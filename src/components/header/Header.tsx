'use client';
import Container from "../Container";
import AddListing from "./AddListing";
import UserButton from "../UserButton";
import { SafePost, SafeUser } from "@/app/types";
import Notification from "./Notification";
import Inbox from "./Inbox";
import Search from "./Search";
import Filter from "./Filter";
import { useRouter } from 'next/navigation';

interface HeaderProps {
  currentUser?: SafeUser | null;
}

const Header: React.FC<HeaderProps> = ({
  currentUser
}) => {
  const router = useRouter();

  const handleSearchResult = (user: SafeUser) => {
    router.push(`/profile/${user.id}`);
  };

  return (
    <div className="pr-4 mt-5 -mb-3 ml-8">
      <Container>
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Search onResultClick={handleSearchResult} />
            <Filter />
          </div>
          <div className="flex items-center space-x-3">
            <AddListing/>
            <Inbox currentUser={currentUser || null} />
            <Notification/>
            <UserButton currentUser={currentUser} data={{} as SafePost}/>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default Header;