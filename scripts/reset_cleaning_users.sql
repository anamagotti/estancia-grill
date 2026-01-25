-- SCRIPT DE RESET TOTAL DOS USUÁRIOS DE LIMPEZA
-- Este script apaga os usuários criados errados (01@..., limpa01@...) e cria os corretos.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Remover usuários incorretos ou antigos de limpeza
-- Apaga qualquer email que comece com números, ou comece com 'limpa' ou 'limpeza'
-- MANTÉM O ADMIN INTACTO
DELETE FROM auth.users 
WHERE email LIKE '%@estanciagrill.com'
AND (
    email ~ '^[0-9]+@'            -- Apaga ex: 13@estanciagrill.com
    OR email LIKE 'limpa%'        -- Apaga ex: limpa01@estanciagrill.com
    OR email LIKE 'limpeza%'      -- Apaga os atuais para recriar com a senha certa
)
AND email NOT LIKE 'admin%';      -- Proteção extra para o admin

-- 2. Recriar os 16 usuários com o padrão correto
-- Email: limpeza01@estanciagrill.com ... limpeza16@estanciagrill.com
-- Senha: limpeza123
DO $$
DECLARE
    i INT;
    temp_email TEXT;
    temp_password TEXT;
    new_user_id UUID;
    encrypted_pw TEXT;
BEGIN
    FOR i IN 1..16 LOOP
        temp_email := format('limpeza%s@estanciagrill.com', lpad(i::text, 2, '0'));
        temp_password := 'limpeza123';
        encrypted_pw := crypt(temp_password, gen_salt('bf'));

        new_user_id := gen_random_uuid();

        INSERT INTO auth.users (
            id,
            email,
            encrypted_password,
            email_confirmed_at,
            raw_app_meta_data,
            raw_user_meta_data,
            created_at,
            updated_at,
            role,
            confirmation_token,
            instance_id,
            aud
        ) VALUES (
            new_user_id,
            temp_email,
            encrypted_pw,
            now(),
            '{"provider":"email","providers":["email"]}',
            format('{"full_name": "Equipe Limpeza %s"}', lpad(i::text, 2, '0'))::jsonb,
            now(),
            now(),
            'authenticated',
            encode(gen_random_bytes(32), 'hex'),
            '00000000-0000-0000-0000-000000000000',
            'authenticated'
        );
    END LOOP;
END $$;

-- 3. Configurar permissões e franquia Bauru
UPDATE public.users 
SET role = 'limpeza',
    franchise_id = (SELECT id FROM public.franchises WHERE name ILIKE '%Bauru%' LIMIT 1)
WHERE email LIKE 'limpeza%@estanciagrill.com';

-- 4. Atualizar o sistema
NOTIFY pgrst, 'reload schema';
