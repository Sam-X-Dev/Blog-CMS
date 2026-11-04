import type { Metadata } from "next";
import { AuthPage } from "@/components/public/account/AuthPage";

export const metadata: Metadata = {
  title: "Log in | BlogCMS",
  robots: { index: false, follow: false },
};

export default function LoginPage({ searchParams }: PageProps<"/login">) {
  return <AuthPage mode="login" searchParams={searchParams} />;
}
