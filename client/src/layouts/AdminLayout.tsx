import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  FolderTree, 
  MessageSquare, 
  Image,
  FileSpreadsheet,
  FileText,
  BarChart3,
  Users,
  LogOut,
  Menu,
  X,
  Trash2
} from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import api from '../lib/axios';

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Products', href: '/admin/products', icon: Package },
  { name: 'Recycle Bin', href: '/admin/products/trash', icon: Trash2 },
  { name: 'Categories', href: '/admin/categories', icon: FolderTree },
  { name: 'Enquiries', href: '/admin/enquiries', icon: MessageSquare },
  { name: 'Media', href: '/admin/media', icon: Image },
  { name: 'Bulk Import', href: '/admin/import', icon: FileSpreadsheet },
  { name: 'CMS', href: '/admin/cms', icon: FileText },
  { name: 'Reports', href: '/admin/reports', icon: BarChart3 },
  { name: 'Users', href: '/admin/users', icon: Users },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // ignore
    } finally {
      logout();
      navigate('/admin/login');
    }
  };

  const isActive = (href: string) => {
    if (href === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(href);
  };

  return (
    <div className="h-screen flex overflow-hidden bg-slate-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-gray-600/75" onClick={() => setSidebarOpen(false)} />
          <div className="relative flex flex-col max-w-xs w-full bg-brand-900 h-full">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-6 w-6 text-white" />
              </button>
            </div>
            <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
              <div className="flex-shrink-0 flex items-center px-4">
                <span className="text-white text-2xl font-heading font-bold">Talukder uPVC</span>
              </div>
              <nav className="mt-5 px-2 space-y-1">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`group flex items-center px-2 py-2 text-base font-medium rounded-md transition-colors ${
                      isActive(item.href) ? 'bg-brand-800 text-white' : 'text-brand-100 hover:bg-brand-700 hover:text-white'
                    }`}
                  >
                    <item.icon className="mr-4 flex-shrink-0 h-6 w-6 text-brand-300 group-hover:text-white" />
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col h-0 flex-1 bg-brand-900 border-r border-brand-800 shadow-xl">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <div className="flex items-center flex-shrink-0 px-6 gap-3">
                <div className="h-8 w-8 bg-brand-500 rounded-lg flex items-center justify-center shadow-md">
                  <span className="text-white font-heading font-bold">T</span>
                </div>
                <span className="text-white text-xl font-heading font-bold">Talukder uPVC</span>
              </div>

              <nav className="mt-8 flex-1 px-4 space-y-1">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-150 ${
                      isActive(item.href)
                        ? 'bg-brand-800 text-white shadow-inner'
                        : 'text-brand-200 hover:bg-brand-800/70 hover:text-white'
                    }`}
                  >
                    <item.icon className={`mr-3 flex-shrink-0 h-5 w-5 transition-colors ${
                      isActive(item.href) ? 'text-white' : 'text-brand-400 group-hover:text-white'
                    }`} />
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>

            {/* User footer */}
            <div className="flex-shrink-0 bg-brand-950 p-4">
              <div className="flex items-center">
                <div className="h-9 w-9 rounded-full bg-brand-700 flex items-center justify-center">
                  <span className="text-white font-medium text-sm">{user?.name?.charAt(0)}</span>
                </div>
                <div className="ml-3 flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                  <p className="text-xs text-brand-400 truncate">{user?.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="ml-2 p-1.5 text-brand-400 hover:text-white rounded-lg hover:bg-brand-800 transition-colors"
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        {/* Mobile top bar */}
        <div className="lg:hidden pl-1 pt-1 sm:pl-3 sm:pt-3 bg-white border-b border-gray-200">
          <button
            className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
        
        <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none bg-slate-50">
          <div className="py-6 px-4 sm:px-6 md:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
