'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Bookmark, 
  Play,
  MoreHorizontal,
  MapPin,
  Tag,
  Eye
} from 'lucide-react';

import { SafePost, SafeUser } from '@/app/types';
import { categories } from '@/components/Categories';
import { Button } from '../ui/button';
import HeartButton from '@/components/HeartButton';

interface PostCardProps {
  post: SafePost;
  currentUser?: SafeUser | null;
  categories: any[];
}

const PostCard: React.FC<PostCardProps> = ({
  post,
  currentUser,
  categories
}) => {
  const router = useRouter();
  const [imageLoaded, setImageLoaded] = useState(false);

  // Find category for styling
  const category = categories.find(cat => cat.label === post.category);
  const categoryColor = category?.color || 'bg-blue-500';

  // Format date
  const formattedDate = format(new Date(post.createdAt), 'MMM dd');

  // Determine if post has media
  const hasImage = post.imageSrc || post.mediaUrl;
  const isVideo = post.mediaType === 'video';
  const isGif = post.mediaType === 'gif';

  // Truncate content for preview
  const truncatedContent = post.content.length > 100 
    ? post.content.substring(0, 100) + '...' 
    : post.content;

  const handleClick = () => {
    router.push(`/post/${post.id}`);
  };

  const handleUserClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/profile/${post.user.id}`);
  };

  const handleInteraction = (e: React.MouseEvent, action: string) => {
    e.stopPropagation();
    console.log(`${action} clicked for post ${post.id}`);
  };

  return (
    <div 
      className="bg-white rounded-3xl shadow overflow-hidden max-w-xl cursor-pointer hover:shadow-lg transition-all duration-300 group"
      onClick={handleClick}
    >
      {/* Media Header Section with Overlay Content */}
      <div className="relative h-[375px] overflow-hidden">
        {hasImage ? (
          <>
            <Image
              src={post.imageSrc || post.mediaUrl || ''}
              alt={`Post by ${post.user.name}`}
              fill
              className={`object-cover transition-all duration-300 group-hover:scale-105 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setImageLoaded(true)}
            />
            
            {/* Dark overlay for better text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
          </>
        ) : (
          // Text-only posts - clean background with centered content
          <div className="absolute inset-0 bg-gray-50 flex items-center justify-center p-6">
            <p className="text-gray-800 text-sm font-medium text-center leading-relaxed">
              {post.content.length > 350 ? post.content.substring(0, 350) + '...' : post.content}
            </p>
          </div>
        )}

        {/* Video/GIF Play Overlay */}
        {(isVideo || isGif) && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white/90 rounded-full p-4 shadow-lg">
              <Play className="w-8 h-8 text-gray-700" />
            </div>
          </div>
        )}

        {/* Category Tag */}
        {post.category && (
        <div className="absolute top-4 left-4 z-20">
        <div className="bg-neutral-100 text-neutral-600 border rounded-lg text-center justify-center w-20  py-1.5">
          <span className="text-xs text-center">{post.category}</span>
        </div>
      </div>
        )}

        {/* More Options */}
        <button 
          className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
          onClick={(e) => handleInteraction(e, 'more')}
        >
          <MoreHorizontal className="w-4 h-4 text-white" />
        </button>

        {/* User Info Overlay - Bottom Left */}
        <div 
          className="absolute bottom-4 left-4 flex items-center gap-3 cursor-pointer hover:opacity-80"
          onClick={handleUserClick}
        >
          <div className="relative w-10 h-10">
            <Image
              src={post.user.image || '/images/placeholder.jpg'}
              alt={post.user.name || 'User'}
              fill
              className="rounded-full object-cover border-2 border-white/30"
            />
          </div>
          <div>
            <p className="font-semibold text-black text-sm ">
              {post.user.name || 'Anonymous'}
            </p>
            <p className="text-black/80 text-xs ">
              {formattedDate}
            </p>
          </div>
        </div>

        {/* Stats Overlay - Bottom Right */}
        <div className="absolute bottom-4 right-4 flex items-center gap-4">
          <div className="flex items-center gap-1 text-black/90 text-sm">
            <Heart className="w-4 h-4" />
            <span >{post.likes?.length || 0}</span>
          </div>
          <div className="flex items-center gap-1 text-black/90 text-sm">
            <Eye className="w-4 h-4" />
            <span >1.2k</span>
          </div>
          <div className="flex items-center gap-1 text-black/90 text-sm">
            <Bookmark className="w-4 h-4" />
            <span >{post.bookmarks?.length || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostCard;