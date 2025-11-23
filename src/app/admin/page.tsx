'use client';
import { useEffect, useState } from 'react';
import { Package, Tag, Users, AlertCircle, Plus, Edit, Trash2, Activity } from 'lucide-react';

interface Stats {
  products: number;
  categories: number;
  users: number;
  admins: number;
  today: { add: number; edit: number; delete: number };
  todayErrors: number;
  duplicateAttempts: number;
  updatedAt: string;
}

interface Log {
  id: number;
  product_id: string;
  action: 'add' | 'edit' | 'delete';
  changed_by: number;
  changed_by_name: string;
  create_at_log: string;
  is_error: 0 | 1;
  error_message: string | null;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentLogs, setRecentLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/dashboard/stats', { cache: 'no-store' });
      const json = await res.json();

      if (json.success && json.data) {
        setStats(json.data);
        setRecentLogs(json.data.recentLogs || []);
      }
    } catch (err) {
      console.error("โหลด Dashboard ไม่ได้:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // อัปเดตอัตโนมัติทุก 10 วินาที
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">กำลังโหลด Dashboard...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-xl text-red-600">โหลดข้อมูลไม่สำเร็จ</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Package className="w-10 h-10 text-indigo-600" />
            Dashboard ระบบจัดการสินค้า
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-8">

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white p-6 shadow-lg hover:scale-105 transition-transform duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-100 text-sm font-medium">สินค้าทั้งหมด</p>
                <p className="text-4xl font-bold mt-2">{stats.products.toLocaleString()}</p>
              </div>
              <Package className="w-14 h-14 opacity-90" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white p-6 shadow-lg hover:scale-105 transition-transform duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-sm font-medium">หมวดหมู่</p>
                <p className="text-4xl font-bold mt-2">{stats.categories}</p>
              </div>
              <Tag className="w-14 h-14 opacity-90" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-500 to-amber-600 text-white p-6 shadow-lg hover:scale-105 transition-transform duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-100 text-sm font-medium">ผู้ใช้ทั้งหมด</p>
                <p className="text-4xl font-bold mt-2">{stats.users}</p>
              </div>
              <Users className="w-14 h-14 opacity-90" />
            </div>
          </div>

          <div className={`relative overflow-hidden ${stats.todayErrors > 0 ? 'bg-gradient-to-br from-red-500 to-red-600' : 'bg-gradient-to-br from-gray-500 to-gray-600'} text-white p-6 shadow-lg hover:scale-105 transition-transform duration-300`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/90 text-sm font-medium">ข้อผิดพลาดวันนี้</p>
                <p className="text-4xl font-bold mt-2">{stats.todayErrors}</p>
                {stats.duplicateAttempts > 0 && (
                  <p className="text-sm mt-2 bg-white/20 rounded-lg px-3 py-1.5 inline-block">
                    ซ้ำ {stats.duplicateAttempts} ครั้ง
                  </p>
                )}
              </div>
              <AlertCircle className="w-14 h-14 opacity-90" />
            </div>
            {stats.todayErrors > 0 && (
              <div className="absolute inset-0 bg-red-600 opacity-20 animate-pulse"></div>
            )}
          </div>
        </div>

        {/* Live Activity Log */}
        <div className="bg-white shadow-lg border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-600 text-white px-8 py-5">
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <Activity className="w-7 h-7" />
              กิจกรรมล่าสุด (อัปเดตอัตโนมัติ)
            </h2>
          </div>

          <div className="p-6 max-h-96 overflow-y-auto">
            {recentLogs.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                <Activity className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg">ยังไม่มีกิจกรรมวันนี้</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentLogs.map((log, i) => (
                  <div
                    key={log.id}
                    className={`flex items-center justify-between p-5 rounded-xl border transition-all ${log.is_error
                      ? 'bg-red-50 border-red-300'
                      : log.action === 'add'
                        ? 'bg-green-50 border-green-300'
                        : log.action === 'edit'
                          ? 'bg-blue-50 border-blue-300'
                          : 'bg-gray-50 border-gray-300'
                      }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${log.is_error ? 'bg-red-500' :
                        log.action === 'add' ? 'bg-green-500' :
                          log.action === 'edit' ? 'bg-blue-500' : 'bg-gray-500'
                        }`}>
                        {log.is_error ? '!' :
                          log.action === 'add' ? '+' :
                            log.action === 'edit' ? 'E' : 'D'}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          <span className="text-blue-600 font-semibold">
                            {log.changed_by_name}
                          </span><br />
                          {log.action === 'add' ? 'เพิ่ม' : log.action === 'edit' ? 'แก้ไข' : 'ลบ'}สินค้า
                          <span className="ml-2 font-bold text-gray-800">#{log.product_id}</span>
                        </p>
                        {log.is_error && log.error_message && (
                          <p className="text-sm text-red-600 mt-1">
                            {log.error_message}
                          </p>
                        )}
                      </div>
                    </div>
                    <span className="text-sm text-gray-500 whitespace-nowrap">
                      {new Date(log.create_at_log).toLocaleTimeString('th-TH', {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Last Updated */}
        <div className="text-center text-sm text-gray-500 bg-white rounded-xl py-3 border">
          อัปเดตล่าสุดอัตโนมัติ: {new Date(stats.updatedAt).toLocaleString('th-TH')}
        </div>
      </div>
    </div>
  );
}