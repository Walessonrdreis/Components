<?php
// Primeiro, vamos garantir que não haja saída antes do PDF
ob_clean();

require_once 'AgendamentoController.php';
require_once __DIR__ . '/../vendor/autoload.php';

use TCPDF;

if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['aluno_id'])) {
    try {
        $controller = new AgendamentoController();
        $dados = $controller->getDadosAlunoPDF($_GET['aluno_id']);
        
        if ($dados['success']) {
            // Cria uma nova instância do TCPDF
            $pdf = new TCPDF('P', 'mm', 'A4', true, 'UTF-8');
            
            // Configurações básicas
            $pdf->SetCreator('Sistema de Aulas');
            $pdf->SetAuthor('Sistema de Agendamento');
            $pdf->SetTitle('Dados do Aluno - ' . $dados['aluno']['nome']);
            
            // Remove cabeçalho e rodapé
            $pdf->setPrintHeader(false);
            $pdf->setPrintFooter(false);
            
            // Configura margens (left, top, right)
            $pdf->SetMargins(15, 15, 15);
            
            // Adiciona página
            $pdf->AddPage();
            
            // Define fonte
            $pdf->SetFont('helvetica', '', 10);

            // Conteúdo do PDF
            $html = '
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        margin: 0;
                        padding: 20px;
                        background-color: #f4f4f4;
                        height: 100%;
                    }
                   
                    h1 {
                        color: #0066cc;
                        font-size: 24px;
                        border-bottom: 2px solid #0066cc;
                        padding-bottom: 10px;
                        margin-bottom: 20px;


                    }
                    .aluno-info {
                        background-color: #f8f9fa;
                        padding: 15px;
                        margin-bottom: 20px;
                        border: 1px solid #ddd;
                    }
                    .aluno-info h2 {
                        color: #333;
                        font-size: 20px;
                        margin: 0 0 10px 0;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-top: 20px;
                        font-size: 12px;
                    }
                    th {
                        background-color: #0066cc;
                        color: #ffffff;
                        font-weight: bold;
                        padding: 8px;
                        text-align: left;
                        border: 1px solid #0052a3;
                    }
                    td {
                        padding: 8px;
                        border: 1px solid #ddd;
                    }
                    tr:nth-child(even) {
                        background-color: #f9f9f9;
                    }
                </style>
            </head>
            <body>
                <h1>Dados do Aluno</h1>
                <div class="aluno-info">
                    <h2>' . htmlspecialchars($dados['aluno']['nome']) . '</h2>
                    <p><strong>Tipo de Aula:</strong> ' . htmlspecialchars($dados['aluno']['tipo_aula']) . '</p>
                </div>
                
                <h2 style="color: #0066cc; font-size: 18px;">Aulas Agendadas</h2>
                <table cellpadding="4">
                    <thead>
                        <tr>
                            <th width="33%">Data</th>
                            <th width="33%">Horário</th>
                            <th width="34%">Status</th>
                        </tr>
                    </thead>
                    <tbody>';
            
            foreach ($dados['aulas'] as $aula) {
                $status_color = '#333333';
                switch(strtolower($aula['status'])) {
                    case 'agendado':
                        $status_color = '#28a745';
                        break;
                    case 'cancelado':
                        $status_color = '#dc3545';
                        break;
                    case 'realizado':
                        $status_color = '#0066cc';
                        break;
                }
                
                $html .= '<tr>
                    <td>' . date('d/m/Y', strtotime($aula['data_aula'])) . '</td>
                    <td>' . date('H:i', strtotime($aula['horario'])) . '</td>
                    <td style="color: ' . $status_color . '; font-weight: bold;">' . 
                        ucfirst($aula['status']) . '</td>
                </tr>';
            }
            
            $html .= '
                    </tbody>
                </table>
            </body>
            </html>';
            
            // Adiciona o conteúdo HTML ao PDF
            $pdf->writeHTML($html, true, false, true, false, '');
            
            // Limpa qualquer saída anterior
            ob_end_clean();
            
            // Define os headers corretos
            header('Content-Type: application/pdf');
            header('Cache-Control: private, must-revalidate, post-check=0, pre-check=0, max-age=1');
            header('Pragma: public');
            header('Expires: Sat, 26 Jul 1997 05:00:00 GMT');
            header('Last-Modified: '.gmdate('D, d M Y H:i:s').' GMT');
            
            // Saída do PDF
            $pdf->Output('aluno_' . $dados['aluno']['id'] . '.pdf', 'I');
            exit;
        }
    } catch (Exception $e) {
        header('Content-Type: application/json');
        echo json_encode([
            'success' => false, 
            'message' => 'Erro ao gerar PDF: ' . $e->getMessage()
        ]);
    }
}
?> 