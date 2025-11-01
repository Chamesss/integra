import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "../ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router";

interface SkeletonProps {
  className?: string;
}

export function ProductInfoSectionSkeleton({ className = "" }: SkeletonProps) {
  return (
    <Card className={`border gap-0 shadow-none ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between border-b gap-2 pb-4 text-lg font-semibold text-gray-900">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gray-100">
              <Skeleton className="w-4 h-4 rounded" />
            </div>
            <Skeleton className="h-4 w-32" />
            <Skeleton className="ml-2 h-5 w-12 rounded-full" />
          </div>
          <Skeleton className="h-5 w-5 rounded" />
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-2/3" />
      </CardContent>
    </Card>
  );
}

export default function ProductDetailsSkeleton() {
  const navigate = useNavigate();
  return (
    <main className="flex flex-col h-screen w-full">
      <div className="flex items-center justify-between p-6 border-b bg-white">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/inventory")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="h-6 w-48 bg-gray-200 animate-pulse rounded mb-2" />
            <div className="h-4 w-32 bg-gray-200 animate-pulse rounded" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-9 w-20 bg-gray-200 animate-pulse rounded hidden sm:block" />
          <div className="h-9 w-32 bg-gray-200 animate-pulse rounded" />
        </div>
      </div>

      <div className="p-4 sm:p-6">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-6">
            <ProductInfoSectionSkeleton />
            <ProductInfoSectionSkeleton />
            <ProductInfoSectionSkeleton />
          </div>
          <div className="space-y-6">
            <ProductInfoSectionSkeleton />
            <ProductInfoSectionSkeleton />
          </div>
        </div>
        <div className="mt-6">
          <ProductInfoSectionSkeleton />
        </div>
      </div>
    </main>
  );
}
