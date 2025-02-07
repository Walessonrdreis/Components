export const generateCardHTML = (aluno, formatDate) => `
    <div class="aluno-card" data-aluno-id="${aluno.id}">
        <div class="aluno-info">
            <h4>${aluno.nome}</h4>
            <p class="disciplina">${aluno.disciplina || 'Sem disciplina'}</p>
            <p class="proxima-aula">Próxima aula: ${formatDate(aluno.proxima_aula)}</p>
        </div>
        <div class="aluno-actions">
            <button class="btn-pdf" data-tooltip="Visualizar PDF">
                <i class="fas fa-file-pdf"></i>
            </button>
            <button class="btn-ver-aulas" data-tooltip="Ver aulas">
                <i class="fas fa-calendar-alt"></i>
            </button>
            <button class="btn-editar" data-tooltip="Editar aluno">
                <i class="fas fa-edit"></i>
            </button>
        </div>
    </div>
`; 