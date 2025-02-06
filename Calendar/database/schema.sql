CREATE DATABASE IF NOT EXISTS calendario_aulas;
USE calendario_aulas;

-- Primeiro, vamos dropar as tabelas na ordem correta (por causa das foreign keys)
DROP TABLE IF EXISTS agendamentos;
DROP TABLE IF EXISTS alunos;
DROP TABLE IF EXISTS disciplinas;

-- Agora criamos as tabelas na ordem correta
CREATE TABLE IF NOT EXISTS alunos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS disciplinas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS agendamentos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    aluno_id INT NOT NULL,
    disciplina_id INT NULL,
    data_aula DATE NOT NULL,
    horario TIME NOT NULL,
    status ENUM('agendado', 'cancelado', 'realizado') DEFAULT 'agendado',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (aluno_id) REFERENCES alunos(id),
    FOREIGN KEY (disciplina_id) REFERENCES disciplinas(id),
    INDEX idx_data_aula (data_aula)
);

-- Insere as disciplinas de piano
INSERT INTO disciplinas (nome) VALUES 
    ('Piano Clássico'),
    ('Piano Popular'),
    ('Musicalização com Piano'),
    ('Piano Clássico e Popular');

-- Inserir tipos de aula padrão
INSERT INTO disciplinas (nome) VALUES 
    ('Individual'),
    ('Grupo'),
    ('Online'),
    ('Intensivo');

-- Alterar nome da tabela tipos_aula para disciplinas
RENAME TABLE tipos_aula TO disciplinas;

-- Atualizar referências na tabela agendamentos
ALTER TABLE agendamentos 
DROP FOREIGN KEY agendamentos_ibfk_2,
CHANGE COLUMN tipo_aula_id disciplina_id INT,
ADD CONSTRAINT agendamentos_ibfk_2 
FOREIGN KEY (disciplina_id) REFERENCES disciplinas(id); 