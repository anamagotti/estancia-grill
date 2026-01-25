-- SCRIPT DE CRIAÇÃO ÚNICA (CORRIGIDO)
-- Corrige o erro de "chave duplicada" (23505) causado pelo Trigger automático.

-- 1. Apagar sem dó (Limpeza total do teste)
DELETE FROM public.checklist_items WHERE inspection_id IN (SELECT id FROM public.inspections WHERE inspector_id IN (SELECT id FROM public.users WHERE email = 'limpeza01@estanciagrill.com'));
DELETE FROM public.inspections WHERE inspector_id IN (SELECT id FROM public.users WHERE email = 'limpeza01@estanciagrill.com');
DELETE FROM public.users WHERE email = 'limpeza01@estanciagrill.com';
DELETE FROM auth.users WHERE email = 'limpeza01@estanciagrill.com';

-- 2. Recriar usuário único
DO $$
DECLARE
    new_id UUID := gen_random_uuid();
BEGIN
    -- Inserir APENAS no Auth (O Trigger vai criar na Public automaticamente)
    INSERT INTO auth.users (
        id, email, encrypted_password, email_confirmed_at, role, aud,
        raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
        new_id, 
        'limpeza01@estanciagrill.com', 
        crypt('limpeza123', gen_salt('bf')), 
        now(), 'authenticated', 'authenticated',
        '{"provider":"email","providers":["email"]}',
        '{"full_name":"Limpeza 01 Teste"}',
        now(), now()
    );

    -- ATUALIZAR a tabela pública em vez de inserir (pois o trigger já criou)
    -- Usamos INSERT ... ON CONFLICT apenas por segurança extra
    INSERT INTO public.users (id, email, full_name, role, franchise_id)
    VALUES (
        new_id, 
        'limpeza01@estanciagrill.com', 
        'Limpeza 01 Teste', 
        'limpeza',
        (SELECT id FROM public.franchises WHERE name ILIKE '%Bauru%' LIMIT 1)
    )
    ON CONFLICT (id) DO UPDATE 
    SET role = 'limpeza',
        franchise_id = (SELECT id FROM public.franchises WHERE name ILIKE '%Bauru%' LIMIT 1);
        
END $$;

SELECT email, role FROM public.users WHERE email = 'limpeza01@estanciagrill.com';
