// Renders a <script type="application/ld+json"> tag for structured data.
// Usage: <JsonLd data={{ "@type": "LocalBusiness", ... }} />

interface JsonLdProps {
  data: Record<string, unknown>;
}

export default function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", ...data }) }}
    />
  );
}

// Pre-built schema helpers

export function localBusinessSchema(listing: {
  title: string;
  description?: string;
  imageSrc?: string;
  category?: string;
  address?: string | null;
  location?: string | null;
  rating?: number | null;
  ratingCount?: number;
  phoneNumber?: string | null;
  website?: string | null;
  url: string;
}) {
  const schema: Record<string, unknown> = {
    "@type": "LocalBusiness",
    name: listing.title,
    url: listing.url,
  };

  if (listing.description) schema.description = listing.description.slice(0, 300);
  if (listing.imageSrc) schema.image = listing.imageSrc;
  if (listing.category) schema.additionalType = listing.category;
  if (listing.phoneNumber) schema.telephone = listing.phoneNumber;
  if (listing.website) schema.sameAs = listing.website;

  if (listing.address || listing.location) {
    schema.address = {
      "@type": "PostalAddress",
      streetAddress: listing.address || undefined,
      addressLocality: listing.location?.split(',')[0]?.trim() || undefined,
      addressRegion: listing.location?.split(',')[1]?.trim() || undefined,
    };
  }

  if (listing.rating && listing.ratingCount && listing.ratingCount > 0) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: listing.rating,
      reviewCount: listing.ratingCount,
    };
  }

  return schema;
}

export function productSchema(product: {
  name: string;
  description?: string;
  image?: string;
  price: number;
  currency?: string;
  availability?: string;
  url: string;
}) {
  return {
    "@type": "Product",
    name: product.name,
    url: product.url,
    ...(product.description ? { description: product.description.slice(0, 300) } : {}),
    ...(product.image ? { image: product.image } : {}),
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: product.currency || "USD",
      availability: product.availability || "https://schema.org/InStock",
    },
  };
}

export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
