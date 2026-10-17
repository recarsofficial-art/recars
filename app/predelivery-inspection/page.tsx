'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function PDIRedirectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const params = searchParams ? searchParams.toString() : '';
    router.replace(params ? `/pdi?${params}` : '/pdi');
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-12 h-12 rounded-full border-4 border-[#E5325C] border-t-transparent animate-spin mb-4" />
      <h2 className="text-lg font-bold text-[#101216]">Redirecting to Pre-Delivery Inspection Services...</h2>
      <p className="text-xs text-gray-500 mt-1 max-w-sm">
        Connecting you with certified Recars automotive representatives for new car showroom inspections.
      </p>
    </div>
  );
}

export default function PredeliveryInspectionRedirect() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center text-xs font-bold text-gray-500">
          Redirecting...
        </div>
      }
    >
      <PDIRedirectContent />
    </Suspense>
  );
}
