'use client'

import { FaEdit, FaTrash, FaDownload, FaPlus, FaUser } from "react-icons/fa";
import { getProductLogs } from "@/lib/services/productLog/get";
import { useState, useEffect } from "react";
import { getUsers } from "@/lib/services/users/get";
import { User } from "@/lib/types/user";

function UserTable({ productLogs }: { productLogs: any[] }) {
    const [dataProductLogs, setDataProductLogs] = useState(productLogs);
    const [dataUsers, setDataUsers] = useState<User[]>([]);


    const fetchProductLogs = async () => {
        try {
            const data = await getProductLogs();
            setDataProductLogs(data);
        } catch (err) {
            console.error("ไม่สามารถโหลดประวัติได้", err);
        }
    };

    useEffect(() => {
        fetchProductLogs();
    }, []);

    const fetchUsers = async () => {
        try {
            const data = await getUsers();
            setDataUsers(data);
        } catch (err) {
            console.error("ไม่สามารถโหลดผู้ใช้ได้", err);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);
    return (
        <div className="p-4">
            <div>
                <p className="border-b border-gray-200 py-2 text-lg font-semibold">
                    การจัดการประวัติ
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
                            <th className="p-4 text-left">รหัส</th>
                            <th className="p-4 text-left">รหัสสินค้า</th>
                            <th className="p-4 text-left">เหตุการณ์</th>
                            <th className="p-4 text-left">ข้อมูลเดิม</th>
                            <th className="p-4 text-left">ข้อมูลใหม่</th>
                            <th className="p-4 text-left">ผู้บันทึก</th>
                            <th className="p-4 text-left">วันที่</th>
                        </tr>
                    </thead>
                    <tbody>
                        {dataProductLogs.map((productLog) => (
                            <tr
                                key={productLog.product_log_id}
                                className="hover:bg-gray-50 transition duration-150"
                            >
                                <td className="p-4">{productLog.product_log_id}</td>
                                <td className="p-4">{productLog.product_id}</td>
                                <td className="p-4">{productLog.action}</td>
                                <td className="p-4">{productLog.old_data}</td>
                                <td className="p-4">{productLog.new_data}</td>
                                <td className="p-4">{productLog.user_id}</td>
                                <td className="p-4">{productLog.create_at}</td>
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
                {dataProductLogs.map((productLog) => (
                    <div
                        key={productLog.product_log_id}
                        className="border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition bg-white"
                    >
                        <div className="flex justify-between items-center mb-3">
                            <div className="flex items-center gap-2">
                                <FaUser className="text-gray-500" />
                                <h2 className="font-semibold text-gray-800">
                                    {productLog.product_id || "ไม่ระบุชื่อ"}
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
                            <span className="font-medium">รหัสสินค้า:</span> {productLog.product_id}
                        </p>
                        <p className="text-sm text-gray-600 mb-1">
                            <span className="font-medium">เหตุการณ์:</span> {productLog.action}
                        </p>
                        <p className="text-sm text-gray-600 mb-1">
                            <span className="font-medium">วันที่เพิ่ม:</span> {productLog.create_at}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default UserTable;
