-- SCRIPT DE CORREÇÃO DE SENHA (MANTENDO OS EMAILS ATUAIS)
-- Atualiza a senha de 'limpa01' e '02' a '16' para 'limpeza123'

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
    senha_hash TEXT;
BEGIN
    -- Gerar o hash da senha 'limpeza123'
    senha_hash := crypt('limpeza123', gen_salt('bf'));

    -- 1. Atualizar senha do 'limpa01@estanciagrill.com'
    UPDATE auth.users
    SET encrypted_password = senha_hash,
        updated_at = now(),
        email_confirmed_at = COALESCE(email_confirmed_at, now()),
        raw_app_meta_data = '{"provider":"email","providers":["email"]}'
    WHERE email = 'limpa01@estanciagrill.com';

    -- 2. Atualizar senha dos numéricos (02@, 03@ ... 16@)
    UPDATE auth.users
    SET encrypted_password = senha_hash,
        updated_at = now(),
        email_confirmed_at = COALESCE(email_confirmed_at, now()),
        raw_app_meta_data = '{"provider":"email","providers":["email"]}'
    WHERE email ~ '^[0-9]+@estanciagrill.com'; 

    -- 3. Garantir acesso na tabela pública (Role = limpeza) e Franquia Bauru
    UPDATE public.users 
    SET role = 'limpeza',
        franchise_id = (SELECT id FROM public.franchises WHERE name ILIKE '%Bauru%' LIMIT 1)
    WHERE email = 'limpa01@estanciagrill.com' 
       OR email ~ '^[0-9]+@estanciagrill.com';

END $$;

-- Mostra quem foi atualizado recentemente
SELECT email, role, updated_at FROM auth.users 
WHERE email = 'limpa01@estanciagrill.com' OR email ~ '^[0-9]+@estanciagrill.com';
