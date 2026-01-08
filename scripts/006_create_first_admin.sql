-- Este script marca o primeiro usuário cadastrado como admin
-- Após fazer o signup com admin@bardoportugues.com, este usuário será automaticamente admin

-- Função para promover o primeiro usuário a admin
CREATE OR REPLACE FUNCTION promote_first_user_to_admin()
RETURNS void AS $$
DECLARE
  first_user_id UUID;
BEGIN
  -- Pega o ID do usuário com o email admin@bardoportugues.com
  SELECT id INTO first_user_id
  FROM auth.users
  WHERE email = 'admin@estanciagrill.com'
  LIMIT 1;
  
  -- Se encontrou, atualiza para admin
  IF first_user_id IS NOT NULL THEN
    UPDATE users
    SET role = 'admin'
    WHERE id = first_user_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Executar a função
SELECT promote_first_user_to_admin();
