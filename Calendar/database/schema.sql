CREATE DATABASE IF NOT EXISTS calendario_aulas;
USE calendario_aulas;

CREATE TABLE IF NOT EXISTS alunos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tipos_aula (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS agendamentos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    aluno_id INT NOT NULL,
    tipo_aula_id INT NOT NULL,
    data_aula DATE NOT NULL,
    horario TIME NOT NULL,
    status ENUM('agendado', 'cancelado', 'realizado') DEFAULT 'agendado',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (aluno_id) REFERENCES alunos(id),
    FOREIGN KEY (tipo_aula_id) REFERENCES tipos_aula(id),
    INDEX idx_data_aula (data_aula)
);

-- Inserir tipos de aula padrão
INSERT INTO tipos_aula (nome) VALUES 
    ('Individual'),
    ('Grupo'),
    ('Online'),
    ('Intensivo'); 