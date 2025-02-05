# Componente Calendário Profissional

Um componente de calendário moderno, responsivo e profissional com suporte a feriados nacionais, desenvolvido em duas versões: JavaScript puro e PHP.

## 🌟 Características Principais

- 📅 Calendário totalmente responsivo
- 🎨 Design moderno e intuitivo
- 🏖️ Suporte a feriados nacionais
- 🔄 Navegação AJAX entre meses
- 📱 Adaptação automática para mobile
- 🎯 Seleção de data com feedback visual
- ⌨️ Input mascarado para data
- 🌐 Internacionalização (pt-BR)
- 🎠 Animações e transições suaves

## 🛠️ Tecnologias Utilizadas

- jQuery 3.6.0+
- jQuery UI 1.13.2+
- jQuery Mask Plugin
- Font Awesome 6.0.0+
- PHP 7.0+

## 📦 Estrutura do Projeto

```
projeto/
├── components/           # Versão JavaScript
│   ├── Calendar/
│   │   ├── Calendar.js
│   │   ├── Calendar.css
│   │   └── constants/
│   │       └── holidays.js
│   ├── CalendarDay/
│   │   ├── CalendarDay.js
│   │   └── CalendarDay.css
│   └── DateInput/
│       ├── DateInput.js
│       └── DateInput.css
│
└── calendarPhp/         # Versão PHP
    ├── Calendar.php
    ├── ajax/
    │   └── updateMonth.php
    ├── assets/
    │   ├── calendar.js
    │   └── calendar.css
    └── constants/
        └── holidays.php
```

## 💻 Como Usar

### Versão JavaScript

```html
<!-- Incluir CSS -->
<link rel="stylesheet" href="components/Calendar/Calendar.css">
<link rel="stylesheet" href="components/CalendarDay/CalendarDay.css">
<link rel="stylesheet" href="components/DateInput/DateInput.css">

<!-- Estrutura HTML -->
<div id="meu-calendario"></div>

<!-- Incluir JavaScript -->
<script src="components/Calendar/Calendar.js"></script>
<script>
    new Calendar({
        containerId: 'meu-calendario',
        options: {
            theme: 'light',
            locale: 'pt-BR'
        }
    });
</script>
```

### Versão PHP

```php
<?php
require_once 'calendarPhp/Calendar.php';

$calendar = new Calendar([
    'theme' => 'light',
    'locale' => 'pt-BR',
    'containerId' => 'meu-calendario'
]);

echo $calendar->render();
?>
```

## ⚙️ Configurações Disponíveis

```javascript
{
    theme: 'light',           // Tema (light/dark)
    locale: 'pt-BR',          // Localização
    firstDayOfWeek: 0,        // Primeiro dia da semana (0 = Domingo)
    showToday: true,          // Mostrar dia atual
    showNavigation: true,     // Mostrar botões de navegação
    doubleClickDelay: 300,    // Delay para duplo clique em feriados
    dateFormat: 'dd/mm/yy'    // Formato da data
}
```

## 🎯 Funcionalidades Específicas

### Feriados
- Destacados com borda dourada
- Requer duplo clique para seleção
- Tooltip com nome do feriado no hover
- Configuráveis via arquivo de constantes

### Navegação
- Botões anterior/próximo mês
- Atualização via AJAX (versão PHP)
- Indicador de carregamento
- Tratamento de erros

### Input de Data
- Campo mascarado (99/99/9999)
- Somente leitura
- Formatação automática
- Validação de entrada

### Responsividade
- Layout adaptativo
- Tamanho mínimo para mobile (280px)
- Tamanho máximo para desktop (400px)
- Ajustes automáticos de fonte e espaçamento

## 🔄 Eventos Disponíveis

```javascript
// Seleção de data
$('#calendar').on('calendar:dateSelected', function(e, date) {
    console.log('Data selecionada:', date);
});

// Mudança de mês
$('#calendar').on('calendar:monthChanged', function(e, month, year) {
    console.log('Mês alterado:', month, year);
});
```

## 🎨 Personalização CSS

O componente possui classes CSS bem definidas para personalização:

- `.calendar-container`: Container principal
- `.calendar`: Wrapper do calendário
- `.calendar-header`: Cabeçalho com navegação
- `.calendar-day`: Dias individuais
- `.calendar-day.today`: Dia atual
- `.calendar-day.feriado`: Dias de feriado

## 🔧 Melhorias Implementadas

1. **Estruturais**
   - Refatoração para padrão de plugin jQuery
   - Implementação de classes ES6
   - Organização modular do código

2. **Visuais**
   - Animações suaves
   - Feedback visual de interações
   - Indicador de carregamento
   - Mensagens de erro estilizadas

3. **Funcionais**
   - Navegação AJAX
   - Validação de entrada
   - Tratamento de erros
   - Eventos personalizados

4. **Performance**
   - Lazy loading de recursos
   - Otimização de renderização
   - Cache de elementos DOM

## 📱 Compatibilidade

- Chrome 61+
- Firefox 60+
- Safari 11+
- Edge 16+
- iOS Safari 11+
- Android Browser 76+

## 🚀 Próximas Atualizações Planejadas

- [ ] Suporte a múltiplos idiomas
- [ ] Temas personalizáveis
- [ ] Seleção de intervalo de datas
- [ ] Integração com eventos do Google Calendar
- [ ] Modo dark/light automático

