import getCurrentUser from '@/app/actions/getCurrentUser';
import { redirect } from 'next/navigation';
import MessagesClient from './MessagesClient';


export default async function MessagesPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect('/');

  return <MessagesClient currentUser={currentUser} />;
}
