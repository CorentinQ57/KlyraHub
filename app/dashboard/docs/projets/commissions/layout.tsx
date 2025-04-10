import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Commissions et paiements | Documentation Klyra",
  description: "Guide complet sur les commissions, les paiements et la facturation des projets sur la plateforme Klyra.",
};

export default function CommissionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 