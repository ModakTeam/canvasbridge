import { CANVAS_BASE_URL } from '../config';

export async function submitAssignment(courseId: number, assignmentId: number, token: string, uploadFileIds: number[], comment?: string) {
    const submissionData = {
        comment: {
            text_comment: comment || ''
        },
        submission: {
        }
    };
    if (uploadFileIds.length > 0) {
        submissionData.submission = {
            submission_type: 'online_upload',
            file_ids: uploadFileIds
        };
    }

    const response = await fetch(`${CANVAS_BASE_URL}/api/v1/courses/${courseId}/assignments/${assignmentId}/submissions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(submissionData)
    });

    if (!response.ok) {
        throw new Error(`과제 제출 실패: ${response.status}`);
    }
}