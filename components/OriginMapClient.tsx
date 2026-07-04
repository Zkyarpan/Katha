"use client";

import dynamic from "next/dynamic";

const OriginMap = dynamic(() => import("./OriginMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] rounded-2xl bg-katha-plum/20 animate-pulse flex items-center justify-center text-katha-muted">
      Loading map...
    </div>
  ),
});

export default OriginMap;
