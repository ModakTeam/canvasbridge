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
        public readonly id_: number,
        public readonly html: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState
    ) {
        super(label, collapsibleState);
        this.command = {
            command: 'assignment.displayAssignmentPage',
            title: 'Display Assignment Page',
            arguments: [this],
        };
    }
}