export const generateModalHTML = () => `
    <div class="modal-content">
        <div class="modal-header">
            <h2><i class="fas fa-user-edit"></i> Editar Aluno</h2>
            <button type="button" class="close-modal" title="Fechar modal">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <div class="modal-body">
            <form id="form-editar-aluno" class="modal-form">
                <input type="hidden" name="aluno_id">
                <div class="form-group">
                    <label for="edit-nome">
                        <i class="fas fa-user"></i> Nome do Aluno
                    </label>
                    <input type="text" id="edit-nome" name="nome" required>
                </div>
                <div class="form-group">
                    <label for="edit-email">
                        <i class="fas fa-envelope"></i> Email
                    </label>
                    <input type="email" id="edit-email" name="email" required>
                </div>
                <div class="form-group">
                    <label for="edit-disciplina">
                        <i class="fas fa-book"></i> Disciplina
                    </label>
                    <select id="edit-disciplina" name="disciplina" class="select-disciplina">
                        <option value="">Selecione uma disciplina</option>
                    </select>
                </div>
                <div class="calendar-edit-container">
                    <!-- Calendário será inserido aqui -->
                </div>
            </form>
        </div>
    </div>
`; 