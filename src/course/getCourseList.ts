import * as vscode from 'vscode';
import { Course } from './course';
import { getProperties } from '../getProperites';

export async function getCourseList(): Promise<Course[]> {
    const { token, baseURL } = getProperties();

    if (token === '' || baseURL === '') {
        return Promise.resolve([]);
    }

    try {
        const response = await fetch(`${baseURL}/api/v1/courses?enrollment_state=active`, {
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

        return data
            .filter((course: any) => typeof course?.name === 'string' && course.name.trim() !== '')
            .map((course: any) => new Course(course.name, course.id || 0, course.calendar, vscode.TreeItemCollapsibleState.None));
    } catch (error: any) {
        vscode.window.showErrorMessage('Canvas 연결 실패: ' + error.message);
        return [];
    }
}