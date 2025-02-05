<?php
/**
 * Arquivo de atualização AJAX do calendário
 * 
 * @package Calendar
 * @subpackage Ajax
 */

header('Content-Type: application/json');

require_once '../Calendar.php';

try {
    // Valida os parâmetros recebidos
    $direction = isset($_POST['direction']) ? intval($_POST['direction']) : 0;
    $currentMonth = isset($_POST['currentMonth']) ? intval($_POST['currentMonth']) : date('n');
    $containerId = isset($_POST['containerId']) ? $_POST['containerId'] : 'calendar-php';

    // Calcula o novo mês
    $targetMonth = $currentMonth + $direction;
    $targetYear = date('Y');
    
    // Ajusta a virada de ano
    if ($targetMonth > 12) {
        $targetMonth = 1;
        $targetYear++;
    } elseif ($targetMonth < 1) {
        $targetMonth = 12;
        $targetYear--;
    }

    // Cria uma nova instância do calendário
    $calendar = new Calendar([
        'containerId' => $containerId
    ]);

    // Define a data atual para o mês solicitado
    $calendar->setCurrentDate(new DateTime("$targetYear-$targetMonth-01"));

    // Renderiza o novo conteúdo
    $html = $calendar->renderContent();

    echo json_encode([
        'success' => true,
        'html' => $html
    ]);

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
} 