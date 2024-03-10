'use client'
import Image from 'next/image'
import { useRouter } from "next/navigation";
import { Button } from "../ui/button"
import { MessageSquarePlusIcon } from "lucide-react"
import { IoIosMail } from "react-icons/io";

function CreateChatButton() {
    const router = useRouter();

    const createNewChat = async() => {

        //logic for cchat

        router.push(`/chat/abc`);


    }
  return (
    <Button className="bg-[#ffffff] bg-opacity-25 " onClick={createNewChat} variant={'outline'} size="icon">
          <IoIosMail  className="w-5 h-5 text-[#ffffff]"/>
      </Button>
  )
}

export default CreateChatButton