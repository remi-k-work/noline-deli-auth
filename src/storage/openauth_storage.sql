CREATE TABLE openauth_storage (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    expiry TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_expiry ON openauth_storage (expiry) WHERE expiry IS NOT NULL;

CREATE TABLE openauth_storage_text (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    expiry BIGINT
);

CREATE INDEX idx_expiry_text ON openauth_storage_text (expiry) WHERE expiry IS NOT NULL;