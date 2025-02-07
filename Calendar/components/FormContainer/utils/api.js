export const API = {
    async loadDisciplinas() {
        const response = await fetch('api/listar-disciplinas.php');
        return response.json();
    },

    async cadastrarAluno(data) {
        const response = await fetch('api/cadastrar-aluno.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return response.json();
    }
}; 