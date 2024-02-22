'use client';
import React from 'react';
import ProfileHead from '@/components/profile/ProfileHead';
import Post from '@/components/feed/Post';
//import ProfileImages from '@/components/profile/ProfileImages';
//import UserListings from '@/components/profile/UserListings';
import { useState, useEffect } from 'react';
import { SafeProfile, SafePost, SafeListing} from "@/app/types";
import { categories } from '@/components/Categories';
import ProfileRightbar from '@/components/rightbar/ProfileRightBar';

interface ProfileClientProps {
  posts: SafePost[];
  user: SafeProfile;


}

const ProfileClient: React.FC<ProfileClientProps> = ({ user, posts }) => {

  return (
    <div>
       <ProfileHead user={user} />
      <div className="flex w-full">
        <div className="flex-none w-[45%] ml-20 mt-2">
          {/* Posts Mapping */}
          {posts.map((post, index) => (
            <Post key={index} post={post} currentUser={user} categories={categories} />
          ))}
        </div>
        <div className="flex-grow w-[45%] ml-4">
        <ProfileRightbar/>
          {/*<ProfileInfo user={user} />
          <ProfileImages user={user} />
          <UserListings listings={listings} />*/}
        </div>
      </div>
    </div>
  );
};

export default ProfileClient;