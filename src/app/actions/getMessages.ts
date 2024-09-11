// app/actions/getMessages.ts

import axios from 'axios';
import { SafeMessage } from "@/app/types";

export default async function getMessages(conversationId: string): Promise<SafeMessage[]> {
  try {
    const response = await axios.get(`/api/messages/${conversationId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching messages:", error);
    return [];
  }
}