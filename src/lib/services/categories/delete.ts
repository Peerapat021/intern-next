export async function deleteCategory({ category_id }: {
    category_id: number;
}) {
    const res = await fetch(`/api/categories/${category_id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) throw new Error('ไม่สามารถลบข้อมูลได้');

    return res.json();
}