## 📄 Licença

MIT License - Veja o arquivo LICENSE.md para detalhes

## Características

- 📅 Calendário responsivo
- 🎨 Design moderno e limpo
- 📱 Adaptável para dispositivos móveis
- 🎯 Seleção de data com feedback visual
- 🏖️ Suporte a feriados nacionais
- 🔄 Navegação intuitiva entre meses
- 📝 Input de data integrado

## Estrutura do Componente

```
Calendar/
├── Calendar.js    # Lógica e estilos do componente
├── Calendar.php   # Wrapper PHP para renderização
└── README.md      # Documentação
```

## Como Usar

### 1. Estrutura de Arquivos

Primeiro, copie a estrutura de arquivos para seu projeto:

```
Calendar/
├── Calendar.js    # Lógica e estilos do componente
├── Calendar.php   # Wrapper PHP para renderização
└── README.md      # Documentação
```

### 2. Incluindo na Página

Adicione o seguinte código PHP onde deseja exibir o calendário:

```php
<?php
require_once 'components/Calendar/Calendar.php';
$calendar = new Calendar();
echo $calendar->render();
?>
```

### 3. Controlando a Visibilidade

O calendário só será exibido quando receber "sim" como resposta. Para controlar:

```javascript
// Mostrar o calendário
updateCalendarVisibility('sim');

// Ocultar o calendário
updateCalendarVisibility('não');
```

## Feriados Incluídos

O componente inclui automaticamente os seguintes feriados nacionais:

- 01/01 - Ano Novo
- 21/04 - Tiradentes
- 01/05 - Dia do Trabalho
- 07/09 - Independência do Brasil
- 12/10 - Nossa Senhora Aparecida
- 02/11 - Finados
- 15/11 - Proclamação da República
- 25/12 - Natal

## Personalização

O componente já vem com estilos predefinidos, mas você pode personalizá-los sobrescrevendo as classes CSS:

- `.calendar-container`: Container principal
- `.calendar`: Wrapper do calendário
- `.calendar-header`: Cabeçalho com dias da semana
- `.calendar-days`: Grid de dias
- `.day`: Dia individual
- `.day.holiday`: Estilo dos feriados

## Requisitos Técnicos

- PHP 7.0 ou superior
- Navegador com suporte a JavaScript moderno
- Servidor web (Apache/Nginx)

## Exemplo de Implementação

```html
<!-- Sua página PHP -->
<div class="sua-pagina">
    <!-- Outros elementos -->
    
    <?php
    require_once 'components/Calendar/Calendar.php';
    $calendar = new Calendar();
    echo $calendar->render();
    ?>
    
    <!-- Campo de resposta que controla o calendário -->
    <select onchange="updateCalendarVisibility(this.value)">
        <option value="não">Não</option>
        <option value="sim">Sim</option>
    </select>
</div>
```

## Suporte

Em caso de dúvidas ou problemas, verifique:

1. Se todos os arquivos do componente estão no lugar correto
2. Se o JavaScript está habilitado no navegador
3. Se os caminhos dos arquivos estão corretos na sua implementação

## Contribuição

Sinta-se à vontade para contribuir com melhorias ou reportar problemas através de issues ou pull requests.

## Atualização do README com exemplos de uso em JavaScript e PHP

### Exemplo de uso em JavaScript

```javascript
// Inicialização básica
const calendar = new Calendar({
    containerId: 'meu-calendario',
    options: {
        theme: 'light',
        locale: 'pt-BR',
        firstDayOfWeek: 0,
        showToday: true,
        showNavigation: true
    }
});

// Exemplo com eventos
const calendar = new Calendar({
    containerId: 'meu-calendario',
    options: {
        theme: 'light',
        locale: 'pt-BR',
        events: [
            {
                id: 1,
                date: '2025-02-02',
                title: 'Reunião',
                description: 'Reunião importante'
            }
        ],
        holidays: {
            '25/12': 'Natal',
            '01/01': 'Ano Novo'
        },
        unavailableDays: ['24/12', '31/12'],
        onDateSelect: (date) => {
            console.log('Data selecionada:', date);
        },
        onMonthChange: (month, year) => {
            console.log('Mês alterado:', month, year);
        }
    }
});
```

### Exemplo de uso em PHP

```php
// Inicialização do Calendar
$calendar = new Calendar($db, [
    'theme' => 'light',
    'locale' => 'pt-BR'
]);

// Renderização do calendário
echo $calendar->render([
    'containerId' => 'meu-calendario',
    'events' => [
        [
            'id' => 1,
            'date' => '2025-02-02',
            'title' => 'Reunião',
            'description' => 'Reunião importante'
        ]
    ],
    'holidays' => [
        '25/12' => 'Natal',
        '01/01' => 'Ano Novo'
    ],
    'unavailableDays' => ['24/12', '31/12']
]);

// Adicionando eventos
$calendar->addEvent([
    'date' => '2025-02-02',
    'title' => 'Reunião',
    'description' => 'Reunião importante'
]);

// Listando eventos de um período
$events = $calendar->getEvents('2025-02-01', '2025-02-28');

// Verificando disponibilidade
$isAvailable = $calendar->checkAvailability('2025-02-02');
