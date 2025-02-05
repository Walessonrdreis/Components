<?php
require_once 'calendarPhp/Calendar.php';

$calendar = new Calendar([
    'theme' => 'light',
    'locale' => 'pt-BR',
    'firstDayOfWeek' => 0,
    'containerId' => 'meu-calendario'
]);

?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Calendário PHP</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
</head>
<body>
    <?php echo $calendar->render(); ?>
</body>
</html> 