import Container from "../Container";
import AddListing from "./AddListing";
import UserButton from "../UserButton";
import { SafePost } from "@/app/types";
import Notification from "./Notification";
import CreateChatButton from "./CreateChatButton";
import { SafeUser } from "@/app/types";
import Search from "./Search";
import Filter from "./Filter";

interface HeaderProps {
  currentUser?: SafeUser | null;
}

const Header: React.FC<HeaderProps> = ({
  currentUser
}) => {
  console.log({ currentUser});
  return (
        <div className=" pr-4 pt-7 -mb-3">
          <Container>
              <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <Search />
                    <Filter />
                  </div>
                <div className="flex items-center space-x-4">
                  <AddListing/>
                  <CreateChatButton />
                  <Notification/>
                  <UserButton currentUser={currentUser} data={{} as SafePost}/>
                </div>
              </div>
          </Container>
        </div>
  );
};

export default Header