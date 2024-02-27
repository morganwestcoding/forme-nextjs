'use client'
import Image from 'next/image'
import { useRouter } from "next/navigation";
import { Button } from "../ui/button"
import { MessageSquarePlusIcon } from "lucide-react"
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded';

function Notification() {
    const router = useRouter();

    const createNewChat = async() => {

        //logic for cchat

        router.push(`/chat/abc`);


    }
  return (
    <Button className="bg-[#ffffff] bg-opacity-25 " onClick={createNewChat} variant={'outline'} size="icon">
          <NotificationsRoundedIcon  className="w-6 h-6 text-[#ffffff]"/>
      </Button>
  )
}

export default Notification