import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Construction, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function UnderDevelopmentPage({
  title = "Tính năng đang phát triển",
  description = "Tính năng này đang được xây dựng và sẽ sớm ra mắt. Vui lòng quay lại sau nhé!",
}) {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-16 text-center">
      <div className="relative mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-lg shadow-amber-200">
        <Construction className="h-8 w-8" />
        <span className="absolute -right-1 -top-1 flex h-4 w-4">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
          <span className="relative inline-flex h-4 w-4 rounded-full bg-amber-500 ring-2 ring-white" />
        </span>
      </div>

      <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{title}</h1>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground md:text-base">
        {description}
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button
          asChild
          className="gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 shadow-md shadow-amber-200 hover:from-amber-600 hover:to-amber-700"
        >
          <Link to="/">
            <Home className="h-4 w-4" />
            Về trang chủ
          </Link>
        </Button>
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
          className="gap-2 rounded-xl border-amber-200 text-amber-700 hover:bg-amber-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại
        </Button>
      </div>
    </div>
  );
}
