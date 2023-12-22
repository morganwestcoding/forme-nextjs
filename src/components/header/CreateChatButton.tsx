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
    <Button onClick={createNewChat} variant={'outline'} size="icon"><MessageSquarePlusIcon className="h-[1.2rem] w-[1.2rem]"/></Button>
  )
}

export default CreateChatButton