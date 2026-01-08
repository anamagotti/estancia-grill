# Como Criar o Usuário Administrador

## Opção 1: Via Interface de Registro (RECOMENDADO)

### Passo 1: Registre-se no Sistema
1. Abra o Preview do projeto
2. Vá para `/auth/sign-up`
3. Preencha:
   - **Nome:** Administrador
   - **Email:** admin@bardoportugues.com
   - **Senha:** AdminBar

4. Clique em "Criar Conta"

### Passo 2: Confirme o Email
1. Verifique seu email (pode estar no spam)
2. Clique no link de confirmação do Supabase
3. Volte para `/auth/login`

### Passo 3: Me avise aqui no chat
Digite: "Confirmei o email admin@bardoportugues.com"
E eu vou executar este comando SQL para torná-lo administrador:

```sql
UPDATE public.users 
SET role = 'admin' 
WHERE email = 'admin@bardoportugues.com';
```

---

## Opção 2: Via Dashboard do Supabase

### Passo 1: Abrir Supabase Dashboard
1. Vá para https://supabase.com/dashboard
2. Entre no projeto "bar-do-portugues"
3. Vá em **Authentication** > **Users**

### Passo 2: Criar Usuário
1. Clique em "Add User"
2. Preencha:
   - **Email:** admin@bardoportugues.com
   - **Password:** AdminBar
   - **Auto Confirm User:** ✅ Marque esta opção
3. Clique em "Create User"

### Passo 3: Copie o UUID
Copie o ID do usuário criado (ex: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`)

### Passo 4: Execute SQL
1. No Supabase, vá em **SQL Editor**
2. Cole e execute este comando (substitua o UUID):

```sql
-- Atualizar o role para admin
UPDATE public.users 
SET role = 'admin' 
WHERE email = 'admin@bardoportugues.com';
```

---

## Credenciais de Login

Após completar qualquer uma das opções acima:

- **URL de Login:** `/auth/login`
- **Email:** admin@bardoportugues.com
- **Senha:** AdminBar

---

## O que você terá acesso:

- Dashboard administrativo completo
- Gestão de todas as franquias
- Criação e edição de vistorias
- Visualização de relatórios e analytics
- Gestão de usuários (quando implementado)

---

## Solução de Problemas

### Erro: "Invalid login credentials"
- Verifique se confirmou o email
- Certifique-se de que o role foi atualizado para 'admin'
- Verifique se a senha está correta (AdminBar)

### Erro ao fazer login
- Limpe o cache do navegador
- Tente em uma aba anônima
- Verifique se o Supabase está conectado no projeto

### Não recebeu email de confirmação
- Verifique a pasta de spam
- Use a Opção 2 (Dashboard) e marque "Auto Confirm User"

---

**Precisa de ajuda? Me chame no chat!**
