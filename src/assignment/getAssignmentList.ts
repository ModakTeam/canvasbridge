import * as vscode from "vscode";
import { Assignment } from "./assignment";

export async function getAssignmentList(courseId: number): Promise<Assignment[]> {
    let config = vscode.workspace.getConfiguration('knu');
    let token: any = config.get<string>('token') || "";

    if (token === "") {
        vscode.window.showWarningMessage("LMS 토큰을 설정해주세요.");
        return Promise.resolve([]);
    }

    try {
        const response = await fetch(`https://canvas.knu.ac.kr/api/v1/courses/${courseId}/assignments`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
        });

        if (!response.ok) {
            throw new Error(`LMS 연결 실패: ${response.status}`);
        }
        
        let data: any = await response.json();
        
        return data.map((assignment: any) => new Assignment(
            assignment.name || "empty",
            assignment.id || 0,
            assignment.description || "",
            assignment.due_at || "",
            assignment.points_possible || 0,
            assignment.submission_types || [],
            assignment.published || false,
            vscode.TreeItemCollapsibleState.None
        ));
    } catch (error: any) {
        vscode.window.showErrorMessage("LMS 연결 실패: " + error.message);
        return [];
    }
}