// app/actions/getProductCategories.ts
import prisma from "@/app/libs/prismadb";

export default async function getProductCategories() {
  try {
    const categories = await prisma.productCategory.findMany({
      include: {
        _count: {
          select: {
            products: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    // Transform to safe categories
    const safeCategories = categories.map(category => ({
      id: category.id,
      name: category.name,
      description: category.description,
      image: category.image,
      parentId: category.parentId,
      productCount: category._count.products
    }));

    return safeCategories;
  } catch (error: any) {
    console.error("Error in getProductCategories:", error);
    throw new Error(`Failed to fetch product categories: ${error.message}`);
  }
}