// src/app/api/products/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import path from "path";
import { randomUUID } from "crypto";
import { writeFile, unlink } from "fs/promises";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { saveLog } from "@/lib/utils/saveLog";

const UPLOAD_DIR = path.join(process.cwd(), "public", "products");

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "admin")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const userId = session.user.id;

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    const product_name = formData.get("product_name") as string | null;
    const product_price = formData.get("product_price") as string | null;
    const product_qty = formData.get("product_qty") as string | null;
    const category_id = formData.get("category_id") as string | null;

    // ดึงข้อมูลเก่า
    const [rows] = await db.query<any[]>("SELECT * FROM products WHERE product_id = ?", [id]);
    if (rows.length === 0) return NextResponse.json({ error: "ไม่พบสินค้า" }, { status: 404 });
    const old = rows[0];

    let newImagePath = old.product_image;

    // ถ้ามีไฟล์ใหม่ → อัปโหลด + ลบเก่า
    if (file && file.size > 0) {
      if (file.size > 5 * 1024 * 1024)
        return NextResponse.json({ error: "ไฟล์ใหญ่เกิน 5MB" }, { status: 400 });

      const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
      if (!allowed.includes(file.type))
        return NextResponse.json({ error: "รูปแบบไฟล์ไม่รองรับ" }, { status: 400 });

      const ext = path.extname(file.name).toLowerCase() || ".jpg";
      const filename = `${randomUUID()}${ext}`;
      await writeFile(path.join(UPLOAD_DIR, filename), Buffer.from(await file.arrayBuffer()));
      newImagePath = `/products/${filename}`;

      // ลบรูปเก่า
      if (old.product_image && old.product_image !== "/products/placeholder.jpg") {
        try {
          await unlink(path.join(UPLOAD_DIR, path.basename(old.product_image)));
        } catch (e: any) {
          if (e.code !== "ENOENT") console.error("ลบรูปเก่าไม่สำเร็จ:", e);
        }
      }
    }

    // สร้าง query อัปเดตเฉพาะที่ส่งมา
    const updates: string[] = [];
    const values: any[] = [];

    if (product_name !== null) { updates.push("product_name = ?"); values.push(product_name); }
    if (product_price !== null) { updates.push("product_price = ?"); values.push(Number(product_price)); }
    if (product_qty !== null) { updates.push("product_qty = ?"); values.push(Number(product_qty)); }
    if (category_id !== null) { updates.push("category_id = ?"); values.push(category_id); }
    if (newImagePath !== old.product_image) { updates.push("product_image = ?"); values.push(newImagePath); }

    if (updates.length === 0)
      return NextResponse.json({ error: "ไม่มีข้อมูลให้แก้ไข" }, { status: 400 });

    // แทรกตรงไก่สุด! ใช้เวลาไทยจริงจาก JavaScript
    const thaiNow = new Date();
    updates.push("updated_at_product = ?");
    values.push(thaiNow);

    // WHERE
    values.push(id);

    await db.query(`UPDATE products SET ${updates.join(", ")} WHERE product_id = ?`, values);

    // บันทึก log
    await saveLog({
      product_id: id,
      action: "edit",
      old_value: { product_image: old.product_image },
      new_value: newImagePath !== old.product_image ? { product_image: newImagePath } : {},
      userId,
    });

    return NextResponse.json({ success: true, product_image: newImagePath });

  } catch (error: any) {
    console.error("PUT /api/products/[id] error:", error);
    return NextResponse.json({ error: "แก้ไขไม่สำเร็จ" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "admin")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const userId = session.user.id;

  try {
    const [rows] = await db.query<any[]>("SELECT product_image FROM products WHERE product_id = ?", [id]);
    if (rows.length === 0) return NextResponse.json({ error: "ไม่พบสินค้า" }, { status: 404 });

    const imagePath = rows[0].product_image;

    await db.query("DELETE FROM products WHERE product_id = ?", [id]);

    // ลบรูปจริง
    if (imagePath && imagePath !== "/products/placeholder.jpg") {
      try {
        await unlink(path.join(UPLOAD_DIR, path.basename(imagePath)));
      } catch (e: any) {
        if (e.code !== "ENOENT") console.error("ลบรูปไม่สำเร็จ:", e);
      }
    }

    await saveLog({ product_id: id, action: "delete", userId });
    return NextResponse.json({ success: true, message: "ลบสินค้าสำเร็จ" });

  } catch (error: any) {
    console.error("DELETE error:", error);
    return NextResponse.json({ error: "ลบไม่สำเร็จ" }, { status: 500 });
  }
}

export const config = { api: { bodyParser: false } };