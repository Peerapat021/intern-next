

export async function putUser(data: { id: string, name: string, email: string, password: string, role: string }) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/users/${data.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });

    if (!res.ok) {
        throw new Error("ไม่สามารถอัปเดตข้อมูลผู้ใช้ได้");
    }

    return res.json();
}