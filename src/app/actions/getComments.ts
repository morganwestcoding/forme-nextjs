// app/actions/getComments.ts

import axios from 'axios';
import { SafeComment } from "@/app/types";

export default async function getComments(postId: string): Promise<SafeComment[]> {
  console.log(`Fetching comments for post: ${postId}`);
  try {
    const response = await axios.get(`/api/comments/${postId}`);
    const comments: SafeComment[] = response.data;

    console.log('Fetched comments:', JSON.stringify(comments, null, 2));

    if (comments.length === 0) {
      console.log(`No comments found for post ${postId}`);
    }

    return comments;
  } catch (error) {
    console.error("Error fetching comments:", error);
    return [];
  }
}