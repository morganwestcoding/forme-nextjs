import type { Metadata } from "next";
import getCurrentUser from "@/app/actions/getCurrentUser";
import getProductById from "@/app/actions/getProductById";
import getProducts from "@/app/actions/getProducts";
import EmptyState from "@/components/EmptyState";
import ProductClient from "./ProductClient";

export async function generateMetadata({ params }: { params: { productId: string } }): Promise<Metadata> {
  const product = await getProductById(params.productId).catch(() => null);
  if (!product) return { title: 'Product Not Found' };
  const description = product.description
    ? product.description.slice(0, 160)
    : `Shop ${product.name} on ForMe.`;
  return {
    title: product.name,
    description,
    openGraph: {
      title: product.name,
      description,
      ...(product.mainImage ? { images: [{ url: product.mainImage }] } : {}),
    },
  };
}

const ProductPage = async ({ params }: { params: { productId: string } }) => {
  const product = await getProductById(params.productId);
  const currentUser = await getCurrentUser();

  if (!product) {
    return (
      <EmptyState
        title="Product not found"
        subtitle="This product does not exist or was removed."
      />
    );
  }

  // Fetch related products from the same shop
  const relatedProducts = await getProducts({
    shopId: product.shopId,
    limit: 10,
  }).then((products) => products.filter((p) => p.id !== product.id));

  return (
    <ProductClient
      product={product as any}
      currentUser={currentUser}
      relatedProducts={relatedProducts}
    />
  );
};

export default ProductPage;
