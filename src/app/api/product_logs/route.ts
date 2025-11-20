import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ProductLog } from "@/lib/types/product_logs";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import { RowDataPacket, ResultSetHeader } from "mysql2/promise";

export async function GET() {
    try {
        const [rows] = await db.query<ProductLog[] & RowDataPacket[]>("SELECT * FROM product_logs");
        return new Response(JSON.stringify(rows), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    }
    catch (error) {
        console.error("Get product_logs error:", error);
        return new Response("ไม่สามารถโหลดข้อมูลได้", { status: 500 });
    }
}