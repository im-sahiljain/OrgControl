"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RecruitmentPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/recruitment/candidates-board");
  }, [router]);

  return null;
}
