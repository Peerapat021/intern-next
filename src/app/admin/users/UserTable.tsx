'use client'

import { FaEdit, FaTrash, FaDownload, FaPlus, FaUser } from "react-icons/fa";
import { getUsers } from "@/lib/services/users/get";
import { useState, useEffect } from "react";

function UserTable({ users }: { users: any[] }) {
    const [dataUsers, setDataUsers] = useState(users);

    const fetchUsers = async () => {
        try {
            const data = await getUsers();
            setDataUsers(data);
        } catch (err) {
            console.error("ไม่สามารถโหลดห้องได้", err);
        }
    };

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
                        <button className="border border-gray-200 rounded-full p-2 px-4 flex gap-2 items-center text-gray-700 hover:bg-gray-50 transition">
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
                                    <button className="text-blue-600 hover:text-blue-800 transition">
                                        <FaEdit />
                                    </button>
                                    <button className="text-red-600 hover:text-red-800 transition">
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
                                className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                                    user.role === "admin"
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
        </div>
    );
}

export default UserTable;
