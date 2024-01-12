// route.ts
import prisma from "@/app/libs/prismadb";
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'POST') {
      const { content, mood, location, photo, userId, categoryId } = req.body;
      const post = await prisma.post.create({
        data: {
          content,
          location,
          photo,
          userId,
          categoryId,
        },
      });
      res.status(200).json(post);
    } else if (req.method === 'GET') {
      const posts = await prisma.post.findMany();
      res.status(200).json(posts);
    } else {
      res.setHeader('Allow', ['POST', 'GET']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}
