// route.ts
'use client'
import prisma from "@/app/libs/prismadb";
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { content, mood, location, photo, userId, categoryId } = req.body;

    try {
      const post = await prisma.post.create({
        data: {
          content,
          mood,
          location,
          photo,
          userId,
          categoryId,
        },
      });

      res.status(200).json(post);
    } catch (error) {
      console.error('Post creation failed:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
