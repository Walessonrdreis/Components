export const API = {
    async loadDisciplinas() {
        const response = await fetch('api/listar-disciplinas.php');
        return response.json();
    },

    async addDisciplina(nome) {
        const response = await fetch('api/adicionar-disciplina.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome })
        });
        return response.json();
    },

    async editDisciplina(id, nome) {
        const response = await fetch('api/editar-disciplina.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, nome })
        });
        return response.json();
    },

    async deleteDisciplina(id) {
        const response = await fetch('api/remover-disciplina.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id })
        });
        return response.json();
    }
}; 