

export async function deleteProduct(id: string) {
    const res = await fetch(`/api/products/${id}`, {
        method: "DELETE",
    });

    if (!res.ok) {
        throw new Error("ไม่สามารถลบข้อมูลได้");
    }

    return res.json();
}