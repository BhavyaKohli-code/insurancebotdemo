'use client';

import dynamic from 'next/dynamic';

/** Client-only for the same reason as `ChatWidgetClient`. */
const Dashboard = dynamic(() => import('./Dashboard'), { ssr: false });

export default function DashboardClient() {
  return <Dashboard />;
}
