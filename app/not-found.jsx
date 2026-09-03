import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Compass, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center space-y-4">
      <div className="h-16 w-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-2">
        <Compass className="h-8 w-8 animate-spin-slow" />
      </div>
      <h1 className="text-6xl sm:text-7xl font-extrabold gradient-title tracking-tight">
        404
      </h1>
      <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
        Page Not Found
      </h2>
      <p className="text-sm sm:text-base text-muted-foreground max-w-md leading-relaxed">
        The destination you are looking for does not exist or has been relocated within the career platform.
      </p>
      <div className="pt-2">
        <Button asChild size="lg" className="gap-2 shadow-xs">
          <Link href="/">
            <ArrowLeft className="h-4 w-4" />
            <span>Return to Homepage</span>
          </Link>
        </Button>
      </div>
    </div>
  );
}