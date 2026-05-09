const vscode = acquireVsCodeApi();
let uploadedFilesState = [];

function escapeHtml(text) {
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function getFileName(file) {
    if (!file) {
        return '';
    }

    if (typeof file.path === 'string' && file.path.length > 0) {
        const fromPath = file.path.split('/').pop();
        if (fromPath) {
            return fromPath;
        }
    }

    if (typeof file.fsPath === 'string' && file.fsPath.length > 0) {
        const normalized = file.fsPath.replace(/\\/g, '/');
        const fromFsPath = normalized.split('/').pop();
        if (fromFsPath) {
            return fromFsPath;
        }
    }

    return '파일';
}

function getFileKey(file) {
    if (!file) {
        return '';
    }

    if (typeof file.fsPath === 'string' && file.fsPath.length > 0) {
        return file.fsPath;
    }

    if (typeof file.path === 'string' && file.path.length > 0) {
        return file.path;
    }

    return '';
}

function renderUploadedFiles(files) {
    const fileList = document.getElementById('uploadedFileList');
    if (!fileList) {
        return;
    }

    uploadedFilesState = Array.isArray(files) ? files : [];

    if (uploadedFilesState.length === 0) {
        fileList.innerHTML = '<li class="empty">아직 업로드된 파일이 없습니다.</li>';
        return;
    }

    fileList.innerHTML = uploadedFilesState
        .map((file, index) => `
            <li>
                <span class="uploaded-file-name">${escapeHtml(getFileName(file))}</span>
                <button type="button" class="delete-upload-btn" data-file-index="${index}" aria-label="${escapeHtml(getFileName(file))} 삭제">삭제</button>
            </li>
        `)
        .join('');
}

document.addEventListener('DOMContentLoaded', () => {
    const uploadButton = document.getElementById('uploadFilesButton');
    if (uploadButton) {
        uploadButton.addEventListener('click', (e) => {
            e.preventDefault();
            vscode.postMessage({
                command: 'upload'
            });
        });
    }

    const initialFilesNode = document.getElementById('initialUploadedFiles');
    if (initialFilesNode) {
        try {
            const initialFiles = JSON.parse(initialFilesNode.textContent || '[]');
            renderUploadedFiles(initialFiles);
        } catch {
            renderUploadedFiles([]);
        }
    }

    const fileList = document.getElementById('uploadedFileList');
    if (fileList) {
        fileList.addEventListener('click', (event) => {
            const target = event.target;
            if (!(target instanceof HTMLElement) || !target.classList.contains('delete-upload-btn')) {
                return;
            }

            const index = Number(target.getAttribute('data-file-index'));
            if (Number.isNaN(index) || index < 0 || index >= uploadedFilesState.length) {
                return;
            }

            const fileKey = getFileKey(uploadedFilesState[index]);
            if (!fileKey) {
                return;
            }

            vscode.postMessage({
                command: 'removeUploadedFile',
                fileKey
            });
        });
    }
});

window.addEventListener('message', (event) => {
    const message = event.data;
    if (message.command === 'filesUploaded') {
        renderUploadedFiles(message.files);
    }
});

document.addEventListener('submit', (e) => {
    e.preventDefault();
    vscode.postMessage({
        command: 'submit'
    });
});
