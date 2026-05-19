import * as vscode from 'vscode';
import { Assignment } from './assignment';
import { uploadSubmissionFile } from './uploadSubmissionFile';
import { submitAssignment } from './submitAssignment';
import { getProperties } from '../getProperites';

export async function displayAssignmentPage(assignment: Assignment, extensionUri: vscode.Uri) {
    const { token, baseURL } = getProperties();

    const configuredTheme = vscode.workspace.getConfiguration('canvasbridge').get<string>('assignmentPageTheme') || 'light';
    const theme = configuredTheme === 'dark' ? 'dark' : 'light';
    const resourceRoot = vscode.Uri.joinPath(extensionUri, 'resources');

    const panel = vscode.window.createWebviewPanel(
        'assignmentPage',
        `Assignment: ${assignment.label}`,
        vscode.ViewColumn.Two,
        {
            enableScripts: true,
            localResourceRoots: [resourceRoot],
        }
    );

    const styleUri = panel.webview.asWebviewUri(vscode.Uri.joinPath(resourceRoot, 'assignmentPage.css'));
    const scriptUri = panel.webview.asWebviewUri(vscode.Uri.joinPath(resourceRoot, 'assignmentPage.js'));
    const initialFilesJson = JSON.stringify(assignment.submissions).replace(/</g, '\\u003c');
    
    panel.webview.html = getWebviewContent(assignment, theme, styleUri, scriptUri, initialFilesJson);

    panel.webview.onDidReceiveMessage(async message => {
        if (message.command === 'upload') {
            const files = await vscode.window.showOpenDialog({
                canSelectMany: true,
                openLabel: '업로드할 파일 선택',
                filters: {
                    'All Files': ['*']
                }
            });

            if (files && files.length > 0) {
                for (const file of files) {
                    if (!assignment.submissions.some(uri => uri.fsPath === file.fsPath)) {
                        assignment.submissions.push(file);
                    }
                }
                panel.webview.postMessage({
                    command: 'filesUploaded',
                    files: assignment.submissions
                });
            }
        } else if (message.command === 'removeUploadedFile') {
            const fileKey = typeof message.fileKey === 'string' ? message.fileKey : '';
            if (!fileKey) {
                return;
            }

            const updatedSubmissions = assignment.submissions.filter(uri => {
                const uriPath = typeof uri.path === 'string' ? uri.path : '';
                return uri.fsPath !== fileKey && uriPath !== fileKey;
            });

            if (updatedSubmissions.length !== assignment.submissions.length) {
                assignment.submissions = updatedSubmissions;
                panel.webview.postMessage({
                    command: 'filesUploaded',
                    files: assignment.submissions
                });
            }
        } else if (message.command === 'submit') {
            const uploadFileIds: number[] = [];

            const comment = await vscode.window.showInputBox({
                prompt: '과제 코멘트를 입력하세요 (선택 사항)',
                placeHolder: '코멘트...',
                value: '',
                ignoreFocusOut: true
            });

            for (const fileUri of assignment.submissions) {
                try {
                    const fileId = await uploadSubmissionFile(assignment.courseId, assignment.assignmentId, fileUri);
                    uploadFileIds.push(fileId);
                } catch (error) {
                    vscode.window.showErrorMessage(error instanceof Error ? error.message : '파일 업로드 중 알 수 없는 오류가 발생했습니다.');
                    return;
                }
            }

            try {
                await submitAssignment(assignment.courseId, assignment.assignmentId, uploadFileIds, comment);
            } catch (error) {
                vscode.window.showErrorMessage(error instanceof Error ? error.message : '과제 제출 중 알 수 없는 오류가 발생했습니다.');
                return;
            }
		    vscode.window.showInformationMessage(`제출되었습니다!`, { modal: true });
        }
    });
}

function getWebviewContent(
    assignment: Assignment,
    theme: 'light' | 'dark',
    styleUri: vscode.Uri,
    scriptUri: vscode.Uri,
    initialFilesJson: string
): string {
    const dueText = assignment.dueAt ? assignment.dueAt : '미정';
    const pointsText = assignment.pointsPossible ? `${assignment.pointsPossible}점` : '미지정';
    const submitTypeText = assignment.submissionTypes?.length
        ? assignment.submissionTypes.join(' · ')
        : '제출 방식 없음';

    return `
        <!DOCTYPE html>
        <html lang="ko">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${assignment.label}</title>
            <link rel="stylesheet" href="${styleUri}">
        </head>
        <body class="theme-${theme}">
            <script id="initialUploadedFiles" type="application/json">${initialFilesJson}</script>
            <div class="shell">
                <section class="hero">
                    <h1>${assignment.label}</h1>
                    <div class="meta">
                        <span>마감: ${dueText}</span>
                        <span>배점: ${pointsText}</span>
                        <span>방식: ${submitTypeText}</span>
                    </div>
                </section>

                <section class="content-card">
                    <div class="content-header">과제 안내</div>
                    <div class="description">
                        ${assignment.html}
                    </div>
                </section>

                <section class="uploaded-files">
                    <div class="uploaded-title">
                        업로드된 파일
                        <form id="fileUploadForm" class="inline-form" action="/upload" method="post">
                            <button class="upload-btn" id="uploadFilesButton" type="button">파일 업로드</button>
                        </form>
                    </div>
                    <div class="upload-block">
                        <p class="upload-help">파일을 선택하면 아래 목록에 표시됩니다. 같은 파일은 한 번만 추가됩니다.</p>
                        <ul class="uploaded-list" id="uploadedFileList" aria-live="polite">
                            <li class="empty">아직 업로드된 파일이 없습니다.</li>
                        </ul>
                    </div>
                </section>

                <form class="submit-card" action="/submit" method="post">
                    <p>제출 전 과제 요건과 첨부 파일을 다시 확인하세요.</p>
                    <button class="submit-btn" type="submit">과제 제출하기</button>
                </form>
            </div>
            <script src="${scriptUri}"></script>
        </body>
        </html>
    `;
}