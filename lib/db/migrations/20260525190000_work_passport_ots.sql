ALTER TABLE work_passports ADD COLUMN IF NOT EXISTS ots_proof TEXT;
ALTER TABLE work_passports ADD COLUMN IF NOT EXISTS ots_status TEXT DEFAULT 'pending';
ALTER TABLE work_passports ADD COLUMN IF NOT EXISTS ots_blockchain TEXT DEFAULT 'bitcoin';
ALTER TABLE work_passports ADD COLUMN IF NOT EXISTS ots_block_height INTEGER;
ALTER TABLE work_passports ADD COLUMN IF NOT EXISTS ots_tx_id TEXT;
ALTER TABLE work_passports ADD COLUMN IF NOT EXISTS ots_confirmed_at TIMESTAMP;
