import React, { useState, useEffect } from 'react';
import { BarChart3, Activity, Clock, TrendingUp, Users, ShoppingCart, Eye, ChevronRight, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';
import toast from 'react-hot-toast';
import api from '../../lib/axios';

type TabKey = 'overview' | 'reports' | 'activity';

export default function ReportsActivityLog() {
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [stats, setStats] = useState({ totalViews: 0, totalEnquiries: 0, totalWishlist: 0 });

  useEffect(() => {
    api.get('/admin/reports/product-performance?limit=100').then(res => {
      const data = res.data || [];
      const views = data.reduce((sum: number, p: any) => sum + (p.viewCount || 0), 0);
      const enq = data.reduce((sum: number, p: any) => sum + (p.enquiryCount || 0), 0);
      const wish = data.reduce((sum: number, p: any) => sum + (p.wishlistCount || 0), 0);
      setStats({ totalViews: views, totalEnquiries: enq, totalWishlist: wish });
    }).catch(() => {});
  }, []);

  return (
    <div className="animate-fade-in pb-12">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl p-8 sm:p-10 mb-8 shadow-2xl text-white">
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3 flex items-center gap-4 text-white">
              <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md border border-white/20 shadow-inner">
                <BarChart3 className="h-7 w-7 text-brand-300" />
              </div>
              Reports & Analytics
            </h1>
            <p className="text-gray-300 text-lg leading-relaxed">
              Track your product performance and website activity in real-time.
            </p>
          </div>
        </div>
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-96 h-96 bg-brand-500/20 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-500 to-blue-700 rounded-3xl p-6 text-white shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <div className="relative z-10 flex justify-between items-start">
            <div>
              <p className="text-blue-100 font-medium text-sm mb-1 uppercase tracking-wider">Total Product Views</p>
              <h3 className="text-4xl font-bold">{stats.totalViews.toLocaleString()}</h3>
            </div>
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl shadow-inner"><Eye className="h-6 w-6 text-white" /></div>
          </div>
          <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
        </div>

        <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-3xl p-6 text-white shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <div className="relative z-10 flex justify-between items-start">
            <div>
              <p className="text-emerald-100 font-medium text-sm mb-1 uppercase tracking-wider">Enquiries Received</p>
              <h3 className="text-4xl font-bold">{stats.totalEnquiries.toLocaleString()}</h3>
            </div>
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl shadow-inner"><ShoppingCart className="h-6 w-6 text-white" /></div>
          </div>
          <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
        </div>

        <div className="relative overflow-hidden bg-gradient-to-br from-rose-500 to-rose-700 rounded-3xl p-6 text-white shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <div className="relative z-10 flex justify-between items-start">
            <div>
              <p className="text-rose-100 font-medium text-sm mb-1 uppercase tracking-wider">Products in Wishlists</p>
              <h3 className="text-4xl font-bold">{stats.totalWishlist.toLocaleString()}</h3>
            </div>
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl shadow-inner"><Activity className="h-6 w-6 text-white" /></div>
          </div>
          <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex justify-center mb-10">
        <div className="inline-flex bg-gray-100/80 backdrop-blur-md p-1.5 rounded-2xl shadow-inner">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 py-3 px-6 rounded-xl font-semibold text-sm transition-all duration-300 ${
              activeTab === 'overview' ? 'bg-white text-brand-700 shadow-sm' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/50'
            }`}
          >
            <TrendingUp className="h-4 w-4" /> Overview Dashboard
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`flex items-center gap-2 py-3 px-6 rounded-xl font-semibold text-sm transition-all duration-300 ${
              activeTab === 'reports' ? 'bg-white text-brand-700 shadow-sm' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/50'
            }`}
          >
            <BarChart3 className="h-4 w-4" /> Performance Data
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`flex items-center gap-2 py-3 px-6 rounded-xl font-semibold text-sm transition-all duration-300 ${
              activeTab === 'activity' ? 'bg-white text-brand-700 shadow-sm' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/50'
            }`}
          >
            <Clock className="h-4 w-4" /> System Activity
          </button>
        </div>
      </div>

      <div className="transition-all duration-500">
        {activeTab === 'overview' && <OverviewDashboard />}
        {activeTab === 'reports' && <ProductPerformance />}
        {activeTab === 'activity' && <ActivityLogView />}
      </div>
    </div>
  );
}

function OverviewDashboard() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/reports/product-performance?limit=10')
      .then(res => {
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
    <div className="space-y-8 animate-fade-in">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Bar Chart */}
        <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300">
          <h3 className="text-xl font-bold text-gray-900 mb-8 flex items-center gap-2">
            <span className="w-2 h-6 bg-brand-500 rounded-full"></span>
            Top 10 Products (Enquiries vs Wishlist)
          </h3>
          {loading ? (
            <div className="h-[350px] flex items-center justify-center text-brand-500">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : data.length === 0 ? (
            <div className="h-[350px] flex items-center justify-center text-gray-400">Not enough data to display chart.</div>
          ) : (
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280', fontWeight: 500 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280', fontWeight: 500 }} dx={-10} />
                  <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)', padding: '12px 16px', fontWeight: 600 }} />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontWeight: 500 }} />
                  <Bar dataKey="Enquiries" fill="#3b82f6" radius={[6, 6, 0, 0]} maxBarSize={45} />
                  <Bar dataKey="Wishlist" fill="#f43f5e" radius={[6, 6, 0, 0]} maxBarSize={45} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Area Chart */}
        <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300">
          <h3 className="text-xl font-bold text-gray-900 mb-8 flex items-center gap-2">
            <span className="w-2 h-6 bg-emerald-500 rounded-full"></span>
            Views Engagement Trend
          </h3>
          {loading ? (
            <div className="h-[350px] flex items-center justify-center text-emerald-500">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : data.length === 0 ? (
            <div className="h-[350px] flex items-center justify-center text-gray-400">Not enough data to display chart.</div>
          ) : (
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280', fontWeight: 500 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280', fontWeight: 500 }} dx={-10} />
                  <Tooltip cursor={{ stroke: '#9ca3af', strokeWidth: 1, strokeDasharray: '5 5' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)', padding: '12px 16px', fontWeight: 600 }} />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontWeight: 500 }} />
                  <Area type="monotone" dataKey="Views" stroke="#10b981" fillOpacity={1} fill="url(#colorViews)" strokeWidth={4} activeDot={{ r: 7, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }} />
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
    <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden animate-fade-in">
      <div className="px-8 py-6 border-b border-gray-100 bg-white flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <span className="w-2 h-6 bg-brand-500 rounded-full"></span>
          Detailed Performance Table (Top 50)
        </h2>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-gray-50/50">
            <tr>
              <th className="px-8 py-5 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Product</th>
              <th className="px-8 py-5 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Code</th>
              <th className="px-8 py-5 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Category</th>
              <th className="px-8 py-5 text-center text-xs font-bold text-emerald-600 uppercase tracking-widest">Views</th>
              <th className="px-8 py-5 text-center text-xs font-bold text-rose-600 uppercase tracking-widest">Wishlist</th>
              <th className="px-8 py-5 text-center text-xs font-bold text-blue-600 uppercase tracking-widest">Enquiries</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan={6} className="px-8 py-16 text-center text-gray-400">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-brand-500 mb-3" />
                <p className="font-medium">Fetching performance metrics...</p>
              </td></tr>
            ) : data.length === 0 ? (
              <tr><td colSpan={6} className="px-8 py-16 text-center text-gray-400 font-medium">No product data found.</td></tr>
            ) : (
              data.map((item: any) => (
                <tr key={item.id} className="hover:bg-gray-50/80 transition-colors group">
                  <td className="px-8 py-5 text-sm font-bold text-gray-900 max-w-xs truncate group-hover:text-brand-600 transition-colors">{item.productName}</td>
                  <td className="px-8 py-5 text-sm font-mono text-gray-500">
                    <span className="bg-gray-100 px-2.5 py-1 rounded-md">{item.productCode}</span>
                  </td>
                  <td className="px-8 py-5 text-sm text-gray-500">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700 border border-gray-200 shadow-sm">
                      {item.category?.name || 'N/A'}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <span className="inline-flex items-center justify-center px-3 py-1.5 rounded-full text-sm font-bold bg-emerald-50 text-emerald-700 min-w-[3rem] shadow-[0_0_0_1px_rgba(16,185,129,0.1)]">
                      {item.viewCount}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <span className="inline-flex items-center justify-center px-3 py-1.5 rounded-full text-sm font-bold bg-rose-50 text-rose-700 min-w-[3rem] shadow-[0_0_0_1px_rgba(244,63,94,0.1)]">
                      {item.wishlistCount}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <span className="inline-flex items-center justify-center px-3 py-1.5 rounded-full text-sm font-bold bg-blue-50 text-blue-700 min-w-[3rem] shadow-[0_0_0_1px_rgba(59,130,246,0.1)]">
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
    <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 animate-fade-in max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-10 pb-6 border-b border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <div className="p-2.5 bg-brand-50 rounded-xl text-brand-600">
            <Clock className="h-6 w-6" />
          </div>
          System Activity Log
        </h2>
        <span className="text-xs font-bold uppercase tracking-wider bg-gray-100 text-gray-600 px-4 py-2 rounded-full shadow-sm border border-gray-200">
          Last 50 Actions
        </span>
      </div>
      
      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center text-brand-500">
          <Loader2 className="h-10 w-10 animate-spin mb-4" />
          <p className="font-medium text-gray-500">Loading activity history...</p>
        </div>
      ) : logs.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <Clock className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <p className="font-bold text-gray-900 text-lg mb-2">No Activity Found</p>
          <p className="text-gray-500">System events and admin actions will be recorded here.</p>
        </div>
      ) : (
        <ul className="space-y-6 relative before:absolute before:inset-0 before:ml-[1.4rem] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-[2px] before:bg-gradient-to-b before:from-brand-100 before:via-brand-200 before:to-transparent pt-4 pb-12">
          {logs.map((log: any, idx: number) => (
            <li key={log.id} className="relative flex flex-col md:flex-row items-start md:justify-between group">
              {/* Center Dot for Desktop, Left Dot for Mobile */}
              <div className="absolute left-[1.4rem] md:left-1/2 -translate-x-1/2 flex items-center justify-center w-10 h-10 rounded-full border-[3px] border-white bg-brand-100 text-brand-600 shadow-md z-10 group-hover:scale-110 group-hover:bg-brand-500 group-hover:text-white transition-all duration-300">
                <Activity className="h-4 w-4" />
              </div>
              
              {/* Card - alternating sides on desktop */}
              <div className={`w-full pl-16 md:pl-0 md:w-[calc(50%-3rem)] ${idx % 2 === 0 ? 'md:pr-12 md:text-right' : 'md:ml-auto md:pl-12'}`}>
                <div className="p-5 rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative">
                  <div className={`flex flex-col md:flex-row md:items-center gap-2 mb-2 ${idx % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
                    <span className="font-bold text-gray-900 text-base">{log.actor?.name || 'System User'}</span>
                    <time className="text-xs font-bold text-brand-700 bg-brand-50 px-2.5 py-1 rounded-md">
                      {format(new Date(log.createdAt), 'MMM d, h:mm a')}
                    </time>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    <span className="font-bold text-brand-600 capitalize">{log.action.toLowerCase()}</span> a{' '}
                    <span className="font-bold text-gray-800">{log.entity}</span>
                  </p>
                  {log.after && (
                    <div className={`mt-3 text-xs text-gray-500 bg-gray-50 p-3 rounded-xl border border-gray-100 font-mono overflow-x-auto ${idx % 2 === 0 ? 'text-left' : ''}`}>
                      {JSON.stringify(log.after)}
                    </div>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
