import * as vscode from 'vscode';
import { Course, CoursesProvider } from "./course/course";
import { Assignment, AssignmentsProvider } from "./assignment/assignment";
import { getCourseList } from './course/getCourseList';
import { getAssignmentList } from './assignment/getAssignmentList';
import { displayAssignmentPage } from './assignment/displayAssignmentPage';
import { Submission, SubmissionsProvider } from './submission/submission';

export async function activate(context: vscode.ExtensionContext) {
	let config = vscode.workspace.getConfiguration('knu');
	let token: any = config.get<string>('token') || "";

	let courses: any = await getCourseList();

	const coursesProvider = new CoursesProvider(courses);
	vscode.window.createTreeView('course', {
		treeDataProvider: coursesProvider
	});

	const assignmentsProvider = new AssignmentsProvider([]);
	vscode.window.createTreeView('assignment', {
		treeDataProvider: assignmentsProvider
	});

	const submissionsProvider = new SubmissionsProvider([]);
	vscode.window.createTreeView('submission', {
		treeDataProvider: submissionsProvider
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
		displayAssignmentPage(assignment);
		vscode.commands.executeCommand('submission.focus');
	});

	vscode.commands.registerCommand('submission.selectFile', async () => {
		const selectedFiles = await vscode.window.showOpenDialog({
			canSelectFiles: true,
			canSelectFolders: false,
			canSelectMany: true,
			openLabel: '선택',
			title: '제출 파일 선택'
		});

		if (!selectedFiles || selectedFiles.length === 0) {
			return;
		}

		const submissions = selectedFiles.map((fileUri) => new Submission(
			fileUri,
			vscode.TreeItemCollapsibleState.None
		));

		submissionsProvider.refresh(submissions);
	});

	vscode.commands.registerCommand('submission.deleteFile', async (submission: Submission) => {
		const submissions = submissionsProvider.getChildren().then((subs) => {
			const updatedSubmissions = subs.filter((sub) => sub.uri.fsPath !== submission.uri.fsPath);
			submissionsProvider.refresh(updatedSubmissions);
		});
	});
}

export function deactivate() {}
