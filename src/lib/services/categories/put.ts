
export async function updateCategory({ category_id, category_name }: {
  category_id: number;
  category_name: string;
}) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/categories/${category_id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({category_name}), // id ไม่ต้องส่งใน body
  });

  if (!res.ok) throw new Error('ไม่สามารถอัปเดตข้อมูลห้องได้');

  return res.json();
}
