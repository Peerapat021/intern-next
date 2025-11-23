'use client'

import { FaDownload, FaUser } from "react-icons/fa";
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

    const fetchUsers = async () => {
        try {
            const data = await getUsers();
            setDataUsers(data);
        } catch (err) {
            console.error("ไม่สามารถโหลดผู้ใช้ได้", err);
        }
    };

    useEffect(() => {
        fetchProductLogs();
        fetchUsers();
    }, []);

    // ฟังก์ชันช่วยแสดง object เป็น JSON สวย ๆ (ไม่ crash แน่นอน)
    const renderJson = (value: any) => {
        if (!value) return <span className="text-gray-400 italic">-</span>;

        let parsed;
        try {
            parsed = typeof value === "string" ? JSON.parse(value) : value;
        } catch {
            return <span className="text-red-600">ข้อมูลเสียหาย</span>;
        }

        return (
            <pre className="text-xs font-mono bg-gray-100 p-2 rounded overflow-x-auto max-w-xs">
                {JSON.stringify(parsed, null, 2)}
            </pre>
        );
    };

    return (
        <div className="p-4">
            <div>
                <p className="border-b border-gray-200 py-2 text-lg font-semibold">
                    การจัดการประวัติการเปลี่ยนแปลงสินค้า
                </p>

                {/* Search + Buttons */}
                <div className="flex flex-col md:flex-row md:justify-between py-4 gap-4">
                    <div className="flex-1">
                        <input
                            type="text"
                            placeholder="ค้นหา..."
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

            {/* Table (Desktop) */}
            <div className="overflow-x-auto hidden text-sm md:block ">
                <table className="w-full border border-gray-200 min-w-[800px]">
                    <thead>
                        <tr className="border-b-2 border-[#4e6cef] bg-gray-50">
                            <th className="p-4 text-left">ID Log</th>
                            <th className="p-4 text-left">รหัสสินค้า</th>
                            <th className="p-4 text-left">เหตุการณ์</th>
                            <th className="p-4 text-left">ข้อมูลเดิม</th>
                            <th className="p-4 text-left">ข้อมูลใหม่</th>                            
                            <th className="p-4 text-left">ผลลัพธ์</th>
                            <th className="p-4 text-left">รายละเอียดข้อผิดพลาด</th>
                            <th className="p-4 text-left">ผู้บันทึก</th>
                            <th className="p-4 text-left">วันที่</th>
                        </tr>
                    </thead>
                    <tbody>
                        {dataProductLogs.map((log) => (
                            <tr
                                key={log.id} // key ครบแล้ว หาย warning!
                                className="border-b hover:bg-gray-50 transition"
                            >
                                <td className="p-4">{log.id}</td>
                                <td className="p-4">{log.product_id}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-xs font-medium
                                        ${log.action === 'add' ? 'bg-green-100 text-green-800' : ''}
                                        ${log.action === 'edit' ? 'bg-blue-100 text-blue-800' : ''}
                                        ${log.action === 'delete' ? 'bg-red-100 text-red-800' : ''}
                                    `}>
                                        {log.action || '-'}
                                    </span>
                                </td>
                                <td className="p-4">{renderJson(log.old_value)}</td>
                                <td className="p-4">{renderJson(log.new_value)}</td>
                                {/* คอลัมน์ "ผลลัพธ์" */}
                                <td className="p-4">
                                    {log.is_error ? (
                                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800">
                                            ข้อผิดพลาด
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800">
                                            สำเร็จ
                                        </span>
                                    )}
                                </td>
                                {/* คอลัมน์ "รายละเอียดข้อผิดพลาด" */}
                                <td className="p-4">
                                    {log.is_error ? (
                                        <span className="text-red-600 font-medium text-sm">
                                            {log.error_message}
                                        </span>
                                    ) : (
                                        <span className="text-gray-400 italic">ไม่มีข้อผิดพลาด</span>
                                    )}
                                </td>
                                <td className="p-4">{log.changed_by || '-'}</td>
                                <td className="p-4">
                                    {new Date(log.create_at_log).toLocaleString('th-TH')}
                                </td>

                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
                {dataProductLogs.map((log) => (
                    <div
                        key={log.id} // key ครบ!
                        className="border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition bg-white"
                    >
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <FaUser className="text-gray-500" />
                                    <h3 className="font-bold text-lg">
                                        สินค้า #{log.product_id}
                                    </h3>
                                </div>
                                <p className="text-sm text-gray-600">
                                    <span className="font-medium">เหตุการณ์:</span>{' '}
                                    <span className={`font-semibold
                                        ${log.action === 'add' ? 'text-green-600' : ''}
                                        ${log.action === 'edit' ? 'text-blue-600' : ''}
                                        ${log.action === 'delete' ? 'text-red-600' : ''}
                                    `}>
                                        {log.action || 'ไม่ระบุ'}
                                    </span>
                                </p>
    
                                <p className="text-sm text-gray-600">
                                    <span className="font-medium">ผลลัพธ์:</span>{' '}
                                    <span className={`font-semibold
                                        ${log.is_error ? 'text-red-600' : 'text-green-600'}`}
                                    >
                                        {log.is_error ? 'ข้อผิดพลาด' : 'สำเร็จ'}
                                    </span>
                                </p>
                                <p className="text-sm text-gray-600">
                                    <span className="font-medium">รายละเอียดข้อผิดพลาด:</span> {log.error_message || '-'}
                                </p>
                                <p className="text-sm text-gray-600">
                                    <span className="font-medium">ผู้บันทึก:</span> {log.changed_by || '-'}
                                </p>
                                <p className="text-sm text-gray-600">
                                    <span className="font-medium">วันที่:</span>{' '}
                                    {new Date(log.create_at_log).toLocaleString('th-TH')}
                                </p>
                            </div>
                        </div>

                        {/* แสดงข้อมูลใหม่ (ถ้ามี) */}
                        {log.new_value && (
                            <details className="mt-3 text-xs">
                                <summary className="cursor-pointer font-medium text-blue-600">
                                    ดูข้อมูลใหม่
                                </summary>
                                <pre className="mt-2 p-3 bg-gray-100 rounded overflow-x-auto">
                                    {JSON.stringify(
                                        typeof log.new_value === "string"
                                            ? JSON.parse(log.new_value)
                                            : log.new_value,
                                        null,
                                        2
                                    )}
                                </pre>
                            </details>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default UserTable;