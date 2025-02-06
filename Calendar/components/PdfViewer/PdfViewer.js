class PdfViewer {
    constructor() {
        this.init();
    }

    init() {
        this.createModal();
    }

    createModal() {
        const modal = `
            <div id="pdf-viewer-modal" class="pdf-modal">
                <div class="pdf-modal-content">
                    <div class="pdf-modal-header">
                        <h2>Visualizar PDF</h2>
                        <button class="close-modal">&times;</button>
                    </div>
                    <div class="pdf-modal-body">
                        <div class="pdf-toolbar">
                            <button class="btn-download">
                                <i class="fas fa-download"></i> Download
                            </button>
                            <button class="btn-print">
                                <i class="fas fa-print"></i> Imprimir
                            </button>
                        </div>
                        <iframe id="pdf-frame" class="pdf-frame"></iframe>
                    </div>
                </div>
            </div>
        `;

        if (!document.getElementById('pdf-viewer-modal')) {
            document.body.insertAdjacentHTML('beforeend', modal);
            this.setupEventListeners();
        }
    }

    setupEventListeners() {
        const modal = document.getElementById('pdf-viewer-modal');
        
        // Fechar modal
        modal.querySelector('.close-modal').addEventListener('click', () => {
            this.closeViewer();
        });

        // Fechar ao clicar fora
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeViewer();
            }
        });

        // Download
        modal.querySelector('.btn-download').addEventListener('click', () => {
            const iframe = document.getElementById('pdf-frame');
            window.open(iframe.src + '&download=1', '_blank');
        });

        // Imprimir
        modal.querySelector('.btn-print').addEventListener('click', () => {
            const iframe = document.getElementById('pdf-frame');
            iframe.contentWindow.print();
        });
    }

    showPdf(alunoId) {
        const modal = document.getElementById('pdf-viewer-modal');
        const iframe = document.getElementById('pdf-frame');
        
        iframe.src = `api/gerar-pdf-aluno.php?aluno_id=${alunoId}`;
        modal.style.display = 'block';
    }

    closeViewer() {
        const modal = document.getElementById('pdf-viewer-modal');
        modal.style.display = 'none';
    }
} 