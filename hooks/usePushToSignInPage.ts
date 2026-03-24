"use client";

import { ROUTES } from "@/constants";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

export const usePushToSignInPage = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentUrl = useMemo(() => {
    return (
      pathname + (searchParams.toString() ? `?${searchParams.toString()}` : "")
    );
  }, [pathname, searchParams]);

  return useCallback(() => {
    router.push(
      `${ROUTES.signIn}?callbackUrl=${encodeURIComponent(currentUrl)}`,
    );
  }, [currentUrl, router]);
};
