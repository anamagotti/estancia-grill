-- Habilitar a extensão pgcrypto se ainda não estiver habilitada
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Script para criar 16 usuários de limpeza
DO $$
DECLARE
    i INT;
    temp_email TEXT;
    temp_password TEXT;
    new_user_id UUID;
    encrypted_pw TEXT;
BEGIN
    FOR i IN 1..16 LOOP
        -- Configuração do usuário
        temp_email := format('limpeza%s@estanciagrill.com', lpad(i::text, 2, '0'));
        temp_password := 'limpeza123';
        -- Criptografar senha
        encrypted_pw := crypt(temp_password, gen_salt('bf'));

        -- Verificar se o usuário já existe na tabela auth.users
        IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = temp_email) THEN
            new_user_id := gen_random_uuid();

            -- Inserir novo usuário na tabela auth.users
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
            
            -- O trigger on_auth_user_created deve criar a entrada na tabela public.users automaticamente.
            -- Mas precisamos garantir que a role seja 'limpeza'.
            -- Como o trigger é assíncrono ou pode já ter rodado, atualizamos diretamente.
            
            -- Aguardar um momento ou forçar update se possível? Não podemos em DO block com trigger.
            -- Vamos assumir que o sistema usa trigger. Se não usar, teríamos que inserir em public.users também. 
            
        END IF;
    END LOOP;
END $$;

-- Atualizar as permissões na tabela de usuários para o papel 'limpeza'
UPDATE public.users 
SET role = 'limpeza' 
WHERE email LIKE 'limpeza%@estanciagrill.com';

-- Garantir que a tabela de usuários tenha a coluna franchise_id atualizada se necessário
-- Adicione aqui updates para franchise_id se todos os usuários pertencerem a uma franquia padrão
-- UPDATE public.users SET franchise_id = 'ID_DA_FRANQUIA' WHERE role = 'limpeza';
