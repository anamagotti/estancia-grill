# Configuração Inicial - Bar do Português

## Status Atual ✅

### Banco de Dados
- ✅ Todas as tabelas criadas com sucesso
- ✅ Políticas RLS habilitadas
- ✅ Índices de performance criados
- ✅ 3 franquias de exemplo já cadastradas

### O que falta
- ⚠️ Criar o usuário administrador

---

## Passo a Passo para Criar o Usuário Administrador

### Opção 1: Através do App (Recomendado)

1. **Acesse a página de login** no seu app
2. **Clique em "Criar conta"** (se disponível)
3. **Cadastre-se com o email**: `admin@bardoportugues.com`
4. **Use a senha**: `Admin@2024!BP`
5. **Confirme o email** através do link enviado

### Opção 2: Através do Supabase Dashboard

1. Acesse o [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecione seu projeto "bar-do-portugues"
3. Vá em **Authentication** > **Users**
4. Clique em **"Add user"** > **"Create new user"**
5. Preencha:
   - **Email**: `admin@bardoportugues.com`
   - **Password**: `Admin@2024!BP`
   - Marque **"Auto Confirm User"**
6. Clique em **"Create user"**

7. **Importante**: Após criar o usuário, copie o **User UID** que aparece
8. Vá em **SQL Editor** e execute:

```sql
-- Substitua 'USER_UID_AQUI' pelo UID que você copiou
INSERT INTO public.users (id, email, full_name, role, franchise_id)
VALUES (
  'USER_UID_AQUI'::uuid,
  'admin@bardoportugues.com',
  'Administrador',
  'admin',
  NULL
);
```

---

## Credenciais de Acesso

Após configurar, use estas credenciais para fazer login:

- **Email**: `admin@bardoportugues.com`
- **Senha**: `Admin@2024!BP`
- **Papel**: Administrador

---

## Próximos Passos

Após o login bem-sucedido, você poderá:

1. ✨ Cadastrar novos supervisores
2. 🏪 Gerenciar franquias
3. 📋 Criar e visualizar vistorias
4. 📊 Acessar relatórios e dashboards

---

## Problemas Comuns

### "Email not confirmed"
- Confirme o email através do link enviado
- Ou marque "Auto Confirm User" no dashboard

### "Invalid login credentials"
- Verifique se o usuário foi criado corretamente
- Confirme que a senha está correta
- Verifique se o email foi confirmado

### "User exists but not in users table"
- Execute o SQL acima para criar o registro na tabela users
- Certifique-se de usar o UID correto do auth.users
