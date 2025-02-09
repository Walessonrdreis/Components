import { CSS_CLASSES } from '../constants';
import { formatarData } from '../utils';

export const renderAlunoCard = (aluno) => {
    console.log('Renderizando card com dados:', aluno);

    return `
        <div class="aluno-card-v2" data-aluno-id="${aluno.id}">
            <div class="${CSS_CLASSES.info}">
                <h4 class="aluno-nome">${aluno.nome}</h4>
                <div class="matricula-container">
                    <span class="matricula-label">Matrícula:</span>
                    <span class="matricula-valor">${aluno.matricula || 'Não informada'}</span>
                </div>
                <p class="${CSS_CLASSES.disciplina}">
                    <i class="fas fa-book"></i>
                    ${aluno.disciplina || 'Sem disciplina'}
                </p>
                <p class="${CSS_CLASSES.proximaAula}">
                    <i class="fas fa-calendar"></i>
                    Próxima aula: ${formatarData(aluno.proxima_aula)}
                </p>
            </div>
            <div class="${CSS_CLASSES.actions}">
                <button class="btn-action btn-pdf" data-action="pdf" data-tooltip="Visualizar PDF">
                    <i class="fas fa-file-pdf"></i>
                </button>
                <button class="btn-action btn-aulas" data-action="aulas" data-tooltip="Ver aulas">
                    <i class="fas fa-calendar-alt"></i>
                </button>
                <button class="btn-action btn-editar" data-action="editar" data-tooltip="Editar aluno">
                    <i class="fas fa-edit"></i>
                </button>
            </div>
        </div>
    `;
}; 