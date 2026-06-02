import os
import json
import uuid
import hashlib
import base64
import urllib.parse
import urllib.request
from datetime import datetime, timezone
import psycopg2

ESIA_BASE_URL = "https://esia.gosuslugi.ru"
ESIA_TOKEN_URL = f"{ESIA_BASE_URL}/aas/oauth2/te"
ESIA_PERSON_URL = f"{ESIA_BASE_URL}/rs/prns"
ESIA_SCOPE = "openid fullname email mobile"

CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Session-Token",
    "Content-Type": "application/json",
}

DB_SCHEMA = os.environ.get("MAIN_DB_SCHEMA", "public")


def db():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def ok(data, code=200):
    return {"statusCode": code, "headers": CORS, "body": json.dumps(data, ensure_ascii=False)}


def err(msg, code=400):
    return ok({"error": msg}, code)


def sign(message: str) -> str:
    key_pem = os.environ.get("ESIA_PRIVATE_KEY", "")
    if not key_pem:
        return base64.urlsafe_b64encode(b"MOCK_SIGN").decode()
    import subprocess, tempfile
    with tempfile.NamedTemporaryFile(mode="w", suffix=".pem", delete=False) as f:
        f.write(key_pem)
        kp = f.name
    try:
        r = subprocess.run(["openssl", "dgst", "-sign", kp, "-md_gost12_256"],
                           input=message.encode(), capture_output=True, timeout=10)
        return base64.urlsafe_b64encode(r.stdout).decode().rstrip("=")
    finally:
        os.unlink(kp)


def client_secret(scope, ts, client_id, state):
    return sign(scope + ts + client_id + state)


def login(event):
    cid = os.environ.get("ESIA_CLIENT_ID", "")
    if not cid:
        return err("ESIA_CLIENT_ID не настроен", 500)
    redir = (event.get("queryStringParameters") or {}).get("redirect_uri", "")
    state = uuid.uuid4().hex
    ts = datetime.now(timezone.utc).strftime("%Y.%m.%d %H:%M:%S +0000")
    params = urllib.parse.urlencode({
        "client_id": cid, "client_secret": client_secret(ESIA_SCOPE, ts, cid, state),
        "redirect_uri": redir, "scope": ESIA_SCOPE, "response_type": "code",
        "state": state, "timestamp": ts, "access_type": "online",
    })
    return ok({"auth_url": f"{ESIA_BASE_URL}/aas/oauth2/ac?{params}", "state": state})


def callback(event):
    body = json.loads(event.get("body") or "{}")
    code = body.get("code")
    if not code:
        return err("Отсутствует code от ЕСИА")
    cid = os.environ.get("ESIA_CLIENT_ID", "")
    state = body.get("state", "")
    redir = body.get("redirect_uri", "")
    ts = datetime.now(timezone.utc).strftime("%Y.%m.%d %H:%M:%S +0000")
    data = urllib.parse.urlencode({
        "client_id": cid, "client_secret": client_secret(ESIA_SCOPE, ts, cid, state),
        "grant_type": "authorization_code", "code": code, "redirect_uri": redir,
        "scope": ESIA_SCOPE, "timestamp": ts, "token_type": "Bearer", "state": state,
    }).encode()
    req = urllib.request.Request(ESIA_TOKEN_URL, data=data, method="POST")
    req.add_header("Content-Type", "application/x-www-form-urlencoded")
    try:
        with urllib.request.urlopen(req, timeout=15) as r:
            tr = json.loads(r.read())
    except Exception as e:
        return err(f"Ошибка токена ЕСИА: {e}", 502)
    at = tr.get("access_token")
    if not at:
        return err("ЕСИА не вернул access_token", 502)
    esia_sub = None
    idt = tr.get("id_token", "")
    if idt:
        try:
            p = idt.split(".")[1] + "=="
            esia_sub = str(json.loads(base64.urlsafe_b64decode(p)).get("sub", ""))
        except Exception:
            pass
    if not esia_sub:
        return err("Не удалось извлечь sub из id_token", 502)
    ui = {}
    try:
        ir = urllib.request.Request(f"{ESIA_PERSON_URL}/{esia_sub}")
        ir.add_header("Authorization", f"Bearer {at}")
        with urllib.request.urlopen(ir, timeout=10) as r:
            ui = json.loads(r.read())
    except Exception:
        pass
    fn = ui.get("firstName", "")
    ln = ui.get("lastName", "")
    mn = ui.get("middleName", "")
    email = phone = ""
    for c in (ui.get("contacts") or {}).get("elements", []):
        if c.get("type") == "EML": email = c.get("value", "")
        elif c.get("type") == "MBT": phone = c.get("value", "")
    conn = db()
    cur = conn.cursor()
    cur.execute(f"""
        INSERT INTO {DB_SCHEMA}.users (esia_sub,first_name,last_name,middle_name,email,phone,last_login)
        VALUES (%s,%s,%s,%s,%s,%s,NOW())
        ON CONFLICT (esia_sub) DO UPDATE SET
          first_name=EXCLUDED.first_name, last_name=EXCLUDED.last_name,
          middle_name=EXCLUDED.middle_name, email=EXCLUDED.email,
          phone=EXCLUDED.phone, last_login=NOW()
        RETURNING id
    """, (esia_sub, fn, ln, mn, email, phone))
    uid = cur.fetchone()[0]
    tok = hashlib.sha256(f"{uid}{uuid.uuid4()}".encode()).hexdigest()
    cur.execute(f"INSERT INTO {DB_SCHEMA}.sessions (user_id,session_token) VALUES (%s,%s)", (uid, tok))
    conn.commit(); cur.close(); conn.close()
    return ok({"session_token": tok, "user": {"id": uid, "first_name": fn, "last_name": ln,
               "middle_name": mn, "email": email, "phone": phone, "verified": True}})


def me(event):
    h = event.get("headers") or {}
    tok = h.get("x-session-token") or h.get("X-Session-Token")
    if not tok:
        return err("Не авторизован", 401)
    conn = db()
    cur = conn.cursor()
    cur.execute(f"""
        SELECT u.id,u.first_name,u.last_name,u.middle_name,u.email,u.phone,u.verified,u.created_at
        FROM {DB_SCHEMA}.sessions s JOIN {DB_SCHEMA}.users u ON u.id=s.user_id
        WHERE s.session_token=%s AND s.expires_at>NOW()
    """, (tok,))
    row = cur.fetchone(); cur.close(); conn.close()
    if not row:
        return err("Сессия не найдена или истекла", 401)
    return ok({"user": {"id": row[0], "first_name": row[1], "last_name": row[2],
               "middle_name": row[3], "email": row[4], "phone": row[5],
               "verified": row[6], "member_since": row[7].year if row[7] else None}})


def logout(event):
    h = event.get("headers") or {}
    tok = h.get("x-session-token") or h.get("X-Session-Token")
    if tok:
        conn = db()
        cur = conn.cursor()
        cur.execute(f"UPDATE {DB_SCHEMA}.sessions SET expires_at=NOW() WHERE session_token=%s", (tok,))
        conn.commit(); cur.close(); conn.close()
    return ok({"ok": True})


def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}
    path = (event.get("path") or "/").rstrip("/") or "/"
    method = event.get("httpMethod", "GET")
    if path.endswith("/login") and method == "GET":
        return login(event)
    if path.endswith("/callback") and method == "POST":
        return callback(event)
    if path.endswith("/me") and method == "GET":
        return me(event)
    if path.endswith("/logout") and method == "POST":
        return logout(event)
    return err("Маршрут не найден", 404)
