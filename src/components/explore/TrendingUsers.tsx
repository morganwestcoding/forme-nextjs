'use client';

import { useRouter } from 'next/navigation';
import { SafeUser } from '@/app/types';
import Avatar from '../ui/avatar';

interface TrendingUsersProps {
  users: SafeUser[];
  currentUser?: SafeUser | null;
}

const TrendingUsers: React.FC<TrendingUsersProps> = ({
  users = [],
  currentUser
}) => {
  const router = useRouter();
  
  // Function to check if current user follows this user
  const isFollowing = (userId: string) => {
    return currentUser?.following?.includes(userId) || false;
  };
  
  // Check if there are no users to display
  if (!users || users.length === 0) {
    return (
      <div className="w-full">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Popular Creators</h2>
          <button 
            className="text-sm text-gray-500 hover:text-[#F08080] transition-colors"
            onClick={() => router.push('/community')}
          >
            View all
          </button>
        </div>
        
        <div className="bg-white rounded-lg overflow-hidden border border-gray-100 p-8 text-center">
          <p className="text-gray-500">No popular creators found at the moment.</p>
        </div>
      </div>
    );
  };
  
  // Function to handle follow/unfollow
  const handleFollowToggle = (e: React.MouseEvent, userId: string) => {
    e.stopPropagation();
    // Here you would implement your follow/unfollow logic
    console.log('Toggle follow for user:', userId);
  };
  
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Popular Creators</h2>
        <button 
          className="text-sm text-gray-500 hover:text-[#F08080] transition-colors"
          onClick={() => router.push('/community')}
        >
          View all
        </button>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {users.map(user => (
          <div 
            key={user.id}
            onClick={() => router.push(`/users/${user.id}`)}
            className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition cursor-pointer border border-gray-100 p-4"
          >
            <div className="flex flex-col items-center">
              <Avatar 
                className="h-20 w-20 rounded-full"
              />
              
              <h3 className="font-medium text-sm mt-2 text-center">{user.name}</h3>
              <p className="text-xs text-gray-500 text-center mb-2">{user.location || 'No location'}</p>
              
              <div className="flex text-xs gap-4 mb-3 text-gray-500">
                <div className="flex flex-col items-center">
                  <span className="font-medium">{user.followers?.length || 0}</span>
                  <span>Followers</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="font-medium">{user.following?.length || 0}</span>
                  <span>Following</span>
                </div>
              </div>
              
              {currentUser && currentUser.id !== user.id && (
                <button 
                  onClick={(e) => handleFollowToggle(e, user.id)}
                  className={`
                    w-full py-1.5 px-3 rounded-full text-xs font-medium
                    transition-colors
                    ${isFollowing(user.id) 
                      ? 'bg-gray-100 text-gray-800 hover:bg-gray-200' 
                      : 'bg-[#F08080] text-white hover:bg-[#E57373]'}
                  `}
                >
                  {isFollowing(user.id) ? 'Following' : 'Follow'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrendingUsers;