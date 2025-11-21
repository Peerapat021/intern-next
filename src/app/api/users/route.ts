import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { User } from "@/lib/types/user";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import { RowDataPacket, ResultSetHeader } from "mysql2/promise";

export async function GET() {
    try {
        const [rows] = await db.query<User[] & RowDataPacket[]>("SELECT * FROM users");
        return new Response(JSON.stringify(rows), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    }
    catch (error) {
        console.error("Get users error:", error);
        return new Response("ไม่สามารถโหลดข้อมูลผู้ใช้ได้", { status: 500 });
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
        const { name, email, password, role } = body;

        if (!name || !email || !password || !role) {
            return new Response("กรุณากรอกชื่อผู้ใช้ อีเมล รหัสผ่าน และบทบาท", { status: 400 });
        }

        const [result] = await db.query<ResultSetHeader>(
            `INSERT INTO users 
             (name, email, password, role, create_at_user) 
             VALUES (?, ?, ?, ?, ?)`,
            [name, email, password, role, new Date()]
        );

        return new Response(
            JSON.stringify({
                id: result.insertId,
                name,
                email,
                password: password,
                role: role,
                create_at_user: new Date(),
            }),
            {
                status: 201,
                headers: { "Content-Type": "application/json" },
            }
        );
    } catch (error) {
        console.error("Post users error:", error);
        return new Response("ไม่สามารถเพิ่มข้อมูลผู้ใช้ได้", { status: 500 });
    }
}