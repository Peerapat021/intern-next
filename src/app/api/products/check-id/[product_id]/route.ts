// src/app/api/check-id/[product_id]/route.ts
import { db } from "@/lib/db";
import { RowDataPacket } from "mysql2/promise";
import { NextResponse } from "next/server";

export async function GET(
    request: Request,
    { params }: { params: { product_id: string } }   // ต้องตรงกับชื่อโฟลเดอร์เป๊ะ ๆ
) {
    // ตรวจสอบว่ามี params.product_id ไหม
    const { product_id } = await params;

    if (!product_id || product_id.trim() === "") {
        return NextResponse.json(
            { error: "product_id is required" },
            { status: 400 }
        );
    }

    try {
        const [rows] = await db.query<RowDataPacket[]>(
            "SELECT 1 FROM products WHERE product_id = ? LIMIT 1",
            [product_id.trim()]
        );

        return NextResponse.json({ exists: rows.length > 0 });
    } catch (error) {
        console.error("Check product_id error:", error);
        return NextResponse.json({ exists: true }, { status: 500 });
    }
}