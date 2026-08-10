import React, { useEffect, useState } from 'react';
import { Package, MessageSquare, TrendingUp, Users } from 'lucide-react';
import api from '../../lib/axios';

interface DashboardStats {
  total: number;
  newToday: number;
  newThisWeek: number;
  statusCounts: { status: string; _count: number }[];
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/admin/enquiries/stats');
        setStats(response.data);
      } catch (error) {
        console.error('Failed to load stats', error);
      }
    };
    fetchStats();
  }, []);

  const kpis = [
    { name: 'Total Enquiries', stat: stats?.total || 0, icon: MessageSquare, color: 'text-blue-600', bg: 'bg-blue-100' },
    { name: 'New Today', stat: stats?.newToday || 0, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-100' },
    { name: 'Total Products', stat: '243', icon: Package, color: 'text-brand-600', bg: 'bg-brand-100' }, // Would come from API in real
    { name: 'Pending Review', stat: stats?.statusCounts.find(s => s.status === 'PENDING')?._count || 0, icon: Users, color: 'text-orange-600', bg: 'bg-orange-100' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-heading font-semibold text-gray-900 mb-8">Dashboard Overview</h1>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((item) => (
          <div key={item.name} className="relative bg-white pt-5 px-4 pb-12 sm:pt-6 sm:px-6 shadow-sm rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
            <dt>
              <div className={`absolute rounded-lg p-3 ${item.bg}`}>
                <item.icon className={`h-6 w-6 ${item.color}`} aria-hidden="true" />
              </div>
              <p className="ml-16 text-sm font-medium text-gray-500 truncate">{item.name}</p>
            </dt>
            <dd className="ml-16 pb-6 flex items-baseline sm:pb-7">
              <p className="text-2xl font-semibold text-gray-900">{item.stat}</p>
            </dd>
            <div className="absolute bottom-0 inset-x-0 bg-gray-50 px-4 py-3 sm:px-6 border-t border-gray-100">
              <div className="text-sm">
                <a href="#" className="font-medium text-brand-600 hover:text-brand-500">
                  View all<span className="sr-only"> {item.name} stats</span>
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Additional dashboard widgets would go here */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-panel p-6">
          <h2 className="text-lg font-heading font-semibold mb-4">Recent Enquiries</h2>
          <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg text-gray-400">
            Enquiries List Placeholder
          </div>
        </div>
        <div className="glass-panel p-6">
          <h2 className="text-lg font-heading font-semibold mb-4">Product Performance</h2>
          <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg text-gray-400">
            Chart Placeholder
          </div>
        </div>
      </div>
    </div>
  );
}
