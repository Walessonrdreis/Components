# Componente Calendar

Este componente foi isolado para facilitar a reutilização em diferentes páginas.

## Estrutura do Componente

- Calendar.js: JavaScript que implementa a funcionalidade do calendário.
- Calendar.css: Estilos específicos para o componente.
- constants/: Constantes e configurações.
- examples/: Exemplos de uso.
- src/: Código fonte organizado em módulos.

## Como Utilizar

1. Inclua os arquivos CSS e JS do componente na sua página:
   Exemplo:
   <link rel="stylesheet" href="components/Calendar/Calendar.css">
   <script src="components/Calendar/Calendar.js"></script>

2. Inicialize o componente via jQuery:
   Exemplo:
   $('#meu-calendario').calendar();

3. Configure os parâmetros conforme necessário.

## Observações

- As dependências (como jQuery) devem estar incluídas na sua página.
- Este componente foi estruturado para facilitar a manutenção e reutilização. 