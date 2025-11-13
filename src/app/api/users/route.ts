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