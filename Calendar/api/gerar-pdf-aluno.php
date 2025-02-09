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
            $base_path = 'F:/xampp/htdocs/Components/Calendar';
            $logo_path = $base_path . '/assets/img/logo.jpg';
            $arvore_path = $base_path . '/assets/img/arvore-musical.jpg';

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
                     
                    }
                
                    .aluno-info table {
                        width: 100%;
                        border: none;
                        
                    }
                    .aluno-info td {
                        border: none;
                        border-bottom: solid 1px #000;
                        padding: 0;
                        margin: 0 auto;
                        
                    }
                    .aluno-info .matricula {
                        text-align: right;
                    }
                    table {
                        width: 80%;
            margin: 20px auto;
            border-collapse: collapse;
            background-color: white;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
            margin: 0 auto;
                    }
                 th {
                    background-color:rgb(166, 156, 156);
                    color: #333;
        }
                    th, td {
                      border: 1px solid #ddd;
            padding: 10px;
            text-align: center;
                    }
                    th {
                        background-color: #fff;
                        font-weight: bold;
                    }
                    .col-aula {
                        text-align: center;
                        width: 45px;
                    }
                    .col-data {
                        width: 70px;
                    }
                    .col-dia {
                        width: 110px;
                    }
                    .col-hora {
                        width: 60px;
                    }
                    .col-prof {
                        width: 150px;
                    }
                    .col-instr {
                        width: 150px;
                    }
                    .col-assinatura {
                        width: auto;
                        min-width: 180px;
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
                        <tr class="aluno-info-table">
                            <td>Agenda do(a) aluno(a): ' . htmlspecialchars($dados['aluno']['nome']) . '</td>
                            <td class="matricula">Matrícula: ' . str_pad($dados['aluno']['matricula'], 2, '0', STR_PAD_LEFT) . '</td>
                        </tr>
                    </table>
                </div>

                <table cellpadding="4">
                    <thead>
                        <tr>
                            <th class="col-aula">Aula</th>
                            <th class="col-data">Data</th>
                            <th class="col-dia">Dia</th>
                            <th class="col-hora">Hora</th>
                            <th class="col-prof">Professora</th>
                            <th class="col-instr">Instrumento</th>
                            <th class="col-assinatura">Assinatura Prof.ª / Aluno(a)</th>
                        </tr>
                    </thead>
                    <tbody>';

            $aula_count = 1;
            foreach ($dados['aulas'] as $aula) {
                $data = new DateTime($aula['data_aula']);
                $dia_semana = traduzirDiaSemana($data->format('l'));
                
                $html .= '<tr>
                    <td class="col-aula">' . $aula_count . '</td>
                    <td class="col-data">' . $data->format('d-m-y') . '</td>
                    <td class="col-dia">' . $dia_semana . '</td>
                    <td class="col-hora">' . date('H:i', strtotime($aula['horario'])) . '</td>
                    <td class="col-prof">Avyen Aramás Melgaço</td>
                    <td class="col-instr">' . htmlspecialchars($aula['disciplina'] ?: 'PIANO CLÁSSICO') . '</td>
                    <td class="col-assinatura">&nbsp;</td>
                </tr>';
                $aula_count++;
            }

            $html .= '
                    </tbody>
                </table>';
            
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
            $pdf->Output('aluno_' . $dados['aluno']['matricula'] . '.pdf', 'I');
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