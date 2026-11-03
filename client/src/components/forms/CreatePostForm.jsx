import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import {
  CreateNewPost,
  UpdatePostById,
  GetDetailPostById,
  UploadPostThumbnail,
  UploadPostContentImage,
} from "@/apis/post.api";
import { GetAllCategories } from "@/apis/category.api";
import { GetAllProduct } from "@/apis/product.api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  Type,
  ImagePlus,
  Trash2,
  ArrowUp,
  ArrowDown,
  ImageOff,
  Newspaper,
  AlignLeft,
  PenLine,
} from "lucide-react";

// ===== Enum phía BE (đã đối chiếu) =====
// PostContentType: Image = 1, Text = 2
const CONTENT_TYPE = { Text: 2, Image: 1 };
// PostVisibility: PostPublic = 1, PostPrivate = 2
const VISIBILITY = { PostPublic: 1, PostPrivate: 2 };
const NONE = "none"; // giá trị đại diện "không chọn" cho Select

const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);
const newTextBlock = () => ({
  key: uid(),
  kind: "text",
  value: "",
  file: null,
  preview: null,
});
const newImageBlock = () => ({
  key: uid(),
  kind: "image",
  value: "",
  file: null,
  preview: null,
});

const normalizeOption = (o) => ({
  id:
    o.id ?? o.Id ?? o.productId ?? o.ProductId ?? o.categoryId ?? o.CategoryId,
  name: o.name ?? o.Name ?? "",
});

// Style dùng chung cho input — chỉ là className, không động vào logic
const inputCls =
  "rounded-xl border-orange-100 bg-white focus-visible:border-orange-300 focus-visible:ring-orange-400";

const labelCls = "text-sm font-medium text-zinc-700";

// Tiêu đề từng nhóm field — component trình bày thuần túy
const SectionTitle = ({ icon: Icon, children }) => (
  <div className="flex items-center gap-2">
    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-100 text-orange-600">
      <Icon className="h-4 w-4" />
    </span>
    <h4 className="text-sm font-semibold uppercase tracking-wide text-zinc-700">
      {children}
    </h4>
  </div>
);

