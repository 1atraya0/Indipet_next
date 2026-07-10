ALTER TABLE role_master ADD COLUMN IF NOT EXISTS entity_role VARCHAR(50);

UPDATE role_master SET entity_role = 'Franchisee' WHERE role_code = 'FRANCHISE_OWNER_RL_002';

UPDATE role_master SET entity_role = 'Branch' WHERE role_code IN ('STORE_MANAGER_RL_003', 'VETERINARIAN_RL_004', 'GROOMER_RL_005');
