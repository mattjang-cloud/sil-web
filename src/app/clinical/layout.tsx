"use client";

import { ClinicalNav } from "@/components/clinical/clinical-nav";
import { ClinicalShell } from "@/components/clinical/clinical-shell";

export default function ClinicalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="clinical fixed inset-0 z-40 overflow-auto">
      <ClinicalShell>
        <ClinicalNav />
        <main className="pt-14">{children}</main>
      </ClinicalShell>
    </div>
  );
}
