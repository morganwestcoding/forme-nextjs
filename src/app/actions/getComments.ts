// app/actions/getComments.ts
import axios from 'axios';
import { SafeComment } from "@/app/types";

export default async function getComments(postId: string): Promise<SafeComment[]> {
  try {
    console.log(`Fetching comments for post: ${postId}`);
    const response = await axios.get(`/api/comments/${postId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching comments:", error);
    return [];
  }
}