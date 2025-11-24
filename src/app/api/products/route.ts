import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { Product } from "@/lib/types/products";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import { RowDataPacket, ResultSetHeader } from "mysql2/promise";
import { saveLog } from "@/lib/utils/saveLog";
import path from "path";
import { randomUUID } from "crypto";
import { writeFile } from "fs/promises";
const UPLOAD_DIR = path.join(process.cwd(), "public", "products");

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
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (session.user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const userId = session.user.id;

    try {
        const formData = await request.formData();
        const file = formData.get("file") as File | null;

        const product_id = formData.get("product_id") as string;
        const product_name = formData.get("product_name") as string;
        const product_price = formData.get("product_price") as string;
        const product_qty = formData.get("product_qty") as string;
        const category_id = formData.get("category_id") as string;

        // ตรวจสอบข้อมูลครบ
        if (!product_id || !product_name || !product_price || !product_qty || !category_id || !file) {
            await saveLog({ product_id, action: "failed", error_message: "ข้อมูลหรือรูปภาพไม่ครบ", userId });
            return NextResponse.json({ error: "กรุณากรอกข้อมูลและเลือกภาพสินค้า" }, { status: 400 });
        }

        const price = Number(product_price);
        const qty = Number(product_qty);
        if (isNaN(price) || isNaN(qty) || price < 0 || qty < 0) {
            return NextResponse.json({ error: "ราคาหรือจำนวนไม่ถูกต้อง" }, { status: 400 });
        }

        // ตรวจสอบรหัสซ้ำ
        const [exists] = await db.query<any[]>("SELECT 1 FROM products WHERE product_id = ?", [product_id]);
        if (exists.length > 0) {
            return NextResponse.json({ error: "รหัสสินค้านี้มีอยู่แล้ว" }, { status: 409 });
        }

        // อัปโหลดรูปภาพ
        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json({ error: "รูปภาพใหญ่เกิน 5MB" }, { status: 400 });
        }
        const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json({ error: "รองรับเฉพาะไฟล์รูปภาพ" }, { status: 400 });
        }

        const ext = path.extname(file.name).toLowerCase() || ".jpg";
        const filename = `${randomUUID()}${ext}`;
        const filepath = path.join(UPLOAD_DIR, filename);
        await writeFile(filepath, Buffer.from(await file.arrayBuffer()));

        const product_image = `/products/${filename}`;
        
        const date = new Date();
        // บันทึกลง DB
        await db.query(
            `INSERT INTO products 
       (product_id, product_name, product_price, product_qty, category_id, product_image, create_at_product, user_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [product_id, product_name, price, qty, category_id, product_image, date, userId]
        );

        await saveLog({
            product_id,
            action: "add",
            new_value: { product_id, product_name, product_price: price, product_qty: qty, category_id, product_image },
            userId,
        });

        return NextResponse.json({
            success: true,
            data: { product_id, product_name, product_price: price, product_qty: qty, category_id, product_image },
        }, { status: 201 });

    } catch (error: any) {
        console.error("POST /api/products error:", error);
        await saveLog({
            product_id: "unknown",
            action: "failed",
            error_message: error.message,
            userId: userId || "unknown",
        });
        return NextResponse.json({ error: "เพิ่มสินค้าไม่สำเร็จ" }, { status: 500 });
    }
}

// ต้องปิด bodyParser เพราะใช้ FormData
export const config = { api: { bodyParser: false } };