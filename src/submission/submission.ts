import * as vscode from 'vscode';

export class SubmissionsProvider implements vscode.TreeDataProvider<Submission> {
    private _onDidChangeTreeData: vscode.EventEmitter<Submission | undefined | null | void>
        = new vscode.EventEmitter<Submission | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<Submission | undefined | null | void>
        = this._onDidChangeTreeData.event;

    private submissions: Submission[];
    
    constructor(submissions: Submission[]) {
        this.submissions = submissions;
    }

    refresh(submissions: Submission[]): void {
        this.submissions = submissions;
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: Submission): vscode.TreeItem {
        element.contextValue = 'submission';
        return element;
    }

    getChildren(element?: Submission): Thenable<Submission[]> {
        return Promise.resolve(this.submissions);
    }

    deleteChildren(submission: Submission): void {
        this.submissions = this.submissions.filter(s => s !== submission);
        this._onDidChangeTreeData.fire();
    }
}

export class Submission extends vscode.TreeItem {
    constructor(public readonly uri: vscode.Uri, public readonly collapsibleState: vscode.TreeItemCollapsibleState) {
        super(uri, collapsibleState);
    }
}