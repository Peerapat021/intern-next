'use client'

import { FaEdit, FaTrash, FaDownload, FaPlus } from "react-icons/fa";
import { getProducts } from "@/lib/services/products/get";
import { getCategories } from "@/lib/services/categories/get";
import { useState, useEffect, useCallback } from "react";
import { Product } from "@/lib/types/products";

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

    // Image preview
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [editImageFile, setEditImageFile] = useState<File | null>(null);
    const [editImagePreview, setEditImagePreview] = useState<string | null>(null);

    // Check product_id ซ้ำ (debounce)
    const [idChecking, setIdChecking] = useState(false);
    const [idExists, setIdExists] = useState(false);
    const [checkTimeout, setCheckTimeout] = useState<NodeJS.Timeout | null>(null);

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

    // Filter products
    const filteredProducts = dataProducts.filter(p =>
        p.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.product_id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Debounce check product_id
    const checkProductId = useCallback((value: string) => {
        if (checkTimeout) clearTimeout(checkTimeout);

        const trimmed = value.trim();
        if (!trimmed) {
            setIdExists(false);
            setIdChecking(false);
            return;
        }

        setIdChecking(true);
        setIdExists(false);

        const timeout = setTimeout(async () => {
            try {
                const res = await fetch(`/api/products/check-id/${encodeURIComponent(trimmed)}`, {
                    cache: "no-store",
                });
                const data = await res.json();
                setIdExists(data.exists === true);
            } catch (err) {
                setIdExists(true);
            } finally {
                setIdChecking(false);
            }
        }, 400);

        setCheckTimeout(timeout);
    }, [checkTimeout]);

    // Modal handlers
    const openCreateModal = () => {
        setFormData({ product_id: "", product_name: "", product_price: "", product_qty: "", category_id: "" });
        setImageFile(null);
        setImagePreview(null);
        setIdExists(false);
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
        setEditImageFile(null);
        setEditImagePreview(null);
    };

    const closeEditModal = () => setEditProduct(null);

    const openDeleteModal = (product: Product) => setDeletingProduct(product);
    const closeDeleteModal = () => setDeletingProduct(null);

    // CREATE
    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (idExists || idChecking || !formData.product_id.trim()) return;

        const submitData = new FormData();
        submitData.append("product_id", formData.product_id.trim().toUpperCase());
        submitData.append("product_name", formData.product_name.trim());
        submitData.append("product_price", formData.product_price);
        submitData.append("product_qty", formData.product_qty);
        submitData.append("category_id", formData.category_id);
        if (imageFile) submitData.append("file", imageFile);

        try {
            const res = await fetch("/api/products", {
                method: "POST",
                body: submitData,
            });

            const result = await res.json();
            if (!res.ok) throw new Error(result.error || "เพิ่มสินค้าไม่สำเร็จ");

            alert("เพิ่มสินค้าสำเร็จ!");
            setImageFile(null);
            setImagePreview(null);
            await fetchProducts();
            closeCreateModal();
        } catch (err: any) {
            alert(err.message || "เพิ่มสินค้าไม่สำเร็จ");
        }
    };

    // UPDATE
    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editProduct) return;

        const submitData = new FormData();
        submitData.append("product_name", editFormData.product_name.trim());
        submitData.append("product_price", editFormData.product_price);
        submitData.append("product_qty", editFormData.product_qty);
        submitData.append("category_id", editFormData.category_id);
        if (editImageFile) submitData.append("file", editImageFile);

        try {
            const res = await fetch(`/api/products/${editProduct.product_id}`, {
                method: "PUT",
                body: submitData,
            });

            const result = await res.json();
            if (!res.ok) throw new Error(result.error || "แก้ไขไม่สำเร็จ");

            alert("แก้ไขสินค้าสำเร็จ!");
            setEditImageFile(null);
            setEditImagePreview(null);
            await fetchProducts();
            closeEditModal();
        } catch (err: any) {
            alert(err.message || "แก้ไขไม่สำเร็จ");
        }
    };

    // DELETE
    const confirmDelete = async () => {
        if (!deletingProduct) return;

        try {
            const res = await fetch(`/api/products/${deletingProduct.product_id}`, {
                method: "DELETE",
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "ลบไม่สำเร็จ");
            }

            alert("ลบสินค้าสำเร็จ");
            await fetchProducts();
            closeDeleteModal();
        } catch (err: any) {
            alert(err.message || "ลบสินค้าไม่สำเร็จ");
        }
    };

    const getCategoryName = (id: number | string) => {
        return categories.find(c => c.category_id === Number(id))?.category_name || "-";
    };

    return (
        <div className="p-4 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen">
            <div>
                <p className="border-b border-gray-200 dark:border-gray-700 py-2 text-lg font-semibold text-gray-900 dark:text-white">
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
                            className="w-full md:w-[550px] border border-gray-400 dark:border-gray-600 bg-white dark:bg-gray-800 p-2 rounded-sm text-gray-900 dark:text-white"
                            autoFocus
                        />
                    </div>
                    <div className="flex flex-col md:flex-row gap-2">
                        <button onClick={openCreateModal} className="border border-gray-200 dark:border-gray-700 rounded-full p-2 px-4 flex gap-2 items-center text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition">
                            เพิ่มสินค้า
                        </button>
                        <button className="border border-gray-200 dark:border-gray-700 rounded-full p-2 px-4 flex gap-2 items-center bg-[#4e6cef] hover:bg-[#3b5bd6] text-white transition">
                            Download
                        </button>
                    </div>
                </div>
            </div>

            {/* Desktop Table */}
            <div className="overflow-x-auto hidden md:block">
                <table className="w-full border border-gray-200 dark:border-gray-700 min-w-[600px] bg-white dark:bg-gray-800">
                    <thead>
                        <tr className="border-b-2 border-[#4e6cef] shadow-md bg-gray-50 dark:bg-gray-800">
                            <th className="p-4 text-left text-gray-900 dark:text-white">รหัสสินค้า</th>
                            <th className="p-4 text-left text-gray-900 dark:text-white">ชื่อสินค้า</th>
                            <th className="p-4 text-left text-gray-900 dark:text-white">ราคา</th>
                            <th className="p-4 text-left text-gray-900 dark:text-white">จำนวน</th>
                            <th className="p-4 text-left text-gray-900 dark:text-white">หมวดหมู่</th>
                            <th className="p-4 text-left text-gray-900 dark:text-white">วันที่เพิ่ม</th>
                            <th className="p-4 text-left text-gray-900 dark:text-white">จัดการ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProducts.map((product) => (
                            <tr key={product.product_id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition duration-150">
                                <td className="p-4 text-gray-800 dark:text-gray-200">{product.product_id}</td>
                                <td className="p-4 text-gray-800 dark:text-gray-200">{product.product_name}</td>
                                <td className="p-4 text-gray-800 dark:text-gray-200">{Number(product.product_price).toLocaleString()} บาท</td>
                                <td className="p-4 text-gray-800 dark:text-gray-200">{product.product_qty}</td>
                                <td className="p-4 text-gray-800 dark:text-gray-200">{getCategoryName(product.category_id)}</td>
                                <td className="p-4 text-gray-600 dark:text-gray-400">
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
                    <div key={product.product_id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm hover:shadow-md transition bg-white dark:bg-gray-800 mb-4">
                        <div className="flex justify-between items-center mb-3">
                            <h2 className="font-semibold text-gray-800 dark:text-gray-200">{product.product_name}</h2>
                            <div className="flex gap-3">
                                <button onClick={() => openEditModal(product)} className="text-blue-600 hover:text-blue-800 transition dark:text-white">
                                    <FaEdit />
                                </button>
                                <button onClick={() => openDeleteModal(product)} className="text-red-600 hover:text-red-800 transition dark:text-white">
                                    <FaTrash />
                                </button>
                            </div>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1"><span className="font-medium">รหัส:</span> {product.product_id}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1"><span className="font-medium">ราคา:</span> {Number(product.product_price).toLocaleString()} บาท</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1"><span className="font-medium">จำนวน:</span> {product.product_qty}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1"><span className="font-medium">หมวดหมู่:</span> {getCategoryName(product.category_id)}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400"><span className="font-medium">วันที่เพิ่ม:</span> {product.create_at_product ? new Date(product.create_at_product).toLocaleDateString("th-TH") : "-"}</p>
                    </div>
                ))}
            </div>

            {/* Modal: เพิ่มสินค้า */}
            {newProduct && (
                <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex justify-center items-center z-50 overflow-y-auto">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-[90%] max-w-md shadow-lg my-8">
                        <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">เพิ่มสินค้าใหม่</h2>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <input
                                    type="text"
                                    placeholder="รหัสสินค้า (ไม่สามารถแก้ไขได้ภายหลัง)"
                                    value={formData.product_id}
                                    onChange={(e) => {
                                        const val = e.target.value.toUpperCase();
                                        setFormData({ ...formData, product_id: val });
                                        checkProductId(val);
                                    }}
                                    className={`w-full border rounded p-2 ${idExists ? "border-red-500" : "border-gray-300 dark:border-gray-600"} bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                                    required
                                />
                                <div className="text-sm mt-1 h-5">
                                    {idChecking && <span className="text-blue-600 dark:text-blue-400">กำลังตรวจสอบ...</span>}
                                    {idExists && !idChecking && <span className="text-red-600 dark:text-red-400">รหัสนี้มีในระบบแล้ว!</span>}
                                    {!idExists && !idChecking && formData.product_id && <span className="text-green-600 dark:text-green-400">รหัสนี้ใช้ได้!</span>}
                                </div>
                            </div>

                            <input type="text" placeholder="ชื่อสินค้า" value={formData.product_name} onChange={e => setFormData({ ...formData, product_name: e.target.value })} className="w-full border border-gray-300 dark:border-gray-600 rounded p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" required />
                            <input type="number" placeholder="ราคา" value={formData.product_price} onChange={e => setFormData({ ...formData, product_price: e.target.value })} className="w-full border border-gray-300 dark:border-gray-600 rounded p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" required />
                            <input type="number" placeholder="จำนวน" value={formData.product_qty} onChange={e => setFormData({ ...formData, product_qty: e.target.value })} className="w-full border border-gray-300 dark:border-gray-600 rounded p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" required />
                            <select value={formData.category_id} onChange={e => setFormData({ ...formData, category_id: e.target.value })} className="w-full border border-gray-300 dark:border-gray-600 rounded p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" required>
                                <option value="">เลือกหมวดหมู่</option>
                                {categories.map(cat => <option key={cat.category_id} value={cat.category_id}>{cat.category_name}</option>)}
                            </select>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">รูปภาพสินค้า</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            setImageFile(file);
                                            setImagePreview(URL.createObjectURL(file));
                                        }
                                    }}
                                    className="w-full border border-gray-300 dark:border-gray-600 rounded p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    required
                                />
                                {imagePreview && <img src={imagePreview} alt="Preview" className="w-full max-h-64 object-contain rounded border mt-2 border-gray-300 dark:border-gray-600" />}
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <button type="button" onClick={closeCreateModal} className="px-5 py-2 bg-gray-300 dark:bg-gray-700 rounded hover:bg-gray-400 dark:hover:bg-gray-600 transition text-gray-800 dark:text-gray-200">ยกเลิก</button>
                                <button
                                    type="submit"
                                    disabled={idChecking || idExists || !formData.product_id.trim()}
                                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed rounded text-white transition"
                                >
                                    {idChecking ? "กำลังตรวจสอบ..." : "เพิ่มสินค้า"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal: แก้ไขสินค้า */}
            {editProduct && (
                <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex justify-center items-center z-50 overflow-y-auto">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-[90%] max-w-md shadow-lg my-8">
                        <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">แก้ไขสินค้า</h2>
                        <form onSubmit={handleUpdate} className="space-y-4">
                            <input type="text" value={editProduct.product_id} disabled className="w-full border border-gray-300 dark:border-gray-600 rounded p-2 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400" />

                            <input type="text" placeholder="ชื่อสินค้า" value={editFormData.product_name} onChange={e => setEditFormData({ ...editFormData, product_name: e.target.value })} className="w-full border border-gray-300 dark:border-gray-600 rounded p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" required />
                            <input type="number" placeholder="ราคา" value={editFormData.product_price} onChange={e => setEditFormData({ ...editFormData, product_price: e.target.value })} className="w-full border border-gray-300 dark:border-gray-600 rounded p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" required />
                            <input type="number" placeholder="จำนวน" value={editFormData.product_qty} onChange={e => setEditFormData({ ...editFormData, product_qty: e.target.value })} className="w-full border border-gray-300 dark:border-gray-600 rounded p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" required />
                            <select value={editFormData.category_id} onChange={e => setEditFormData({ ...editFormData, category_id: e.target.value })} className="w-full border border-gray-300 dark:border-gray-600 rounded p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" required>
                                <option value="">เลือกหมวดหมู่</option>
                                {categories.map(cat => <option key={cat.category_id} value={cat.category_id}>{cat.category_name}</option>)}
                            </select>

                            {editProduct.product_image && !editImagePreview && (
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">รูปภาพปัจจุบัน</label>
                                    <img src={editProduct.product_image} alt="Current" className="w-full max-h-64 object-contain rounded border border-gray-300 dark:border-gray-600" />
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">เปลี่ยนรูปภาพ (ถ้าต้องการ)</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            setEditImageFile(file);
                                            setEditImagePreview(URL.createObjectURL(file));
                                        }
                                    }}
                                    className="w-full border border-gray-300 dark:border-gray-600 rounded p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                />
                                {editImagePreview && <img src={editImagePreview} alt="New preview" className="w-full max-h-64 object-contain rounded border mt-2 border-gray-300 dark:border-gray-600" />}
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <button type="button" onClick={closeEditModal} className="px-5 py-2 bg-gray-300 dark:bg-gray-700 rounded hover:bg-gray-400 dark:hover:bg-gray-600 transition text-gray-800 dark:text-gray-200">ยกเลิก</button>
                                <button type="submit" className="px-5 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white transition">
                                    บันทึกการแก้ไข
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal: ลบสินค้า */}
            {deletingProduct && (
                <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex justify-center items-center z-50">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-[90%] max-w-sm shadow-lg">
                        <h2 className="text-lg font-bold mb-4 text-red-600 dark:text-red-400">ยืนยันการลบ</h2>
                        <p className="mb-6 text-gray-700 dark:text-gray-300">
                            คุณแน่ใจหรือไม่ที่จะลบสินค้า <span className="font-semibold">{deletingProduct.product_name}</span>?
                        </p>
                        <div className="flex justify-end gap-3">
                            <button onClick={closeDeleteModal} className="px-5 py-2 bg-gray-300 dark:bg-gray-700 rounded hover:bg-gray-400 dark:hover:bg-gray-600 transition text-gray-800 dark:text-gray-200">ยกเลิก</button>
                            <button onClick={confirmDelete} className="px-5 py-2 bg-red-600 hover:bg-red-700 rounded text-white transition">ยืนยันลบ</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ProductTable;