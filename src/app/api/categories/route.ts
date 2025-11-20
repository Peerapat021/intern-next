import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { Category } from "@/lib/types/categories";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import { RowDataPacket, ResultSetHeader } from "mysql2/promise";

export async function GET() {
    try {
        const [rows] = await db.query<Category[] & RowDataPacket[]>("SELECT * FROM categories");
        return new Response(JSON.stringify(rows), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    }
    catch (error) {
        console.error("Get categories error:", error);
        return new Response("ไม่สามารถโหลดข้อมูลได้", { status: 500 });
    }
}

export async function POST(request: NextRequest) {

    const session = await getServerSession(authOptions);
    if (!session) {
        return new Response("Unauthorized", { status: 401 });
    }

    if (session.user.role !== "admin") {
        return new Response("Forbidden", { status: 403 });
    }

    try {

        const body = await request.json();
        const { category_name } = body;

        if (!category_name) {
            return new Response("กรุณากรอกชื่อหมวดหมู่", { status: 400 });
        }

        const userId = session.user.id;

        const [result] = await db.query<ResultSetHeader>("INSERT INTO categories (category_name, create_at_category, user_id) VALUES (?, ?, ?)", [category_name, new Date(), userId]);
        return new Response(JSON.stringify({ id: result.insertId, category_name, create_at_category: new Date(), user_id: userId }), {
            status: 201,
            headers: { "Content-Type": "application/json" },
        });
    }
    catch (error) {
        console.error("Post categories error:", error);
        return new Response("ไม่สามารถเพิ่มข้อมูลได้", { status: 500 });
    }
}
