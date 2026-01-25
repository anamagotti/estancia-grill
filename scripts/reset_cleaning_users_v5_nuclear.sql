-- SCRIPT V5: LIMPEZA FORÇADA (NUCLEAR)
-- Seu print mostrou que os usuários "02@", "03@", "limpa01@" ainda existem.
-- Este script deleta um por um explicitamente.

-- 1. APAGAR AS VARIAÇÕES ERRADAS "NA UNHA"
DELETE FROM auth.users WHERE email = 'limpa01@estanciagrill.com';
DELETE FROM auth.users WHERE email = 'limpa02@estanciagrill.com';
DELETE FROM auth.users WHERE email = 'limpa03@estanciagrill.com';
-- Apagar numéricos que apareceram no seu print (02@, 03@...)
DELETE FROM auth.users WHERE email ~ '^[0-9]+@estanciagrill.com';
-- Apagar qualquer um que comece com limpeza (para recriar limpo)
DELETE FROM auth.users WHERE email LIKE 'limpeza%@estanciagrill.com';

-- 2. RECRIAR DO ZERO (PADRÃO CORRETO)
DO $$
DECLARE
    i INT;
    email_addr TEXT;
    senha_hash TEXT;
    uid UUID;
BEGIN
    -- Gera hash da senha 'limpeza123' uma única vez para usar em todos (mais rápido)
    -- Se der erro de função, tenta pgcrypto.crypt ou public.crypt ou apenas crypt
    -- Assumindo que a extensão pgcrypto está ativa.
    BEGIN
        senha_hash := crypt('limpeza123', gen_salt('bf'));
    EXCEPTION WHEN OTHERS THEN
        -- Fallback se a função não for encontrada direto
        senha_hash := extensions.crypt('limpeza123', extensions.gen_salt('bf'));
    END;

    FOR i IN 1..16 LOOP
        -- Formata: limpeza01@estanciagrill.com
        email_addr := format('limpeza%s@estanciagrill.com', lpad(i::text, 2, '0'));
        uid := gen_random_uuid();

        INSERT INTO auth.users (
            id, email, encrypted_password, email_confirmed_at, role, aud,
            raw_app_meta_data, raw_user_meta_data, created_at, updated_at
        ) VALUES (
            uid, email_addr, senha_hash, now(), 'authenticated', 'authenticated',
            '{"provider":"email","providers":["email"]}',
            jsonb_build_object('full_name', format('Equipe Limpeza %s', lpad(i::text, 2, '0'))),
            now(), now()
        );

        -- Inserir na tabela pública (se já existir, ignora erro)
        BEGIN
            INSERT INTO public.users (id, email, full_name, role)
            VALUES (uid, email_addr, format('Equipe Limpeza %s', lpad(i::text, 2, '0')), 'limpeza');
        EXCEPTION WHEN unique_violation THEN
            -- Se duplicar, garante que o cargo é limpeza
            UPDATE public.users SET role = 'limpeza' WHERE email = email_addr;
        END;
    END LOOP;
END $$;

-- 3. VINCULAR FRANQUIA BAURU
UPDATE public.users 
SET franchise_id = (SELECT id FROM public.franchises WHERE name ILIKE '%Bauru%' LIMIT 1)
WHERE email LIKE 'limpeza%';

-- 4. CONFIRMAR O RESULTADO
SELECT email, role FROM auth.users WHERE email LIKE '%@estanciagrill.com' ORDER BY email;
