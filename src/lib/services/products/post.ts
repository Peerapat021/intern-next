

export async function postProduct(data: { product_id: string, product_name: string, product_price: number, product_qty: number, category_id: number }) {
    const res = await fetch(`/api/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });

    if (!res.ok) {
        throw new Error("ไม่สามารถเพิ่มข้อมูลได้");
    }

    return res.json();
}
