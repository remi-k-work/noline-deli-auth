CREATE TABLE openauth_storage (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    expiry TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_expiry ON openauth_storage (expiry) WHERE expiry IS NOT NULL;