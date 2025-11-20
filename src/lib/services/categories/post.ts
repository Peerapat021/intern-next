

export async function postCategory(data: { category_name: string }) {
    const res = await fetch(`/api/categories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });

    if (!res.ok) {
        throw new Error("ไม่สามารถเพิ่มข้อมูลได้");
    }

    return res.json();
}
