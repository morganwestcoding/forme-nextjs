export default function PostLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-[9999] bg-white dark:bg-stone-950 overflow-auto">
      {children}
    </div>
  );
}
