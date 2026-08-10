import React, { useState, useEffect } from 'react';
import { MessageSquare, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import api from '../../lib/axios';

interface Enquiry {
  id: string;
  customerName: string;
  companyName?: string;
  email: string;
  phone: string;
  status: 'PENDING' | 'REVIEWED' | 'QUOTED' | 'CLOSED';
  createdAt: string;
  items: { product: { productName: string }; quantity: number }[];
}

export default function EnquiriesManager() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchEnquiries = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/admin/enquiries');
      setEnquiries(res.data.data);
    } catch {
      toast.error('Failed to load enquiries');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-orange-100 text-orange-800 border-orange-200',
      REVIEWED: 'bg-blue-100 text-blue-800 border-blue-200',
      QUOTED: 'bg-purple-100 text-purple-800 border-purple-200',
      CLOSED: 'bg-gray-100 text-gray-800 border-gray-200',
    };
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colors[status]}`}>
        {status}
      </span>
    );
  };

  return (
    <div>
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-heading font-semibold text-gray-900 flex items-center">
            <MessageSquare className="h-6 w-6 mr-3 text-brand-600" />
            Enquiries Inbox
          </h1>
          <p className="mt-2 text-sm text-gray-700">
            Review and respond to customer quotes and product inquiries.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Enquiries List */}
        <div className="lg:col-span-1 glass-panel overflow-hidden bg-white flex flex-col h-[70vh]">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50">
            <input
              type="text"
              placeholder="Search enquiries..."
              className="admin-input w-full text-sm"
            />
          </div>
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="p-8 text-center text-gray-500 text-sm">Loading inbox...</div>
            ) : enquiries.length === 0 ? (
              <div className="p-8 text-center text-gray-500 text-sm">No enquiries found.</div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {enquiries.map((enq) => (
                  <li key={enq.id} className="p-4 hover:bg-brand-50 cursor-pointer transition-colors border-l-4 border-transparent hover:border-brand-500">
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-gray-900 truncate">{enq.customerName}</p>
                        <p className="text-xs text-gray-500 truncate">{enq.companyName || enq.email}</p>
                      </div>
                      {getStatusBadge(enq.status)}
                    </div>
                    <div className="mt-2 flex items-center text-xs text-gray-400">
                      <Calendar className="mr-1.5 h-3 w-3 flex-shrink-0" />
                      {format(new Date(enq.createdAt), 'MMM d, yyyy h:mm a')}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Enquiry Detail View */}
        <div className="lg:col-span-2 glass-panel p-8 bg-white h-[70vh] flex items-center justify-center text-gray-400 border-2 border-dashed border-gray-100 m-4 rounded-xl">
          <div className="text-center">
            <MessageSquare className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-2 text-sm font-semibold text-gray-900">Select an enquiry</h3>
            <p className="mt-1 text-sm text-gray-500">Choose an enquiry from the list to view details.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
