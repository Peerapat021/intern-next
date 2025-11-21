'use client'

import { FaEdit, FaTrash, FaDownload, FaPlus } from "react-icons/fa";
import { getProducts } from "@/lib/services/products/get";
import { postProduct } from "@/lib/services/products/post";
import { putProduct } from "@/lib/services/products/put";
import { deleteProduct } from "@/lib/services/products/delete";
import { getCategories } from "@/lib/services/categories/get";
import { useState, useEffect, useCallback } from "react";

interface Product {
    product_id: string;
    product_name: string;
    product_price: number;
    product_qty: number;
    category_id: number | string;
    create_at_product?: string;
    updated_at_product?: string;
}

interface Category {
    category_id: number;
    category_name: string;
}

function ProductTable({ products }: { products: Product[] }) {
    const [dataProducts, setDataProducts] = useState<Product[]>(products);
    const [categories, setCategories] = useState<Category[]>([]);
    const [searchTerm, setSearchTerm] = useState("");

    // Modal states
    const [newProduct, setNewProduct] = useState(false);
    const [editProduct, setEditProduct] = useState<Product | null>(null);
    const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

    // Form data
    const [formData, setFormData] = useState({
        product_id: "",
        product_name: "",
        product_price: "",
        product_qty: "",
        category_id: "",
    });

    const [editFormData, setEditFormData] = useState({
        product_name: "",
        product_price: "",
        product_qty: "",
        category_id: "",
    });

    // Fetch data
    const fetchProducts = async () => {
        try {
            const data = await getProducts();
            setDataProducts(data);
        } catch (err) {
            console.error("ไม่สามารถโหลดสินค้าได้", err);
        }
    };

    const fetchCategories = async () => {
        try {
            const data = await getCategories();
            setCategories(data);
        } catch (err) {
            console.error("ไม่สามารถโหลดหมวดหมู่ได้", err);
        }
    };

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, []);

    // Filter
    const filteredProducts = dataProducts.filter(p =>
        p.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.product_id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Modal handlers
    const openCreateModal = () => {
        setFormData({ product_id: "", product_name: "", product_price: "", product_qty: "", category_id: "" });
        setNewProduct(true);
    };
    const closeCreateModal = () => setNewProduct(false);

    const openEditModal = (product: Product) => {
        setEditProduct(product);
        setEditFormData({
            product_name: product.product_name,
            product_price: product.product_price.toString(),
            product_qty: product.product_qty.toString(),
            category_id: product.category_id.toString(),
        });
    };
    const closeEditModal = () => setEditProduct(null);

    const openDeleteModal = (product: Product) => setDeletingProduct(product);
    const closeDeleteModal = () => setDeletingProduct(null);

    // CRUD
    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await postProduct({
                product_id: formData.product_id.trim(),
                product_name: formData.product_name.trim(),
                product_price: Number(formData.product_price) || 0,
                product_qty: Number(formData.product_qty) || 0,
                category_id: Number(formData.category_id),
            });
            await fetchProducts();
            closeCreateModal();
        } catch (err: any) {
            alert(err.response?.data?.error || "ไม่สามารถเพิ่มสินค้าได้");
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editProduct) return;

        try {
            await putProduct({
                product_id: editProduct.product_id,
                product_name: editFormData.product_name.trim(),
                product_price: Number(editFormData.product_price) || 0,
                product_qty: Number(editFormData.product_qty) || 0,
                category_id: Number(editFormData.category_id),
            });
            await fetchProducts();
            closeEditModal();
        } catch (err) {
            alert("ไม่สามารถอัปเดตสินค้าได้");
        }
    };

    const confirmDelete = async () => {
        if (!deletingProduct) return;
        try {
            await deleteProduct(deletingProduct.product_id);
            await fetchProducts();
            closeDeleteModal();
        } catch (err) {
            alert("ไม่สามารถลบสินค้าได้");
        }
    };

    const getCategoryName = (id: number | string) => {
        return categories.find(c => c.category_id === Number(id))?.category_name || "-";
    };

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
                            placeholder="ค้นหาสินค้า..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full md:w-[550px] border border-gray-400 p-2 rounded-sm"
                            autoFocus
                        />
                    </div>
                    <div className="flex flex-col md:flex-row gap-2">
                        <button onClick={openCreateModal} className="border border-gray-200 rounded-full p-2 px-4 flex gap-2 items-center text-gray-700 hover:bg-gray-50 transition">
                            <FaPlus /> เพิ่มสินค้า
                        </button>
                        <button className="border border-gray-200 rounded-full p-2 px-4 flex gap-2 items-center bg-[#4e6cef] text-white hover:bg-[#3b5bd6] transition">
                            <FaDownload /> Download
                        </button>
                    </div>
                </div>
            </div>

            {/* Desktop Table */}
            <div className="overflow-x-auto hidden md:block">
                <table className="w-full border border-gray-200 min-w-[600px]">
                    <thead>
                        <tr className="border-b-2 border-[#4e6cef] shadow-md bg-gray-50">
                            <th className="p-4 text-left">รหัสสินค้า</th>
                            <th className="p-4 text-left">ชื่อสินค้า</th>
                            <th className="p-4 text-left">ราคา</th>
                            <th className="p-4 text-left">จำนวน</th>
                            <th className="p-4 text-left">หมวดหมู่</th>
                            <th className="p-4 text-left">วันที่เพิ่ม</th>
                            <th className="p-4 text-left">จัดการ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProducts.map((product) => (
                            <tr key={product.product_id} className="hover:bg-gray-50 transition duration-150">
                                <td className="p-4">{product.product_id}</td>
                                <td className="p-4">{product.product_name}</td>
                                <td className="p-4">{Number(product.product_price).toLocaleString()} บาท</td>
                                <td className="p-4">{product.product_qty}</td>
                                <td className="p-4">{getCategoryName(product.category_id)}</td>
                                <td className="p-4">
                                    {product.create_at_product ? new Date(product.create_at_product).toLocaleString("th-TH", {
                                        day: "numeric",
                                        month: "short",
                                        year: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    }) : "-"}
                                </td>
                                <td className="p-4 flex gap-2">
                                    <button onClick={() => openEditModal(product)} className="text-blue-600 hover:text-blue-800 transition">
                                        <FaEdit />
                                    </button>
                                    <button onClick={() => openDeleteModal(product)} className="text-red-600 hover:text-red-800 transition">
                                        <FaTrash />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden">
                {filteredProducts.map((product) => (
                    <div key={product.product_id} className="border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition bg-white mb-4">
                        <div className="flex justify-between items-center mb-3">
                            <h2 className="font-semibold text-gray-800">{product.product_name}</h2>
                            <div className="flex gap-3">
                                <button onClick={() => openEditModal(product)} className="text-blue-600 hover:text-blue-800 transition">
                                    <FaEdit />
                                </button>
                                <button onClick={() => openDeleteModal(product)} className="text-red-600 hover:text-red-800 transition">
                                    <FaTrash />
                                </button>
                            </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-1"><span className="font-medium">รหัส:</span> {product.product_id}</p>
                        <p className="text-sm text-gray-600 mb-1"><span className="font-medium">ราคา:</span> {Number(product.product_price).toLocaleString()} บาท</p>
                        <p className="text-sm text-gray-600 mb-1"><span className="font-medium">จำนวน:</span> {product.product_qty}</p>
                        <p className="text-sm text-gray-600 mb-1"><span className="font-medium">หมวดหมู่:</span> {getCategoryName(product.category_id)}</p>
                        <p className="text-sm text-gray-600"><span className="font-medium">วันที่เพิ่ม:</span> {product.create_at_product ? new Date(product.create_at_product).toLocaleDateString("th-TH") : "-"}</p>
                    </div>
                ))}
            </div>

            {/* Modal Create */}
            {newProduct && (
                <div className="modal-overlay bg-black/50 fixed inset-0 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-lg w-[90%] max-w-md shadow-lg">
                        <h2 className="text-lg font-bold mb-4">เพิ่มสินค้าใหม่</h2>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <input type="text" placeholder="รหัสสินค้า" value={formData.product_id} onChange={e => setFormData({ ...formData, product_id: e.target.value })} className="w-full border rounded p-2" required />
                            <input type="text" placeholder="ชื่อสินค้า" value={formData.product_name} onChange={e => setFormData({ ...formData, product_name: e.target.value })} className="w-full border rounded p-2" required />
                            <input type="number" placeholder="ราคา" value={formData.product_price} onChange={e => setFormData({ ...formData, product_price: e.target.value })} className="w-full border rounded p-2" />
                            <input type="number" placeholder="จำนวน" value={formData.product_qty} onChange={e => setFormData({ ...formData, product_qty: e.target.value })} className="w-full border rounded p-2" />
                            <select value={formData.category_id} onChange={e => setFormData({ ...formData, category_id: e.target.value })} className="w-full border rounded p-2" required>
                                <option value="">เลือกหมวดหมู่</option>
                                {categories.map(cat => <option key={cat.category_id} value={cat.category_id}>{cat.category_name}</option>)}
                            </select>
                            <div className="flex justify-end space-x-2">
                                <button type="button" onClick={closeCreateModal} className="px-4 py-2 bg-gray-300 rounded">ยกเลิก</button>
                                <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">บันทึก</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Edit */}
            {editProduct && (
                <div className="modal-overlay bg-black/50 fixed inset-0 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-lg w-[90%] max-w-md shadow-lg">
                        <h2 className="text-lg font-bold mb-4">แก้ไขสินค้า</h2>
                        <form onSubmit={handleUpdate} className="space-y-4">
                            <input type="text" value={editProduct.product_id} disabled className="w-full border rounded p-2 bg-gray-100" />
                            <input type="text" placeholder="ชื่อสินค้า" value={editFormData.product_name} onChange={e => setEditFormData({ ...editFormData, product_name: e.target.value })} className="w-full border rounded p-2" required />
                            <input type="number" placeholder="ราคา" value={editFormData.product_price} onChange={e => setEditFormData({ ...editFormData, product_price: e.target.value })} className="w-full border rounded p-2" />
                            <input type="number" placeholder="จำนวน" value={editFormData.product_qty} onChange={e => setEditFormData({ ...editFormData, product_qty: e.target.value })} className="w-full border rounded p-2" />
                            <select value={editFormData.category_id} onChange={e => setEditFormData({ ...editFormData, category_id: e.target.value })} className="w-full border rounded p-2" required>
                                <option value="">เลือกหมวดหมู่</option>
                                {categories.map(cat => <option key={cat.category_id} value={cat.category_id}>{cat.category_name}</option>)}
                            </select>
                            <div className="flex justify-end space-x-2">
                                <button type="button" onClick={closeEditModal} className="px-4 py-2 bg-gray-300 rounded">ยกเลิก</button>
                                <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">บันทึก</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Delete */}
            {deletingProduct && (
                <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-lg w-[90%] max-w-sm shadow-lg">
                        <h2 className="text-lg font-bold mb-4 text-red-600">ยืนยันการลบ</h2>
                        <p className="mb-6">
                            คุณต้องการลบสินค้า <span className="font-semibold">{deletingProduct.product_name}</span> หรือไม่?
                        </p>
                        <div className="flex justify-end space-x-2">
                            <button onClick={closeDeleteModal} className="px-4 py-2 bg-gray-300 rounded">ยกเลิก</button>
                            <button onClick={confirmDelete} className="px-4 py-2 bg-red-500 text-white rounded">ยืนยันลบ</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ProductTable;