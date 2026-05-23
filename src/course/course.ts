import * as vscode from 'vscode';
import { Assignment } from '../assignment/assignment';
import { getProperties } from '../getProperites';

export class CoursesProvider implements vscode.TreeDataProvider<Course> {
    private _onDidChangeTreeData: vscode.EventEmitter<Course | undefined | null | void>
        = new vscode.EventEmitter<Course | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<Course | undefined | null | void>
        = this._onDidChangeTreeData.event;

    private courses: Course[];
    
    constructor(courses: Course[]) {
        this.courses = courses;
    }

    async refresh(): Promise<void> {
        this.courses = await (async () => {
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

                return Promise.all(data.map((course: any) => {
                    return new Course(
                        course.name,
                        course.id,
                        course.calendar ? course.calendar : '',
                        vscode.TreeItemCollapsibleState.None
                    );
                }));
            } catch (error: any) {
                vscode.window.showErrorMessage('Canvas 연결 실패: ' + error.message);
                return [];
            }
        })();
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: Course): vscode.TreeItem {
        return element;
    }

    getChildren(element?: Course): Thenable<Course[]> {
        return Promise.resolve(this.courses);
    }
}

export class Course extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly courseId: number,
        public readonly calendar: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState
    ) {
        super(label, collapsibleState);
        this.command = {
            command: 'course.listAssignment',
            title: 'List Assignment',
            arguments: [this],
        };
    }
}