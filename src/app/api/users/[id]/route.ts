import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { User } from "@/lib/types/user";
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
        const { name, email, password, role } = await req.json();
        if (![name, email, password, role].every(Boolean)) return new Response("Missing fields", { status: 400 });

        const [result] = await db.query<ResultSetHeader>(
            "UPDATE users SET name = ?, email = ?, password = ?, role = ? WHERE id = ?",
            [name, email, password, role, id]
        );

        if (result.affectedRows === 0) return new Response("User not found", { status: 404 });

        return new Response(JSON.stringify({ message: "User updated successfully" }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("Update error:", error);
        return new Response("Error updating user", { status: 500 });
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
      "DELETE FROM users WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) return new Response("User not found", { status: 404 });

    return new Response(JSON.stringify({ message: "User deleted successfully" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Delete error:", error);
    return new Response("Error deleting user", { status: 500 });
  }
}