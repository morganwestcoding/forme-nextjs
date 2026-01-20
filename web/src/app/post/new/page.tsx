import { redirect } from 'next/navigation';
import getCurrentUser from '@/app/actions/getCurrentUser';
import PostFlow from '@/components/post/PostFlow';

export default async function NewPostPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect('/');
  }

  return <PostFlow currentUser={currentUser} />;
}
