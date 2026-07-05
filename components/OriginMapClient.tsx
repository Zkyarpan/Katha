"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

const OriginMap = dynamic(() => import("./OriginMap"), {
  ssr: false,
  loading: () => <Skeleton className="w-full h-[400px] rounded-2xl" />,
});

export default OriginMap;
