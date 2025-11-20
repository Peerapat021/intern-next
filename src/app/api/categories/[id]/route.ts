import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { Category } from "@/lib/types/categories";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import { RowDataPacket, ResultSetHeader } from "mysql2/promise";


export async function PUT(request: NextRequest, { params }: { params: { category_id: string } }) {

    const session = await getServerSession(authOptions);
    if (!session) {
        return new Response("Unauthorized", { status: 401 });
    }

    if (session.user.role !== "admin") {
        return new Response("Forbidden", { status: 403 });
    }

    const { category_id } = params;
    if (!category_id || isNaN(Number(category_id))) {
        return new Response("ไม่พบข้อมูล", { status: 404 });
    }

    try {
        const body = await request.json();
        const { category_name } = body;

        if (!category_name) {
            return new Response("กรุณากรอกชื่อหมวดหมู่", { status: 400 });
        }

        const [result] = await db.query<ResultSetHeader>("UPDATE categories SET category_name = ? WHERE id = ?", [category_name, category_id]);
        if (result.affectedRows === 0) {
            return new Response("ไม่พบข้อมูล", { status: 404 });
        }

        return new Response(JSON.stringify({ message: "แก้ไขหมวดหมู่สำเร็จ" }), {
            status: 201,
            headers: { "Content-Type": "application/json" },
        });
    }
    catch (error) {
        console.error("Put categories error:", error);
        return new Response("ไม่สามารถแก้ไขข้อมูลได้", { status: 500 });
    }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { category_id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { category_id } = params;
  if (!category_id || isNaN(Number(category_id))) {
    return new Response("ไม่พบข้อมูล", { status: 400 });
  }

  try {
    let query = "DELETE FROM categories WHERE id = ?";
    let values: any[] = [category_id];

    if (session.user.role !== "admin") {
      query += " AND user_id = ?";
      values.push(session.user.id);
    }

    const [result] = await db.query<ResultSetHeader>(query, values);
    if (result.affectedRows === 0) {
      return new Response("ไม่พบข้อมูล", { status: 404 });
    }

    return new Response(JSON.stringify({ message: "ลบข้อมูลสำเร็จ" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Delete error:", error);
    return new Response("ไม่สามารถลบข้อมูลได้", { status: 500 });
  }
}
