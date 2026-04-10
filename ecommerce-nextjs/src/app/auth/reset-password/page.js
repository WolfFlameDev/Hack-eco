import { Suspense } from 'react';
import ResetPasswordClient from './ResetPasswordClient';

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-slate-600">
          Loading reset form...
        </div>
      }
    >
      <ResetPasswordClient />
    </Suspense>
  );
}
