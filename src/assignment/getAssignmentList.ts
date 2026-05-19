import * as vscode from 'vscode';
import { Assignment } from './assignment';
import { CANVAS_BASE_URL } from '../config';

export async function getAssignmentList(courseId: number): Promise<Assignment[]> {
    const config = vscode.workspace.getConfiguration('canvasbridge');
    const token: any = config.get<string>('token') || '';

    if (token === '') {
        vscode.window.showWarningMessage('LMS 토큰을 설정해주세요.');
        return Promise.resolve([]);
    }

    try {
        const response = await fetch(`${CANVAS_BASE_URL}/api/v1/courses/${courseId}/assignments`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
        });

        if (!response.ok) {
            throw new Error(`LMS 연결 실패: ${response.status}`);
        }
        
        const data: any = await response.json();
        
        return data.map((assignment: any) => new Assignment(
            assignment.name || 'empty',
            assignment.id || 0,
            courseId,
            assignment.description || '',
            assignment.due_at || '',
            assignment.points_possible || 0,
            assignment.submission_types || [],
            assignment.published || false,
            [],
            vscode.TreeItemCollapsibleState.None
        ));
    } catch (error: any) {
        vscode.window.showErrorMessage('LMS 연결 실패: ' + error.message);
        return [];
    }
}