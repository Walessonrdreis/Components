# Componente AlunoCard

Um componente jQuery moderno e profissional para exibir informações de alunos em formato de card.

## Características

- Design moderno e responsivo
- Animações suaves
- Tooltips informativos
- Tratamento de erros robusto
- Validação de dados
- Prevenção XSS
- Suporte a temas via CSS Variables
- Totalmente documentado

## Instalação

```html
<!-- Inclua os arquivos necessários -->
<link rel="stylesheet" href="components/AlunoCard/AlunoCard.css">
<script src="components/AlunoCard/AlunoCard.js"></script>
```

## Uso Básico

```javascript
// Inicialize o componente
$('#meuContainer').alunoCard({
    aluno: {
        id: 1,
        nome: 'João Silva',
        matricula: '12345',
        disciplina: 'Matemática',
        proxima_aula: '2024-03-20'
    },
    onVerAulas: (alunoId) => {
        console.log('Ver aulas do aluno:', alunoId);
    },
    onVisualizarPDF: (alunoId) => {
        console.log('Visualizar PDF do aluno:', alunoId);
    },
    onEditar: (alunoId) => {
        console.log('Editar aluno:', alunoId);
    }
});
```

## Opções

| Opção | Tipo | Padrão | Descrição |
|-------|------|--------|-----------|
| aluno | Object | null | Dados do aluno (obrigatório) |
| onVerAulas | Function | null | Callback ao clicar no botão de ver aulas |
| onVisualizarPDF | Function | null | Callback ao clicar no botão de PDF |
| onEditar | Function | null | Callback ao clicar no botão de editar |

## Estrutura do Objeto Aluno

```javascript
{
    id: Number,          // ID único do aluno (obrigatório)
    nome: String,        // Nome do aluno (obrigatório)
    matricula: String,   // Número de matrícula
    disciplina: String,  // Nome da disciplina
    proxima_aula: String // Data da próxima aula (formato ISO)
}
```

## Métodos Públicos

### atualizarDados(aluno)
Atualiza os dados do aluno no card.

```javascript
const $card = $('#meuContainer');
$card.data('alunoCard').atualizarDados({
    id: 1,
    nome: 'João Silva',
    // ... outros dados
});
```

### destruir()
Remove o componente e seus event listeners.

```javascript
$('#meuContainer').data('alunoCard').destruir();
```

## Personalização

O componente utiliza CSS Variables para fácil personalização:

```css
:root {
    --aluno-card-primary: #2196f3;    /* Cor primária */
    --aluno-card-secondary: #f5f5f5;  /* Cor secundária */
    --aluno-card-text: #333;          /* Cor do texto */
    --aluno-card-border: #e0e0e0;     /* Cor da borda */
    /* ... outras variáveis */
}
```

## Compatibilidade

- jQuery 3.0+
- Navegadores modernos (Chrome, Firefox, Safari, Edge)
- Suporte a dispositivos móveis e responsividade

## Desenvolvimento

O componente está organizado em módulos:

- `AlunoCard.js` - Classe principal
- `constants/index.js` - Constantes e configurações
- `utils/index.js` - Funções utilitárias
- `AlunoCard.css` - Estilos

## Contribuição

1. Fork o repositório
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

## Licença

MIT License - veja o arquivo LICENSE para detalhes. 