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
            `**${this.label}**\n\n` +
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
}