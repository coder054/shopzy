import { Button } from "@/components/ui/button";
import { APP_NAME, ROUTES } from "@/constants";
import { ShoppingCart, UserIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Header() {
  return (
    <header className="w-full border-b">
      <div className="wrapper flex-between">
        <div className="flex-start">
          <Link href="/" className="flex-start ml-4">
            <Image
              src="/images/logo.svg"
              alt={`${APP_NAME} logo`}
              height={48}
              width={48}
              priority={true}
            />
            <span className="hidden lg:block font-bold text-2xl ml-3">
              {APP_NAME}
            </span>
          </Link>
        </div>
        <div className="space-x-2 ">
          <Button asChild variant={"ghost"}>
            <Link href={ROUTES.cart}>
              <ShoppingCart /> Cart
            </Link>
          </Button>
          <Button asChild variant={"ghost"}>
            <Link href={ROUTES.signIn}>
              <UserIcon /> Sign in
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
