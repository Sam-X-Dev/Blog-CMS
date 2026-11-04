import type { Metadata } from "next";
import { AuthPage } from "@/components/public/account/AuthPage";

export const metadata: Metadata = {
  title: "Sign up | BlogCMS",
  robots: { index: false, follow: false },
};

export default function SignupPage({ searchParams }: PageProps<"/signup">) {
  return <AuthPage mode="signup" searchParams={searchParams} />;
}
