<?php
function renderHeader($title) {
    ?>
    <!DOCTYPE html>
    <html lang="pt-br">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title><?php echo $title; ?></title>
        <style>
            .container {
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
            }
            .form-group {
                margin-bottom: 15px;
            }
            .form-group label {
                display: block;
                margin-bottom: 5px;
            }
            .form-group input {
                width: 100%;
                padding: 8px;
                border: 1px solid #ddd;
                border-radius: 4px;
            }
            .btn {
                padding: 8px 16px;
                background-color: #007bff;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
            }
            .btn-danger {
                background-color: #dc3545;
            }
            .btn:hover {
                opacity: 0.9;
            }
            .alert {
                padding: 10px;
                margin-bottom: 15px;
                border-radius: 4px;
            }
            .alert-success {
                background-color: #d4edda;
                color: #155724;
                border: 1px solid #c3e6cb;
            }
            .alert-danger {
                background-color: #f8d7da;
                color: #721c24;
                border: 1px solid #f5c6cb;
            }
            table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 20px;
            }
            th, td {
                padding: 12px;
                text-align: left;
                border-bottom: 1px solid #ddd;
            }
            th {
                background-color: #f8f9fa;
            }
        </style>
    </head>
    <body>
        <div class="container">
    <?php
}

function renderFooter() {
    ?>
        </div>
    </body>
    </html>
    <?php
}

function showMessage($message, $type = 'success') {
    $class = $type == 'success' ? 'alert-success' : 'alert-danger';
    echo "<div class='alert {$class}'>{$message}</div>";
}

function checkAuth() {
    session_start();
    if (!isset($_SESSION['usuario'])) {
        header('Location: login.php');
        exit;
    }
    return $_SESSION['usuario'];
}

function isAdmin($usuario) {
    return $usuario['tipo_usuario'] === 'admin';
} 