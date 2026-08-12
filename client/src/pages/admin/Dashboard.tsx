import React, { useEffect, useState } from 'react';
import { Package, MessageSquare, Heart, FileImage, ShieldCheck, Activity, Users, Layers, HardDrive } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import { format } from 'date-fns';
import api from '../../lib/axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

interface DashboardData {
  topProducts: any[];
  enquiriesByStatus: any[];
  topWishlisted: any[];
  categoryDistribution: any[];
  recentEnquiries: any[];
  recentActivity: any[];
  mediaStats: { count: number; totalBytes: number };
  activeAdmins: any[];
  extraStats: {
    totalProducts: number;
    activeProducts: number;
    deletedProducts: number;
    totalEnquiries: number;
    newEnquiries: number;
    totalBanners: number;
    totalFaqs: number;
    totalImportJobs: number;
    failedImportJobs: number;
    totalActivityLogs: number;
    missingDataProducts: number;
    totalCategoriesCount: number;
    pendingEnquiries: number;
    quotedEnquiries: number;
    totalWishlistSaves: number;
  };
}

const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#14b8a6', '#f43f5e'];

export default function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get('/admin/dashboard');
        setData(response.data);
      } catch (error) {
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024, dm = 2, sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center">
          <Activity className="h-10 w-10 animate-pulse text-brand-500 mb-4" />
          <p className="text-gray-500 font-medium">Loading genuine dashboard metrics...</p>
        </div>
      </div>
    );
  }

  if (!data) return <div className="p-8 text-center text-gray-500">No data available</div>;

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl font-heading font-semibold text-gray-900">System Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Real-time overview of your catalog, customers, and team.</p>
      </div>

      {/* QUICK STATS ROW 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Widget 1: Media Storage */}
        <div 
          onClick={() => navigate('/admin/media')}
          className="glass-panel bg-white p-5 shadow-sm rounded-xl border border-gray-100 flex items-center cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all"
        >
          <div className="p-3 rounded-lg bg-indigo-50 text-indigo-600 mr-4">
            <HardDrive className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Media Storage</p>
            <p className="text-xl font-bold text-gray-900">{formatBytes(data.mediaStats.totalBytes)}</p>
            <p className="text-xs text-gray-400 mt-0.5">{data.mediaStats.count} files</p>
          </div>
        </div>

        {/* Widget 2: Admins Online */}
        <div 
          onClick={() => navigate('/admin/users')}
          className="glass-panel bg-white p-5 shadow-sm rounded-xl border border-gray-100 flex items-center cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all"
        >
          <div className="p-3 rounded-lg bg-emerald-50 text-emerald-600 mr-4">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Active Admins</p>
            <p className="text-xl font-bold text-gray-900">{data.activeAdmins.length}</p>
            <p className="text-xs text-gray-400 mt-0.5">System users</p>
          </div>
        </div>

        {/* Widget 3: Total Categories */}
        <div 
          onClick={() => navigate('/admin/categories')}
          className="glass-panel bg-white p-5 shadow-sm rounded-xl border border-gray-100 flex items-center cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all"
        >
          <div className="p-3 rounded-lg bg-amber-50 text-amber-600 mr-4">
            <Layers className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Categories</p>
            <p className="text-xl font-bold text-gray-900">{data.categoryDistribution.length}</p>
            <p className="text-xs text-gray-400 mt-0.5">Catalog structure</p>
          </div>
        </div>

        {/* Widget 4: Top Wishlisted */}
        <div 
          onClick={() => navigate('/admin/products')}
          className="glass-panel bg-white p-5 shadow-sm rounded-xl border border-gray-100 flex flex-col justify-between cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-500 flex items-center"><Heart className="h-4 w-4 mr-1 text-rose-500" /> Most Desired</p>
          </div>
          {data.topWishlisted.length > 0 ? (
            <div>
              <p className="text-sm font-bold text-gray-900 truncate">{data.topWishlisted[0]?.productName}</p>
              <p className="text-xs text-gray-400 mt-0.5">{data.topWishlisted[0]?.wishlistCount} wishlists</p>
            </div>
          ) : (
            <p className="text-sm text-gray-400 italic">No wishlists yet</p>
          )}
        </div>
      </div>

      {/* QUICK STATS ROW 2 & 3 (15 NEW WIDGETS) */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {/* Products */}
        <div 
          onClick={() => navigate('/admin/products')}
          className="glass-panel bg-white p-4 shadow-sm rounded-xl border border-gray-100 cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all"
        >
          <p className="text-xs font-medium text-gray-500 uppercase">Total Products</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{data.extraStats.totalProducts}</p>
          <p className="text-xs text-brand-600 mt-1">{data.extraStats.activeProducts} Active</p>
        </div>
        
        {/* Missing Data */}
        <div 
          onClick={() => navigate('/admin/products/missing-data')}
          className="glass-panel bg-white p-4 shadow-sm rounded-xl border border-red-100 cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all"
        >
          <p className="text-xs font-medium text-red-500 uppercase">Missing Data</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{data.extraStats.missingDataProducts}</p>
          <p className="text-xs text-red-400 mt-1">Requires action</p>
        </div>

        {/* Deleted Products */}
        <div 
          onClick={() => navigate('/admin/products/trash')}
          className="glass-panel bg-white p-4 shadow-sm rounded-xl border border-gray-100 cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all"
        >
          <p className="text-xs font-medium text-gray-500 uppercase">Recycle Bin</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{data.extraStats.deletedProducts}</p>
          <p className="text-xs text-gray-400 mt-1">Deleted products</p>
        </div>

        {/* Categories Count */}
        <div 
          onClick={() => navigate('/admin/categories')}
          className="glass-panel bg-white p-4 shadow-sm rounded-xl border border-gray-100 cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all"
        >
          <p className="text-xs font-medium text-gray-500 uppercase">Categories</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{data.extraStats.totalCategoriesCount}</p>
          <p className="text-xs text-gray-400 mt-1">Catalog tree nodes</p>
        </div>

        {/* Wishlist Saves */}
        <div 
          onClick={() => navigate('/admin/products')}
          className="glass-panel bg-white p-4 shadow-sm rounded-xl border border-gray-100 cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all"
        >
          <p className="text-xs font-medium text-gray-500 uppercase">Total Saves</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{data.extraStats.totalWishlistSaves}</p>
          <p className="text-xs text-rose-500 mt-1">Wishlisted globally</p>
        </div>

        {/* Enquiries */}
        <div 
          onClick={() => navigate('/admin/enquiries')}
          className="glass-panel bg-white p-4 shadow-sm rounded-xl border border-gray-100 cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all"
        >
          <p className="text-xs font-medium text-gray-500 uppercase">Total Enquiries</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{data.extraStats.totalEnquiries}</p>
          <p className="text-xs text-blue-600 mt-1">{data.extraStats.newEnquiries} New</p>
        </div>

        {/* Pending Enquiries */}
        <div 
          onClick={() => navigate('/admin/enquiries')}
          className="glass-panel bg-white p-4 shadow-sm rounded-xl border border-gray-100 cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all"
        >
          <p className="text-xs font-medium text-gray-500 uppercase">Pending Review</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{data.extraStats.pendingEnquiries}</p>
          <p className="text-xs text-orange-500 mt-1">Needs attention</p>
        </div>

        {/* Quoted Enquiries */}
        <div 
          onClick={() => navigate('/admin/enquiries')}
          className="glass-panel bg-white p-4 shadow-sm rounded-xl border border-gray-100 cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all"
        >
          <p className="text-xs font-medium text-gray-500 uppercase">Quoted Deals</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{data.extraStats.quotedEnquiries}</p>
          <p className="text-xs text-green-500 mt-1">Awaiting customer</p>
        </div>

        {/* Banners */}
        <div 
          onClick={() => navigate('/admin/cms')}
          className="glass-panel bg-white p-4 shadow-sm rounded-xl border border-gray-100 cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all"
        >
          <p className="text-xs font-medium text-gray-500 uppercase">Banners</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{data.extraStats.totalBanners}</p>
          <p className="text-xs text-gray-400 mt-1">Homepage slides</p>
        </div>

        {/* FAQs */}
        <div 
          onClick={() => navigate('/admin/cms')}
          className="glass-panel bg-white p-4 shadow-sm rounded-xl border border-gray-100 cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all"
        >
          <p className="text-xs font-medium text-gray-500 uppercase">Total FAQs</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{data.extraStats.totalFaqs}</p>
          <p className="text-xs text-gray-400 mt-1">Help center items</p>
        </div>

        {/* Import Jobs */}
        <div 
          onClick={() => navigate('/admin/import')}
          className="glass-panel bg-white p-4 shadow-sm rounded-xl border border-gray-100 cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all"
        >
          <p className="text-xs font-medium text-gray-500 uppercase">Import Jobs</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{data.extraStats.totalImportJobs}</p>
          <p className="text-xs text-rose-500 mt-1">{data.extraStats.failedImportJobs} Failed</p>
        </div>

        {/* Activity Logs */}
        <div 
          onClick={() => navigate('/admin/reports')}
          className="glass-panel bg-white p-4 shadow-sm rounded-xl border border-gray-100 cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all"
        >
          <p className="text-xs font-medium text-gray-500 uppercase">Audit Logs</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{data.extraStats.totalActivityLogs}</p>
          <p className="text-xs text-gray-400 mt-1">System actions</p>
        </div>
      </div>

      {/* MIDDLE ROW: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Widget 5: Engagement Trends */}
        <div className="glass-panel bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-heading font-semibold mb-4 text-gray-900">Top Products by Engagement</h2>
          <div className="h-72 w-full">
            {data.topProducts.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.topProducts} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="productCode" tick={{fontSize: 12}} />
                  <YAxis tick={{fontSize: 12}} />
                  <RechartsTooltip />
                  <Area type="monotone" dataKey="viewCount" name="Views" stroke="#0ea5e9" fillOpacity={1} fill="url(#colorViews)" />
                  <Area type="monotone" dataKey="enquiryCount" name="Enquiries" stroke="#10b981" fillOpacity={0.3} fill="#10b981" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 italic">Not enough data to chart</div>
            )}
          </div>
        </div>

        {/* Widget 6: Category Distribution */}
        <div className="glass-panel bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-heading font-semibold mb-4 text-gray-900">Products per Category</h2>
          <div className="h-72 w-full">
            {data.categoryDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.categoryDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                    label={({name, percent}) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  >
                    {data.categoryDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 italic">No categories mapped</div>
            )}
          </div>
        </div>
      </div>

      {/* BOTTOM ROW: Tables & Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Widget 7: Recent Enquiries */}
        <div className="lg:col-span-2 glass-panel bg-white p-6 rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-heading font-semibold text-gray-900">Recent Customer Enquiries</h2>
            <a href="/admin/enquiries" className="text-xs font-semibold text-brand-600 hover:text-brand-700">View All</a>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead>
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.recentEnquiries.length === 0 ? (
                  <tr><td colSpan={4} className="px-3 py-6 text-center text-sm text-gray-400">No enquiries found.</td></tr>
                ) : (
                  data.recentEnquiries.map(enq => (
                    <tr key={enq.id} className="hover:bg-gray-50">
                      <td className="px-3 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                        {enq.customerName}
                        {enq.companyName && <span className="block text-xs font-normal text-gray-500">{enq.companyName}</span>}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500">{enq._count.items}</td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                          enq.status === 'NEW' ? 'bg-blue-100 text-blue-800' :
                          enq.status === 'WON' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {enq.status}
                        </span>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500">{format(new Date(enq.createdAt), 'MMM d, h:mm a')}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Widget 8: Recent Activity Log */}
        <div className="glass-panel bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-heading font-semibold text-gray-900">System Activity</h2>
          </div>
          <div className="space-y-4">
            {data.recentActivity.length === 0 ? (
              <p className="text-center text-sm text-gray-400 py-4">No recent activity.</p>
            ) : (
              data.recentActivity.map(act => (
                <div key={act.id} className="flex gap-3 items-start relative">
                  <div className="w-2 h-2 mt-1.5 rounded-full bg-brand-500 flex-shrink-0 relative z-10" />
                  {/* Line connecting dots */}
                  <div className="absolute left-1 top-3.5 bottom-[-16px] w-px bg-gray-200 -z-0 last:hidden" />
                  
                  <div>
                    <p className="text-sm font-medium text-gray-900">{act.action} {act.entity}</p>
                    <p className="text-xs text-gray-500">By {act.actor?.name || 'System'} • {format(new Date(act.createdAt), 'MMM d, h:mm a')}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
