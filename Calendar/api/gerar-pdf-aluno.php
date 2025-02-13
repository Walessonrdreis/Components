<?php
// Primeiro, iniciamos o buffer de saída
ob_start();

require_once 'AgendamentoController.php';
require_once __DIR__ . '/../vendor/autoload.php';
require_once __DIR__ . '/../vendor/tecnickcom/tcpdf/tcpdf.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['aluno_id'])) {
    try {
        $controller = new AgendamentoController();
        $dados = $controller->getDadosAlunoPDF($_GET['aluno_id']);
        
        error_log('Dados recebidos do controller: ' . print_r($dados, true));
        
        if ($dados['success']) {
            // Cria uma nova instância do TCPDF
            $pdf = new TCPDF('L', 'mm', 'A4', true, 'UTF-8');
            
            // Configurações básicas
            $pdf->SetCreator('Sistema de Aulas');
            $pdf->SetAuthor('Sistema de Agendamento');
            $pdf->SetTitle('Agenda do Aluno - ' . $dados['aluno']['nome']);
            
            // Remove cabeçalho e rodapé
            $pdf->setPrintHeader(false);
            $pdf->setPrintFooter(false);
            
            // Configura margens (left, top, right)
            $pdf->SetMargins(15, 15, 15);
            $pdf->SetAutoPageBreak(TRUE, 15);
            
            // Adiciona página
            $pdf->AddPage();
            
            // Define fonte
            $pdf->SetFont('helvetica', '', 12);

            // Configura o locale para português
            setlocale(LC_TIME, 'pt_BR', 'pt_BR.utf-8', 'portuguese');
            date_default_timezone_set('America/Sao_Paulo');

            // Caminho base para as imagens
            $base_path = __DIR__ . '/../';
            $logo_path = $base_path . 'assets/img/logo.jpeg';
            $arvore_path = $base_path . 'assets/img/arvore-musical.jpeg';

            error_log('Caminho do logo: ' . $logo_path);
            error_log('Caminho da árvore: ' . $arvore_path);

            // Adiciona logo no topo
            if (file_exists($logo_path)) {
                $pdf->Image($logo_path, 120, 15, 50, 0, 'JPEG');
            }

            // Função para traduzir dias da semana
            function traduzirDiaSemana($dia_ingles) {
                $dias = [
                    'Monday'    => 'Segunda-feira',
                    'Tuesday'   => 'Terça-feira',
                    'Wednesday' => 'Quarta-feira',
                    'Thursday'  => 'Quinta-feira',
                    'Friday'    => 'Sexta-feira',
                    'Saturday'  => 'Sábado',
                    'Sunday'    => 'Domingo'
                ];
                return $dias[$dia_ingles] ?? $dia_ingles;
            }

            // Conteúdo do PDF
            $html = '
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body {
                        font-family: helvetica;
                        line-height: 1.3;
                    }
                    .header {
                        text-align: center;
                        margin-bottom: 15px;
                    }
                    .header h1 {
                        font-size: 24px;
                        font-weight: bold;
                        color: #000;
                        margin: 3px 0;
                        text-align: center;
                    }
                    .header h2 {
                        font-size: 18px;
                        font-weight: bold;
                        color: #000;
                        margin: 3px 0;
                    }
                    .aluno-info {
                        font-size: 12px;
                        width: 80%;
                        margin: 0 auto;
                    }
                
                    .aluno-info table {
                        width: 100%;
                        border: none;
                        margin-bottom: 20px;
                    }
                    .aluno-info td {
                        border: none;
                        border-bottom: solid 1px #000;
                        padding: 8px 0;
                    }
                    .aluno-info .matricula {
                        text-align: right;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin: 20px 0;
                    }
                    th {
                        background-color: #f5f5f5;
                        color: #333;
                        font-weight: bold;
                        padding: 10px;
                        border: 1px solid #ddd;
                    }
                    td {
                        padding: 8px;
                        border: 1px solid #ddd;
                        text-align: center;
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>Escola de Música Tutti Sonora</h1>
                    <h2>IASD Central Taguatinga</h2>
                </div>

                <div class="aluno-info">
                    <table>
                        <tr>
                            <td>Nome do Aluno: <strong>' . htmlspecialchars($dados['aluno']['nome']) . '</strong></td>
                            <td class="matricula">Matrícula: <strong>' . htmlspecialchars($dados['aluno']['matricula'] ?? 'Não informada') . '</strong></td>
                        </tr>
                        <tr>
                            <td colspan="2">Email: <strong>' . htmlspecialchars($dados['aluno']['email']) . '</strong></td>
                        </tr>
                    </table>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th>Aula</th>
                            <th>Data</th>
                            <th>Dia</th>
                            <th>Hora</th>
                            <th>Professor(a)</th>
                            <th>Disciplina</th>
                            <th>Assinatura</th>
                        </tr>
                    </thead>
                    <tbody>';

            if (!empty($dados['aulas'])) {
                $aula_count = 1;
                foreach ($dados['aulas'] as $aula) {
                    $data = new DateTime($aula['data_aula']);
                    $dia_semana = traduzirDiaSemana($data->format('l'));
                    
                    $html .= '<tr>
                        <td>' . $aula_count . '</td>
                        <td>' . $data->format('d/m/Y') . '</td>
                        <td>' . $dia_semana . '</td>
                        <td>' . date('H:i', strtotime($aula['horario'])) . '</td>
                        <td>Avyen Aramás Melgaço</td>
                        <td>' . htmlspecialchars($aula['disciplina'] ?: 'PIANO CLÁSSICO') . '</td>
                        <td></td>
                    </tr>';
                    $aula_count++;
                }
            } else {
                $html .= '<tr><td colspan="7" style="text-align: center;">Nenhuma aula agendada</td></tr>';
            }

            $html .= '
                    </tbody>
                </table>
                
                <div style="margin-top: 30px; text-align: center; font-size: 10px;">
                    <p>Este documento é um comprovante de agendamento de aulas.</p>
                </div>
            </body>
            </html>';
            
            error_log('HTML gerado: ' . $html);
            
            // Adiciona o conteúdo HTML ao PDF
            $pdf->writeHTML($html, true, false, true, false, '');
            
            // Adiciona árvore musical no rodapé
            if (file_exists($arvore_path)) {
                $pdf->Image($arvore_path, 120, $pdf->GetY() + 10, 50, 0, 'JPEG');
            }
            
            // Limpa qualquer saída anterior
            ob_end_clean();
            
            // Define os headers corretos
            header('Content-Type: application/pdf');
            header('Cache-Control: private, must-revalidate, post-check=0, pre-check=0, max-age=1');
            header('Pragma: public');
            header('Expires: Sat, 26 Jul 1997 05:00:00 GMT');
            header('Last-Modified: '.gmdate('D, d M Y H:i:s').' GMT');
            
            // Saída do PDF
            $pdf->Output('aluno_' . ($dados['aluno']['matricula'] ?? 'sem_matricula') . '.pdf', 'I');
            exit;
        } else {
            throw new Exception($dados['message'] ?? 'Erro ao buscar dados do aluno');
        }
    } catch (Exception $e) {
        error_log('Erro ao gerar PDF: ' . $e->getMessage());
        header('Content-Type: application/json');
        echo json_encode([
            'success' => false, 
            'message' => 'Erro ao gerar PDF: ' . $e->getMessage()
        ]);
    }
}
?> 