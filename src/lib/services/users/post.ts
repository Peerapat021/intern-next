
export async function postUser(data: { name: string, email: string }) {
    const res = await fetch(`/api/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });

    if (!res.ok) {
        throw new Error("ไม่สามารถเพิ่มข้อมูลผู้ใช้ได้");
    }

    return res.json();
}
