-- SCRIPT DE RESET E CORREÇÃO DE USUÁRIOS v4 (FINAL)
-- Correção: Removemos o prefixo 'public.' das funções crypt e gen_salt.
-- O Supabase instala extensões no schema 'extensions' por padrão, então devemos deixar o Postgres buscar no path.

-- Garantir que a extensão existe (pode estar em 'extensions' ou 'public')
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Limpeza de Dados (Ordem correta para evitar erros)
DELETE FROM public.checklist_items 
WHERE inspection_id IN (
    SELECT id FROM public.inspections 
    WHERE inspector_id IN (SELECT id FROM public.users WHERE email ILIKE 'limpeza%' OR email ILIKE 'limpa%' OR email ~ '^[0-9]+@')
);

DELETE FROM public.inspections
WHERE inspector_id IN (SELECT id FROM public.users WHERE email ILIKE 'limpeza%' OR email ILIKE 'limpa%' OR email ~ '^[0-9]+@');

-- Remove da tabela AUTH
DELETE FROM auth.users 
WHERE email ILIKE 'limpeza%@estanciagrill.com' OR email ILIKE 'limpa%' OR email ~ '^[0-9]+@';

-- 2. Recriar Usuários
DO $$
DECLARE
    i INT;
    new_email TEXT;
    encrypted_pw TEXT;
    new_user_id UUID;
BEGIN
    FOR i IN 1..16 LOOP
        new_email := format('limpeza%s@estanciagrill.com', lpad(i::text, 2, '0'));
        
        -- CORREÇÃO: Removido 'public.' -> O Postgres vai achar a função onde ela estiver (public ou extensions)
        encrypted_pw := crypt('limpeza123', gen_salt('bf'));
        
        new_user_id := gen_random_uuid();

        -- Inserir na tabela AUTH
        INSERT INTO auth.users (
            id, instance_id, role, aud, email, encrypted_password, email_confirmed_at,
            raw_app_meta_data, raw_user_meta_data, created_at, updated_at
        ) VALUES (
            new_user_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
            new_email, encrypted_pw, now(),
            '{"provider":"email","providers":["email"]}',
            jsonb_build_object('full_name', format('Equipe Limpeza %s', lpad(i::text, 2, '0'))),
            now(), now()
        );
        
        -- Inserir/Atualizar na tabela PUBLIC
        BEGIN
            INSERT INTO public.users (id, email, full_name, role)
            VALUES (new_user_id, new_email, format('Equipe Limpeza %s', lpad(i::text, 2, '0')), 'limpeza');
        EXCEPTION WHEN unique_violation THEN
            UPDATE public.users 
            SET role = 'limpeza', full_name = format('Equipe Limpeza %s', lpad(i::text, 2, '0'))
            WHERE id = new_user_id;
        END;

    END LOOP;
END $$;

-- 3. Vincular Franquia Bauru
UPDATE public.users 
SET franchise_id = (SELECT id FROM public.franchises WHERE name ILIKE '%Bauru%' LIMIT 1)
WHERE email ILIKE 'limpeza%@estanciagrill.com';

SELECT email, role FROM public.users WHERE email ILIKE 'limpeza%' ORDER BY email;
