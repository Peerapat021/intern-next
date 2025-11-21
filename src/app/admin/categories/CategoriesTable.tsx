'use client'

import { FaEdit, FaTrash, FaDownload, FaPlus, FaUser } from "react-icons/fa";
import { getCategories } from "@/lib/services/categories/get";
import { useState, useEffect } from "react";
import { getUsers } from "@/lib/services/users/get";
import { deleteCategory } from "@/lib/services/categories/delete";
import { updateCategory } from "@/lib/services/categories/put";
import { postCategory } from "@/lib/services/categories/post";
import { User } from "@/lib/types/user";

function UserTable({ categories }: { categories: any[] }) {
    const [dataCategories, setDataCategories] = useState(categories);
    const [dataUsers, setDataUsers] = useState<User[]>([]);
    const [newCategory, setNewCategory] = useState(false);
    const [editCategory, setEditCategory] = useState<any | null>(null);
    const [deletingCategory, setDeletingCategory] = useState<any | null>(null);
    const [newCategoryData, setNewCategoryData] = useState({
        category_name: ""
    });

    const [editCategoryData, setEditCategoryData] = useState({
        category_name: ""
    });

    const fetchCategories = async () => {
        try {
            const data = await getCategories();
            setDataCategories(data);
        } catch (err) {
            console.error("ไม่สามารถโหลดหมวดหมู่ได้", err);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        fetchUsers();
    }, []);

    const openCreateModal = () => setNewCategory(true);
    const closeCreateModal = () => setNewCategory(false);

    const openEditModal = (room: any) => {
        setEditCategory(room);
        setEditCategoryData({
            category_name: room.category_name,
        });
    };
    const closeEditModal = () => setEditCategory(null);

    const openDeleteModal = (category: any) => setDeletingCategory(category);
    const closeDeleteModal = () => setDeletingCategory(null);

    const fetchUsers = async () => {
        try {
            const data = await getUsers();
            setDataUsers(data);
        } catch (err) {
            console.error("ไม่สามารถโหลดผู้ใช้ได้", err);
        }
    };

    const handleCreateCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await postCategory({ category_name: newCategoryData.category_name });
            await fetchCategories();
            closeCreateModal();
            setNewCategoryData({ category_name: "" });
        } catch (err) {
            console.error("Error creating category:", err);
            alert("ไม่สามารถสร้างหมวดหมู่ได้");
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editCategory) return;

        try {
            await updateCategory({
                category_id: editCategory.category_id,
                category_name: editCategoryData.category_name,
            });
            await fetchCategories(); // โหลดข้อมูลล่าสุดหลังแก้ไข
            closeEditModal();
        } catch (err) {
            console.error("Error updating category:", err);
            alert("ไม่สามารถอัปเดตข้อมูลห้องได้");
        }
    };

    const confirmDelete = async () => {
        if (!deletingCategory) return;

        try {
            await deleteCategory({ category_id: deletingCategory.category_id });
            await fetchCategories(); // โหลดข้อมูลล่าสุดหลังลบ
            closeDeleteModal();
        } catch (err) {
            console.error("Error deleting category:", err);
            alert("ไม่สามารถลบหมวดหมู่ได้");
        }
    };

    return (
        <div className="p-4">
            <div>
                <p className="border-b border-gray-200 py-2 text-lg font-semibold">
                    การจัดการหมวดหมู่
                </p>

                {/* Search + Buttons */}
                <div className="flex flex-col md:flex-row md:justify-between py-4 gap-4">
                    <div className="flex-1">
                        <input
                            type="text"
                            placeholder="Search"
                            className="w-full md:w-[550px] border border-gray-400 p-2 rounded-sm"
                            autoFocus
                        />
                    </div>
                    <div className="flex flex-col md:flex-row gap-2">
                        <button onClick={openCreateModal} className="border border-gray-200 rounded-full p-2 px-4 flex gap-2 items-center text-gray-700 hover:bg-gray-50 transition">
                            <FaPlus /> เพิ่มหมวดหมู่
                        </button>
                        <button className="border border-gray-200 rounded-full p-2 px-4 flex gap-2 items-center bg-[#4e6cef] text-white hover:bg-[#3b5bd6] transition">
                            <FaDownload /> Download
                        </button>
                    </div>
                </div>
            </div>

            {/* Table (Desktop only) */}
            <div className="overflow-x-auto hidden md:block">
                <table className="w-full border border-gray-200 min-w-[600px]">
                    <thead>
                        <tr className="border-b-2 border-[#4e6cef] shadow-md bg-gray-50">
                            <th className="p-4 text-left">รหัสหมวดหมู่</th>
                            <th className="p-4 text-left">ชื่อหมวดหมู่</th>
                            <th className="p-4 text-left">วันที่เพิ่ม</th>
                            <th className="p-4 text-left">จัดการ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {dataCategories.map((category) => (
                            <tr
                                key={category.category_id}
                                className="hover:bg-gray-50 transition duration-150"
                            >
                                <td className="p-4">{category.category_id}</td>
                                <td className="p-4">{category.category_name}</td>
                                <td className="p-4">
                                    {new Date(category.create_at_category).toLocaleString("th-TH", {
                                        day: "numeric",
                                        month: "short",
                                        year: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                </td>
                                <td className="p-4 flex gap-2">
                                    <button onClick={() => openEditModal(category)} className="text-blue-600 hover:text-blue-800 transition">
                                        <FaEdit />
                                    </button>
                                    <button onClick={() => openDeleteModal(category)} className="text-red-600 hover:text-red-800 transition">
                                        <FaTrash />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Card view (Mobile only) */}
            <div className="md:hidden ">
                {dataCategories.map((category) => (
                    <div
                        key={category.category_id}
                        className="border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition bg-white"
                    >
                        <div className="flex justify-between items-center mb-3">
                            <div className="flex items-center gap-2">

                                <h2 className="font-semibold text-gray-800">
                                    {category.category_name || "ไม่ระบุชื่อ"}
                                </h2>
                            </div>
                            <div className="flex gap-3">
                                <button className="text-blue-600 hover:text-blue-800 transition">
                                    <FaEdit />
                                </button>
                                <button className="text-red-600 hover:text-red-800 transition">
                                    <FaTrash />
                                </button>
                            </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">
                            <span className="font-medium">รหัสสินค้า:</span> {category.category_id}
                        </p>
                        <p className="text-sm text-gray-600 mb-1">
                            <span className="font-medium">ชื่อสินค้า:</span> {category.category_name}
                        </p>
                        <p className="text-sm text-gray-600 mb-1">
                            <span className="font-medium">วันที่เพิ่ม:</span> {category.create_at_category}
                        </p>
                    </div>
                ))}
            </div>

            {/* Modal Create */}
            {newCategory && (
                <div className="modal-overlay bg-black/50 fixed inset-0 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-lg w-[90%] max-w-md shadow-lg">
                        <h2 className="text-lg font-bold mb-4">สร้างหมวดหมู่ใหม่</h2>
                        <form onSubmit={handleCreateCategory} className="space-y-4">
                            <input
                                type="text"
                                placeholder="ชื่อหมวดหมู่"
                                value={newCategoryData.category_name}
                                onChange={e =>
                                    setNewCategoryData({ ...newCategoryData, category_name: e.target.value })
                                }
                                autoFocus
                                className="w-full border rounded p-2"
                                required
                            />

                            <div className="flex justify-end space-x-2">
                                <button
                                    type="button"
                                    className="px-4 py-2 bg-gray-300 rounded"
                                    onClick={closeCreateModal}
                                >
                                    ยกเลิก
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-500 text-white rounded"
                                >
                                    บันทึก
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Edit */}
            {editCategory && (
                <div className="modal-overlay bg-black/50 fixed inset-0 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-lg w-[90%] max-w-md shadow-lg">
                        <h2 className="text-lg font-bold mb-4">แก้ไขหมวดหมู่</h2>
                        <form onSubmit={handleUpdate} className="space-y-4">
                            <input
                                type="text"
                                placeholder="ชื่อหมวดหมู่"
                                value={editCategoryData.category_name}
                                onChange={e =>
                                    setEditCategoryData({ ...editCategoryData, category_name: e.target.value })
                                }
                                autoFocus
                                className="w-full border rounded p-2"
                                required
                            />

                            <div className="flex justify-end space-x-2">
                                <button
                                    type="button"
                                    className="px-4 py-2 bg-gray-300 rounded"
                                    onClick={closeEditModal}
                                >
                                    ยกเลิก
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-500 text-white rounded"
                                >
                                    บันทึก
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Delete */}
            {deletingCategory && (
                <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-lg w-[90%] max-w-sm shadow-lg">
                        <h2 className="text-lg font-bold mb-4 text-red-600">
                            ยืนยันการลบ
                        </h2>
                        <p className="mb-6">
                            คุณต้องการลบหมวดหมู่นี้{" "}
                            <span className="font-semibold">{deletingCategory.category_name}</span> หรือไม่?
                        </p>
                        <div className="flex justify-end space-x-2">
                            <button
                                onClick={closeDeleteModal}
                                className="px-4 py-2 bg-gray-300 rounded"
                            >
                                ยกเลิก
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="px-4 py-2 bg-red-500 text-white rounded"
                            >
                                ยืนยันลบ
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default UserTable;
