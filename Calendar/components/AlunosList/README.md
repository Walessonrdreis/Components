# Componente AlunosList

Este componente foi isolado para facilitar a reutilização em diferentes páginas.

## Estrutura do Componente

- AlunosList.js: JavaScript que implementa a comunicação e manipulação da lista de alunos.
- AlunosList.css: Estilos específicos para a lista de alunos.

## Como Utilizar

1. Inclua os arquivos CSS e JS do componente na sua página:
   Exemplo:
   <link rel="stylesheet" href="components/AlunosList/AlunosList.css">
   <script src="components/AlunosList/AlunosList.js"></script>

2. Inicialize o componente via jQuery no container desejado:
   Exemplo:
   $('#lista-alunos').alunosList();

## Observações

- Certifique-se de que todas as dependências (como jQuery) estejam corretamente referenciadas na sua página.
- Este componente facilita a gestão de alunos através de uma interface interativa. 