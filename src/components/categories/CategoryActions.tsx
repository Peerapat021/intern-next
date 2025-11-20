// CategoryActions.tsx
import { FaEdit, FaTrash } from "react-icons/fa";

interface Props {
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function CategoryActions({ onEdit, onDelete }: Props) {
  return (
    <div className="flex gap-2">
      <button className="text-blue-600 hover:text-blue-800 transition" onClick={onEdit}>
        <FaEdit />
      </button>
      <button className="text-red-600 hover:text-red-800 transition" onClick={onDelete}>
        <FaTrash />
      </button>
    </div>
  );
}
