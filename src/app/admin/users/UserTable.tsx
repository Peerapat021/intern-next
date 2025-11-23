'use client'

import { FaEdit, FaTrash, FaDownload, FaPlus, FaUser } from "react-icons/fa";
import { getUsers } from "@/lib/services/users/get";
import { postUser } from "@/lib/services/users/post";
import { putUser } from "@/lib/services/users/put";
import { deleteUser } from "@/lib/services/users/delete";
import { useState, useEffect } from "react";

function UserTable({ users }: { users: any[] }) {
    const [dataUsers, setDataUsers] = useState(users);
    const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: '' });
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [editUser, setEditUser] = useState({ id: '', name: '', email: '', password: '', role: '' });
    const [deletingUser, setDeletingUser] = useState<any | null>(null);

    const fetchUsers = async () => {
        try {
            const data = await getUsers();
            setDataUsers(data);
        } catch (err) {
            console.error("ไม่สามารถโหลดห้องได้", err);
        }
    };

    const handleAddUser = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await postUser(newUser);
            setNewUser({ name: '', email: '', password: '', role: '' });
            setIsCreateModalOpen(false);
            fetchUsers();
        } catch (err: any) {
            console.error("Error adding user:", err);
            alert(err.message || "เพิ่มผู้ใช้ไม่สำเร็จ");
        }
    };
    const openCreateModal = () => setIsCreateModalOpen(true);
    const closeCreateModal = () => setIsCreateModalOpen(false);

    const handleUpdateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await putUser({
                id: editUser.id,
                name: editUser.name,
                email: editUser.email,
                password: editUser.password || "", // ถ้าไม่กรอกรหัสผ่านใหม่ อาจไม่ส่งก็ได้
                role: editUser.role,
            });

            alert("อัปเดตผู้ใช้สำเร็จ!");
            setIsUpdateModalOpen(false);
            fetchUsers();
        } catch (err: any) {
            console.error("Error updating user:", err);
            alert(err.message || "อัปเดตผู้ใช้ไม่สำเร็จ");
        }
    };
    const openUpdateModal = (user: any) => {
        setEditUser(user);
        setIsUpdateModalOpen(true);
    };
    const closeUpdateModal = () => setIsUpdateModalOpen(false);


    const confirmDelete = async () => {
        if (!deletingUser) return;

        try {
            await deleteUser(deletingUser.id);
            await fetchUsers(); // โหลดข้อมูลล่าสุดหลังลบ
            closeDeleteModal();
        } catch (err) {
            console.error("Error deleting user:", err);
            alert("ไม่สามารถลบผู้ใช้ได้");
        }
    };
    const openDeleteModal = (user: any) => setDeletingUser(user);
    const closeDeleteModal = () => setDeletingUser(null);


    useEffect(() => {
        fetchUsers();
    }, []);

    return (
        <div className="p-4">
            <div>
                <p className="border-b border-gray-200 py-2 text-lg font-semibold">
                    การจัดการผู้ใช้
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
                            <FaPlus /> เพิ่มผู้ใช้
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
                            <th className="p-4 text-left">ชื่อ</th>
                            <th className="p-4 text-left">อีเมล</th>
                            <th className="p-4 text-left">บทบาท</th>
                            <th className="p-4 text-left">วันที่สร้าง</th>
                            <th className="p-4 text-left">จัดการ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {dataUsers.map((user) => (
                            <tr
                                key={user.id}
                                className="hover:bg-gray-50 transition duration-150"
                            >
                                <td className="p-4">{user.name}</td>
                                <td className="p-4">{user.email}</td>
                                <td className="p-4">{user.role}</td>
                                <td className="p-4">{user.create_at_user}</td>
                                <td className="p-4 flex gap-2">
                                    <button onClick={() => openUpdateModal(user)} className="text-blue-600 hover:text-blue-800 transition">
                                        <FaEdit />
                                    </button>
                                    <button onClick={() => openDeleteModal(user)} className="text-red-600 hover:text-red-800 transition">
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
                {dataUsers.map((user) => (
                    <div
                        key={user.id}
                        className="border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition bg-white"
                    >
                        <div className="flex justify-between items-center mb-3">
                            <div className="flex items-center gap-2">
                                <FaUser className="text-gray-500" />
                                <h2 className="font-semibold text-gray-800">
                                    {user.name || "ไม่ระบุชื่อ"}
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
                            <span className="font-medium">อีเมล:</span> {user.email}
                        </p>
                        <p className="text-sm text-gray-600 mb-1">
                            <span className="font-medium">บทบาท:</span>{" "}
                            <span
                                className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${user.role === "admin"
                                    ? "bg-purple-100 text-purple-700"
                                    : "bg-green-100 text-green-700"
                                    }`}
                            >
                                {user.role}
                            </span>
                        </p>
                        <p className="text-sm text-gray-600">
                            <span className="font-medium">วันที่สร้าง:</span>{" "}
                            {user.create_at_user || "-"}
                        </p>
                    </div>
                ))}
            </div>


            {/* Modal Create */}
            {isCreateModalOpen && (
                <div className="modal-overlay bg-black/50 fixed inset-0 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-lg w-[90%] max-w-md shadow-lg">
                        <h2 className="text-lg font-bold mb-4">สร้างผู้ใช้ใหม่</h2>
                        <form onSubmit={handleAddUser} className="space-y-4">
                            <input
                                type="text"
                                placeholder="ชื่อผู้ใช้"
                                value={newUser.name}
                                onChange={e =>
                                    setNewUser({ ...newUser, name: e.target.value })
                                }
                                autoFocus
                                className="w-full border rounded p-2"
                                required
                            />
                            <input
                                type="email"
                                placeholder="อีเมล"
                                value={newUser.email}
                                onChange={e =>
                                    setNewUser({ ...newUser, email: e.target.value })
                                }
                                className="w-full border rounded p-2"
                                required
                            />
                            <input
                                type="password"
                                placeholder="รหัสผ่าน"
                                value={newUser.password}
                                onChange={e =>
                                    setNewUser({ ...newUser, password: e.target.value })
                                }
                                className="w-full border rounded p-2"
                                required
                            />
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    บทบาท
                                </label>
                                <select
                                    value={newUser.role}
                                    onChange={(e) =>
                                        setNewUser({ ...newUser, role: e.target.value as "user" | "admin" })
                                    }
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                >
                                    <option value="">-- เลือกบทบาท --</option>
                                    <option value="user">ผู้ใช้ทั่วไป (user)</option>
                                    <option value="admin">ผู้ดูแลระบบ (admin)</option>
                                </select>
                            </div>

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
            {isUpdateModalOpen && (
                <div className="modal-overlay bg-black/50 fixed inset-0 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-lg w-[90%] max-w-md shadow-lg">
                        <h2 className="text-lg font-bold mb-4">แก้ไขหมวดหมู่</h2>
                        <form onSubmit={handleUpdateUser} className="space-y-4">
                            <input
                                type="text"
                                placeholder="ชื่อผู้ใช้"
                                value={editUser.name}
                                onChange={e =>
                                    setEditUser({ ...editUser, name: e.target.value })
                                }
                                autoFocus
                                className="w-full border rounded p-2"
                                required
                            />
                            <input
                                type="email"
                                placeholder="อีเมล"
                                value={editUser.email}
                                onChange={e =>
                                    setEditUser({ ...editUser, email: e.target.value })
                                }
                                className="w-full border rounded p-2"
                                required
                            />
                            <input
                                type="password"
                                placeholder="รหัสผ่าน"
                                value={editUser.password}
                                onChange={e =>
                                    setEditUser({ ...editUser, password: e.target.value })
                                }
                                className="w-full border rounded p-2"
                                required
                            />
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    บทบาท
                                </label>
                                <select
                                    value={editUser.role}
                                    onChange={(e) =>
                                        setEditUser({ ...editUser, role: e.target.value as "user" | "admin" })
                                    }
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                >
                                    <option value="">-- เลือกบทบาท --</option>
                                    <option value="user">ผู้ใช้ทั่วไป (user)</option>
                                    <option value="admin">ผู้ดูแลระบบ (admin)</option>
                                </select>
                            </div>

                            <div className="flex justify-end space-x-2">
                                <button
                                    type="button"
                                    className="px-4 py-2 bg-gray-300 rounded"
                                    onClick={closeUpdateModal}
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
            {deletingUser && (
                <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-lg w-[90%] max-w-sm shadow-lg">
                        <h2 className="text-lg font-bold mb-4 text-red-600">
                            ยืนยันการลบ
                        </h2>
                        <p className="mb-6">
                            คุณต้องการลบผู้ใช้{" "}
                            <span className="font-semibold">{deletingUser.name}</span> หรือไม่?
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
