import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { Product } from "@/lib/types/products";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import { RowDataPacket, ResultSetHeader } from "mysql2/promise";
import { saveLog } from "@/lib/utils/saveLog";

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

    // ตรวจสอบล็อกอิน
    if (!session?.user) {
        await saveLog({
            product_id: null,
            action: "failed",
            error_message: "พยายามเพิ่มสินค้าโดยไม่ล็อกอิน",
            userId: "anonymous"
        });
        return new Response("Unauthorized", { status: 401 });
    }

    // ตรวจสอบสิทธิ์ admin
    if (session.user.role !== "admin") {
        await saveLog({
            product_id: null,
            action: "failed",
            error_message: `ผู้ใช้ไม่มีสิทธิ์: ${session.user.name || session.user.email}`,
            userId: session.user.id
        });
        return new Response("Forbidden", { status: 403 });
    }

    const userId = session.user.id;

    try {
        const body = await request.json();
        const { product_id, product_name, product_price, product_qty, category_id } = body;

        // ตรวจสอบข้อมูลไม่ครบ
        if (!product_id || !product_name || !product_price || !product_qty || !category_id) {
            await saveLog({
                product_id,
                action: "failed",
                new_value: body,
                error_message: "กรอกข้อมูลไม่ครบถ้วน",
                userId
            });
            return new Response("กรุณากรอกข้อมูลที่จำเป็น", { status: 400 });
        }

        const price = Number(product_price);
        const qty = Number(product_qty);
        if (isNaN(price) || isNaN(qty) || price < 0 || qty < 0) {
            await saveLog({
                product_id,
                action: "failed",
                new_value: body,
                error_message: "ราคาหรือจำนวนไม่ถูกต้อง",
                userId
            });
            return new Response("ราคาและจำนวนต้องเป็นตัวเลขที่มากกว่าหรือเท่ากับ 0", { status: 400 });
        }

        // ตรวจสอบรหัสซ้ำ
        const [existing] = await db.query<RowDataPacket[]>(
            "SELECT product_id FROM products WHERE product_id = ?",
            [product_id]
        );
        if (existing.length > 0) {
            await saveLog({
                product_id,
                action: "failed",
                new_value: body,
                error_message: "รหัสสินค้านี้มีในระบบแล้ว",
                userId
            });
            return new Response(
                JSON.stringify({ error: "รหัสสินค้านี้มีในระบบแล้ว กรุณาใช้รหัสอื่น" }),
                { status: 409, headers: { "Content-Type": "application/json" } }
            );
        }

        // เพิ่มสินค้าสำเร็จ
        const [result] = await db.query<ResultSetHeader>(
            `INSERT INTO products 
            (product_id, product_name, product_price, product_qty, category_id, create_at_product, user_id) 
            VALUES (?, ?, ?, ?, ?, NOW(), ?)`,
            [product_id, product_name, price, qty, category_id, userId]
        );

        const newValue = { product_id, product_name, product_price: price, product_qty: qty, category_id };

        await saveLog({
            product_id,
            action: "add",
            new_value: newValue,
            userId
        });

        return new Response(JSON.stringify({
            success: true,
            data: { product_id, product_name, product_price: price, product_qty: qty, category_id }
        }), {
            status: 201,
            headers: { "Content-Type": "application/json" },
        });

    } catch (error: any) {
        console.error("POST /api/products - Unhandled error:", error);

        let body: any = null;  // เพิ่มบรรทัดนี้ด้านบน try

        try {
            body = await request.json();  
            const { product_id, product_name, product_price, product_qty, category_id } = body;
        } catch (error: any) {
            console.error("POST /api/products - Unhandled error:", error);

            await saveLog({
                product_id: body?.product_id || "unknown",
                action: "failed",
                new_value: body || null,
                error_message: error.message || "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุในระบบ",
                userId: userId || "unknown"
            });

            return new Response("ไม่สามารถเพิ่มข้อมูลได้ เกิดข้อผิดพลาดในระบบ", { status: 500 });
        }

        return new Response("ไม่สามารถเพิ่มข้อมูลได้ เกิดข้อผิดพลาดในระบบ", { status: 500 });
    }
}