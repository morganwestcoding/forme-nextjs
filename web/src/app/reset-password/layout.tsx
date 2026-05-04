export const metadata = {
  title: 'Reset Password',
  description: 'Set a new password for your account',
  robots: { index: false, follow: false },
};

export default function ResetPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
