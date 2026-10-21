import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { GetAllPost, SetHeroPost, DeletePostById } from "@/apis/post.api";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Star,
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
import PostForm from "@/components/forms/CreatePostForm";

const PAGE_SIZE = 10;

const normalizePost = (p) => ({
  ...p,
  id: p.postId ?? p.PostId,
  title: p.title ?? p.Title,
  thumbnail: p.thumbnailUrl ?? p.ThumbnailUrl,
  author: p.authorName ?? p.AuthorName,
  date: p.publicDate ?? p.PublicDate,
  likes: p.likeCount ?? p.LikeCount ?? 0,
  views: p.viewCount ?? p.ViewCount ?? 0,
  isHightLight: p.isHightLight ?? p.IsHightLight ?? false,
});

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

// Ô search dùng chung cho hero + danh sách
const SearchBox = ({
  value,
  onChange,
  onSearch,
  onClear,
  placeholder,
  loading,
}) => (
  <div className="flex flex-1 gap-2">
    <div className="relative flex-1">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onSearch()}
        className="pl-9 pr-9"
      />
      {value && (
        <button
          type="button"
          onClick={onClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
    <Button onClick={onSearch} disabled={loading}>
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Tìm kiếm"}
    </Button>
  </div>
);

const AdminPostsPage = () => {
  const [posts, setPosts] = useState([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const [listKeyword, setListKeyword] = useState("");
  const [activeSearch, setActiveSearch] = useState("");

  const [hero, setHero] = useState(null);
  const [heroKeyword, setHeroKeyword] = useState("");
  const [heroResults, setHeroResults] = useState([]);
  const [heroSearching, setHeroSearching] = useState(false);
  const [heroSearched, setHeroSearched] = useState(false);
  const [settingId, setSettingId] = useState(null);

  const [deletingId, setDeletingId] = useState(null);

  // Dialog tạo/sửa bài viết: null = đóng, { postId: null } = tạo mới, { postId } = sửa
  const [formDialog, setFormDialog] = useState(null);

  const fetchPage = async (page, term = "") => {
    setLoading(true);
    try {
      const res = await GetAllPost({
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
      console.error("Lỗi load posts:", err);
      toast.error("Không tải được danh sách bài viết.");
    } finally {
      setLoading(false);
    }
  };

  const fetchHero = async () => {
    try {
      const res = await GetAllPost({ highlight: true, pageSize: 1 });
      const item = res.data?.items?.[0];
      setHero(item ? normalizePost(item) : null);
    } catch (err) {
      console.error("Lỗi load hero:", err);
    }
  };

  useEffect(() => {
    fetchPage(1);
    fetchHero();
  }, []);

  const handleListSearch = () => {
    const term = listKeyword.trim();
    setActiveSearch(term);
    fetchPage(1, term);
  };

  const clearListSearch = () => {
    setListKeyword("");
    setActiveSearch("");
    fetchPage(1, "");
  };

  const handleHeroSearch = async () => {
    const term = heroKeyword.trim();
    if (!term) {
      setHeroResults([]);
      setHeroSearched(false);
      return;
    }
    setHeroSearching(true);
    setHeroSearched(true);
    try {
      const res = await GetAllPost({
        search: term,
        pageNumber: 1,
        pageSize: 5,
      });
      setHeroResults((res.data?.items ?? []).map(normalizePost));
    } catch (err) {
      console.error("Lỗi tìm kiếm:", err);
      toast.error("Tìm kiếm thất bại, thử lại sau.");
    } finally {
      setHeroSearching(false);
    }
  };

  const clearHeroSearch = () => {
    setHeroKeyword("");
    setHeroResults([]);
    setHeroSearched(false);
  };

  const handleSetHero = async (post) => {
    if (post.isHightLight) return;
    setSettingId(post.id);
    try {
      await SetHeroPost(post.id);
      await fetchHero();
      const mark = (p) => ({ ...p, isHightLight: p.id === post.id });
      setPosts((prev) => prev.map(mark));
      setHeroResults((prev) => prev.map(mark));
      toast.success(`Đã đặt "${post.title}" làm bài viết chủ đề.`);
    } catch (err) {
      console.error("Lỗi đặt hero:", err);
      toast.error(
        err.response?.data?.message || "Đặt bài chủ đề thất bại, thử lại sau.",
      );
    } finally {
      setSettingId(null);
    }
  };

  const handleDelete = async (post) => {
    setDeletingId(post.id);
    try {
      await DeletePostById(post.id);
      toast.success(`Đã xoá bài viết "${post.title}".`);
      if (hero?.id === post.id) fetchHero();
      if (posts.length === 1 && pageNumber > 1) {
        fetchPage(pageNumber - 1, activeSearch);
      } else {
        fetchPage(pageNumber, activeSearch);
      }
    } catch (err) {
      console.error("Lỗi xoá bài:", err);
      toast.error(
        err.response?.data?.message || "Xoá bài viết thất bại, thử lại sau.",
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* ===== CARD TRÊN: bài viết chủ đề (Hero) ===== */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Star className="h-4 w-4 text-yellow-500" />
            Bài viết chủ đề (Hero)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {hero ? (
            <div className="flex items-center gap-4">
              <Thumb src={hero.thumbnail} className="w-24 h-16" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{hero.title}</p>
                <p className="text-xs text-muted-foreground">
                  {hero.author || "—"} • {formatDate(hero.date)}
                </p>
              </div>
              <Badge>Đang hiển thị</Badge>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Chưa có bài chủ đề. Tìm bài bên dưới và đặt làm chủ đề.
            </p>
          )}

          <SearchBox
            value={heroKeyword}
            onChange={setHeroKeyword}
            onSearch={handleHeroSearch}
            onClear={clearHeroSearch}
            placeholder="Tìm bài viết để đặt làm chủ đề..."
            loading={heroSearching}
          />

          {heroSearching && (
            <p className="text-sm text-muted-foreground">Đang tìm...</p>
          )}

          {!heroSearching && heroSearched && heroResults.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Không tìm thấy bài viết nào.
            </p>
          )}

          {heroResults.length > 0 && (
            <div className="space-y-1 rounded-lg border p-2">
              {heroResults.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center gap-3 rounded-md p-2 hover:bg-muted/50"
                >
                  <Thumb src={p.thumbnail} className="w-16 h-11" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{p.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(p.date)}
                    </p>
                  </div>
                  {p.isHightLight ? (
                    <Badge variant="secondary">Chủ đề</Badge>
                  ) : (
                    <Button
                      size="sm"
                      disabled={settingId === p.id}
                      onClick={() => handleSetHero(p)}
                    >
                      {settingId === p.id && (
                        <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                      )}
                      Đặt làm chủ đề
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            Chỉ 1 bài được làm chủ đề tại 1 thời điểm — đặt bài mới sẽ tự gỡ bài
            cũ.
          </p>
        </CardContent>
      </Card>

      {/* ===== CARD DƯỚI: danh sách bài viết ===== */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Danh sách bài viết ({totalCount})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {/* Ô search + nút thêm bài viết */}
          <div className="flex gap-2 pb-2">
            <SearchBox
              value={listKeyword}
              onChange={setListKeyword}
              onSearch={handleListSearch}
              onClear={clearListSearch}
              placeholder="Tìm theo tiêu đề hoặc mô tả (gõ không dấu cũng được)..."
              loading={loading}
            />
            <Button onClick={() => setFormDialog({ postId: null })}>
              <Plus className="mr-2 h-4 w-4" />
              Thêm bài viết
            </Button>
          </div>

          {activeSearch && (
            <p className="text-sm text-muted-foreground pb-1">
              Kết quả cho{" "}
              <span className="font-medium text-foreground">
                "{activeSearch}"
              </span>{" "}
              — {totalCount} bài viết
            </p>
          )}

          {loading ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              Đang tải...
            </p>
          ) : posts.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              {activeSearch
                ? `Không tìm thấy bài viết nào khớp "${activeSearch}".`
                : "Chưa có bài viết nào."}
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
                    <span>{p.author || "—"}</span>
                    <span>{formatDate(p.date)}</span>
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3" /> {p.views}
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart className="h-3 w-3" /> {p.likes}
                    </span>
                  </p>
                </div>

                {p.isHightLight && <Badge variant="secondary">Chủ đề</Badge>}

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setFormDialog({ postId: p.id })}
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

      {/* ===== Dialog tạo / sửa bài viết (dùng lại PostForm) ===== */}
      <Dialog
        open={!!formDialog}
        onOpenChange={(o) => !o && setFormDialog(null)}
      >
        <DialogContent className="w-[96vw] max-w-4xl sm:max-w-4xl max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {formDialog?.postId ? "Sửa bài viết" : "Tạo bài viết mới"}
            </DialogTitle>
          </DialogHeader>
          {formDialog && (
            <PostForm
              key={formDialog.postId ?? "new"}
              postId={formDialog.postId}
              onSuccess={() => {
                setFormDialog(null);
                fetchPage(pageNumber, activeSearch);
              }}
              onCancel={() => setFormDialog(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPostsPage;
