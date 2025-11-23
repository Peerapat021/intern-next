// src/lib/utils/saveLog.ts
import { db } from "@/lib/db";

export async function saveLog({
    product_id = null,
    action,                    // "add", "edit", "delete", หรือ "failed"
    old_value = null,
    new_value = null,
    error_message = null,
    userId,
}: {
    product_id?: string | null;
    action: string;
    old_value?: any;
    new_value?: any;
    error_message?: string | null;
    userId: string | number;
}) {
    try {
        await db.query(
            `INSERT INTO product_logs 
       (product_id, action, old_value, new_value, error_message, is_error, changed_by, create_at_log)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
            [
                product_id,
                action,
                old_value ? JSON.stringify(old_value) : null,
                new_value ? JSON.stringify(new_value) : null,
                error_message,
                action === "failed" ? 1 : 0,
                userId,
            ]
        );
    } catch (err) {
        console.error("บันทึก log ไม่ได้:", err);
    }
}
