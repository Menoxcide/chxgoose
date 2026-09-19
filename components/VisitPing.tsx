"use client";

import { useEffect } from "react";

export function VisitPing() {
  useEffect(() => {
    fetch("/api/hit", { method: "POST", keepalive: true }).catch(() => {});
  }, []);
  return null;
}
