export const progressDocId = (studentId: string, dayId: string) => `${studentId}_${dayId}`;

export const CAMP_TOTAL_DAYS = 5;

export const dayIds = Array.from({ length: CAMP_TOTAL_DAYS }, (_, i) => String(i + 1));
