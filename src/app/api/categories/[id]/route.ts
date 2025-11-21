import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { Category } from "@/lib/types/categories";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import { RowDataPacket, ResultSetHeader } from "mysql2/promise";


export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {

  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { id } = await params;
  if (!id || isNaN(Number(id))) return new Response("Invalid id", { status: 400 });

  try {
    const { category_name } = await req.json();
    if (![category_name].every(Boolean)) return new Response("Missing fields", { status: 400 });

    const [result] = await db.query<ResultSetHeader>(
      "UPDATE categories SET category_name = ? WHERE category_id = ?",
      [category_name, id]
    );

    if (result.affectedRows === 0) return new Response("Category not found", { status: 404 });

    return new Response(JSON.stringify({ message: "Category updated successfully" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Update error:", error);
    return new Response("Error updating category", { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { id } = await params;
  if (!id || isNaN(Number(id))) return new Response("Invalid id", { status: 400 });

  try {
    const [result] = await db.query<ResultSetHeader>(
      "DELETE FROM categories WHERE category_id = ?",
      [id]
    );

    if (result.affectedRows === 0) return new Response("Category not found", { status: 404 });

    return new Response(JSON.stringify({ message: "Category deleted successfully" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Delete error:", error);
    return new Response("Error deleting category", { status: 500 });
  }
}