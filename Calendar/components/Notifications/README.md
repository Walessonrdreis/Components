# Componente de Notificações

O componente de notificações é um sistema modular e moderno para exibir mensagens no sistema, com uma lógica distribuída em módulos especializados. Ele foi desenvolvido para facilitar a manutenção e a personalização, permitindo a extensão de funcionalidades sem interferir nas demais partes do sistema.

## Estrutura do Componente

<!-- Integração com o Notifications -->

## Integração

Para integrar o componente Notifications à sua aplicação, siga os passos abaixo:

1. Importe o componente:
   ```js
   import Notifications from 'components/Notifications';
   ```

2. Utilize-o na sua aplicação:
   ```jsx
   function App() {
     return (
       <div>
         <Notifications />
       </div>
     );
   }

   export default App;
   ```

3. Customize as propriedades conforme necessário:
   - Exemplo: <Notifications type="success" message="Operação realizada com sucesso!" />

## Exemplos

Exemplo básico:
<Notifications type="info" message="Esta é uma notificação de exemplo!" />
