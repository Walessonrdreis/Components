export const generateListHTML = () => `
    <div class="alunos-list-header">
        <h3>Alunos Cadastrados</h3>
        <div class="alunos-search">
            <input type="text" class="search-input" placeholder="Buscar aluno...">
        </div>
    </div>
    <div class="alunos-grid"></div>
`;

export const generateEmptyListHTML = () => `
    <div class="no-alunos">
        <i class="fas fa-users"></i>
        <p>Nenhum aluno cadastrado</p>
    </div>
`; 