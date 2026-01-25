-- SCRIPT DE RESET E CORREÇÃO DE USUÁRIOS v3 (SAFE MODE)
-- Removemos o comando ALTER TABLE que exige permissões de superusuário.
-- Tratamos a inserção na tabela public com verificação de segurança.

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;

-- 1. Limpeza de Dados (Ordem correta para evitar erros de chave estrangeira)

-- Remove itens de checklist viculados a vistorias de usuários de limpeza antigos
DELETE FROM public.checklist_items 
WHERE inspection_id IN (
    SELECT id FROM public.inspections 
    WHERE inspector_id IN (SELECT id FROM public.users WHERE email ILIKE 'limpeza%' OR email ILIKE 'limpa%' OR email ~ '^[0-9]+@')
);

-- Remove vistorias antigas
DELETE FROM public.inspections
WHERE inspector_id IN (SELECT id FROM public.users WHERE email ILIKE 'limpeza%' OR email ILIKE 'limpa%' OR email ~ '^[0-9]+@');

-- Remove da tabela de autenticação (deve remover da public via CASCADE se configurado, mas vamos garantir)
DELETE FROM auth.users 
WHERE email ILIKE 'limpeza%@estanciagrill.com' 
   OR email ILIKE 'limpa%@estanciagrill.com' 
   OR email ILIKE '%@estanciagrill.com' AND email ~ '^[0-9]+@';

-- Se restar algo na public (caso o cascade falhe), removemos manualmente
DELETE FROM public.users 
WHERE email ILIKE 'limpeza%@estanciagrill.com' 
   OR email ILIKE 'limpa%@estanciagrill.com' 
   OR email ~ '^[0-9]+@';

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
        -- Criptografia correta para Supabase Auth
        encrypted_pw := public.crypt('limpeza123', public.gen_salt('bf'));
        new_user_id := gen_random_uuid();

        -- Inserir na tabela AUTH (fundamental para login)
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
        -- Usamos um bloco BEGIN/EXCEPTION para lidar com caso do Trigger já ter criado o usuário
        BEGIN
            INSERT INTO public.users (id, email, full_name, role)
            VALUES (new_user_id, new_email, format('Equipe Limpeza %s', lpad(i::text, 2, '0')), 'limpeza');
        EXCEPTION WHEN unique_violation THEN
            -- Se deu erro de duplicidade, é pq o trigger já criou. Então apenas atualizamos o role.
            UPDATE public.users 
            SET role = 'limpeza', 
                full_name = format('Equipe Limpeza %s', lpad(i::text, 2, '0'))
            WHERE id = new_user_id;
        END;

    END LOOP;
END $$;

-- 3. Vincular Franquia Bauru
UPDATE public.users 
SET franchise_id = (SELECT id FROM public.franchises WHERE name ILIKE '%Bauru%' LIMIT 1)
WHERE email ILIKE 'limpeza%@estanciagrill.com';

-- 4. Notificar recarga de schema (opcional, ajuda em cache)
NOTIFY pgrst, 'reload schema';

-- 5. Validação final
SELECT email, role, left(id::text, 5) as id_inicio FROM public.users WHERE email ILIKE 'limpeza%' ORDER BY email;
