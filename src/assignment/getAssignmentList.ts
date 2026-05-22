import * as vscode from 'vscode';
import { Assignment } from './assignment';
import { getProperties } from '../getProperites';

export async function getAssignmentList(courseId: number): Promise<Assignment[]> {
    const { token, baseURL } = getProperties();

    if (token === '' || baseURL === '') {
        return Promise.resolve([]);
    }

    try {
        const response = await fetch(`${baseURL}/api/v1/courses/${courseId}/assignments`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
        });

        if (!response.ok) {
            throw new Error(`Canvas 연결 실패: ${response.status}`);
        }
        
        const data: any = await response.json();
        
        return Promise.all(data.map(async (assignment: any) => {
            const workflowState = await fetch(`${baseURL}/api/v1/courses/${courseId}/assignments/${assignment.id}/submissions/self`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
            }).then(res => res.json())
              .then(submissions => submissions.workflow_state || 'unsubmitted')
              .catch(() => 'unsubmitted');

            return new Assignment(
            assignment.name || 'empty',
            workflowState,
            assignment.id || 0,
            courseId,
            assignment.description || '',
            assignment.due_at || '',
            assignment.points_possible || 0,
            assignment.submission_types || [],
            assignment.published || false,
            [],
            vscode.TreeItemCollapsibleState.None
        )}));
    } catch (error: any) {
        vscode.window.showErrorMessage('Canvas 연결 실패: ' + error.message);
        return [];
    }
}