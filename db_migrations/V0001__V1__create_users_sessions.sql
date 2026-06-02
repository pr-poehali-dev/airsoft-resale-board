CREATE TABLE IF NOT EXISTS t_p21584960_airsoft_resale_board.users (
    id SERIAL PRIMARY KEY,
    esia_sub VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    middle_name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    verified BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    last_login TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS t_p21584960_airsoft_resale_board.sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES t_p21584960_airsoft_resale_board.users(id),
    session_token VARCHAR(512) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP DEFAULT (NOW() + INTERVAL '30 days')
);

CREATE INDEX IF NOT EXISTS idx_sessions_token ON t_p21584960_airsoft_resale_board.sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_users_esia_sub ON t_p21584960_airsoft_resale_board.users(esia_sub);
