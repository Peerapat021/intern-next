'use client'

import { FaEdit, FaTrash, FaDownload, FaPlus, FaUser } from "react-icons/fa";
import { getProducts } from "@/lib/services/products/get";
import { useState, useEffect } from "react";
import { getUsers } from "@/lib/services/users/get";
import { User } from "@/lib/types/user";

function UserTable({ products }: { products: any[] }) {
    const [dataProducts, setDataProducts] = useState(products);
    const [dataUsers, setDataUsers] = useState<User[]>([]);


    const fetchProducts = async () => {
        try {
            const data = await getProducts();
            setDataProducts(data);
        } catch (err) {
            console.error("ไม่สามารถโหลดห้องได้", err);
        }
    };

    useEffect(() => {
        fetchProducts();
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
                    การจัดการสินค้า
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
                            <FaPlus /> เพิ่มสินค้า
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
                            <th className="p-4 text-left">รหัสสินค้า</th>
                            <th className="p-4 text-left">ชื่อสินค้า</th>
                            <th className="p-4 text-left">ราคา</th>
                            <th className="p-4 text-left">จำนวน</th>
                            <th className="p-4 text-left">วันที่สร้าง</th>
                            <th className="p-4 text-left">วันที่อัปเดต</th>
                            <th className="p-4 text-left">หมวดหมู่</th>
                            {/* <th className="p-4 text-left">ผู้เพิ่ม</th> */}
                            <th className="p-4 text-left">จัดการ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {dataProducts.map((product) => (
                            <tr
                                key={product.product_id}
                                className="hover:bg-gray-50 transition duration-150"
                            >
                                <td className="p-4">{product.product_id}</td>
                                <td className="p-4">{product.product_name}</td>
                                <td className="p-4">{product.product_price}</td>
                                <td className="p-4">{product.product_qty}</td>
                                <td className="p-4">{product.create_at_product}</td>
                                <td className="p-4">{product.updated_at_product || " - "}</td>
                                <td className="p-4">{product.category_id}</td>
                               {/* <td className="p-4">{dataUsers.find((user) => user.id === product.user_id)?.name}</td>*/}
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
                {dataProducts.map((product) => (
                    <div
                        key={product.product_id}
                        className="border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition bg-white"
                    >
                        <div className="flex justify-between items-center mb-3">
                            <div className="flex items-center gap-2">
                                <FaUser className="text-gray-500" />
                                <h2 className="font-semibold text-gray-800">
                                    {product.product_name || "ไม่ระบุชื่อ"}
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
                            <span className="font-medium">รหัสสินค้า:</span> {product.product_id}
                        </p>
                        <p className="text-sm text-gray-600 mb-1">
                            <span className="font-medium">ชื่อสินค้า:</span> {product.product_name}
                        </p>
                        <p className="text-sm text-gray-600 mb-1">
                            <span className="font-medium">ราคา:</span> {product.product_price}
                        </p>
                        <p className="text-sm text-gray-600 mb-1">
                            <span className="font-medium">จำนวน:</span> {product.product_qty}
                        </p>

                        <p className="text-sm text-gray-600 mb-1">
                            <span className="font-medium">หมวดหมู่:</span>{" "}
                            <span
                                className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${product.category_id === "admin"
                                    ? "bg-purple-100 text-purple-700"
                                    : "bg-green-100 text-green-700"
                                    }`}
                            >
                                {product.category_id}
                            </span>
                        </p>
                        <p className="text-sm text-gray-600 mb-1">
                            <span className="font-medium">วันที่สร้าง:</span>{" "}
                            {product.create_at_product || "-"}
                        </p>
                        <p className="text-sm text-gray-600">
                            <span className="font-medium">วันที่อัปเดต:</span>{" "}
                            {product.updated_at_product || "-"}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default UserTable;
