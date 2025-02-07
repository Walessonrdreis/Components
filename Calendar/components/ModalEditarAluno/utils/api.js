export const API = {
    async loadAlunoData(alunoId) {
        const response = await fetch(`api/buscar-aluno.php?aluno_id=${alunoId}`);
        return response.json();
    },

    async loadAlunoAulas(alunoId) {
        const response = await fetch(`api/buscar-aulas-aluno.php?aluno_id=${alunoId}`);
        return response.json();
    },

    async updateAluno(alunoId, data) {
        const response = await fetch(`api/editar-aluno.php?aluno_id=${alunoId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return response.json();
    }
}; 