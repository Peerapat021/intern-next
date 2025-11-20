export async function updateCategoryById(category_id: number, category_name: string) {
    const res = await fetch(`/api/categories/${category_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category_name }),
    });

    if (!res.ok) {
        throw new Error("ไม่สามารถแก้ไขข้อมูลได้");
    }

    return res.json();

}