import { auth } from "@/auth";
import Footer from "@/components/footer";
import Header from "@/components/shared/header";
import { redirect } from "next/navigation";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect(`/api/auth/signin`);
  }

  return (
    <div className="flex h-screen flex-col ">
      <Header />
      <div className="flex-1 wrapper ">{children}</div>
      <Footer />
    </div>
  );
}
