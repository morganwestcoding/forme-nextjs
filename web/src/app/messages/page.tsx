import getCurrentUser from '@/app/actions/getCurrentUser';
import { redirect } from 'next/navigation';
import MessagesClient from './MessagesClient';

export const metadata = {
  title: 'Messages',
  description: 'Your conversations on ForMe',
  robots: { index: false, follow: false },
};

export default async function MessagesPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect('/');

  return <MessagesClient currentUser={currentUser} />;
}
