-- Habilitar a extensão pgcrypto
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Script corrigido para criar usuários de limpeza
-- SEM tentar inserir manualmente na tabela public.users (deixa o trigger agir)
DO $$
DECLARE
    i INT;
    temp_email TEXT;
    temp_password TEXT;
    new_user_id UUID;
    encrypted_pw TEXT;
BEGIN
    FOR i IN 1..16 LOOP
        -- Define email e senha
        temp_email := format('limpeza%s@estanciagrill.com', lpad(i::text, 2, '0'));
        temp_password := 'limpeza123';
        encrypted_pw := crypt(temp_password, gen_salt('bf'));

        -- Verifica se o usuário NÃO existe antes de criar
        IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = temp_email) THEN
            new_user_id := gen_random_uuid();

            -- Inserir apenas na tabela de autenticação (auth.users)
            -- O trigger automático do seu banco vai criar a linha na tabela public.users
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
        END IF;
    END LOOP;
END $$;

-- Atualiza as permissões (roles) de todos os usuários de limpeza
-- Isso corrige caso o trigger tenha criado como 'user' padrão
UPDATE public.users 
SET role = 'limpeza' 
WHERE email LIKE 'limpeza%@estanciagrill.com';
