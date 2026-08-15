import React from 'react';
import SEO from '../../components/SEO';
import { FileText } from 'lucide-react';

export default function TermsAndConditionsPage() {
  return (
    <div className="bg-gray-50 min-h-screen py-12 md:py-24">
      <SEO 
        title="Terms & Conditions" 
        description="Terms and Conditions for Talukder uPVC Fittings Ltd." 
        canonical="/terms-conditions" 
      />
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
          <div className="bg-brand-900 p-8 md:p-12 text-center text-white">
            <FileText className="w-16 h-16 mx-auto mb-6 text-brand-300" />
            <h1 className="text-3xl md:text-5xl font-heading font-bold mb-4">Terms & Conditions</h1>
            <p className="text-brand-200">Last Updated: {new Date().toLocaleDateString()}</p>
          </div>
          
          <div className="p-8 md:p-12 prose prose-brand max-w-none text-gray-600">
            <h2>1. Agreement to Terms</h2>
            <p>
              By accessing this website, you are agreeing to be bound by these website Terms and Conditions of Use, all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws.
            </p>

            <h2>2. Use License</h2>
            <p>
              Permission is granted to temporarily download one copy of the materials (information or software) on Talukder uPVC Fittings Ltd.'s website for personal, non-commercial transitory viewing only.
            </p>
            <p>This is the grant of a license, not a transfer of title, and under this license you may not:</p>
            <ul>
              <li>modify or copy the materials;</li>
              <li>use the materials for any commercial purpose;</li>
              <li>attempt to decompile or reverse engineer any software contained on the website;</li>
              <li>remove any copyright or other proprietary notations from the materials;</li>
            </ul>

            <h2>3. Disclaimer</h2>
            <p>
              The materials on Talukder uPVC Fittings Ltd.'s website are provided "as is". We make no warranties, expressed or implied, and hereby disclaim and negate all other warranties, including without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
            </p>

            <h2>4. Limitations</h2>
            <p>
              In no event shall Talukder uPVC Fittings Ltd. or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on our website.
            </p>

            <h2>5. Revisions and Errata</h2>
            <p>
              The materials appearing on our website could include technical, typographical, or photographic errors. We do not warrant that any of the materials on its website are accurate, complete, or current. We may make changes to the materials contained on its website at any time without notice.
            </p>

            <h2>6. Governing Law</h2>
            <p>
              Any claim relating to Talukder uPVC Fittings Ltd.'s website shall be governed by the laws of Bangladesh without regard to its conflict of law provisions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
