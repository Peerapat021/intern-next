

export async function putProduct(data: { product_id: string, product_name: string, product_price: number, product_qty: number, category_id: number }) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/products/${data.product_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });

    if (!res.ok) {
        throw new Error("ไม่สามารถอัปเดตข้อมูลสินค้าได้");
    }

    return res.json();
}