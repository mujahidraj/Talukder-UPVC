import React, { useState } from 'react';
import { Upload, FileSpreadsheet, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/axios';

export default function BulkImport() {
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<'append' | 'replace'>('append');
  const [uploading, setUploading] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select an Excel file');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('mode', mode);

      const res = await api.post('/admin/import/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setJobId(res.data.id);
      setJobStatus('PENDING');
      toast.success('Import job queued!');

      // Poll for job status
      pollJobStatus(res.data.id);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Import failed');
    } finally {
      setUploading(false);
    }
  };

  const pollJobStatus = async (id: string) => {
    const interval = setInterval(async () => {
      try {
        const res = await api.get(`/admin/jobs/${id}/status`);
        setJobStatus(res.data.status);
        setProgress(res.data.progress || 0);

        if (res.data.status === 'COMPLETED' || res.data.status === 'FAILED') {
          clearInterval(interval);
          if (res.data.status === 'COMPLETED') {
            toast.success('Import completed successfully!');
          } else {
            toast.error('Import failed. Check the error report.');
          }
        }
      } catch {
        clearInterval(interval);
      }
    }, 2000);
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-heading font-semibold text-gray-900 flex items-center">
          <FileSpreadsheet className="h-6 w-6 mr-3 text-brand-600" />
          Bulk Import
        </h1>
        <p className="mt-2 text-sm text-gray-700">
          Import products from an Excel (.xlsx) file matching the catalog template.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload Section */}
        <div className="glass-panel p-8 bg-white">
          <h2 className="text-lg font-heading font-semibold mb-6">Upload Excel File</h2>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Duplicate Detection</label>
              <div className="flex flex-col gap-3">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="mode"
                    value="replace"
                    checked={mode === 'replace'}
                    onChange={() => setMode('replace')}
                    className="mr-3 text-brand-600 focus:ring-brand-500 h-4 w-4"
                  />
                  <div>
                    <span className="text-sm font-semibold text-gray-900 block">Detect Duplicates (Overwrite Existing)</span>
                    <span className="text-xs text-gray-500">If a product code already exists, the existing product will be updated.</span>
                  </div>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="mode"
                    value="append"
                    checked={mode === 'append'}
                    onChange={() => setMode('append')}
                    className="mr-3 text-brand-600 focus:ring-brand-500 h-4 w-4"
                  />
                  <div>
                    <span className="text-sm font-semibold text-gray-900 block">Do Not Detect (Create New)</span>
                    <span className="text-xs text-gray-500">Always creates new products. Duplicate codes will get an auto-suffix (e.g., 0000-1).</span>
                  </div>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Excel File</label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-brand-400 transition-colors">
                <Upload className="mx-auto h-10 w-10 text-gray-400" />
                <div className="mt-4">
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    id="excel-upload"
                    className="hidden"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                  />
                  <label htmlFor="excel-upload" className="cursor-pointer">
                    <span className="text-brand-600 font-medium hover:text-brand-500">Choose a file</span>
                    <span className="text-gray-500"> or drag and drop</span>
                  </label>
                </div>
                {file && (
                  <p className="mt-2 text-sm text-gray-600 font-medium">
                    Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-400">XLSX or XLS, up to 10MB</p>
              </div>
            </div>

            <button
              onClick={handleUpload}
              disabled={uploading || !file}
              className="admin-btn-primary w-full flex items-center justify-center"
            >
              {uploading ? (
                <><Loader2 className="animate-spin h-4 w-4 mr-2" /> Uploading...</>
              ) : (
                <><Upload className="h-4 w-4 mr-2" /> Start Import</>
              )}
            </button>
          </div>
        </div>

        {/* Job Status Section */}
        <div className="glass-panel p-8 bg-white">
          <h2 className="text-lg font-heading font-semibold mb-6">Import Status</h2>

          {!jobId ? (
            <div className="text-center py-12 text-gray-400">
              <FileSpreadsheet className="mx-auto h-12 w-12 text-gray-300" />
              <p className="mt-3 text-sm">No active import. Upload a file to begin.</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                {jobStatus === 'COMPLETED' ? (
                  <CheckCircle className="h-6 w-6 text-green-500" />
                ) : jobStatus === 'FAILED' ? (
                  <AlertCircle className="h-6 w-6 text-red-500" />
                ) : (
                  <Loader2 className="h-6 w-6 text-brand-600 animate-spin" />
                )}
                <span className="text-lg font-medium text-gray-900 capitalize">
                  {jobStatus?.toLowerCase().replace('_', ' ')}
                </span>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Progress</span>
                  <span className="font-medium text-gray-900">{progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-brand-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
                <p>Job ID: <span className="font-mono">{jobId}</span></p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
