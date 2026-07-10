"use client";

import { useEffect } from "react";
import { createIcons, icons } from "lucide";
import { hrmsApi } from "@/src/lib/hrms-api";

export default function PrototypeRuntime({ initialSlug }) {
  useEffect(() => {
    if (!sessionStorage.getItem("hrms_auth")) {
      window.location.href = "/login";
      return;
    }

    window.lucide = {
      createIcons: () => createIcons({ icons })
    };
    window.IndipetHRMS = {
      api: hrmsApi,
      dataMode: process.env.NEXT_PUBLIC_HRMS_DATA_MODE || "mock",
      initialPath: initialSlug || ""
    };
    window.logout = () => {
      sessionStorage.removeItem("hrms_auth");
      window.location.href = "/login";
    };

    if (document.querySelector('script[data-indipet-runtime="true"]')) return;

    const xlsxScript = document.createElement("script");
    xlsxScript.src = "https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js";
    document.body.appendChild(xlsxScript);

    const script = document.createElement("script");
    script.src = "/hrms-runtime.js";
    script.async = false;
    script.dataset.indipetRuntime = "true";
    document.body.appendChild(script);
  }, []);

  return null;
}
