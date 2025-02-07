# Bugs e Melhorias Potenciais

## Bugs Potenciais

### Gerenciamento de Estado
- [ ] Possível race condition no cadastro duplo de alunos
    Exemplo: Usuário clica duas vezes rapidamente no botão cadastrar, causando duplicação
- [ ] Estado do calendário pode ficar dessincronizado após múltiplas edições
    Exemplo: Ao editar várias vezes o mesmo horário, o calendário mostra hora errada
- [ ] Possível memory leak em listeners de eventos que não são removidos
    Exemplo: Eventos do modal não são removidos após fechar, causando lentidão

### Validações
- [ ] Falta validação mais robusta de email
    Exemplo: Email "teste@teste" é aceito como válido
- [ ] Falta validação de datas passadas no calendário
    Exemplo: Sistema permite agendar aulas para datas que já passaram
- [ ] Falta tratamento de caracteres especiais nos inputs
    Exemplo: Nome com aspas simples causa erro no SQL

### Concorrência
- [ ] Possível conflito quando dois usuários editam o mesmo aluno
    Exemplo: Usuário A e B editam simultaneamente, mudanças do usuário A são perdidas
- [ ] Falta bloqueio de múltiplos cliques em botões de ação
    Exemplo: Cliques rápidos no botão excluir geram múltiplas requisições
- [ ] Possível perda de dados em requisições simultâneas
    Exemplo: Salvamento de aulas simultâneas causa perda de horários

### Interface
- [ ] Modal pode ficar preso se houver erro durante carregamento
    Exemplo: Erro na API deixa modal aberto sem opção de fechar
- [ ] Tooltips podem ficar presos em dispositivos móveis
    Exemplo: Tooltip permanece visível após tocar em outro elemento
- [ ] Scroll pode quebrar em certos navegadores durante animações
    Exemplo: Safari iOS trava scroll durante animação do modal

## Melhorias Sugeridas

### Performance
- [ ] Implementar lazy loading para lista de alunos
    Exemplo: Carregar apenas 20 alunos inicialmente, mais conforme scroll
- [ ] Adicionar cache para requisições frequentes
    Exemplo: Cachear lista de disciplinas por 5 minutos
- [ ] Otimizar renderização de componentes grandes
    Exemplo: Usar virtualização na lista de alunos

### UX/UI
- [ ] Adicionar feedback visual mais claro para ações
    Exemplo: Mostrar toast de sucesso/erro após cada ação
- [ ] Melhorar acessibilidade (ARIA labels, contraste)
    Exemplo: Adicionar aria-label="Editar aluno João" nos botões
- [ ] Implementar undo/redo para ações importantes
    Exemplo: Permitir desfazer exclusão de aluno por 5 segundos

### Funcionalidades
- [ ] Implementar sistema de busca mais avançado
    Exemplo: Buscar por disciplina, status e período de aulas
- [ ] Adicionar filtros por status/disciplina
    Exemplo: Filtrar alunos por "Aulas em andamento" ou "Matemática"
- [ ] Implementar exportação de dados
    Exemplo: Exportar lista de alunos para Excel ou CSV

### Segurança
- [ ] Implementar rate limiting nas APIs
    Exemplo: Limitar a 100 requisições por minuto por IP
- [ ] Adicionar validação de token em todas requisições
    Exemplo: Verificar JWT token em cada chamada de API
- [ ] Melhorar sanitização de inputs
    Exemplo: Escapar caracteres especiais antes de salvar no banco

### Código
- [ ] Migrar para TypeScript
    Exemplo: Adicionar tipagem forte em todos componentes
- [ ] Implementar testes automatizados
    Exemplo: Adicionar testes unitários para validações
- [ ] Melhorar documentação do código
    Exemplo: Documentar parâmetros e retornos de cada método

### Infraestrutura
- [ ] Implementar CI/CD
    Exemplo: Configurar pipeline no GitHub Actions
- [ ] Adicionar monitoramento de erros
    Exemplo: Integrar Sentry para tracking de erros
- [ ] Melhorar sistema de backup
    Exemplo: Backup automático diário do banco de dados

## Exemplos de Implementação

### Exemplo de Correção de Race Condition
```javascript
// Antes
handleSubmit() {
    this.submitForm();
}

// Depois
handleSubmit() {
    if (this.isSubmitting) return;
    this.isSubmitting = true;
    
    try {
        await this.submitForm();
    } finally {
        this.isSubmitting = false;
    }
}
```

### Exemplo de Melhoria de Validação
```javascript
// Antes
validateEmail(email) {
    return email.includes('@');
}

// Depois
validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}
```

### Exemplo de Feedback Visual
```javascript
// Antes
async deleteAluno(id) {
    await api.delete(id);
}

// Depois
async deleteAluno(id) {
    try {
        showLoading('Excluindo aluno...');
        await api.delete(id);
        showSuccess('Aluno excluído com sucesso!');
    } catch (error) {
        showError('Erro ao excluir aluno');
    } finally {
        hideLoading();
    }
}
```

## Prioridades Sugeridas

### Alta Prioridade
1. Corrigir race conditions no cadastro
2. Implementar validações robustas
3. Melhorar feedback visual
4. Implementar tratamento de erros consistente

### Média Prioridade
1. Implementar sistema de busca avançado
2. Melhorar performance geral
3. Adicionar testes automatizados
4. Implementar histórico de alterações

### Baixa Prioridade
1. Implementar modo escuro
2. Adicionar funcionalidades extras de exportação
3. Migrar para TypeScript
4. Implementar sistema de notificações

## Como Contribuir
1. Escolha um item da lista
2. Crie uma branch específica
3. Implemente a correção/melhoria
4. Submeta um pull request
5. Atualize este documento

## Notas
- Este documento deve ser atualizado constantemente
- Prioridades podem mudar conforme feedback dos usuários
- Bugs críticos devem ser tratados imediatamente
- Melhorias devem ser implementadas de forma incremental
