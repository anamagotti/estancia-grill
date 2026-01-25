-- SCRIPT DE RESET E CORREÇÃO DE USUÁRIOS v2
-- Este script força a limpeza das tabelas pública e de autenticação antes de recriar.

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;

-- 1. Desabilitar trigger temporariamente para evitar erros de chave duplicada na tabela public
ALTER TABLE auth.users DISABLE TRIGGER on_auth_user_created;

-- 2. Limpeza prévia na tabela PÚBLICA (public.users) e INSPECTIONS (para evitar erro de FK constraint)
-- Se houver vistorias ligadas aos usuários antigos, elas precisam ser deletadas ou o delete do usuario falha
DELETE FROM public.checklist_items 
WHERE inspection_id IN (
    SELECT id FROM public.inspections 
    WHERE inspector_id IN (SELECT id FROM public.users WHERE email ILIKE 'limpeza%' OR email ILIKE 'limpa%' OR email ~ '^[0-9]+@')
);

DELETE FROM public.inspections
WHERE inspector_id IN (SELECT id FROM public.users WHERE email ILIKE 'limpeza%' OR email ILIKE 'limpa%' OR email ~ '^[0-9]+@');

DELETE FROM public.users 
WHERE email ILIKE 'limpeza%@estanciagrill.com'
   OR email ILIKE 'limpa%@estanciagrill.com'
   OR email ~ '^[0-9]+@';

-- 3. Limpeza na tabela de AUTENTICAÇÃO (auth.users)
DELETE FROM auth.users 
WHERE email ILIKE 'limpeza%@estanciagrill.com'
   OR email ILIKE 'limpa%@estanciagrill.com'
   OR email ILIKE '%@estanciagrill.com' AND email ~ '^[0-9]+@';

-- 4. Recriar os usuários
DO $$
DECLARE
    i INT;
    new_email TEXT;
    new_password TEXT;
    new_user_id UUID;
    encrypted_pw TEXT;
BEGIN
    FOR i IN 1..16 LOOP
        -- Formatar email: limpeza01, limpeza02...
        new_email := format('limpeza%s@estanciagrill.com', lpad(i::text, 2, '0'));
        new_password := 'limpeza123';
        
        -- Gerar hash da senha (Bcrypt)
        encrypted_pw := public.crypt(new_password, public.gen_salt('bf'));
        
        new_user_id := gen_random_uuid();

        -- Inserir em auth.users
        INSERT INTO auth.users (
            id,
            instance_id,
            role,
            aud,
            email,
            encrypted_password,
            email_confirmed_at,
            raw_app_meta_data,
            raw_user_meta_data,
            created_at,
            updated_at,
            is_super_admin
        ) VALUES (
            new_user_id,
            '00000000-0000-0000-0000-000000000000',
            'authenticated',
            'authenticated',
            new_email,
            encrypted_pw,
            now(),
            '{"provider":"email","providers":["email"]}',
            jsonb_build_object('full_name', format('Equipe Limpeza %s', lpad(i::text, 2, '0'))),
            now(),
            now(),
            false
        );

        -- Inserir MANUALMENTE em public.users (já que o trigger está desligado)
        -- Isso garante que as dependências existam corretamente
        INSERT INTO public.users (
            id,
            email,
            full_name,
            role,
            franchise_id -- Será atualizado em massa depois, mas podemos tentar setar agora se soubermos
        ) VALUES (
            new_user_id,
            new_email,
            format('Equipe Limpeza %s', lpad(i::text, 2, '0')),
            'limpeza',
            NULL -- atualizaremos logo abaixo
        );

    END LOOP;
END $$;

-- 5. Reabilitar o trigger
ALTER TABLE auth.users ENABLE TRIGGER on_auth_user_created;

-- 6. Vincular à franquia Bauru
UPDATE public.users 
SET franchise_id = (SELECT id FROM public.franchises WHERE name ILIKE '%Bauru%' LIMIT 1)
WHERE email ILIKE 'limpeza%@estanciagrill.com';

-- 7. Confirmação
SELECT id, email, role FROM public.users WHERE email ILIKE 'limpeza%';
