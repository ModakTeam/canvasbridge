import * as vscode from 'vscode';
import { Course } from './course';
import { CANVAS_BASE_URL } from '../config';

export async function getCourseList(): Promise<Course[]> {
    const config = vscode.workspace.getConfiguration('canvasbridge');
    const token: any = config.get<string>('token') || '';

    if (token === '') {
        vscode.window.showWarningMessage('LMS 토큰을 설정해주세요.');
        return Promise.resolve([]);
    }

    try {
        const response = await fetch(`${CANVAS_BASE_URL}/api/v1/courses?enrollment_state=active`, {
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

        return data
            .filter((course: any) => typeof course?.name === 'string' && course.name.trim() !== '')
            .map((course: any) => new Course(course.name, course.id || 0, course.calendar, vscode.TreeItemCollapsibleState.None));
    } catch (error: any) {
        vscode.window.showErrorMessage('LMS 연결 실패: ' + error.message);
        return [];
    }
}