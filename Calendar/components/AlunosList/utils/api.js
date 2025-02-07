export const API = {
    async loadAlunos() {
        const response = await fetch('api/listar-alunos.php');
        return response.json();
    },

    async updateAulaStatus(aulaId, status) {
        const response = await fetch('api/atualizar-status-aula.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ aula_id: aulaId, status })
        });
        return response.json();
    },

    async deleteAula(aulaId) {
        const response = await fetch('api/excluir-aula.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ aula_id: aulaId })
        });
        return response.json();
    }
}; 