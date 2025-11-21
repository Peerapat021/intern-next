import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { Product } from "@/lib/types/products";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import { RowDataPacket, ResultSetHeader } from "mysql2/promise";

export async function GET() {
    try {
        const [rows] = await db.query<Product[] & RowDataPacket[]>("SELECT * FROM products");
        return new Response(JSON.stringify(rows), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    }
    catch (error) {
        console.error("Get products error:", error);
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
        const { product_id, product_name, product_price, product_qty, category_id } = body;

        if (!product_id || !product_name || !product_price || !product_qty || !category_id) {
            return new Response("กรุณากรอกข้อมูลที่จำเป็น", { status: 400 });
        }

        const userId = session.user.id;
        // เช็คว่ามี product_id นี้ในระบบแล้วหรือยัง
        const [existing] = await db.query<any[]>(
            "SELECT product_id FROM products WHERE product_id = ?",
            [product_id]
        );
        if (existing.length > 0) {
            return new Response(
                JSON.stringify({ error: "รหัสสินค้านี้มีในระบบแล้ว กรุณาใช้รหัสอื่น" }),
                {
                    status: 409, // Conflict
                    headers: { "Content-Type": "application/json" },
                }
            );
        }
        const [result] = await db.query<ResultSetHeader>("INSERT INTO products (product_id, product_name, product_price, product_qty, category_id, create_at_product, user_id) VALUES (?, ?, ?, ?, ?, ?, ?)", [product_id, product_name, product_price, product_qty, category_id, new Date(), userId]);
        return new Response(JSON.stringify({ id: result.insertId, product_id, product_name, product_price, product_qty, category_id, create_at_product: new Date(), user_id: userId }), {
            status: 201,
            headers: { "Content-Type": "application/json" },
        });
    }
    catch (error) {
        console.error("Post products error:", error);
        return new Response("ไม่สามารถเพิ่มข้อมูลได้", { status: 500 });
    }
}
