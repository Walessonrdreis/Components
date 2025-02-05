# Sistema de Gerenciamento de Usuários

Este é um sistema de gerenciamento de usuários com suporte a diferentes níveis de acesso (administrador e usuário comum).

## Funcionalidades

### Autenticação
- Login de usuários
- Registro de novos usuários
- Logout
- Sessões seguras

### Níveis de Acesso
- **Administrador**: Acesso total ao sistema
- **Usuário**: Acesso limitado às funcionalidades básicas

### Funcionalidades do Administrador
- Visualizar todos os usuários
- Promover usuários comuns para administradores
- Rebaixar administradores para usuários comuns
- Excluir usuários
- Visualizar tipos de usuários

### Funcionalidades do Usuário Comum
- Visualizar lista de usuários
- Atualizar próprias informações

## Estrutura do Banco de Dados

### Tabela: usuarios
```sql
CREATE TABLE usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    telefone VARCHAR(20),
    tipo_usuario VARCHAR(20) NOT NULL DEFAULT 'usuario',
    data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## Usuário Administrador Padrão
- **Email**: admin@sistema.com
- **Senha**: admin123

## Tecnologias Utilizadas
- PHP 7+
- SQLite
- HTML5
- CSS3
- JavaScript (Vanilla)
- PDO para conexão com banco de dados

## Segurança
- Senhas armazenadas com hash (PASSWORD_DEFAULT)
- Proteção contra SQL Injection usando PDO
- Validação de sessões
- Verificação de permissões em todas as ações
- Sanitização de dados de entrada

## Estrutura de Arquivos

```
├── api/
│   ├── alterar_tipo_usuario.php
│   ├── cadastrar_usuario.php
│   ├── excluir_usuario.php
│   ├── listar_usuarios.php
│   ├── login.php
│   ├── logout.php
│   └── verificar_sessao.php
├── config/
│   └── database.php
├── database/
│   └── usuarios.sqlite
├── dashboard.html
├── index.html
├── login.html
├── README.md
└── usuarios.php
```

## Endpoints da API

### POST /api/cadastrar_usuario.php
- Cadastra um novo usuário
- Parâmetros: nome, email, senha, telefone

### POST /api/login.php
- Autentica um usuário
- Parâmetros: email, senha

### POST /api/alterar_tipo_usuario.php
- Altera o tipo de um usuário (requer admin)
- Parâmetros: id, tipo

### POST /api/excluir_usuario.php
- Exclui um usuário (requer admin)
- Parâmetros: id

### GET /api/listar_usuarios.php
- Lista todos os usuários

### GET /api/verificar_sessao.php
- Verifica se o usuário está logado

### POST /api/logout.php
- Encerra a sessão do usuário

## Regras de Negócio

### Administradores
1. Não podem excluir a própria conta
2. Não podem alterar o próprio tipo de usuário
3. Podem promover/rebaixar outros usuários
4. Podem excluir outros usuários

### Usuários Comuns
1. Podem apenas visualizar a lista de usuários
2. Não têm acesso às funcionalidades administrativas

### Validações
1. Email deve ser único
2. Senha é obrigatória
3. Nome é obrigatório
4. Telefone é opcional

## Atualizações e Migrações

O sistema inclui migrações automáticas para:
1. Adicionar coluna tipo_usuario
2. Criar usuário admin padrão
3. Backup de dados durante migrações

## Interface do Usuário

### Elementos Visuais
- Mensagens de sucesso em verde
- Mensagens de erro em vermelho
- Botões de ação com cores intuitivas
- Layout responsivo

### Ações Administrativas
- Botão "Promover" para usuários comuns
- Botão "Rebaixar" para administradores
- Botão "Excluir" para remoção de usuários
- Confirmação antes de ações críticas

## Instalação

1. Clone o repositório
2. Configure um servidor web com PHP 7+
3. Certifique-se que as extensões PDO e SQLite estão habilitadas
4. Dê permissões de escrita para a pasta database/
5. Acesse o sistema pelo navegador

## Manutenção

Para manutenção do sistema:
1. Backup regular do arquivo SQLite
2. Monitoramento de logs de erro
3. Verificação periódica de segurança
4. Atualização das dependências 