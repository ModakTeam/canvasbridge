import * as vscode from 'vscode';

export function getProperties(): { token: string; baseURL: string } {
    const config = vscode.workspace.getConfiguration('canvasbridge');
    const token = config.get<string>('token') || '';
    let baseURL = config.get<string>('baseURL') || '';

    if (token === '') {
        vscode.window.showWarningMessage('Canvas API 토큰을 설정해주세요.');
    }

    if (baseURL === '') {
        vscode.window.showWarningMessage('Canvas API URL을 설정해주세요.');
    }

    if (baseURL.endsWith('/')) {
        baseURL = baseURL.slice(0, -1);
    }

    return { token, baseURL };
}