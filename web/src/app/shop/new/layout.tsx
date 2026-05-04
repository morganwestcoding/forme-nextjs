export const metadata = {
  title: 'New Shop',
  description: 'Create a new shop on ForMe',
  robots: { index: false, follow: false },
};

export default function NewShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
