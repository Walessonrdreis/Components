export const generateViewerHTML = () => `
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
`; 