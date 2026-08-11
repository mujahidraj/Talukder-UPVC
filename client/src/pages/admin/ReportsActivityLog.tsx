import React, { useState, useEffect } from 'react';
import { BarChart3, Activity, Clock, TrendingUp, Users, ShoppingCart, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';
import toast from 'react-hot-toast';
import api from '../../lib/axios';

type TabKey = 'overview' | 'reports' | 'activity';

export default function ReportsActivityLog() {
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [stats, setStats] = useState({ totalViews: 0, totalEnquiries: 0, totalWishlist: 0 });

  useEffect(() => {
    // Fetch aggregate stats if possible, or just calculate from products
    api.get('/admin/reports/product-performance?limit=100').then(res => {
      const data = res.data || [];
      const views = data.reduce((sum: number, p: any) => sum + (p.viewCount || 0), 0);
      const enq = data.reduce((sum: number, p: any) => sum + (p.enquiryCount || 0), 0);
      const wish = data.reduce((sum: number, p: any) => sum + (p.wishlistCount || 0), 0);
      setStats({ totalViews: views, totalEnquiries: enq, totalWishlist: wish });
    }).catch(() => {});
  }, []);

  return (
    <div>
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-heading font-semibold text-gray-900 flex items-center">
            <BarChart3 className="h-6 w-6 mr-3 text-brand-600" />
            Reports & Analytics
          </h1>
          <p className="text-sm text-gray-500 mt-1">Track your product performance and website activity in real-time.</p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="glass-panel p-6 bg-white border-l-4 border-l-brand-500 hover:shadow-lg transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Product Views</p>
              <h3 className="text-3xl font-heading font-bold text-gray-900 mt-2">{stats.totalViews.toLocaleString()}</h3>
            </div>
            <div className="p-3 bg-brand-50 rounded-xl"><Eye className="h-6 w-6 text-brand-600" /></div>
          </div>
        </div>
        <div className="glass-panel p-6 bg-white border-l-4 border-l-emerald-500 hover:shadow-lg transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Enquiries Received</p>
              <h3 className="text-3xl font-heading font-bold text-gray-900 mt-2">{stats.totalEnquiries.toLocaleString()}</h3>
            </div>
            <div className="p-3 bg-emerald-50 rounded-xl"><ShoppingCart className="h-6 w-6 text-emerald-600" /></div>
          </div>
        </div>
        <div className="glass-panel p-6 bg-white border-l-4 border-l-rose-500 hover:shadow-lg transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Products in Wishlists</p>
              <h3 className="text-3xl font-heading font-bold text-gray-900 mt-2">{stats.totalWishlist.toLocaleString()}</h3>
            </div>
            <div className="p-3 bg-rose-50 rounded-xl"><Activity className="h-6 w-6 text-rose-600" /></div>
          </div>
        </div>
      </div>

      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'overview' ? 'border-brand-500 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <TrendingUp className="h-4 w-4" /> Overview Dashboard
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'reports' ? 'border-brand-500 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <BarChart3 className="h-4 w-4" /> Performance Data Table
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'activity' ? 'border-brand-500 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Clock className="h-4 w-4" /> System Activity Log
          </button>
        </nav>
      </div>

      {activeTab === 'overview' && <OverviewDashboard />}
      {activeTab === 'reports' && <ProductPerformance />}
      {activeTab === 'activity' && <ActivityLogView />}
    </div>
  );
}

function OverviewDashboard() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/reports/product-performance?limit=10')
      .then(res => {
        // Format data for Recharts
        const formatted = (res.data || []).map((item: any) => ({
          name: item.productCode || item.productName.substring(0, 15) + '...',
          Views: item.viewCount || 0,
          Enquiries: item.enquiryCount || 0,
          Wishlist: item.wishlistCount || 0,
        }));
        setData(formatted);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <div className="glass-panel bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="font-heading font-semibold text-gray-900 mb-6">Top 10 Products by Enquiries</h3>
          {loading ? (
            <div className="h-80 flex items-center justify-center text-gray-400">Loading chart data...</div>
          ) : data.length === 0 ? (
            <div className="h-80 flex items-center justify-center text-gray-400">Not enough data to display chart.</div>
          ) : (
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                  <Tooltip cursor={{ fill: '#f9fafb' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                  <Bar dataKey="Enquiries" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  <Bar dataKey="Wishlist" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Area Chart */}
        <div className="glass-panel bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="font-heading font-semibold text-gray-900 mb-6">Engagement vs Views (Top Products)</h3>
          {loading ? (
            <div className="h-80 flex items-center justify-center text-gray-400">Loading chart data...</div>
          ) : data.length === 0 ? (
            <div className="h-80 flex items-center justify-center text-gray-400">Not enough data to display chart.</div>
          ) : (
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                  <Tooltip cursor={{ stroke: '#9ca3af', strokeWidth: 1, strokeDasharray: '3 3' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                  <Area type="monotone" dataKey="Views" stroke="#10b981" fillOpacity={1} fill="url(#colorViews)" strokeWidth={3} activeDot={{ r: 6 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ProductPerformance() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/reports/product-performance?limit=50')
      .then(res => { setData(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="glass-panel overflow-hidden bg-white shadow-sm border border-gray-100">
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
        <h2 className="text-lg font-heading font-semibold text-gray-900">Detailed Performance Table (Top 50)</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Product</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Code</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-emerald-600 uppercase tracking-wider">Views</th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-rose-600 uppercase tracking-wider">Wishlist</th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-brand-600 uppercase tracking-wider">Enquiries</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-400">Fetching performance metrics...</td></tr>
            ) : data.length === 0 ? (
              <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-400">No product data found.</td></tr>
            ) : (
              data.map((item: any) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 max-w-xs truncate">{item.productName}</td>
                  <td className="px-6 py-4 text-sm font-mono text-gray-500 bg-gray-50/50">{item.productCode}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                      {item.category?.name || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-center font-semibold text-emerald-700 bg-emerald-50/30">{item.viewCount}</td>
                  <td className="px-6 py-4 text-sm text-center font-semibold text-rose-700 bg-rose-50/30">{item.wishlistCount}</td>
                  <td className="px-6 py-4 text-sm text-center bg-brand-50/30">
                    <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-bold bg-brand-100 text-brand-800 min-w-[32px]">
                      {item.enquiryCount}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ActivityLogView() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/activity-log?limit=50')
      .then(res => { setLogs(res.data.data || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="glass-panel p-6 bg-white shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-heading font-semibold text-gray-900">System Activity Log</h2>
        <span className="text-xs font-medium bg-brand-100 text-brand-800 px-2.5 py-1 rounded-full border border-brand-200">
          Last 50 Actions
        </span>
      </div>
      {loading ? (
        <p className="text-sm text-gray-400 py-12 text-center flex flex-col items-center">
          <Clock className="h-8 w-8 text-gray-300 animate-spin mb-3" />
          Loading activity history...
        </p>
      ) : logs.length === 0 ? (
        <div className="text-center py-16 text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <Clock className="mx-auto h-12 w-12 text-gray-300 mb-3" />
          <p className="font-medium text-gray-600 mb-1">No Activity Found</p>
          <p className="text-sm">System events and admin actions will be recorded here.</p>
        </div>
      ) : (
        <ul className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
          {logs.map((log: any, idx: number) => (
            <li key={log.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
              {/* Icon */}
              <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-brand-100 text-brand-600 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm relative z-10">
                <Activity className="h-4 w-4" />
              </div>
              {/* Card */}
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-gray-100 bg-white shadow-sm hover:shadow-md hover:border-brand-200 transition-all">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-gray-900 text-sm">{log.actor?.name || 'System User'}</span>
                  <time className="text-xs font-medium text-gray-500 bg-gray-50 px-2 py-0.5 rounded">{format(new Date(log.createdAt), 'MMM d, h:mm a')}</time>
                </div>
                <p className="text-sm text-gray-600">
                  <span className="font-medium text-brand-600 capitalize">{log.action.toLowerCase()}</span> a{' '}
                  <span className="font-medium text-gray-800">{log.entity}</span>
                </p>
                {log.after && (
                  <div className="mt-2 text-xs text-gray-500 bg-gray-50 p-2 rounded border border-gray-100 font-mono overflow-x-auto">
                    {JSON.stringify(log.after)}
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
