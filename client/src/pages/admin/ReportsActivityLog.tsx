import React, { useState, useEffect } from 'react';
import { BarChart3, Activity, Clock } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import api from '../../lib/axios';

type TabKey = 'reports' | 'activity';

export default function ReportsActivityLog() {
  const [activeTab, setActiveTab] = useState<TabKey>('reports');

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-heading font-semibold text-gray-900 flex items-center">
          <BarChart3 className="h-6 w-6 mr-3 text-brand-600" />
          Reports & Activity Log
        </h1>
      </div>

      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('reports')}
            className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'reports' ? 'border-brand-500 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <BarChart3 className="h-4 w-4" /> Product Performance
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'activity' ? 'border-brand-500 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Activity className="h-4 w-4" /> Activity Log
          </button>
        </nav>
      </div>

      {activeTab === 'reports' && <ProductPerformance />}
      {activeTab === 'activity' && <ActivityLogView />}
    </div>
  );
}

function ProductPerformance() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/reports/product-performance')
      .then(res => { setData(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="glass-panel overflow-hidden bg-white">
      <div className="px-6 py-4 border-b border-gray-100">
        <h2 className="text-lg font-heading font-semibold">Top Products by Enquiry Count</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50/80">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Views</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Wishlist</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Enquiries</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-400">Loading report...</td></tr>
            ) : data.length === 0 ? (
              <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-400">No data yet.</td></tr>
            ) : (
              data.map((item: any) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 max-w-xs truncate">{item.productName}</td>
                  <td className="px-6 py-4 text-sm font-mono text-gray-500">{item.productCode}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{item.category?.name}</td>
                  <td className="px-6 py-4 text-sm text-center text-gray-700">{item.viewCount}</td>
                  <td className="px-6 py-4 text-sm text-center text-gray-700">{item.wishlistCount}</td>
                  <td className="px-6 py-4 text-sm text-center">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-100 text-brand-800">
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
    api.get('/admin/activity-log')
      .then(res => { setLogs(res.data.data || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="glass-panel p-6 bg-white">
      <h2 className="text-lg font-heading font-semibold mb-4">Recent Admin Activity</h2>
      {loading ? (
        <p className="text-sm text-gray-400 py-8 text-center">Loading activity log...</p>
      ) : logs.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <Clock className="mx-auto h-10 w-10 text-gray-300 mb-2" />
          <p className="text-sm">No activity logged yet.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {logs.map((log: any) => (
            <li key={log.id} className="flex items-start gap-3 p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-brand-100 flex items-center justify-center">
                <Activity className="h-4 w-4 text-brand-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900">
                  <span className="font-medium">{log.actor?.name || 'System'}</span>{' '}
                  <span className="text-gray-500">{log.action}</span>{' '}
                  <span className="font-medium">{log.entity}</span>
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {format(new Date(log.createdAt), 'MMM d, yyyy h:mm a')}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
