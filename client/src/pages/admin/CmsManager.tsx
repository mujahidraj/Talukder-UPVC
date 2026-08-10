import React, { useState, useEffect } from 'react';
import { FileText, Plus, Edit2, Trash2, Eye, EyeOff, Image as ImageIcon, HelpCircle } from 'lucide-react';
import api from '../../lib/axios';

type TabKey = 'banners' | 'pages' | 'faqs';

export default function CmsManager() {
  const [activeTab, setActiveTab] = useState<TabKey>('banners');

  const tabs: { key: TabKey; label: string; icon: React.ReactNode }[] = [
    { key: 'banners', label: 'Banners', icon: <ImageIcon className="h-4 w-4" /> },
    { key: 'pages', label: 'Pages', icon: <FileText className="h-4 w-4" /> },
    { key: 'faqs', label: 'FAQs', icon: <HelpCircle className="h-4 w-4" /> },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-heading font-semibold text-gray-900 flex items-center">
          <FileText className="h-6 w-6 mr-3 text-brand-600" />
          Content Management
        </h1>
        <p className="mt-2 text-sm text-gray-700">
          Manage banners, static pages, and frequently asked questions.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.key
                  ? 'border-brand-500 text-brand-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'banners' && <BannersTab />}
      {activeTab === 'pages' && <PagesTab />}
      {activeTab === 'faqs' && <FaqsTab />}
    </div>
  );
}

/* ─── Banners Tab ──────────────────────────────── */
function BannersTab() {
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/cms/banners').then(res => { setBanners(res.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  // For the admin we fetch ALL banners (including inactive), but we reuse the public endpoint for now
  // In production, we'd add an admin banners endpoint

  return (
    <div className="glass-panel p-6 bg-white">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-heading font-semibold">Homepage Banners</h2>
        <button className="admin-btn-primary flex items-center text-sm">
          <Plus className="h-4 w-4 mr-2" /> Add Banner
        </button>
      </div>
      {loading ? (
        <p className="text-sm text-gray-400 py-8 text-center">Loading banners...</p>
      ) : banners.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <ImageIcon className="mx-auto h-10 w-10 text-gray-300 mb-2" />
          <p className="text-sm">No banners yet. Add one to display on the homepage.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {banners.map((b: any) => (
            <div key={b.id} className="border rounded-xl overflow-hidden">
              <div className="h-32 bg-gray-100 flex items-center justify-center text-gray-400">
                {b.imageUrl ? <img src={b.imageUrl} className="w-full h-full object-cover" /> : 'No image'}
              </div>
              <div className="p-3 flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">{b.title || 'Untitled'}</p>
                  <p className="text-xs text-gray-400">{b.subtitle}</p>
                </div>
                <div className="flex gap-1">
                  <button className="p-1.5 text-gray-400 hover:text-brand-600"><Edit2 className="h-4 w-4" /></button>
                  <button className="p-1.5 text-gray-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Pages Tab ──────────────────────────────── */
function PagesTab() {
  const [pages, setPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/cms/pages').then(res => { setPages(res.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  return (
    <div className="glass-panel p-6 bg-white">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-heading font-semibold">Static Pages</h2>
        <button className="admin-btn-primary flex items-center text-sm">
          <Plus className="h-4 w-4 mr-2" /> Add Page
        </button>
      </div>
      {loading ? (
        <p className="text-sm text-gray-400 py-8 text-center">Loading pages...</p>
      ) : (
        <div className="divide-y divide-gray-100">
          {pages.map((p: any) => (
            <div key={p.id} className="flex items-center justify-between py-4">
              <div>
                <p className="font-medium text-gray-900">{p.title}</p>
                <p className="text-xs text-gray-400 font-mono">/{p.slug}</p>
              </div>
              <div className="flex items-center gap-3">
                {p.isPublished ? (
                  <span className="flex items-center text-xs text-green-600"><Eye className="h-3 w-3 mr-1" /> Published</span>
                ) : (
                  <span className="flex items-center text-xs text-gray-400"><EyeOff className="h-3 w-3 mr-1" /> Draft</span>
                )}
                <button className="p-1.5 text-gray-400 hover:text-brand-600"><Edit2 className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── FAQs Tab ──────────────────────────────── */
function FaqsTab() {
  const [faqs, setFaqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/cms/faqs').then(res => { setFaqs(res.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  return (
    <div className="glass-panel p-6 bg-white">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-heading font-semibold">Frequently Asked Questions</h2>
        <button className="admin-btn-primary flex items-center text-sm">
          <Plus className="h-4 w-4 mr-2" /> Add FAQ
        </button>
      </div>
      {loading ? (
        <p className="text-sm text-gray-400 py-8 text-center">Loading FAQs...</p>
      ) : (
        <div className="space-y-3">
          {faqs.map((faq: any, idx: number) => (
            <div key={faq.id} className="border border-gray-200 rounded-xl p-4 hover:border-brand-300 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-medium text-gray-900 text-sm">{idx + 1}. {faq.question}</p>
                  <p className="mt-1 text-xs text-gray-500 line-clamp-2">{faq.answer}</p>
                </div>
                <div className="flex gap-1 ml-4">
                  <button className="p-1.5 text-gray-400 hover:text-brand-600"><Edit2 className="h-4 w-4" /></button>
                  <button className="p-1.5 text-gray-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
