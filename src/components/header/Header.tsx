'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Container from "../Container";
import AddListing from "./AddListing";
import UserButton from "../UserButton";
import { SafePost, SafeUser, SafeListing } from "@/app/types";
import Notification from "./Notification";
import Inbox from "./Inbox";
import Search from "./Search";
import Filter from "./Filter";

interface HeaderProps {
  currentUser?: SafeUser | null;
}

const Header: React.FC<HeaderProps> = ({ currentUser }) => {
  const router = useRouter();

  const handleSearchResult = (result: SafeUser | SafeListing) => {
    if ('email' in result) {
      // It's a user
      router.push(`/profile/${result.id}`);
    } else {
      // It's a listing
      router.push(`/listings/${result.id}`);
    }
  };

  return (
    <div className="pr-4 mt-5 -mb-3">
      <Container>
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Search onResultClick={handleSearchResult} />
          </div>
          <div className="flex items-center space-x-2 ">
            <AddListing />
            <Inbox currentUser={currentUser || null} />
            <Notification />
            <UserButton currentUser={currentUser} data={{} as SafePost} />
          </div>
        </div>
      </Container>
    </div>
  );
};

export default Header;