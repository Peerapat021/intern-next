// app/api/dashboard/stats/route.ts
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import type { RowDataPacket, OkPacket } from "mysql2";

// ใช้ type ตรงนี้เลย ไม่ต้องไปสร้างไฟล์แยกก็ได้ (หรือจะแยกก็ได้)
interface CountRow extends RowDataPacket {
    count: number;
}

interface TodayStatsRow extends RowDataPacket {
    add_count: number | null;
    edit_count: number | null;
    delete_count: number | null;
}

interface LogRow extends RowDataPacket {
    id: number;
    product_id: string;
    action: string;
    changed_by: string | null;
    create_at_log: Date;
    is_error: 0 | 1;
    error_message: string | null;
}

interface TopUserRow extends RowDataPacket {
    changed_by: string | null;
    actions: number;
}

interface DayStatsRow extends RowDataPacket {
    date: string;
    total: number;
    errors: number;
}

export const dynamic = "force-dynamic";

export async function GET() {
    let connection;
    try {
        connection = await db.getConnection();

        const [
            totalProducts,
            totalCategories,
            totalUsers,
            totalAdmins,
            todayStats,
            todayErrors,
            duplicateAttempts,
            recentLogs,
            topUsersToday,
            last7Days,
        ] = await Promise.all([
            connection.query<(CountRow & RowDataPacket)[]>("SELECT COUNT(*) as count FROM products"),
            connection.query<(CountRow & RowDataPacket)[]>("SELECT COUNT(*) as count FROM categories"),
            connection.query<(CountRow & RowDataPacket)[]>("SELECT COUNT(*) as count FROM users"),
            connection.query<(CountRow & RowDataPacket)[]>("SELECT COUNT(*) as count FROM users WHERE role = 'admin'"),

            connection.query<(TodayStatsRow & RowDataPacket)[]>(`
        SELECT 
          SUM(CASE WHEN action = 'add' THEN 1 ELSE 0 END) as add_count,
          SUM(CASE WHEN action = 'edit' THEN 1 ELSE 0 END) as edit_count,
          SUM(CASE WHEN action = 'delete' THEN 1 ELSE 0 END) as delete_count
        FROM product_logs 
        WHERE DATE(create_at_log) = CURDATE()
      `),

            connection.query<(CountRow & RowDataPacket)[]>("SELECT COUNT(*) as count FROM product_logs WHERE is_error = 1 AND DATE(create_at_log) = CURDATE()"),
            connection.query<(CountRow & RowDataPacket)[]>("SELECT COUNT(*) as count FROM product_logs WHERE error_message LIKE '%มีในระบบแล้ว%' AND DATE(create_at_log) = CURDATE()"),

            connection.query<
                (LogRow & RowDataPacket)[]
            >(
                `
                    SELECT 
                    pl.id,
                    pl.product_id,
                    pl.action,
                    pl.create_at_log,
                    pl.is_error,
                    pl.error_message,
                    u.id AS changed_by,
                    u.name AS changed_by_name
                    FROM product_logs pl
                    LEFT JOIN users u ON pl.changed_by = u.id
                    ORDER BY pl.id DESC
                    LIMIT 15
                `
            ),
            connection.query<(TopUserRow & RowDataPacket)[]>("SELECT changed_by, COUNT(*) as actions FROM product_logs WHERE DATE(create_at_log) = CURDATE() GROUP BY changed_by ORDER BY actions DESC LIMIT 5"),

            connection.query<(DayStatsRow & RowDataPacket)[]>("SELECT DATE(create_at_log) as date, COUNT(*) as total, SUM(is_error = 1) as errors FROM product_logs WHERE create_at_log >= DATE_SUB(CURDATE(), INTERVAL 6 DAY) GROUP BY DATE(create_at_log) ORDER BY date"),
        ]);

        const stats = {
            products: Number(totalProducts[0][0]?.count || 0),
            categories: Number(totalCategories[0][0]?.count || 0),
            users: Number(totalUsers[0][0]?.count || 0),
            admins: Number(totalAdmins[0][0]?.count || 0),
            today: {
                add: Number(todayStats[0][0]?.add_count || 0),
                edit: Number(todayStats[0][0]?.edit_count || 0),
                delete: Number(todayStats[0][0]?.delete_count || 0),
            },
            todayErrors: Number(todayErrors[0][0]?.count || 0),
            duplicateAttempts: Number(duplicateAttempts[0][0]?.count || 0),
            recentLogs: recentLogs[0],
            topUsers: topUsersToday[0],
            last7Days: last7Days[0],
            updatedAt: new Date().toISOString(),
        };

        return NextResponse.json({ success: true, data: stats });

    } catch (error: any) {
        console.error("Dashboard API Error:", error);
        return NextResponse.json(
            { success: false, error: error.message || "โหลดข้อมูลไม่ได้" },
            { status: 500 }
        );
    } finally {
        connection?.release();
    }
}