import { redirect } from 'next/navigation';
import getCurrentUser from '@/app/actions/getCurrentUser';
import PostFlow from '@/components/post/PostFlow';

export const metadata = {
  title: 'New Post',
  description: 'Share something with your community',
  robots: { index: false, follow: false },
};

export default async function NewPostPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect('/');
  }

  return <PostFlow currentUser={currentUser} />;
}
