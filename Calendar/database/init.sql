-- Primeiro, vamos dropar as tabelas na ordem correta (por causa das foreign keys)
DROP TABLE IF EXISTS presencas;
DROP TABLE IF EXISTS agendamentos;
DROP TABLE IF EXISTS aluno_disciplina;
DROP TABLE IF EXISTS aulas;
DROP TABLE IF EXISTS alunos;
DROP TABLE IF EXISTS disciplinas;
DROP TABLE IF EXISTS professores;

-- Configuração do charset e collation
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;
ALTER DATABASE calendar CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- Agora criamos as tabelas na ordem correta
CREATE TABLE IF NOT EXISTS professores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    telefone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS alunos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    telefone VARCHAR(20),
    matricula VARCHAR(20) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS disciplinas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS aulas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    disciplina_id INT,
    data_aula DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fim TIME NOT NULL,
    descricao TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (disciplina_id) REFERENCES disciplinas(id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS aluno_disciplina (
    aluno_id INT,
    disciplina_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (aluno_id, disciplina_id),
    FOREIGN KEY (aluno_id) REFERENCES alunos(id) ON DELETE CASCADE,
    FOREIGN KEY (disciplina_id) REFERENCES disciplinas(id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS agendamentos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    aluno_id INT NOT NULL,
    disciplina_id INT NULL,
    professor_id INT NULL,
    data_aula DATE NOT NULL,
    horario TIME NOT NULL,
    status ENUM('agendado', 'cancelado', 'realizado') DEFAULT 'agendado',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (aluno_id) REFERENCES alunos(id),
    FOREIGN KEY (disciplina_id) REFERENCES disciplinas(id),
    FOREIGN KEY (professor_id) REFERENCES professores(id),
    INDEX idx_data_aula (data_aula)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS presencas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    aluno_id INT,
    aula_id INT,
    presente BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (aluno_id) REFERENCES alunos(id) ON DELETE CASCADE,
    FOREIGN KEY (aula_id) REFERENCES aulas(id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Inserir dados iniciais
INSERT INTO disciplinas (nome) VALUES 
    ('Piano Clássico'),
    ('Piano Popular'),
    ('Musicalização com Piano'),
    ('Piano Clássico e Popular'),
    ('Individual'),
    ('Grupo'),
    ('Online'),
    ('Intensivo');
