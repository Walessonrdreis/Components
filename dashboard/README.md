# Componente de Usuário

## 📋 Sumário
1. [Descrição](#descrição)
2. [Funcionalidades](#funcionalidades)
3. [Instalação](#instalação)
4. [Como Usar](#como-usar)
5. [API](#api)
6. [Banco de Dados](#banco-de-dados)
7. [Estilização](#estilização)
8. [Exemplos](#exemplos)

## 📝 Descrição

O Componente de Usuário é um sistema completo para gerenciamento de usuários, oferecendo funcionalidades de autenticação, registro, edição de perfil e recuperação de senha. O componente é totalmente responsivo e suporta temas claro/escuro.

## ✨ Funcionalidades

- Sistema completo de autenticação (login/logout)
- Registro de novos usuários
- Edição de perfil
- Recuperação de senha
- Gerenciamento de sessão
- Suporte a temas claro/escuro
- Design responsivo
- Validação de formulários
- Feedback visual para o usuário

## 💻 Instalação

1. **Incluir Arquivos**:
   ```html
   <!-- CSS -->
   <link rel="stylesheet" href="User/User.css">
   
   <!-- JavaScript -->
   <script src="api-usage.js"></script>
   <script src="User/User.js"></script>
   ```

2. **Criar Container**:
   ```html
   <div id="user-component"></div>
   ```

3. **Configurar Banco de Dados**:
   - As tabelas necessárias serão criadas automaticamente
   - Verifique as permissões do diretório `database`

## 🚀 Como Usar

### Inicialização Básica
```javascript
const user = new User({
    containerId: 'user-component'
});
```

### Configuração Completa
```javascript
const user = new User({
    // Container do componente
    containerId: 'user-component',
    
    // Callbacks
    onLogin: (user) => {
        console.log('Usuário logado:', user);
    },
    onLogout: () => {
        console.log('Usuário deslogado');
    },
    onProfileUpdate: (user) => {
        console.log('Perfil atualizado:', user);
    }
});
```

## 🔧 API

### Endpoints Disponíveis

#### Autenticação
- `POST /api/users.php?action=login` - Login
- `POST /api/users.php?action=logout` - Logout
- `POST /api/users.php?action=request-reset` - Solicitar reset de senha
- `POST /api/users.php?action=reset-password` - Resetar senha

#### Usuários
- `GET /api/users.php` - Listar usuários (com paginação)
- `GET /api/users.php?id=1` - Obter usuário específico
- `POST /api/users.php` - Criar usuário
- `PUT /api/users.php?id=1` - Atualizar usuário
- `DELETE /api/users.php?id=1` - Deletar usuário

### Exemplos de Uso da API

```javascript
// Login
const response = await fetch('/api/users.php?action=login', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        email: 'usuario@exemplo.com',
        password: 'senha123'
    })
});

// Criar usuário
const response = await fetch('/api/users.php', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        name: 'João Silva',
        email: 'joao@exemplo.com',
        password: 'senha123'
    })
});
```

## 🗄️ Banco de Dados

### Tabelas

#### users
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    avatar TEXT,
    role TEXT DEFAULT 'user',
    status TEXT DEFAULT 'active',
    last_login DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

#### password_resets
```sql
CREATE TABLE password_resets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    token TEXT NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
)
```

#### user_sessions
```sql
CREATE TABLE user_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    token TEXT NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
)
```

## 🎨 Estilização

O componente utiliza variáveis CSS para personalização:

```css
:root {
    --primary-color: #007bff;
    --primary-color-dark: #0056b3;
    --danger-color: #dc3545;
    --danger-color-dark: #c82333;
    --background-color: #fff;
    --text-color: #333;
    --text-color-light: #666;
    --border-color: #ddd;
}

/* Tema escuro */
[data-theme="dark"] {
    --background-color: #1a1a1a;
    --text-color: #fff;
    --text-color-light: #bbb;
    --border-color: #333;
}
```

## 📱 Responsividade

O componente é totalmente responsivo e se adapta a diferentes tamanhos de tela:

- Desktop: Layout padrão
- Tablet: Adaptações de padding e margens
- Mobile: Layout simplificado e empilhado

## 💡 Exemplos

### Login e Registro
```javascript
// Inicializar componente
const user = new User({
    containerId: 'user-component',
    onLogin: (user) => {
        // Redirecionar após login
        window.location.href = '/dashboard';
    }
});

// Verificar estado da autenticação
if (user.currentUser) {
    console.log('Usuário está logado');
}
```

### Atualização de Perfil
```javascript
// Atualizar avatar
await user.handleProfileUpdate({
    avatar: 'https://exemplo.com/avatar.jpg'
});

// Atualizar senha
await user.handleProfileUpdate({
    password: 'novaSenha123'
});
```

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie sua feature branch (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.
