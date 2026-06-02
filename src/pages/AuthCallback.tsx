import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Icon from "@/components/ui/icon";

export default function AuthCallback() {
  const navigate = useNavigate();
  const { processCallback, error } = useAuth();
  const [status, setStatus] = useState<"loading" | "error">("loading");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const state = params.get("state");
    const savedState = sessionStorage.getItem("esia_state");

    if (!code) {
      setStatus("error");
      return;
    }

    if (state && savedState && state !== savedState) {
      setStatus("error");
      return;
    }

    processCallback(code, state || "").then((user) => {
      if (user) {
        navigate("/", { replace: true });
      } else {
        setStatus("error");
      }
    });
  }, []);

  return (
    <div className="min-h-screen tactical-bg flex items-center justify-center px-4">
      <div className="bg-card border border-border rounded-sm p-8 max-w-sm w-full text-center">
        {status === "loading" ? (
          <>
            <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="font-display uppercase tracking-widest text-foreground text-sm">
              Авторизация...
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Получаем данные из Госуслуг
            </p>
          </>
        ) : (
          <>
            <Icon name="AlertCircle" size={40} className="text-destructive mx-auto mb-4" />
            <p className="font-display uppercase tracking-widest text-foreground text-sm mb-2">
              Ошибка авторизации
            </p>
            <p className="text-xs text-muted-foreground mb-5">
              {error || "Не удалось войти через Госуслуги. Попробуйте снова."}
            </p>
            <button
              onClick={() => navigate("/")}
              className="text-xs text-primary hover:underline uppercase tracking-wide"
            >
              Вернуться на главную
            </button>
          </>
        )}
      </div>
    </div>
  );
}
