import React, { useState, useEffect, useCallback } from 'react';
import {
  MessageSquare,
  Calendar,
  Search,
  User,
  Mail,
  Phone,
  MapPin,
  Package,
  ChevronRight,
  Clock,
  Send,
  X,
  Filter,
  Building2,
  Truck,
  StickyNote,
  RefreshCw,
  Trash2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/axios';

interface EnquiryItem {
  id: string;
  quantity: number;
  note?: string;
  product: {
    id: string;
    productName: string;
    productCode: string;
    slug: string;
    images?: { thumbPath?: string }[];
  };
}

interface Enquiry {
  id: string;
  customerName: string;
  companyName?: string;
  email: string;
  phone: string;
  address?: string;
  district?: string;
  deliveryPref?: string;
  message?: string;
  sourcePage?: string;
  internalNotes?: string;
  status: string;
  assignedTo?: { id: string; name: string; email?: string };
  createdAt: string;
  updatedAt: string;
  items: EnquiryItem[];
}

const STATUSES = ['NEW', 'IN_PROGRESS', 'QUOTED', 'WON', 'CLOSED', 'LOST'] as const;

const statusConfig: Record<string, { label: string; color: string; dot: string }> = {
  NEW: { label: 'New', color: 'bg-amber-50 text-amber-700 ring-amber-600/20', dot: 'bg-amber-500' },
  IN_PROGRESS: { label: 'In Progress', color: 'bg-blue-50 text-blue-700 ring-blue-600/20', dot: 'bg-blue-500' },
  QUOTED: { label: 'Quoted', color: 'bg-violet-50 text-violet-700 ring-violet-600/20', dot: 'bg-violet-500' },
  WON: { label: 'Won', color: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20', dot: 'bg-emerald-500' },
  CLOSED: { label: 'Closed', color: 'bg-gray-50 text-gray-600 ring-gray-500/20', dot: 'bg-gray-400' },
  LOST: { label: 'Lost', color: 'bg-red-50 text-red-700 ring-red-600/20', dot: 'bg-red-500' },
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatDateTime(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit',
  });
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(dateStr);
}

export default function EnquiriesManager() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Detail state
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<Enquiry | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Status update
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Notes
  const [newNote, setNewNote] = useState('');
  const [addingNote, setAddingNote] = useState(false);

  // Stats
  const [stats, setStats] = useState<{ total: number; newToday: number; newThisWeek: number } | null>(null);

  const fetchEnquiries = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: any = { page, limit: 20 };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const res = await api.get('/admin/enquiries', { params });
      setEnquiries(res.data.data);
      setTotalPages(res.data.meta.totalPages);
      setTotalCount(res.data.meta.total);
    } catch {
      toast.error('Failed to load enquiries');
    } finally {
      setIsLoading(false);
    }
  }, [page, search, statusFilter]);

  const fetchStats = async () => {
    try {
      const res = await api.get('/admin/enquiries/stats');
      setStats(res.data);
    } catch {
      // Stats are optional, fail silently
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => { fetchEnquiries(); }, 300);
    return () => clearTimeout(timer);
  }, [fetchEnquiries]);

  useEffect(() => { fetchStats(); }, []);

  const fetchDetail = async (id: string) => {
    setDetailLoading(true);
    try {
      const res = await api.get(`/admin/enquiries/${id}`);
      setDetail(res.data);
    } catch {
      toast.error('Failed to load enquiry details');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleSelect = (enq: Enquiry) => {
    setSelectedId(enq.id);
    fetchDetail(enq.id);
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!detail) return;
    setUpdatingStatus(true);
    try {
      await api.put(`/admin/enquiries/${detail.id}/status`, { status: newStatus });
      toast.success(`Status updated to ${statusConfig[newStatus]?.label || newStatus}`);
      // Refresh both
      fetchDetail(detail.id);
      fetchEnquiries();
      fetchStats();
    } catch {
      toast.error('Failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim() || !detail) return;
    setAddingNote(true);
    try {
      await api.post(`/admin/enquiries/${detail.id}/note`, { note: newNote.trim() });
      toast.success('Note added');
      setNewNote('');
      fetchDetail(detail.id);
    } catch {
      toast.error('Failed to add note');
    } finally {
      setAddingNote(false);
    }
  };

  const handleDelete = async () => {
    if (!detail) return;
    if (!window.confirm(`Are you sure you want to delete the enquiry from ${detail.customerName}?`)) return;
    
    try {
      await api.delete(`/admin/enquiries/${detail.id}`);
      toast.success('Enquiry deleted successfully');
      setSelectedId(null);
      setDetail(null);
      fetchEnquiries();
      fetchStats();
    } catch {
      toast.error('Failed to delete enquiry');
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-heading font-semibold text-gray-900 flex items-center">
            <MessageSquare className="h-6 w-6 mr-3 text-brand-600" />
            Enquiries Inbox
          </h1>
          <p className="mt-2 text-sm text-gray-700">
            Review and respond to customer quotes and product inquiries.
          </p>
        </div>
        <button
          onClick={() => { fetchEnquiries(); fetchStats(); }}
          className="admin-btn-secondary flex items-center gap-2 mt-4 sm:mt-0"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="glass-panel p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-brand-100 flex items-center justify-center">
              <MessageSquare className="h-5 w-5 text-brand-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 tabular-nums">{stats.total}</p>
              <p className="text-xs text-gray-500 font-medium">Total Enquiries</p>
            </div>
          </div>
          <div className="glass-panel p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-amber-100 flex items-center justify-center">
              <Clock className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 tabular-nums">{stats.newToday}</p>
              <p className="text-xs text-gray-500 font-medium">New Today</p>
            </div>
          </div>
          <div className="glass-panel p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center">
              <Calendar className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 tabular-nums">{stats.newThisWeek}</p>
              <p className="text-xs text-gray-500 font-medium">This Week</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ─── Left: Enquiries List ─────────────────── */}
        <div className="lg:col-span-1 glass-panel overflow-hidden bg-white flex flex-col" style={{ height: 'calc(100vh - 320px)', minHeight: '400px' }}>
          {/* Search & Filter */}
          <div className="p-3 border-b border-gray-100 bg-gray-50/50 space-y-2">
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by name, email, phone..."
                className="admin-input w-full text-sm pl-9"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              />
            </div>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Filter className="h-3.5 w-3.5 text-gray-400" />
              </div>
              <select
                className="admin-input w-full text-sm pl-9 py-2"
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              >
                <option value="">All Statuses</option>
                {STATUSES.map(s => (
                  <option key={s} value={s}>{statusConfig[s].label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="p-8 text-center text-gray-500 text-sm">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
                  Loading inbox...
                </div>
              </div>
            ) : enquiries.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-sm">
                <MessageSquare className="h-10 w-10 mx-auto mb-2 text-gray-200" />
                No enquiries found.
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {enquiries.map((enq) => {
                  const cfg = statusConfig[enq.status] || statusConfig.NEW;
                  const isActive = selectedId === enq.id;
                  return (
                    <li
                      key={enq.id}
                      onClick={() => handleSelect(enq)}
                      className={`p-4 cursor-pointer transition-all border-l-4 ${
                        isActive
                          ? 'bg-brand-50 border-brand-600'
                          : 'border-transparent hover:bg-gray-50 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className={`text-sm font-semibold truncate ${isActive ? 'text-brand-900' : 'text-gray-900'}`}>
                            {enq.customerName}
                          </p>
                          <p className="text-xs text-gray-500 truncate mt-0.5">
                            {enq.companyName || enq.email}
                          </p>
                        </div>
                        <span className={`flex-shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ring-1 ring-inset ${cfg.color}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
                          {cfg.label}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Package className="h-3 w-3" />
                          {enq.items.length} item{enq.items.length !== 1 ? 's' : ''}
                        </span>
                        <span className="text-xs text-gray-400">{timeAgo(enq.createdAt)}</span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-3 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
              <span className="text-xs text-gray-500">{totalCount} total</span>
              <div className="flex gap-1">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-2 py-1 text-xs rounded border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Prev
                </button>
                <span className="px-2 py-1 text-xs text-gray-500">{page}/{totalPages}</span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-2 py-1 text-xs rounded border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ─── Right: Enquiry Detail ────────────────── */}
        <div className="lg:col-span-2 glass-panel bg-white overflow-hidden flex flex-col" style={{ height: 'calc(100vh - 320px)', minHeight: '400px' }}>
          {!selectedId ? (
            <div className="flex-1 flex items-center justify-center text-gray-400 border-2 border-dashed border-gray-100 m-4 rounded-xl">
              <div className="text-center">
                <MessageSquare className="mx-auto h-12 w-12 text-gray-200" />
                <h3 className="mt-3 text-sm font-semibold text-gray-900">Select an enquiry</h3>
                <p className="mt-1 text-sm text-gray-500">Choose an enquiry from the list to view details.</p>
              </div>
            </div>
          ) : detailLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
            </div>
          ) : detail ? (
            <div className="flex-1 overflow-y-auto">
              {/* Detail Header */}
              <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-100 px-6 py-4 z-10">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-lg font-heading font-bold text-gray-900">{detail.customerName}</h2>
                    <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                      {detail.companyName && (
                        <span className="flex items-center gap-1">
                          <Building2 className="h-3.5 w-3.5" />
                          {detail.companyName}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {formatDateTime(detail.createdAt)}
                      </span>
                    </div>
                  </div>
                  {/* Status Dropdown and Actions */}
                  <div className="flex items-center gap-3">
                    <select
                      value={detail.status}
                      onChange={(e) => handleStatusChange(e.target.value)}
                      disabled={updatingStatus}
                      className={`text-sm font-semibold rounded-lg px-3 py-1.5 ring-1 ring-inset cursor-pointer transition-colors disabled:opacity-50 ${
                        statusConfig[detail.status]?.color || ''
                      }`}
                    >
                      {STATUSES.map(s => (
                        <option key={s} value={s}>{statusConfig[s].label}</option>
                      ))}
                    </select>
                    
                    <button
                      onClick={handleDelete}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Enquiry"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Contact Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <Mail className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-gray-400">Email</p>
                      <a href={`mailto:${detail.email}`} className="text-sm font-medium text-brand-700 hover:underline truncate block">
                        {detail.email}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="h-8 w-8 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                      <Phone className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-gray-400">Phone</p>
                      <a href={`tel:${detail.phone}`} className="text-sm font-medium text-gray-900 truncate block">
                        {detail.phone}
                      </a>
                    </div>
                  </div>
                  {detail.address && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <div className="h-8 w-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                        <MapPin className="h-4 w-4 text-amber-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-gray-400">Address</p>
                        <p className="text-sm font-medium text-gray-900">{detail.address}{detail.district ? `, ${detail.district}` : ''}</p>
                      </div>
                    </div>
                  )}
                  {detail.deliveryPref && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <div className="h-8 w-8 rounded-lg bg-violet-100 flex items-center justify-center flex-shrink-0">
                        <Truck className="h-4 w-4 text-violet-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-gray-400">Delivery Preference</p>
                        <p className="text-sm font-medium text-gray-900">{detail.deliveryPref}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Customer Message */}
                {detail.message && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <span className="h-1.5 w-1.5 bg-brand-600 rounded-full" />
                      Customer Message
                    </h4>
                    <div className="bg-brand-50 rounded-xl p-4 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap border border-brand-100">
                      {detail.message}
                    </div>
                  </div>
                )}

                {/* Products / Items */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <span className="h-1.5 w-1.5 bg-brand-600 rounded-full" />
                    Requested Products ({detail.items.length})
                  </h4>
                  <div className="border border-gray-200 rounded-xl overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50/80">
                        <tr>
                          <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                          <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                          <th className="px-4 py-2.5 text-center text-xs font-medium text-gray-500 uppercase">Qty</th>
                          <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">Note</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 bg-white">
                        {detail.items.map((item) => (
                          <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                {item.product.images?.[0]?.thumbPath ? (
                                  <img
                                    src={`http://localhost:3000${item.product.images[0].thumbPath}`}
                                    className="h-8 w-8 rounded-md object-cover border border-gray-200"
                                    alt=""
                                  />
                                ) : (
                                  <div className="h-8 w-8 rounded-md bg-gray-100 border border-gray-200 flex items-center justify-center">
                                    <Package className="h-3.5 w-3.5 text-gray-400" />
                                  </div>
                                )}
                                <span className="text-sm font-medium text-gray-900">{item.product.productName}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-xs font-mono text-gray-500">{item.product.productCode}</td>
                            <td className="px-4 py-3 text-center">
                              <span className="inline-flex items-center justify-center h-6 min-w-[24px] px-1.5 bg-brand-50 text-brand-700 rounded-md text-xs font-bold">
                                {item.quantity}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-xs text-gray-500">{item.note || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Internal Notes */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <span className="h-1.5 w-1.5 bg-brand-600 rounded-full" />
                    Internal Notes
                  </h4>
                  {detail.internalNotes ? (
                    <div className="bg-amber-50 rounded-xl p-4 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap border border-amber-100 mb-3 font-mono text-xs">
                      {detail.internalNotes}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400 italic mb-3">No internal notes yet.</p>
                  )}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddNote(); } }}
                      className="admin-input flex-1 text-sm"
                      placeholder="Add a note..."
                    />
                    <button
                      onClick={handleAddNote}
                      disabled={addingNote || !newNote.trim()}
                      className="admin-btn-primary px-3 flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Meta */}
                {detail.sourcePage && (
                  <div className="text-xs text-gray-400 pt-2 border-t border-gray-100">
                    Source: {detail.sourcePage}
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
