
// ตัวอย่างใช้ใน Server Component หรือ Server Action
export async function checkProductIdExists(product_id: string): Promise<boolean> {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    const res = await fetch(`/api/check-id/${encodeURIComponent(product_id.trim())}`, {
        cache: "no-store"
    });

    if (!res.ok) {
        console.error("Failed to check product_id:", res.status);
        return true; // ถ้าเช็คไม่ได้ ให้สมมติว่ามีแล้ว (fail-safe)
    }

    const data = await res.json();
    return data.exists === true;
}