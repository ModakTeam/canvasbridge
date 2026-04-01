import * as vscode from 'vscode';
import { Assignment } from './assignment';

export async function displayAssignmentPage(assignment: Assignment) {
    const panel = vscode.window.createWebviewPanel(
        'assignmentPage',
        `Assignment: ${assignment.label}`,
        vscode.ViewColumn.Two
    );
    
    panel.webview.html = `<h1>${assignment.label}</h1>` + assignment.html
}