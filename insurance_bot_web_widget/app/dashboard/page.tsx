import DashboardClient from '@/components/DashboardClient';

export const metadata = {
  title: 'ABC Assist · Dashboard',
  description: 'Desktop workspace for the ABC Insurance specialists.',
};

/** `/dashboard` is the standalone desktop app. */
export default function Page() {
  return <DashboardClient />;
}
