'use client';

import { AdminRouteGuard } from '@/components/admin/AdminRouteGuard';

export default function AdminLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminRouteGuard>
      {children}
    </AdminRouteGuard>
  );
}