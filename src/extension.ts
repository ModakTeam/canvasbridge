import * as vscode from 'vscode';
import { Course, CoursesProvider } from './course/course';
import { Assignment, AssignmentsProvider } from './assignment/assignment';
import { getCourseList } from './course/getCourseList';
import { getAssignmentList } from './assignment/getAssignmentList';
import { displayAssignmentPage } from './assignment/displayAssignmentPage';

export async function activate(context: vscode.ExtensionContext) {
	let courses: any = await getCourseList();

	const coursesProvider = new CoursesProvider(courses);
	vscode.window.createTreeView('course', {
		treeDataProvider: coursesProvider
	});

	const assignmentsProvider = new AssignmentsProvider([]);
	vscode.window.createTreeView('assignment', {
		treeDataProvider: assignmentsProvider
	});

	vscode.commands.registerCommand('course.refreshEntry', async () => {
		courses = await getCourseList();
		coursesProvider.refresh(courses);
	});

	vscode.commands.registerCommand('course.listAssignment', async (course: Course) => {
		const assignments = await getAssignmentList(course.courseId);
		assignmentsProvider.refresh(assignments);
	});

	vscode.commands.registerCommand('assignment.displayAssignmentPage', async (assignment: Assignment) => {
		displayAssignmentPage(assignment, context.extensionUri);
	});
}

export function deactivate() {}
