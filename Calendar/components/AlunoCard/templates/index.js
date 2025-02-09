import { CSS_CLASSES } from '../constants';
import { formatarData } from '../utils';

export const renderAlunoCard = (aluno) => {
    console.log('Renderizando card com dados:', aluno);

    return `
        <div class="${CSS_CLASSES.container}" data-aluno-id="${aluno.id}">
            <div class="${CSS_CLASSES.info}" style="width: 100%;">
                <h4>${aluno.nome}</h4>
                <div class="matricula-container">
                    Matrícula: ${aluno.matricula || 'Não informada'}
                </div>
                <p class="${CSS_CLASSES.disciplina}">${aluno.disciplina || 'Sem disciplina'}</p>
                <p class="${CSS_CLASSES.proximaAula}">Próxima aula: ${formatarData(aluno.proxima_aula)}</p>
            </div>
            <div class="${CSS_CLASSES.actions}">
                <button class="${CSS_CLASSES.buttons.pdf}" data-tooltip="Visualizar PDF">
                    <i class="fas fa-file-pdf"></i>
                </button>
                <button class="${CSS_CLASSES.buttons.verAulas}" data-tooltip="Ver aulas">
                    <i class="fas fa-calendar-alt"></i>
                </button>
                <button class="${CSS_CLASSES.buttons.editar}" data-tooltip="Editar aluno">
                    <i class="fas fa-edit"></i>
                </button>
            </div>
        </div>
    `;
}; 