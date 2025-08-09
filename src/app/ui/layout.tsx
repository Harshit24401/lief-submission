import { auth0 } from "../../lib/auth0"; // Adjust path if your auth0 client is elsewhere
import { redirect } from 'next/navigation';
export default async function ProtectedLayout({children}: {children: React.ReactNode}) {
  const session = await auth0.getSession();

  if (!session) {
    return (
    redirect('/auth/login')
     );
  }

  return (
    <section>
      {children}
    </section>
  );
}
