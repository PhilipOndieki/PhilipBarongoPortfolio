import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Lead Queue",
  robots: { index: false, follow: false },
  appleWebApp: { capable: true, title: "Lead Queue", statusBarStyle: "black" },
};

export default function AdminLayout({ children }: { readonly children: ReactNode }) {
  return children;
}
