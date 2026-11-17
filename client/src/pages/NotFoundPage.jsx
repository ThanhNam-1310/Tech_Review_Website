import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Compass, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-16 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-teal-500 text-white shadow-lg shadow-sky-200">
        <Compass className="h-8 w-8" />
      </div>

      <p className="bg-gradient-to-r from-sky-600 to-teal-600 bg-clip-text text-7xl font-extrabold tracking-tight text-transparent md:text-8xl">
        404
      </p>

      <h1 className="mt-4 text-2xl font-bold tracking-tight md:text-3xl">
        Không tìm thấy trang
      </h1>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground md:text-base">
        Trang bạn đang tìm không tồn tại hoặc đã được di chuyển sang địa chỉ
        khác.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button
          asChild
          className="gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-teal-500 shadow-md shadow-sky-200 hover:from-sky-600 hover:to-teal-600"
        >
          <Link to="/">
            <Home className="h-4 w-4" />
            Về trang chủ
          </Link>
        </Button>
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
          className="gap-2 rounded-xl border-sky-200 text-sky-700 hover:bg-sky-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại
        </Button>
      </div>
    </div>
  );
}
