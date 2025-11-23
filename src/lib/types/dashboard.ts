// กำหนด type ให้ชัดเจนที่สุด
export type CountRow = {
    count: number;
}

export type TodayStatsRow = {
    add_count: number | null;
    edit_count: number | null;
    delete_count: number | null;
}

export type LogRow = {
    id: number;
    product_id: string;
    action: string;
    changed_by: number;
    create_at_log: Date;
    is_error: 0 | 1;
    error_message: string | null;
}

export type TopUserRow = {
    changed_by: number;
    actions: number;
}

export type DayStatsRow = {
    date: string;
    total: number;
    errors: number;
}

