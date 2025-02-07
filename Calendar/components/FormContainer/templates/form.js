export const generateFormHTML = () => `
    <form id="cadastro-aluno-form">
        <div class="form-group">
            <label for="nome">
                <i class="fas fa-user"></i> Nome do Aluno
            </label>
            <input type="text" id="nome" name="nome" required>
        </div>
        <div class="form-group">
            <label for="email">
                <i class="fas fa-envelope"></i> Email
            </label>
            <input type="email" id="email" name="email" required>
        </div>
        <div class="form-group">
            <label for="disciplina">
                <i class="fas fa-book"></i> Disciplina
            </label>
            <select id="disciplina" name="disciplina">
                <option value="">Selecione uma disciplina</option>
            </select>
        </div>
        <button type="submit" class="btn-cadastrar">
            <i class="fas fa-save"></i> Cadastrar Aluno
        </button>
    </form>
`; 