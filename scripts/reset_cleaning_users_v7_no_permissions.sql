-- SCRIPT V7: MODO COMPATÍVEL (SEM COMANDOS DE SUPERUSUÁRIO)
-- Removemos todos os comandos "ALTER TABLE" que causam erro de permissão.
-- Este script limpa manualmente e insere com cuidado, confiando nos Triggers existentes.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. LIMPEZA SEGURA (De baixo para cima)
-- Primeiro apaga itens de checklist e vistorias para não travar a exclusão dos usuários
DELETE FROM public.checklist_items;
DELETE FROM public.inspections;

-- Agora apaga usuários da tabela pública (Dependência da tabela Auth)
DELETE FROM public.users 
WHERE email = 'limpa01@estanciagrill.com'
   OR email ~ '^[0-9]+@estanciagrill.com' -- Apaga 02@, 03@...
   OR email LIKE 'limpeza%@estanciagrill.com';

-- Por fim, apaga da tabela de Autenticação (Login)
DELETE FROM auth.users 
WHERE email = 'limpa01@estanciagrill.com'
   OR email ~ '^[0-9]+@estanciagrill.com'
   OR email LIKE 'limpeza%@estanciagrill.com';


-- 2. CRIAÇÃO DOS USUÁRIOS (limpeza01 a limpeza16)
DO $$
DECLARE
    i INT;
    email_addr TEXT;
    senha_hash TEXT;
    uid UUID;
BEGIN
    -- Tenta gerar o hash da senha 'limpeza123'
    -- Se der erro aqui, certifique-se que a extensão pgcrypto está instalada
    senha_hash := crypt('limpeza123', gen_salt('bf'));

    FOR i IN 1..16 LOOP
        -- Define email: limpeza01@estanciagrill.com, etc.
        email_addr := format('limpeza%s@estanciagrill.com', lpad(i::text, 2, '0'));
        uid := gen_random_uuid();

        -- Apenas insere na tabela AUTH.
        -- O Trigger automático do banco deve criar a entrada na tabela public.users
        INSERT INTO auth.users (
            id, email, encrypted_password, email_confirmed_at, role, aud,
            raw_app_meta_data, raw_user_meta_data, created_at, updated_at
        ) VALUES (
            uid, email_addr, senha_hash, now(), 'authenticated', 'authenticated',
            '{"provider":"email","providers":["email"]}',
            jsonb_build_object('full_name', format('Equipe Limpeza %s', lpad(i::text, 2, '0'))),
            now(), now()
        );
        
        -- Pequena pausa lógica para dar tempo do Trigger rodar (opcional)
        -- Ajuste manual na tabela pública caso o trigger tenha rodado ou não
        INSERT INTO public.users (id, email, full_name, role)
        VALUES (uid, email_addr, format('Equipe Limpeza %s', lpad(i::text, 2, '0')), 'limpeza')
        ON CONFLICT (id) DO UPDATE 
        SET role = 'limpeza',
            full_name = excluded.full_name;

    END LOOP;
END $$;

-- 3. VINCULAR FRANQUIA E LIMPAR CACHE
UPDATE public.users 
SET franchise_id = (SELECT id FROM public.franchises WHERE name ILIKE '%Bauru%' LIMIT 1)
WHERE email LIKE 'limpeza%';

NOTIFY pgrst, 'reload schema';

-- 4. VERIFICAÇÃO (Se aparecer limpeza01 a limpeza16 aqui, funcionou)
SELECT email, role FROM public.users WHERE email LIKE 'limpeza%' ORDER BY email;
