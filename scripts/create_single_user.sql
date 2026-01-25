-- SCRIPT DE CRIAÇÃO ÚNICA (GARANTIDO)
-- Vamos criar apenas UM usuário para teste, apagando qualquer vestígio anterior dele.

-- 1. Limpar usuário específico
DELETE FROM public.checklist_items WHERE inspection_id IN (SELECT id FROM public.inspections WHERE inspector_id IN (SELECT id FROM public.users WHERE email = 'limpeza01@estanciagrill.com'));
DELETE FROM public.inspections WHERE inspector_id IN (SELECT id FROM public.users WHERE email = 'limpeza01@estanciagrill.com');
DELETE FROM public.users WHERE email = 'limpeza01@estanciagrill.com';
DELETE FROM auth.users WHERE email = 'limpeza01@estanciagrill.com';

-- 2. Criar usuário ÚNICO
DO $$
DECLARE
    new_id UUID := gen_random_uuid();
    v_hash TEXT;
BEGIN
    -- Gera hash da senha 'limpeza123'
    -- Se der erro aqui, o banco não tem pgcrypto instalado corretamente, avise se acontecer.
    v_hash := crypt('limpeza123', gen_salt('bf'));

    -- Inserir no Auth
    INSERT INTO auth.users (
        id, email, encrypted_password, email_confirmed_at, 
        role, aud, raw_app_meta_data, raw_user_meta_data, 
        created_at, updated_at
    ) VALUES (
        new_id, 
        'limpeza01@estanciagrill.com', 
        v_hash, 
        now(), 
        'authenticated', 
        'authenticated',
        '{"provider":"email","providers":["email"]}',
        '{"full_name":"Limpeza 01 Teste"}',
        now(), 
        now()
    );

    -- Inserir no Public (com tratamento de erro simples)
    INSERT INTO public.users (id, email, full_name, role)
    VALUES (
        new_id, 
        'limpeza01@estanciagrill.com', 
        'Limpeza 01 Teste', 
        'limpeza'
    );
END $$;

-- 3. Vincular franquia
UPDATE public.users 
SET franchise_id = (SELECT id FROM public.franchises WHERE name ILIKE '%Bauru%' LIMIT 1)
WHERE email = 'limpeza01@estanciagrill.com';

-- 4. Exibir credencial criada
SELECT 'USUARIO CRIADO COM SUCESSO' as status, email, 'limpeza123' as senha 
FROM auth.users WHERE email = 'limpeza01@estanciagrill.com';
