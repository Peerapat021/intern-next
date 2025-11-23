import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { Category } from "@/lib/types/categories";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import { RowDataPacket, ResultSetHeader } from "mysql2/promise";
import { saveLog } from "@/lib/utils/saveLog";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return new Response("Unauthorized", { status: 401 });
  if (session.user.role !== "admin") return new Response("Forbidden", { status: 403 });

  const { id } = await params;
  const userId = session.user.id;

  try {
    const body = await req.json();
    const { product_name, product_price, product_qty, category_id } = body;

    if (![product_name, product_price, product_qty, category_id].every(Boolean)) {
      await saveLog({
        product_id: id,
        action: "failed",
        new_value: body,
        error_message: "ข้อมูลไม่ครบถ้วนสำหรับการแก้ไข",
        userId,
      });
      return new Response("กรุณากรอกข้อมูลให้ครบ", { status: 400 });
    }

    // ดึงข้อมูลเก่ามาก่อน เพื่อบันทึก old_value
    const [oldRows] = await db.query<RowDataPacket[]>(
      "SELECT * FROM products WHERE product_id = ?",
      [id]
    );

    if (oldRows.length === 0) {
      await saveLog({
        product_id: id,
        action: "failed",
        error_message: "ไม่พบสินค้าที่ต้องการแก้ไข",
        userId,
      });
      return new Response("ไม่พบสินค้า", { status: 404 });
    }

    const oldData = oldRows[0];

    // ทำการอัปเดต
    const [result] = await db.query<ResultSetHeader>(
      `UPDATE products 
       SET product_name = ?, product_price = ?, product_qty = ?, category_id = ?, updated_at_product = NOW()
       WHERE product_id = ?`,
      [product_name, product_price, product_qty, category_id, id]
    );

    if (result.affectedRows === 0) {
      return new Response("ไม่สามารถอัปเดตได้", { status: 404 });
    }

    const newValue = { product_name, product_price, product_qty, category_id };

    // บันทึก log การแก้ไขสำเร็จ
    await saveLog({
      product_id: id,
      action: "edit",
      old_value: {
        product_name: oldData.product_name,
        product_price: oldData.product_price,
        product_qty: oldData.product_qty,
        category_id: oldData.category_id,
      },
      new_value: newValue,
      userId,
    });

    return new Response(JSON.stringify({ success: true, message: "แก้ไขสินค้าสำเร็จ" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error("PUT /api/products/[id] error:", error);
    await saveLog({
      product_id: id,
      action: "failed",
      error_message: error.message || "เกิดข้อผิดพลาดในการแก้ไขสินค้า",
      userId: userId || "unknown",
    });
    return new Response("เกิดข้อผิดพลาดในการแก้ไข", { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return new Response("Unauthorized", { status: 401 });
  if (session.user.role !== "admin") return new Response("Forbidden", { status: 403 });

  const { id } = await params;
  const userId = session.user.id;

  try {
    // ดึงข้อมูลเก่าก่อนลบ
    const [oldRows] = await db.query<RowDataPacket[]>(
      "SELECT * FROM products WHERE product_id = ?",
      [id]
    );

    if (oldRows.length === 0) {
      await saveLog({
        product_id: id,
        action: "failed",
        error_message: "ไม่พบสินค้าที่ต้องการลบ",
        userId,
      });
      return new Response("ไม่พบสินค้า", { status: 404 });
    }

    const oldData = oldRows[0];

    const [result] = await db.query<ResultSetHeader>(
      "DELETE FROM products WHERE product_id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return new Response("ลบไม่สำเร็จ", { status: 404 });
    }

    // บันทึก log การลบ
    await saveLog({
      product_id: id,
      action: "delete",
      old_value: {
        product_id: oldData.product_id,
        product_name: oldData.product_name,
        product_price: oldData.product_price,
        product_qty: oldData.product_qty,
        category_id: oldData.category_id,
      },
      userId,
    });

    return new Response(JSON.stringify({ success: true, message: "ลบสินค้าสำเร็จ" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error("DELETE /api/products/[id] error:", error);
    await saveLog({
      product_id: id,
      action: "failed",
      error_message: error.message || "เกิดข้อผิดพลาดในการลบสินค้า",
      userId: userId || "unknown",
    });
    return new Response("เกิดข้อผิดพลาดในการลบ", { status: 500 });
  }
}