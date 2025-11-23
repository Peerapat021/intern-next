
export const getDashboardStats = async () => {
    const res = await fetch('/api/dashboard/stats');
    const data = await res.json();
    return data;
};