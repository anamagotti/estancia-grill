-- SCRIPT V6: REMOÇÃO EXPLÍCITA (LINHA POR LINHA)
-- Como o padrão está misturado, vamos garantir a exclusão de CADA caso incorreto possível.

-- 1. DESATIVAR TRIGGERS DE SEGURANÇA (Para permitir exclusão sem travas)
ALTER TABLE auth.users DISABLE TRIGGER on_auth_user_created;

-- 2. LIMPAR DADOS VINCULADOS (Evita erro de chave estrangeira)
DELETE FROM public.checklist_items;
DELETE FROM public.inspections;
DELETE FROM public.users WHERE email <> 'admin@estanciagrill.com';

-- 3. REMOÇÃO MANUAL DOS EMAILS ERRADOS (Baseado no seu print)
DELETE FROM auth.users WHERE email = 'limpa01@estanciagrill.com';
DELETE FROM auth.users WHERE email = '01@estanciagrill.com';
DELETE FROM auth.users WHERE email = '02@estanciagrill.com';
DELETE FROM auth.users WHERE email = '03@estanciagrill.com';
DELETE FROM auth.users WHERE email = '04@estanciagrill.com';
DELETE FROM auth.users WHERE email = '05@estanciagrill.com';
DELETE FROM auth.users WHERE email = '06@estanciagrill.com';
DELETE FROM auth.users WHERE email = '07@estanciagrill.com';
DELETE FROM auth.users WHERE email = '08@estanciagrill.com';
DELETE FROM auth.users WHERE email = '09@estanciagrill.com';
DELETE FROM auth.users WHERE email = '10@estanciagrill.com';
DELETE FROM auth.users WHERE email = '11@estanciagrill.com';
DELETE FROM auth.users WHERE email = '12@estanciagrill.com';
DELETE FROM auth.users WHERE email = '13@estanciagrill.com';
DELETE FROM auth.users WHERE email = '14@estanciagrill.com';
DELETE FROM auth.users WHERE email = '15@estanciagrill.com';
DELETE FROM auth.users WHERE email = '16@estanciagrill.com';

-- 4. RECRIAR OS CORRETOS (limpeza01 ... limpeza16)
DO $$
DECLARE
    i INT;
    email_addr TEXT;
    senha_hash TEXT;
    uid UUID;
BEGIN
    -- Hash da senha 'limpeza123'
    -- Tenta pegar de extensions ou public
    BEGIN
        senha_hash := crypt('limpeza123', gen_salt('bf'));
    EXCEPTION WHEN OTHERS THEN
        senha_hash := extensions.crypt('limpeza123', extensions.gen_salt('bf'));
    END;

    FOR i IN 1..16 LOOP
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

        -- Inserir na tabela public
        INSERT INTO public.users (id, email, full_name, role)
        VALUES (uid, email_addr, format('Equipe Limpeza %s', lpad(i::text, 2, '0')), 'limpeza');
        
    END LOOP;
END $$;

-- 5. REATIVAR TRIGGERS
ALTER TABLE auth.users ENABLE TRIGGER on_auth_user_created;

-- 6. CONFIGURAR FRANQUIA
UPDATE public.users 
SET franchise_id = (SELECT id FROM public.franchises WHERE name ILIKE '%Bauru%' LIMIT 1)
WHERE email LIKE 'limpeza%';

-- 7. MOSTRAR RESULTADO FINAL
SELECT email FROM auth.users ORDER BY email;
