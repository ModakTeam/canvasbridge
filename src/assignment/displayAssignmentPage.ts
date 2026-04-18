import * as vscode from 'vscode';
import { Assignment } from './assignment';

export async function displayAssignmentPage(assignment: Assignment) {
    const config = vscode.workspace.getConfiguration('knu');
    const configuredTheme = config.get<string>('assignmentPageTheme') || 'light';
    const theme = configuredTheme === 'dark' ? 'dark' : 'light';

    const panel = vscode.window.createWebviewPanel(
        'assignmentPage',
        `Assignment: ${assignment.label}`,
        vscode.ViewColumn.Two,
        {
            enableScripts: true,
        }
    );
    
    panel.webview.html = getWebviewContent(assignment, theme);

    panel.webview.onDidReceiveMessage(async message => {
        if (message.command === 'submit') {
            vscode.window.showInformationMessage("과제 제출 시작");
            const comment = await vscode.window.showInputBox({
                prompt: '과제 코멘트를 입력하세요 (선택 사항)',
                placeHolder: '코멘트...',
                value: '',
                ignoreFocusOut: true
            });

		    vscode.window.showInformationMessage(`제출되었습니다!${comment ? ` 코멘트: ${comment}` : ''}`, { modal: true });
        }
    });
}

function getWebviewContent(assignment: Assignment, theme: 'light' | 'dark'): string {
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
            <script>
                const vscode = acquireVsCodeApi();
                
                document.addEventListener('submit', (e) => {
                    e.preventDefault();
                    vscode.postMessage({
                        command: 'submit'
                    });
                });
            </script>
            <style>
                :root {
                    --bg-top: #f7efe2;
                    --bg-bottom: #d9e8f3;
                    --ink: #24323d;
                    --ink-soft: #4a5964;
                    --surface: rgba(255, 255, 255, 0.86);
                    --surface-border: rgba(36, 50, 61, 0.14);
                    --brand: #0f6d8a;
                    --brand-strong: #09546b;
                    --chip: #ebf5fa;
                    --chip-border: #c4dfea;
                    --shadow: 0 18px 46px rgba(24, 43, 54, 0.17);
                }

                body.theme-dark {
                    --bg-top: #1c2a35;
                    --bg-bottom: #111921;
                    --ink: #e8f0f5;
                    --ink-soft: #b1c2cf;
                    --surface: rgba(29, 43, 54, 0.84);
                    --surface-border: rgba(202, 221, 235, 0.2);
                    --brand: #5aa7c0;
                    --brand-strong: #3b839a;
                    --chip: #203a48;
                    --chip-border: #346174;
                    --shadow: 0 20px 44px rgba(0, 0, 0, 0.4);
                }

                * {
                    box-sizing: border-box;
                }

                body {
                    margin: 0;
                    min-height: 100vh;
                    padding: 28px 20px;
                    color: var(--ink);
                    font-family: "Pretendard", "Noto Sans KR", "Apple SD Gothic Neo", sans-serif;
                    background:
                        radial-gradient(circle at 18% 16%, rgba(255, 255, 255, 0.78), transparent 42%),
                        radial-gradient(circle at 88% 6%, rgba(226, 239, 247, 0.82), transparent 33%),
                        linear-gradient(155deg, var(--bg-top) 0%, var(--bg-bottom) 100%);
                }

                .shell {
                    max-width: 980px;
                    margin: 0 auto;
                    display: grid;
                    gap: 18px;
                }

                .hero,
                .content-card,
                .uploaded-files,
                .submit-card {
                    border-radius: 18px;
                    border: 1px solid var(--surface-border);
                    box-shadow: var(--shadow);
                }

                .hero {
                    padding: 24px;
                    background: var(--surface);
                    animation: riseIn 0.55s ease-out both;
                }

                .hero h1 {
                    margin: 0;
                    font-size: clamp(1.45rem, 2.5vw, 2.15rem);
                    line-height: 1.3;
                    letter-spacing: -0.02em;
                }

                .meta {
                    margin-top: 14px;
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                }

                .meta span {
                    display: inline-flex;
                    align-items: center;
                    padding: 7px 11px;
                    border-radius: 999px;
                    background: var(--chip);
                    border: 1px solid var(--chip-border);
                    color: var(--ink-soft);
                    font-size: 0.86rem;
                    font-weight: 600;
                }

                .content-card {
                    background: rgba(255, 255, 255, 0.93);
                    overflow: hidden;
                    animation: riseIn 0.65s ease-out 0.08s both;
                }

                body.theme-dark .content-card {
                    background: rgba(23, 35, 43, 0.95);
                }

                .content-header {
                    padding: 14px 20px;
                    border-bottom: 1px solid rgba(36, 50, 61, 0.1);
                    font-size: 0.95rem;
                    font-weight: 700;
                    color: var(--ink-soft);
                    background: linear-gradient(180deg, rgba(246, 251, 253, 0.96), rgba(241, 247, 250, 0.96));
                }

                body.theme-dark .content-header {
                    background: linear-gradient(180deg, rgba(45, 62, 75, 0.92), rgba(29, 43, 54, 0.92));
                }

                .description {
                    padding: 22px 20px;
                    white-space: normal;
                    color: var(--ink);
                    line-height: 1.65;
                    word-break: break-word;
                }

                .submit-card {
                    padding: 18px 20px;
                    background: var(--surface);
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 16px;
                    animation: riseIn 0.75s ease-out 0.16s both;
                }

                .submit-card p {
                    margin: 0;
                    color: var(--ink-soft);
                    font-size: 0.94rem;
                }

                .upload-block {
                    display: grid;
                    gap: 8px;
                }

                .upload-help {
                    margin: 0;
                    font-size: 0.84rem;
                    color: var(--ink-soft);
                }

                .inline-form {
                    display: inline;
                }

                .upload-btn {
                    width: fit-content;
                    border: 1px solid var(--chip-border);
                    border-radius: 10px;
                    padding: 8px 12px;
                    font-size: 0.86rem;
                    font-weight: 700;
                    cursor: pointer;
                    background: var(--chip);
                    color: var(--brand-strong);
                }

                .upload-btn:hover {
                    filter: brightness(0.98);
                }

                .uploaded-files {
                    padding: 18px 20px;
                    background: var(--surface);
                    animation: riseIn 0.85s ease-out 0.22s both;
                }

                .uploaded-title {
                    margin-bottom: 10px;
                    font-size: 0.95rem;
                    font-weight: 700;
                    color: var(--ink-soft);
                }

                .uploaded-list {
                    margin: 0;
                    padding: 0;
                    list-style: none;
                    display: grid;
                    gap: 8px;
                }

                .empty {
                    padding: 10px 12px;
                    border-radius: 12px;
                    border: 1px dashed var(--chip-border);
                    color: var(--ink-soft);
                    font-size: 0.86rem;
                }

                .submit-btn {
                    border: 0;
                    border-radius: 12px;
                    padding: 12px 20px;
                    font-size: 0.95rem;
                    font-weight: 700;
                    letter-spacing: 0.01em;
                    cursor: pointer;
                    color: #ffffff;
                    background: linear-gradient(135deg, var(--brand), var(--brand-strong));
                    box-shadow: 0 10px 20px rgba(15, 109, 138, 0.33);
                    transition: transform 180ms ease, box-shadow 180ms ease, filter 180ms ease;
                }

                .submit-btn:hover {
                    transform: translateY(-1px);
                    filter: brightness(1.03);
                    box-shadow: 0 14px 26px rgba(15, 109, 138, 0.4);
                }

                .submit-btn:active {
                    transform: translateY(0);
                }

                @keyframes riseIn {
                    from {
                        opacity: 0;
                        transform: translateY(8px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @media (max-width: 720px) {
                    body {
                        padding: 16px 12px 20px;
                    }

                    .hero,
                    .content-card,
                    .submit-card,
                    .uploaded-files {
                        border-radius: 14px;
                    }

                    .submit-card {
                        flex-direction: column;
                        align-items: stretch;
                    }

                    .submit-btn {
                        width: 100%;
                    }
                }
            </style>
        </head>
        <body class="theme-${theme}">
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
        </body>
        </html>
    `;
}