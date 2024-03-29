'use client'
import Image from 'next/image'
import { useRouter } from "next/navigation";
import { Button } from "../ui/button"
import { MessageSquarePlusIcon } from "lucide-react"
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';

function Notification() {
    const router = useRouter();

    const createNewChat = async() => {

        //logic for cchat

        router.push(`/chat/abc`);


    }
  return (
    <div className="flex items-center justify-center bg-[#e2e8f0] backdrop-blur-lg rounded-full p-3 cursor-pointer shadow-sm border border-white ">
          <NotificationsOutlinedIcon  className="w-5 h-5 text-[#ffffff]"/>
      </div>
  )
}

export default Notification