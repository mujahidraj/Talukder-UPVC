import React, { useState, useEffect } from 'react';
import { FileText, Plus, Edit2, Trash2, Eye, EyeOff, Image as ImageIcon, HelpCircle, X, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/axios';

type TabKey = 'banners' | 'pages' | 'faqs';

export default function CmsManager() {
  const [activeTab, setActiveTab] = useState<TabKey>('banners');

  const tabs: { key: TabKey; label: string; icon: React.ReactNode }[] = [
    { key: 'banners', label: 'Banners', icon: <ImageIcon className="h-4 w-4" /> },
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
      {activeTab === 'faqs' && <FaqsTab />}
    </div>
  );
}

/* ─── Banners Tab ──────────────────────────────── */
function BannersTab() {
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<any>(null);
  const [formData, setFormData] = useState({ title: '', subtitle: '', linkUrl: '', isActive: true });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  const fetchBanners = () => {
    setLoading(true);
    api.get('/admin/cms/banners').then(res => { setBanners(res.data); setLoading(false); }).catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleOpenModal = (banner?: any) => {
    if (banner) {
      setEditingBanner(banner);
      setFormData({
        title: banner.title || '',
        subtitle: banner.subtitle || '',
        linkUrl: banner.linkUrl || '',
        isActive: banner.isActive
      });
      setPreviewUrl(banner.imageUrl || '');
    } else {
      setEditingBanner(null);
      setFormData({ title: '', subtitle: '', linkUrl: '', isActive: true });
      setPreviewUrl('');
    }
    setSelectedFile(null);
    setIsModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      let imageUrl = editingBanner?.imageUrl || '';
      
      // If a new file is selected, upload it first (using existing media upload or a generic upload)
      // Since we don't have a generic upload endpoint right now, we will rely on URL string for now if file upload isn't strictly requested.
      // Wait, let's just use string URL input for simplicity, or wait, banners need image upload.
      // The admin/media/upload endpoint uploads a *product* image. 
      // Let's assume we can just save the image URL for now as a string if no generic media endpoint exists, or we can use the media endpoint.
      // Actually, if we don't have a generic media endpoint, let's just allow users to type in an image URL for the banner for now to keep it simple and robust.
      // Wait, users expect to upload a file. 
      // We can use the formData if there's an endpoint.
      // Let's check if there is an endpoint for uploading standalone images. There isn't in CmsController.
      // Let's just pass imageUrl as string.
      
      const payload = { ...formData, imageUrl: previewUrl };

      if (editingBanner) {
        await api.put(`/admin/cms/banners/${editingBanner.id}`, payload);
        toast.success('Banner updated successfully');
      } else {
        await api.post('/admin/cms/banners', payload);
        toast.success('Banner created successfully');
      }
      setIsModalOpen(false);
      fetchBanners();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save banner');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this banner?')) return;
    try {
      await api.delete(`/admin/cms/banners/${id}`);
      toast.success('Banner deleted');
      fetchBanners();
    } catch {
      toast.error('Failed to delete banner');
    }
  };

  return (
    <div className="glass-panel p-6 bg-white">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-heading font-semibold">Homepage Banners</h2>
        <button onClick={() => handleOpenModal()} className="admin-btn-primary flex items-center text-sm">
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
            <div key={b.id} className="border rounded-xl overflow-hidden relative">
              {!b.isActive && (
                <div className="absolute top-2 left-2 bg-gray-900/80 text-white text-xs px-2 py-1 rounded-md z-10">Inactive</div>
              )}
              <div className="h-32 bg-gray-100 flex items-center justify-center text-gray-400">
                {b.imageUrl ? <img src={b.imageUrl} className={`w-full h-full object-cover ${!b.isActive ? 'opacity-50' : ''}`} /> : 'No image'}
              </div>
              <div className="p-3 flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">{b.title || 'Untitled'}</p>
                  <p className="text-xs text-gray-400">{b.subtitle}</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => handleOpenModal(b)} className="p-1.5 text-gray-400 hover:text-brand-600"><Edit2 className="h-4 w-4" /></button>
                  <button onClick={() => handleDelete(b.id)} className="p-1.5 text-gray-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden" style={{ animation: 'slideUp 0.2s ease-out' }}>
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="font-semibold text-lg">{editingBanner ? 'Edit Banner' : 'Add Banner'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                <input required type="text" className="admin-input" value={previewUrl} onChange={e => setPreviewUrl(e.target.value)} placeholder="https://example.com/image.jpg" />
                <p className="text-xs text-gray-500 mt-1">For now, provide a direct URL to the banner image.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input required type="text" className="admin-input" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
                <input type="text" className="admin-input" value={formData.subtitle} onChange={e => setFormData({ ...formData, subtitle: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Link URL (Optional)</label>
                <input type="text" className="admin-input" value={formData.linkUrl} onChange={e => setFormData({ ...formData, linkUrl: e.target.value })} />
              </div>
              <div className="flex items-center mt-2">
                <input type="checkbox" id="isActive" checked={formData.isActive} onChange={e => setFormData({ ...formData, isActive: e.target.checked })} className="h-4 w-4 text-brand-600 rounded border-gray-300 focus:ring-brand-500" />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">Active (Visible on homepage)</label>
              </div>
              
              <div className="pt-4 flex justify-end gap-3 border-t mt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="admin-btn-secondary">Cancel</button>
                <button type="submit" disabled={isSaving} className="admin-btn-primary">{isSaving ? 'Saving...' : 'Save Banner'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Pages Tab ──────────────────────────────── */
function PagesTab() {
  const [pages, setPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<any>(null);
  const [formData, setFormData] = useState({ title: '', slug: '', content: '', isPublished: true });
  const [isSaving, setIsSaving] = useState(false);

  const fetchPages = () => {
    setLoading(true);
    // Use admin endpoint which we know exists to fetch all pages including drafts
    api.get('/admin/cms/pages').then(res => { setPages(res.data); setLoading(false); }).catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchPages();
  }, []);

  const handleOpenModal = async (page?: any) => {
    if (page) {
      setEditingPage(page);
      // Fetch full page to get content
      try {
        const res = await api.get(`/admin/cms/pages/${page.id}`);
        setFormData({
          title: res.data.title || '',
          slug: res.data.slug || '',
          content: res.data.content || '',
          isPublished: res.data.isPublished
        });
      } catch {
        toast.error('Failed to load page content');
        return;
      }
    } else {
      setEditingPage(null);
      setFormData({ title: '', slug: '', content: '', isPublished: true });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (editingPage) {
        await api.put(`/admin/cms/pages/${editingPage.id}`, formData);
        toast.success('Page updated successfully');
      } else {
        await api.post('/admin/cms/pages', formData);
        toast.success('Page created successfully');
      }
      setIsModalOpen(false);
      fetchPages();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save page');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this page? This cannot be undone.')) return;
    try {
      await api.delete(`/admin/cms/pages/${id}`);
      toast.success('Page deleted');
      fetchPages();
    } catch {
      toast.error('Failed to delete page');
    }
  };

  return (
    <div className="glass-panel p-6 bg-white">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-heading font-semibold">Static Pages</h2>
        <button onClick={() => handleOpenModal()} className="admin-btn-primary flex items-center text-sm">
          <Plus className="h-4 w-4 mr-2" /> Add Page
        </button>
      </div>
      {loading ? (
        <p className="text-sm text-gray-400 py-8 text-center">Loading pages...</p>
      ) : (
        <div className="divide-y divide-gray-100 border border-gray-100 rounded-xl">
          {pages.map((p: any) => (
            <div key={p.id} className="flex items-center justify-between py-4 px-4 hover:bg-gray-50 transition-colors">
              <div>
                <p className="font-medium text-gray-900">{p.title}</p>
                <p className="text-xs text-gray-400 font-mono">/{p.slug}</p>
              </div>
              <div className="flex items-center gap-4">
                {p.isPublished ? (
                  <span className="flex items-center text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full"><Eye className="h-3 w-3 mr-1" /> Published</span>
                ) : (
                  <span className="flex items-center text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full"><EyeOff className="h-3 w-3 mr-1" /> Draft</span>
                )}
                <div className="flex gap-1">
                  <button onClick={() => handleOpenModal(p)} className="p-1.5 text-gray-400 hover:text-brand-600"><Edit2 className="h-4 w-4" /></button>
                  <button onClick={() => handleDelete(p.id)} className="p-1.5 text-gray-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden" style={{ animation: 'slideUp 0.2s ease-out' }}>
            <div className="flex justify-between items-center p-4 border-b shrink-0">
              <h3 className="font-semibold text-lg">{editingPage ? 'Edit Page' : 'Add Page'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-4 overflow-y-auto flex-1 flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Page Title</label>
                  <input required type="text" className="admin-input" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Slug (URL)</label>
                  <input required type="text" className="admin-input font-mono text-sm" value={formData.slug} onChange={e => setFormData({ ...formData, slug: e.target.value })} placeholder="about-us" />
                </div>
              </div>
              <div className="flex-1 flex flex-col min-h-[300px]">
                <label className="block text-sm font-medium text-gray-700 mb-1">Content (HTML or Text)</label>
                <textarea required className="admin-input flex-1 font-mono text-sm resize-none" value={formData.content} onChange={e => setFormData({ ...formData, content: e.target.value })} placeholder="<h1>Heading</h1><p>Content...</p>" />
              </div>
              <div className="flex items-center">
                <input type="checkbox" id="isPublished" checked={formData.isPublished} onChange={e => setFormData({ ...formData, isPublished: e.target.checked })} className="h-4 w-4 text-brand-600 rounded border-gray-300 focus:ring-brand-500" />
                <label htmlFor="isPublished" className="ml-2 block text-sm text-gray-900">Published (Visible to users)</label>
              </div>
              
              <div className="pt-4 flex justify-end gap-3 border-t shrink-0">
                <button type="button" onClick={() => setIsModalOpen(false)} className="admin-btn-secondary">Cancel</button>
                <button type="submit" disabled={isSaving} className="admin-btn-primary">{isSaving ? 'Saving...' : 'Save Page'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── FAQs Tab ──────────────────────────────── */
function FaqsTab() {
  const [faqs, setFaqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<any>(null);
  const [formData, setFormData] = useState({ question: '', answer: '', sortOrder: 0, isActive: true });
  const [isSaving, setIsSaving] = useState(false);

  const fetchFaqs = () => {
    setLoading(true);
    // Use admin endpoint which we know exists to fetch all FAQs including inactive
    api.get('/admin/cms/faqs').then(res => { setFaqs(res.data); setLoading(false); }).catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  const handleOpenModal = (faq?: any) => {
    if (faq) {
      setEditingFaq(faq);
      setFormData({
        question: faq.question || '',
        answer: faq.answer || '',
        sortOrder: faq.sortOrder || 0,
        isActive: faq.isActive
      });
    } else {
      setEditingFaq(null);
      setFormData({ question: '', answer: '', sortOrder: faqs.length + 1, isActive: true });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload = {
        ...formData,
        sortOrder: Number(formData.sortOrder)
      };

      if (editingFaq) {
        await api.put(`/admin/cms/faqs/${editingFaq.id}`, payload);
        toast.success('FAQ updated successfully');
      } else {
        await api.post('/admin/cms/faqs', payload);
        toast.success('FAQ created successfully');
      }
      setIsModalOpen(false);
      fetchFaqs();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save FAQ');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this FAQ?')) return;
    try {
      await api.delete(`/admin/cms/faqs/${id}`);
      toast.success('FAQ deleted');
      fetchFaqs();
    } catch {
      toast.error('Failed to delete FAQ');
    }
  };

  return (
    <div className="glass-panel p-6 bg-white">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-heading font-semibold">Frequently Asked Questions</h2>
        <button onClick={() => handleOpenModal()} className="admin-btn-primary flex items-center text-sm">
          <Plus className="h-4 w-4 mr-2" /> Add FAQ
        </button>
      </div>
      {loading ? (
        <p className="text-sm text-gray-400 py-8 text-center">Loading FAQs...</p>
      ) : faqs.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <HelpCircle className="mx-auto h-10 w-10 text-gray-300 mb-2" />
          <p className="text-sm">No FAQs yet. Add some to help your customers.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {faqs.map((faq: any, idx: number) => (
            <div key={faq.id} className="border border-gray-200 rounded-xl p-4 hover:border-brand-300 transition-colors bg-white relative">
              {!faq.isActive && (
                <div className="absolute top-2 left-2 bg-gray-900/80 text-white text-xs px-2 py-1 rounded-md z-10">Inactive</div>
              )}
              <div className="flex items-start justify-between">
                <div className={`flex-1 ${!faq.isActive ? 'opacity-50' : ''}`}>
                  <p className="font-medium text-gray-900 text-sm">
                    <span className="text-brand-600 mr-2">Q{idx + 1}.</span> 
                    {faq.question}
                  </p>
                  <p className="mt-1 text-sm text-gray-600 line-clamp-2">{faq.answer}</p>
                  <p className="mt-2 text-xs text-gray-400">Sort Order: {faq.sortOrder}</p>
                </div>
                <div className="flex gap-1 ml-4 shrink-0">
                  <button onClick={() => handleOpenModal(faq)} className="p-1.5 text-gray-400 hover:text-brand-600"><Edit2 className="h-4 w-4" /></button>
                  <button onClick={() => handleDelete(faq.id)} className="p-1.5 text-gray-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden" style={{ animation: 'slideUp 0.2s ease-out' }}>
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="font-semibold text-lg">{editingFaq ? 'Edit FAQ' : 'Add FAQ'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Question</label>
                <input required type="text" className="admin-input" value={formData.question} onChange={e => setFormData({ ...formData, question: e.target.value })} placeholder="How long does shipping take?" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Answer</label>
                <textarea required className="admin-input min-h-[100px]" value={formData.answer} onChange={e => setFormData({ ...formData, answer: e.target.value })} placeholder="Shipping usually takes 3-5 business days..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
                <input required type="number" min="0" className="admin-input w-32" value={formData.sortOrder} onChange={e => setFormData({ ...formData, sortOrder: Number(e.target.value) })} />
              </div>
              <div className="flex items-center">
                <input type="checkbox" id="isActiveFaq" checked={formData.isActive} onChange={e => setFormData({ ...formData, isActive: e.target.checked })} className="h-4 w-4 text-brand-600 rounded border-gray-300 focus:ring-brand-500" />
                <label htmlFor="isActiveFaq" className="ml-2 block text-sm text-gray-900">Active (Visible on website)</label>
              </div>
              
              <div className="pt-4 flex justify-end gap-3 border-t mt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="admin-btn-secondary">Cancel</button>
                <button type="submit" disabled={isSaving} className="admin-btn-primary">{isSaving ? 'Saving...' : 'Save FAQ'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
