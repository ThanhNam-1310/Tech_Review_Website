import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { GetMyPosts, DeletePostById } from "@/apis/post.api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Loader2,
  ImageOff,
  Eye,
  Heart,
  Search,
  X,
  Pencil,
  Trash2,
  Plus,
} from "lucide-react";

const PAGE_SIZE = 10;

const normalizePost = (p) => ({
  ...p,
  id: p.postId ?? p.PostId,
  title: p.title ?? p.Title,
  thumbnail: p.thumbnailUrl ?? p.ThumbnailUrl,
  date: p.publicDate ?? p.PublicDate,
  likes: p.likeCount ?? p.LikeCount ?? 0,
  views: p.viewCount ?? p.ViewCount ?? 0,
  visibility: p.visibility ?? p.Visibility,
});

const isPublic = (v) => v === "PostPublic" || v === 1;

const formatDate = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  return isNaN(d) ? "" : d.toLocaleDateString("vi-VN");
};

const getPageItems = (current, total) => {
  const pages = new Set([1, total, current - 1, current, current + 1]);
  const sorted = [...pages]
    .filter((n) => n >= 1 && n <= total)
    .sort((a, b) => a - b);
  const items = [];
  sorted.forEach((n, i) => {
    if (i > 0 && n - sorted[i - 1] > 1) items.push("...");
    items.push(n);
  });
  return items;
};

const Thumb = ({ src, className }) =>
  src ? (
    <img
      src={src}
      alt=""
      className={`object-cover rounded border shrink-0 ${className}`}
    />
  ) : (
    <div
      className={`rounded border bg-muted flex items-center justify-center shrink-0 ${className}`}
    >
      <ImageOff className="h-4 w-4 text-muted-foreground" />
    </div>
  );

const MyPostsPage = () => {
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const [keyword, setKeyword] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const fetchPage = async (page, term = "") => {
    setLoading(true);
    try {
      const res = await GetMyPosts({
        pageNumber: page,
        pageSize: PAGE_SIZE,
        ...(term ? { search: term } : {}),
      });
      const data = res.data ?? {};
      setPosts((data.items ?? []).map(normalizePost));
      setPageNumber(data.pageNumber ?? page);
      setTotalPages(data.totalPages ?? 1);
      setTotalCount(data.totalCount ?? 0);
    } catch (err) {
      console.error("Lỗi load my posts:", err);
      toast.error("Lỗi", { description: "Không tải được danh sách bài viết." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPage(1);
  }, []);

  const handleSearch = () => {
    const term = keyword.trim();
    setActiveSearch(term);
    fetchPage(1, term);
  };

  const clearSearch = () => {
    setKeyword("");
    setActiveSearch("");
    fetchPage(1, "");
  };

  const handleDelete = async (post) => {
    setDeletingId(post.id);
    try {
      await DeletePostById(post.id);
      toast.success("Đã xoá", {
        description: `Đã xoá bài viết "${post.title}".`,
      });
      if (posts.length === 1 && pageNumber > 1) {
        fetchPage(pageNumber - 1, activeSearch);
      } else {
        fetchPage(pageNumber, activeSearch);
      }
    } catch (err) {
      console.error("Lỗi xoá bài:", err);
      toast.error("Thất bại", {
        description:
          err.response?.data?.message || "Xoá bài viết thất bại, thử lại sau.",
      });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-4xl">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">
            Bài viết của tôi ({totalCount})
          </CardTitle>
          <Button size="sm" onClick={() => navigate("/post/new")}>
            <Plus className="h-4 w-4 mr-1" />
            Tạo bài viết
          </Button>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex gap-2 pb-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm trong bài viết của bạn (gõ không dấu cũng được)..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="pl-9 pr-9"
              />
              {keyword && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <Button onClick={handleSearch} disabled={loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Tìm kiếm"
              )}
            </Button>
          </div>

          {loading ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              Đang tải...
            </p>
          ) : posts.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              {activeSearch
                ? `Không tìm thấy bài viết nào khớp "${activeSearch}".`
                : "Bạn chưa có bài viết nào."}
            </p>
          ) : (
            posts.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-4 rounded-lg border p-3"
              >
                <Thumb src={p.thumbnail} className="w-20 h-14" />

                <div className="flex-1 min-w-0">
                  <Link
                    to={`/post/${p.id}`}
                    className="font-medium text-sm truncate hover:underline block"
                  >
                    {p.title}
                  </Link>
                  <p className="text-xs text-muted-foreground flex items-center gap-3 mt-1">
                    <span>{formatDate(p.date)}</span>
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3" /> {p.views}
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart className="h-3 w-3" /> {p.likes}
                    </span>
                  </p>
                </div>

                <Badge
                  variant={isPublic(p.visibility) ? "secondary" : "outline"}
                >
                  {isPublic(p.visibility) ? "Công khai" : "Riêng tư"}
                </Badge>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate(`/post/edit/${p.id}`)}
                  >
                    <Pencil className="h-3 w-3 mr-1" />
                    Sửa
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    disabled={deletingId === p.id}
                    onClick={() => handleDelete(p)}
                  >
                    {deletingId === p.id ? (
                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    ) : (
                      <Trash2 className="h-3 w-3 mr-1" />
                    )}
                    Xoá
                  </Button>
                </div>
              </div>
            ))
          )}

          {totalPages > 1 && (
            <Pagination className="pt-4">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() =>
                      pageNumber > 1 && fetchPage(pageNumber - 1, activeSearch)
                    }
                    className={
                      pageNumber <= 1
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>

                {getPageItems(pageNumber, totalPages).map((item, i) => (
                  <PaginationItem key={`${item}-${i}`}>
                    {item === "..." ? (
                      <PaginationEllipsis />
                    ) : (
                      <PaginationLink
                        isActive={item === pageNumber}
                        onClick={() => fetchPage(item, activeSearch)}
                        className="cursor-pointer"
                      >
                        {item}
                      </PaginationLink>
                    )}
                  </PaginationItem>
                ))}

                <PaginationItem>
                  <PaginationNext
                    onClick={() =>
                      pageNumber < totalPages &&
                      fetchPage(pageNumber + 1, activeSearch)
                    }
                    className={
                      pageNumber >= totalPages
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MyPostsPage;
