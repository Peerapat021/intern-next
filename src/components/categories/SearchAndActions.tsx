// components/SearchAndActions.tsx
'use client'

import { FaPlus, FaDownload } from "react-icons/fa";

interface Props {
  searchValue?: string;
  onSearch?: (value: string) => void;
  onAdd?: () => void;
  onDownload?: () => void;
  addText?: string;
  downloadText?: string;
}

export default function SearchAndActions({
  searchValue = "",
  onSearch,
  onAdd,
  onDownload,
  addText = "เพิ่ม",
  downloadText = "Download"
}: Props) {

  return (
    <div className="flex flex-col md:flex-row md:justify-between py-4 gap-4">
      {/* Search Input */}
      <div className="flex-1">
        <input
          type="text"
          placeholder="Search"
          value={searchValue}
          onChange={e => onSearch?.(e.target.value)}
          className="w-full md:w-[550px] border border-gray-400 p-2 rounded-sm"
          autoFocus
        />
      </div>

      {/* Buttons */}
      <div className="flex flex-col md:flex-row gap-2">
        {onAdd && (
          <button
            onClick={onAdd}
            className="border border-gray-200 rounded-full p-2 px-4 flex gap-2 items-center text-gray-700 hover:bg-gray-50 transition"
          >
            <FaPlus /> {addText}
          </button>
        )}
        {onDownload && (
          <button
            onClick={onDownload}
            className="border border-gray-200 rounded-full p-2 px-4 flex gap-2 items-center bg-[#4e6cef] text-white hover:bg-[#3b5bd6] transition"
          >
            <FaDownload /> {downloadText}
          </button>
        )}
      </div>
    </div>
  );
}
