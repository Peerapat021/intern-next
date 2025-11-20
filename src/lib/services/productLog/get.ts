
export async function getProductLogs() {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/product_logs`, {
        cache: 'no-store',
    });
    if (!res.ok) {
        throw new Error('Failed to fetch product_logs');
    }
    return res.json();
}