import React from 'react';
import FinanceFixedAssets from './finance/FinanceFixedAssets';

interface FixedAssetManagementProps {
  lang: 'en' | 'bn';
  addAuditLog: (action: string, table: string, descEn: string, descBn: string) => void;
}

export default function FixedAssetManagement({
  lang,
  addAuditLog
}: FixedAssetManagementProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            {lang === 'en' ? 'Fixed Asset Management Hub' : 'স্থায়ী সম্পদ ও অবচয় নিয়ন্ত্রণ কেন্দ্র'}
          </h2>
          <p className="text-xs text-slate-500">
            {lang === 'en' 
              ? 'Unified corporate fixed asset register and double-entry automated amortization engine.' 
              : 'স্থায়ী সম্পদের খতিয়ান, দ্বৈত অবচয় অবলিখন প্রক্রিয়া এবং কিউআর কোড ট্র্যাকিং হাব।'}
          </p>
        </div>
      </div>
      <FinanceFixedAssets lang={lang} addAuditLog={addAuditLog} />
    </div>
  );
}
