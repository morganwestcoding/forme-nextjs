'use client'
import Image from 'next/image'
import { useRouter } from "next/navigation";
import { Button } from "../ui/button"
import { MessageSquarePlusIcon } from "lucide-react"
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';

function CreateChatButton() {
    const router = useRouter();

    const createNewChat = async() => {

        //logic for cchat

        router.push(`/chat/abc`);


    }
  return (
    <div className="flex items-center justify-center bg-[#ffffff] bg-opacity-30 backdrop-blur-lg rounded-full p-3 cursor-pointer shadow-sm border border-white ">
          <EmailOutlinedIcon  className="w-5 h-5 text-[#ffffff]"/>
      </div>
  )
}

export default CreateChatButton