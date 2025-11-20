// CategoryModal.tsx
interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (category_name: string) => void;
  value: string;
  setValue: (val: string) => void;
}

export default function CategoryModal({ open, onClose, onSubmit, value, setValue }: Props) {
  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(value);
  };

  return (
    <div className="modal-overlay bg-black/20 fixed inset-0 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg w-[90%] max-w-md shadow-lg">
        <h2 className="text-lg font-bold mb-4">สร้างหมวดหมู่ใหม่</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="ชื่อหมวดหมู่"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full border rounded p-2"
            required
          />
          <div className="flex justify-end space-x-2">
            <button type="button" className="px-4 py-2 bg-gray-300 rounded" onClick={onClose}>ยกเลิก</button>
            <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">บันทึก</button>
          </div>
        </form>
      </div>
    </div>
  );
}
