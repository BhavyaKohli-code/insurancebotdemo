import ChatWidgetClient from '@/components/ChatWidgetClient';

export const metadata = {
  title: 'ABC Assist',
  description: 'Chat widget embedded by the ABC Insurance mobile app.',
};

/** `/` is the sheet the mobile app loads in its WebView. */
export default function Page() {
  return <ChatWidgetClient />;
}
