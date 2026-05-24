import * as vscode from 'vscode';
import { getProperties } from '../getProperites';

type UploadPreparationResponse = {
    upload_url: string;
    upload_params: Record<string, unknown>;
};

export async function uploadSubmissionFile(courseId: number, assignmentId: number, fileUri: vscode.Uri): Promise<number> {
    const { token, baseURL } = getProperties();
    const filePath = getFilePath(fileUri);
    if (!filePath) {
        throw new Error('업로드할 파일 경로를 찾을 수 없습니다.');
    }

    const localFileUri = vscode.Uri.file(filePath);
    const fileName = filePath.split('/').pop() || 'unknown';
    const fileStat = await vscode.workspace.fs.stat(localFileUri);
    const fileParentFolderPath = filePath.split('/').slice(0, -1).join('/') || '';
    console.log(fileParentFolderPath);

    let response = await fetch(`${baseURL}/api/v1/courses/${courseId}/assignments/${assignmentId}/submissions/self/files`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            name: fileName,
            size: fileStat.size,
            parent_folder_path: fileParentFolderPath
        })
    });

    if (!response.ok) {
        throw new Error(`파일 업로드 준비 실패: ${response.status}`);
    }

    const { upload_url, upload_params } = await response.json() as UploadPreparationResponse;

    const fileBytes = await vscode.workspace.fs.readFile(localFileUri);
    const arrayBuffer = new ArrayBuffer(fileBytes.byteLength);
    new Uint8Array(arrayBuffer).set(fileBytes);

    const form = new FormData();
    for (const [key, value] of Object.entries(upload_params)) {
        form.append(key, String(value));
    }

    const blob = new Blob([arrayBuffer], { type: 'application/octet-stream' });
    form.append('file', blob, fileName);

    response = await fetch(upload_url, {
        method: 'POST',
        body: form
    });

    if (!response.ok) {
        throw new Error(`파일 업로드 실패: ${response.status}`);
    }

    const result = await response.json();
    return result.id;
}

function getFilePath(file: vscode.Uri): string {
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