// Dùng 2 kiểu:
// - Page: <PostForm /> ở /post/new và /post/edit/:id (id lấy từ route)
// - Dialog (admin): <PostForm postId={id|null} onSuccess={...} onCancel={...} />
const PostForm = ({
  postId: postIdProp = null,
  onSuccess = null,
  onCancel = null,
}) => {
  const navigate = useNavigate();
  const { id: routeId } = useParams();
  const id = postIdProp ?? routeId ?? null;
  const isEdit = Boolean(id);
  const embedded = Boolean(onSuccess); // đang nhúng trong dialog

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [productId, setProductId] = useState("");
  const [visibility, setVisibility] = useState(VISIBILITY.PostPublic);

  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);

  const [blocks, setBlocks] = useState([newTextBlock()]);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  // ===== Load danh mục + sản phẩm cho 2 ô select =====
  useEffect(() => {
    (async () => {
      try {
        const res = await GetAllCategories();
        const items = res.data?.items ?? res.data ?? [];
        setCategories(items.map(normalizeOption));
      } catch (err) {
        console.error("Lỗi load categories:", err);
      }
      try {
        const res = await GetAllProduct({ pageNumber: 1, pageSize: 100 });
        const items = res.data?.items ?? res.data ?? [];
        setProducts(items.map(normalizeOption));
      } catch (err) {
        console.error("Lỗi load products:", err);
      }
    })();
  }, []);

  // ===== Chế độ sửa: load chi tiết bài =====
  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      setLoading(true);
      try {
        const res = await GetDetailPostById(id);
        const p = res.data ?? {};
        setTitle(p.title ?? p.Title ?? "");
        setDescription(p.description ?? p.Description ?? "");
        setCategoryId(p.categoryId ?? p.CategoryId ?? "");
        setProductId(p.productId ?? p.ProductId ?? "");
        const vis = p.visibility ?? p.Visibility ?? VISIBILITY.PostPublic;
        setVisibility(
          typeof vis === "string"
            ? (VISIBILITY[vis] ?? VISIBILITY.PostPublic)
            : vis,
        );
        setThumbnailPreview(p.thumbnailUrl ?? p.ThumbnailUrl ?? null);

        const contents = p.contents ?? p.Contents ?? [];
        if (contents.length > 0) {
          setBlocks(
            contents.map((c) => {
              const rawType =
                c.postContentType ?? c.PostContentType ?? c.type ?? c.Type;
              const value =
                c.valueContent ??
                c.ValueContent ??
                c.valueType ??
                c.ValueType ??
                "";
              return rawType === CONTENT_TYPE.Image || rawType === "Image"
                ? {
                    key: uid(),
                    kind: "image",
                    value,
                    file: null,
                    preview: value || null,
                  }
                : {
                    key: uid(),
                    kind: "text",
                    value,
                    file: null,
                    preview: null,
                  };
            }),
          );
        }
      } catch (err) {
        console.error("Lỗi load post:", err);
        toast.error("Lỗi", { description: "Không tải được bài viết." });
      } finally {
        setLoading(false);
      }
    })();
  }, [id, isEdit]);

  // ===== Thao tác trên từng block content =====
  const patchBlock = (key, patch) =>
    setBlocks((prev) =>
      prev.map((b) => (b.key === key ? { ...b, ...patch } : b)),
    );

  const removeBlock = (key) =>
    setBlocks((prev) => prev.filter((b) => b.key !== key));

  const moveBlock = (index, dir) => {
    setBlocks((prev) => {
      const next = [...prev];
      const target = index + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const handleBlockImage = (key, file) => {
    if (!file) return;
    patchBlock(key, { file, preview: URL.createObjectURL(file) });
  };

  const handleThumbnail = (file) => {
    if (!file) return;
    setThumbnailFile(file);
    setThumbnailPreview(URL.createObjectURL(file));
  };

  // Dựng mảng Contents gửi BE; imageUrls[i] là URL vừa upload cho block ảnh ở vị trí i
  const buildContents = (imageUrls = {}) =>
    blocks.map((b, i) => ({
      postContentType:
        b.kind === "image" ? CONTENT_TYPE.Image : CONTENT_TYPE.Text,
      valueContent:
        b.kind === "image" ? (imageUrls[i] ?? b.value ?? "") : b.value,
    }));

  // Upload các ảnh content mới chọn, trả về map { index: url }
  const uploadContentImages = async (postId) => {
    const urls = {};
    for (let i = 0; i < blocks.length; i++) {
      const b = blocks[i];
      if (b.kind === "image" && b.file) {
        const res = await UploadPostContentImage(b.file, postId);
        urls[i] = res.data?.imageUrl ?? res.data?.ImageUrl ?? "";
      }
    }
    return urls;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Thiếu tiêu đề", {
        description: "Vui lòng nhập tiêu đề bài viết.",
      });
      return;
    }
    setSaving(true);
    try {
      if (isEdit) {
        if (thumbnailFile) await UploadPostThumbnail(thumbnailFile, id);
        const urls = await uploadContentImages(id);
        await UpdatePostById(id, {
          title: title.trim(),
          description: description.trim(),
          categoryId: categoryId || null,
          productId: productId || null,
          visibility,
          contents: buildContents(urls),
        });
        toast.success("Thành công", { description: "Đã cập nhật bài viết." });
      } else {
        // 1. Tạo post trước để có id (ảnh content tạm để rỗng)
        const res = await CreateNewPost({
          title: title.trim(),
          description: description.trim(),
          categoryId: categoryId || null,
          productId: productId || null,
          visibility,
          contents: buildContents(),
        });
        const newPostId =
          res.data?.postId ?? res.data?.PostId ?? res.data?.id ?? res.data?.Id;
        if (!newPostId) throw new Error("BE không trả về postId");

        // 2. Upload thumbnail bằng postId
        if (thumbnailFile) await UploadPostThumbnail(thumbnailFile, newPostId);

        // 3. Upload ảnh content, rồi gắn URL vào Contents
        const urls = await uploadContentImages(newPostId);
        if (Object.keys(urls).length > 0) {
          await UpdatePostById(newPostId, { contents: buildContents(urls) });
        }
        toast.success("Thành công", { description: "Đã tạo bài viết mới." });
      }

      // Nhúng trong dialog: báo page đóng dialog + refresh danh sách
      if (embedded) onSuccess();
    } catch (err) {
      console.error("Lỗi lưu bài viết:", err);
      toast.error("Thất bại", {
        description:
          err.response?.data?.message || "Lưu bài viết thất bại, thử lại sau.",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
      </div>
    );
  }

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* ===== Thông tin bài viết ===== */}
      <div className="space-y-4">
        <SectionTitle icon={Newspaper}>Thông tin bài viết</SectionTitle>

        <div className="space-y-2">
          <Label className={labelCls}>Tiêu đề *</Label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="VD: Đánh giá Laptop 2026..."
            className={inputCls}
          />
        </div>

        <div className="space-y-2">
          <Label className={labelCls}>Mô tả ngắn</Label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Tóm tắt nội dung bài viết..."
            rows={3}
            className={inputCls}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label className={labelCls}>Chủ đề</Label>
            <Select
              value={categoryId || NONE}
              onValueChange={(v) => setCategoryId(v === NONE ? "" : v)}
            >
              <SelectTrigger className={inputCls}>
                <SelectValue placeholder="Không chọn" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>Không chọn</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className={labelCls}>Sản phẩm</Label>
            <Select
              value={productId || NONE}
              onValueChange={(v) => setProductId(v === NONE ? "" : v)}
            >
              <SelectTrigger className={inputCls}>
                <SelectValue placeholder="Không chọn" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>Không chọn</SelectItem>
                {products.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className={labelCls}>Hiển thị</Label>
            <Select
              value={String(visibility)}
              onValueChange={(v) => setVisibility(Number(v))}
            >
              <SelectTrigger className={inputCls}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={String(VISIBILITY.PostPublic)}>
                  Công khai
                </SelectItem>
                <SelectItem value={String(VISIBILITY.PostPrivate)}>
                  Riêng tư
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* ===== Ảnh đại diện ===== */}
      <div className="space-y-3">
        <SectionTitle icon={ImagePlus}>Ảnh đại diện</SectionTitle>
        <div className="flex flex-col gap-4 rounded-2xl border-2 border-dashed border-orange-200 bg-orange-50/40 p-4 sm:flex-row sm:items-center">
          {thumbnailPreview ? (
            <img
              src={thumbnailPreview}
              alt=""
              className="h-24 w-40 shrink-0 rounded-xl border border-orange-100 object-cover shadow-sm"
            />
          ) : (
            <div className="flex h-24 w-40 shrink-0 items-center justify-center rounded-xl border border-orange-100 bg-white">
              <ImageOff className="h-5 w-5 text-orange-300" />
            </div>
          )}
          <div className="space-y-1">
            <p className="text-sm font-medium text-zinc-700">
              Chọn ảnh đại diện cho bài viết
            </p>
            <p className="text-xs text-zinc-500">
              Ảnh sẽ được tải lên sau khi bài viết được tạo.
            </p>
            <Input
              type="file"
              accept="image/*"
              className="max-w-xs cursor-pointer rounded-xl border-orange-100 bg-white file:mr-3 file:rounded-lg file:border-0 file:bg-orange-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-orange-700 hover:file:bg-orange-200"
              onChange={(e) => handleThumbnail(e.target.files?.[0])}
            />
          </div>
        </div>
      </div>

      {/* ===== Nội dung bài viết ===== */}
      <div className="space-y-3">
        <SectionTitle icon={AlignLeft}>Nội dung bài viết</SectionTitle>
        {blocks.map((b, i) => (
          <div
            key={b.key}
            className="space-y-3 rounded-2xl border border-orange-100 bg-white p-4 shadow-sm"
          >
            <div className="flex items-center gap-2">
              <Badge
                className={
                  b.kind === "image"
                    ? "bg-violet-100 text-violet-700 hover:bg-violet-100"
                    : "bg-sky-100 text-sky-700 hover:bg-sky-100"
                }
              >
                {b.kind === "image" ? "Ảnh" : "Đoạn văn"}
              </Badge>
              <div className="flex-1" />
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="rounded-lg hover:bg-orange-50 hover:text-orange-600"
                onClick={() => moveBlock(i, -1)}
                disabled={i === 0}
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="rounded-lg hover:bg-orange-50 hover:text-orange-600"
                onClick={() => moveBlock(i, 1)}
                disabled={i === blocks.length - 1}
              >
                <ArrowDown className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="rounded-lg hover:bg-red-50 hover:text-red-600"
                onClick={() => removeBlock(b.key)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            {b.kind === "text" ? (
              <Textarea
                value={b.value}
                onChange={(e) => patchBlock(b.key, { value: e.target.value })}
                placeholder="Nhập nội dung đoạn văn..."
                rows={4}
                className={inputCls}
              />
            ) : (
              <div className="flex flex-col gap-3 rounded-xl bg-orange-50/40 p-3 sm:flex-row sm:items-center">
                {b.preview ? (
                  <img
                    src={b.preview}
                    alt=""
                    className="h-24 w-40 shrink-0 rounded-xl border border-orange-100 object-cover shadow-sm"
                  />
                ) : (
                  <div className="flex h-24 w-40 shrink-0 items-center justify-center rounded-xl border border-orange-100 bg-white">
                    <ImageOff className="h-5 w-5 text-orange-300" />
                  </div>
                )}
                <Input
                  type="file"
                  accept="image/*"
                  className="max-w-xs cursor-pointer rounded-xl border-orange-100 bg-white file:mr-3 file:rounded-lg file:border-0 file:bg-orange-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-orange-700 hover:file:bg-orange-200"
                  onChange={(e) => handleBlockImage(b.key, e.target.files?.[0])}
                />
              </div>
            )}
          </div>
        ))}

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-xl border-sky-200 text-sky-700 hover:bg-sky-50 hover:text-sky-700"
            onClick={() => setBlocks((prev) => [...prev, newTextBlock()])}
          >
            <Type className="h-4 w-4 mr-1" /> Thêm đoạn văn
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-xl border-violet-200 text-violet-700 hover:bg-violet-50 hover:text-violet-700"
            onClick={() => setBlocks((prev) => [...prev, newImageBlock()])}
          >
            <ImagePlus className="h-4 w-4 mr-1" /> Thêm ảnh
          </Button>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button
          type="button"
          variant="outline"
          className="rounded-xl"
          onClick={() => (embedded ? onCancel() : navigate(-1))}
        >
          Huỷ
        </Button>
        <Button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 font-semibold text-white shadow-md shadow-orange-500/25 hover:from-orange-600 hover:to-amber-600"
        >
          {saving && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
          {isEdit ? "Lưu thay đổi" : "Tạo bài viết"}
        </Button>
      </div>
    </form>
  );

  // Nhúng trong dialog: chỉ render form, dialog lo phần khung + tiêu đề
  if (embedded) return formContent;

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto">
      <Card className="overflow-hidden rounded-2xl border-orange-100 shadow-lg shadow-orange-500/10">
        <div className="h-1.5 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-400" />
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-sm shadow-orange-500/25">
              <PenLine className="h-4 w-4" />
            </span>
            {isEdit ? "Sửa bài viết" : "Tạo bài viết mới"}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">{formContent}</CardContent>
      </Card>
    </div>
  );
};

export default PostForm;
