import "./topbar.css";
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person'; 
import ChatIcon from '@mui/icons-material/Chat';
import CircleNotificationsIcon from '@mui/icons-material/CircleNotifications';
import HomeIcon from '@mui/icons-material/Home';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import Logo from "./Logo";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../auth";
import UserButton from "@/components/UserButton";

async function Topbar() {
  const session = await getServerSession(authOptions);
  console.log(session)
  return (
    <div className="topbarContainer">
       <div className="topbarLeft">
        <span className="logo">
          <Logo/>
        </span>
       </div>
       <div className="topbarCenter">
        <div className="searchbar">
          <SearchIcon className="searchIcon"/>
        </div>
        </div>
       <div className="topbarRight">
          <div className="topbarIcons">
        
              <HomeIcon/>
              <PersonIcon />
              <ChatIcon/>
              <CircleNotificationsIcon/>
              <UserButton/>
          </div>
         
        </div>
    </div>
        
  )
};

export default Topbar