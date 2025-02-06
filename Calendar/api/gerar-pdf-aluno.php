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
                        line-height: 1.6;
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
                        border-radius: 5px;
                        margin-bottom: 30px;
                        border-left: 4px solid #0066cc;
                    }
                    .aluno-info p {
                        margin: 5px 0;
                        color: #333;
                    }
                    .info-label {
                        font-weight: bold;
                        color: #666;
                        display: inline-block;
                        width: 120px;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-top: 20px;
                    }
                    th {
                        background-color: #0066cc;
                        color: white;
                        padding: 10px;
                        text-align: left;
                    }
                    td {
                        padding: 8px;
                        border-bottom: 1px solid #ddd;
                    }
                    tr:nth-child(even) {
                        background-color: #f8f9fa;
                    }
                    .status-agendado { color: #28a745; }
                    .status-cancelado { color: #dc3545; }
                    .status-realizado { color: #0066cc; }
                </style>
            </head>
            <body>
                <h1>Relatório de Aulas</h1>
                <div class="aluno-info">
                    <h2>Informações do Aluno</h2>
                    <p><span class="info-label">Nome:</span> ' . htmlspecialchars($dados['aluno']['nome']) . '</p>
                    <p><span class="info-label">Email:</span> ' . htmlspecialchars($dados['aluno']['email']) . '</p>
                    <p><span class="info-label">Disciplina:</span> ' . 
                        (htmlspecialchars($dados['aluno']['disciplina']) ?: 'Não definida') . '</p>
                </div>

                <h2>Aulas Agendadas</h2>
                <table>
                    <thead>
                        <tr>
                            <th width="33%">Data</th>
                            <th width="33%">Horário</th>
                            <th width="34%">Status</th>
                        </tr>
                    </thead>
                    <tbody>';

            foreach ($dados['aulas'] as $aula) {
                $statusClass = 'status-' . strtolower($aula['status']);
                $html .= '<tr>
                    <td>' . date('d/m/Y', strtotime($aula['data_aula'])) . '</td>
                    <td>' . date('H:i', strtotime($aula['horario'])) . '</td>
                    <td class="' . $statusClass . '">' . ucfirst($aula['status']) . '</td>
                </tr>';
            }

            $html .= '
                    </tbody>
                </table>
                <div style="margin-top: 30px; font-size: 12px; color: #666; text-align: center;">
                    <p>Relatório gerado em ' . date('d/m/Y H:i') . '</p>
                </div>
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