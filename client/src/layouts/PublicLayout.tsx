import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import PublicHeader from '../components/public/PublicHeader';
import PublicFooter from '../components/public/PublicFooter';
import EnquiryModal from '../components/public/EnquiryModal';

export default function PublicLayout() {
  const [enquiryOpen, setEnquiryOpen] = useState(false);

  useEffect(() => {
    const handleOpen = () => setEnquiryOpen(true);
    window.addEventListener('open-enquiry-modal', handleOpen);
    return () => window.removeEventListener('open-enquiry-modal', handleOpen);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <PublicHeader onEnquiryClick={() => setEnquiryOpen(true)} />
      <main className="flex-1">
        <Outlet />
      </main>
      <PublicFooter />
      <EnquiryModal
        isOpen={enquiryOpen}
        onClose={() => setEnquiryOpen(false)}
      />
    </div>
  );
}
