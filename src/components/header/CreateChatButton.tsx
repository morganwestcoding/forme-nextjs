'use client'

import { useRouter } from "next/navigation";
import { Button } from "../ui/button"
import { MessageSquarePlusIcon } from "lucide-react"

function CreateChatButton() {
    const router = useRouter();

    const createNewChat = async() => {

        //logic for cchat

        router.push(`/chat/abc`);


    }
  return (
    <Button className="bg-[#ffffff] text-[#FB6848] " onClick={createNewChat} variant={'outline'} size="icon"><MessageSquarePlusIcon className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-[#FFFFFF]"/></Button>
  )
}

export default CreateChatButton