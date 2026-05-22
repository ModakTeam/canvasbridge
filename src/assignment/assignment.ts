import * as vscode from 'vscode';

export class AssignmentsProvider implements vscode.TreeDataProvider<Assignment> {
    private _onDidChangeTreeData: vscode.EventEmitter<Assignment | undefined | null | void>
        = new vscode.EventEmitter<Assignment | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<Assignment | undefined | null | void>
        = this._onDidChangeTreeData.event;

    private assignments: Assignment[];
    
    constructor(assignments: Assignment[]) {
        this.assignments = assignments;
    }

    refresh(assignments: Assignment[]): void {
        this.assignments = assignments;
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: Assignment): vscode.TreeItem {
        return element;
    }

    getChildren(element?: Assignment): Thenable<Assignment[]> {
        return Promise.resolve(this.assignments);
    }
}

export class Assignment extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly workflow_state: string,
        public readonly assignmentId: number,
        public readonly courseId: number,
        public readonly html: string,
        public readonly dueAt: string,
        public readonly pointsPossible: number,
        public readonly submissionTypes: string[],
        public readonly published: boolean,
        public submissions: vscode.Uri[],
        public readonly collapsibleState: vscode.TreeItemCollapsibleState
    ) {
        super(label, collapsibleState);
        this.iconPath = this.getThemeIcon(workflow_state);
        this.tooltip = this.buildTooltip();
        this.command = {
            command: 'assignment.displayAssignmentPage',
            title: 'Display Assignment Page',
            arguments: [this],
        };
    }

    private buildTooltip(): vscode.MarkdownString {
        const dueDateText = this.dueAt
            ? this.formatKoreanDateTime(this.dueAt)
            : '없음';
        const pointsText = this.pointsPossible ?? '미지정';
        const submissionTypesText = this.submissionTypes && this.submissionTypes.length > 0
            ? this.submissionTypes.join(', ')
            : '없음';
        const publishText = this.published ? '공개' : '비공개';

        return new vscode.MarkdownString(
            `**${this.label}** [${this.formatWorkflowState(this.workflow_state)}]\n\n` +
            `- 마감일: ${dueDateText}\n` +
            `- 배점: ${pointsText}\n` +
            `- 제출 방식: ${submissionTypesText}\n` +
            `- 상태: ${publishText}`
        );
    }

    private formatKoreanDateTime(rawDate: string): string {
        const date = new Date(rawDate);
        if (Number.isNaN(date.getTime())) {
            return '없음';
        }

        return new Intl.DateTimeFormat('ko-KR', {
            timeZone: 'Asia/Seoul',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
        }).format(date);
    }

    public formatWorkflowState(state: string): string {
        switch (state) {
            case 'submitted':
                return '제출됨';
            case 'unsubmitted':
                return '미제출';
            case 'graded':
                return '채점됨';
            case 'pending_review':
                return '검토 대기';
            default:
                return state;
        }
    }

    public getWorkflowStateColorId(state: string = this.workflow_state): string {
        switch (state) {
            case 'submitted':
                return 'canvasbridge.status.submitted';
            case 'unsubmitted':
                return 'canvasbridge.status.unsubmitted';
            case 'graded':
                return 'canvasbridge.status.graded';
            case 'pending_review':
                return 'canvasbridge.status.pendingReview';
            default:
                return 'canvasbridge.status.default';
        }
    }

    public getWorkflowStateColorHex(
        themeKind: vscode.ColorThemeKind,
        state: string = this.workflow_state
    ): string {
        const isDark = themeKind === vscode.ColorThemeKind.Dark;
        const isHighContrast =
            themeKind === vscode.ColorThemeKind.HighContrast ||
            themeKind === vscode.ColorThemeKind.HighContrastLight;

        switch (state) {
            case 'submitted':
                if (isHighContrast) {
                    return '#00FF00';
                }
                return isDark ? '#66BB6A' : '#2E7D32';
            case 'unsubmitted':
                if (isHighContrast) {
                    return '#FF0000';
                }
                return isDark ? '#EF5350' : '#C62828';
            case 'graded':
                if (isHighContrast) {
                    return '#00B0FF';
                }
                return isDark ? '#42A5F5' : '#1565C0';
            case 'pending_review':
                if (isHighContrast) {
                    return '#FFFF00';
                }
                return isDark ? '#FFA726' : '#EF6C00';
            default:
                if (isHighContrast) {
                    return '#FFFFFF';
                }
                return isDark ? '#BDBDBD' : '#616161';
        }
    }

    private getThemeIcon(workflowState: string): vscode.ThemeIcon {
        const colorId = this.getWorkflowStateColorId(workflowState);

        switch (workflowState) {
            case 'submitted':
                return new vscode.ThemeIcon('check', new vscode.ThemeColor(colorId));
            case 'unsubmitted':
                return new vscode.ThemeIcon('chrome-close', new vscode.ThemeColor(colorId));
            case 'graded':
                return new vscode.ThemeIcon('pass-filled', new vscode.ThemeColor(colorId));
            case 'pending_review':
                return new vscode.ThemeIcon('pass', new vscode.ThemeColor(colorId));
            default:
                return new vscode.ThemeIcon('question', new vscode.ThemeColor(colorId));
        }
    }
}