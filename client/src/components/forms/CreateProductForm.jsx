import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Loader2,
  X,
  Package,
  SlidersHorizontal,
} from "lucide-react";
import { toast } from "sonner";
import {
  UploadThumbnailProduct,
  UploadProductImages,
  CreateNewProduct,
  UpdateProductById,
  GetDetailProductById,
} from "@/apis/product.api";
import { GetAllCategories } from "@/apis/category.api";
import { GetAllSpecifiByCategory } from "@/apis/specification.api";

const idOf = (o) => o?.id ?? o?.Id;
const nameOf = (o) => o?.name ?? o?.Name;

const flattenCategories = (list, level = 0) =>
  list.flatMap((cat) => [
    { ...cat, level },
    ...flattenCategories(cat.children || [], level + 1),
  ]);

// Style dùng chung cho input — chỉ là className, không động vào logic
const inputCls =
  "rounded-xl border-orange-100 bg-white focus-visible:border-orange-300 focus-visible:ring-orange-400";

const Field = ({ label, children }) => (
  <div>
    <label className="text-sm font-medium text-zinc-700">{label}</label>
    <div className="mt-1.5">{children}</div>
  </div>
);

const INITIAL_FORM = {
  name: "",
  brand: "",
  categoryId: "",
  price: "",
  description: "",
};

// Dùng 2 kiểu:
// - Page: <CreateProductForm /> ở /products/new và /products/edit/:id (id lấy từ route)
// - Dialog (admin): <CreateProductForm productId={id|null} onSuccess={...} onCancel={...} />
const CreateProductForm = ({
  productId: productIdProp = null,
  onSuccess = null,
  onCancel = null,
}) => {
  const navigate = useNavigate();
  const { id: routeId } = useParams();

  const editId = productIdProp ?? routeId ?? null;
  const isEdit = Boolean(editId);
  const embedded = Boolean(onSuccess); // đang nhúng trong dialog

  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(INITIAL_FORM);
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  // specs theo category
  const [specTemplates, setSpecTemplates] = useState([]);
  const [specValues, setSpecValues] = useState({});
  const [loadingSpecs, setLoadingSpecs] = useState(false);
  // Spec values của sản phẩm đang sửa, chờ đổ vào sau khi templates load xong
  const pendingSpecsRef = useRef(null);

  // ảnh: chọn trước, upload sau khi tạo product
  const [thumb, setThumb] = useState(null); // { file, preview } — file = null nghĩa là ảnh cũ
  const [images, setImages] = useState([]); // [{ file, preview }]

  const [submitting, setSubmitting] = useState(false);

  // load categories 1 lần
  useEffect(() => {
    GetAllCategories()
      .then((res) => setCategories(res.data || []))
      .catch((err) => console.error("Lỗi load category:", err));
  }, []);

  // load specs mỗi khi đổi category
  useEffect(() => {
    if (!form.categoryId) {
      setSpecTemplates([]);
      setSpecValues({});
      return;
    }
    let cancelled = false;
    setLoadingSpecs(true);
    GetAllSpecifiByCategory(form.categoryId)
      .then((res) => {
        if (cancelled) return;
        const templates = res.data || [];
        setSpecTemplates(templates);
        // Nếu đang sửa: đổ spec values đã nạp từ detail vào theo template (khớp id, không có thì khớp tên)
        const pending = pendingSpecsRef.current;
        if (pending?.length) {
          const vals = {};
          templates.forEach((t) => {
            const hit = pending.find(
              (s) =>
                (s.specificationId && s.specificationId === idOf(t)) ||
                (s.name &&
                  s.name.toLowerCase() === (nameOf(t) || "").toLowerCase()),
            );
            if (hit) vals[idOf(t)] = hit.value;
          });
          setSpecValues(vals);
          pendingSpecsRef.current = null;
        } else {
          setSpecValues({});
        }
      })
      .catch((err) => {
        if (!cancelled) console.error("Lỗi load specs:", err);
      })
      .finally(() => {
        if (!cancelled) setLoadingSpecs(false);
      });
    return () => {
      cancelled = true;
    };
  }, [form.categoryId]);

  // Chế độ sửa: nạp chi tiết sản phẩm vào form
  useEffect(() => {
    if (!editId) return;
    GetDetailProductById(editId)
      .then((res) => {
        const d = res.data?.data ?? res.data;
        if (!d) return;
        pendingSpecsRef.current = (d.specifications || []).map((s) => ({
          specificationId: s.specificationId ?? s.SpecificationId ?? null,
          name: s.label ?? s.name ?? s.key ?? "",
          value: s.value ?? s.Value ?? "",
        }));
        setForm({
          name: d.name ?? "",
          brand: d.brand ?? "",
          categoryId: d.categoryId ?? "",
          price: d.price ?? "",
          description: d.description ?? "",
        });
        const thumbUrl = d.thumnailUrl ?? d.thumbnailUrl ?? "";
        setThumb(thumbUrl ? { file: null, preview: thumbUrl } : null);
        setImages(
          (d.images || []).map((url) => ({ file: null, preview: url })),
        );
      })
      .catch((err) => console.error("Lỗi load product:", err));
  }, [editId]);

  const pickFile = (e, multiple) => {
    const files = Array.from(e.target.files || []).map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    e.target.value = "";
    if (!files.length) return;
    if (multiple) {
      setImages((prev) => [...prev, ...files]);
    } else {
      if (thumb?.file) URL.revokeObjectURL(thumb.preview);
      setThumb(files[0]);
    }
  };

  const removeThumb = () => {
    if (thumb?.file) URL.revokeObjectURL(thumb.preview);
    setThumb(null);
  };

  const removeImage = (index) => {
    if (images[index]?.file) URL.revokeObjectURL(images[index].preview);
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const specifications = specTemplates
        .map((t) => ({
          specificationId: idOf(t),
          value: (specValues[idOf(t)] ?? "").trim(),
        }))
        .filter((s) => s.value); // bỏ spec chưa điền

      const payload = {
        ...form,
        price: form.price ? Number(form.price) : null,
        specifications,
      };

      if (isEdit) {
        await UpdateProductById(editId, payload);
        // Chỉ upload file MỚI (ảnh cũ có file = null)
        if (thumb?.file) await UploadThumbnailProduct(thumb.file, editId);
        const newImages = images.filter((i) => i.file);
        if (newImages.length > 0) {
          await Promise.all(
            newImages.map(({ file }) => UploadProductImages(file, editId)),
          );
        }
        toast.success("Cập nhật sản phẩm thành công!");
        if (embedded) onSuccess();
        else navigate(-1);
        return;
      }

      const res = await CreateNewProduct(payload);
      const productId = res.data?.id ?? res.data?.Id;
      if (!productId) throw new Error("Không lấy được ID sản phẩm");

      if (thumb) await UploadThumbnailProduct(thumb.file, productId);
      if (images.length > 0) {
        await Promise.all(
          images.map(({ file }) => UploadProductImages(file, productId)),
        );
      }

      toast.success("Tạo sản phẩm thành công!");
      if (embedded) {
        onSuccess();
      } else {
        setForm(INITIAL_FORM);
        setSpecValues({});
        setThumb(null);
        setImages([]);
      }
    } catch (error) {
      console.error("Lỗi:", error.response?.data || error);
      toast.error(
        error.response?.data?.message ||
          error.message ||
          (isEdit ? "Cập nhật sản phẩm thất bại!" : "Tạo sản phẩm thất bại!"),
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={
        embedded ? "space-y-4" : "mx-auto max-w-6xl space-y-5 p-4 md:p-6"
      }
    >
      {/* Hàng trên: nút quay lại + tiêu đề — chỉ hiện ở dạng page */}
      {!embedded && (
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-xl border-orange-200 text-orange-700 hover:bg-orange-50 hover:text-orange-700"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Quay lại
          </Button>
          <h1 className="flex items-center gap-2 text-xl font-bold text-zinc-900">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-sm shadow-orange-500/25">
              <Package className="h-4 w-4" />
            </span>
            {isEdit ? "Chỉnh sửa sản phẩm" : "Tạo sản phẩm"}
          </h1>
        </div>
      )}

      <div className="grid items-start gap-6 lg:grid-cols-2">
        {/* ===== Cột trái: thông tin cơ bản ===== */}
        <Card className="overflow-hidden rounded-2xl border-orange-100 shadow-lg shadow-orange-500/10">
          <div className="h-1.5 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-400" />
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100 text-orange-600">
                <Package className="h-4 w-4" />
              </span>
              Thông tin cơ bản
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            <Field label="Tên sản phẩm">
              <Input
                value={form.name}
                onChange={set("name")}
                required
                placeholder="VD: Laptop Gaming XYZ..."
                className={inputCls}
              />
            </Field>

            <Field label="Thương hiệu">
              <Input
                value={form.brand}
                onChange={set("brand")}
                required
                placeholder="VD: ASUS, MSI..."
                className={inputCls}
              />
            </Field>

            <Field label="Danh mục">
              <Select
                value={form.categoryId}
                onValueChange={(v) => setForm((f) => ({ ...f, categoryId: v }))}
              >
                <SelectTrigger className={inputCls}>
                  <SelectValue placeholder="Chọn danh mục" />
                </SelectTrigger>
                <SelectContent>
                  {flattenCategories(categories).map((cat) => (
                    <SelectItem key={idOf(cat)} value={idOf(cat)}>
                      {"— ".repeat(cat.level)}
                      {nameOf(cat)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Giá">
              <Input
                type="number"
                min="0"
                value={form.price}
                onChange={set("price")}
                placeholder="VD: 25000000"
                className={inputCls}
              />
            </Field>

            <Field label="Mô tả">
              <Textarea
                value={form.description}
                onChange={set("description")}
                placeholder="Mô tả ngắn về sản phẩm..."
                rows={3}
                className={inputCls}
              />
            </Field>

            <Field label="Thumbnail">
              {thumb ? (
                <div className="relative h-28 w-28">
                  <img
                    src={thumb.preview}
                    alt="thumbnail"
                    className="h-full w-full rounded-xl border border-orange-100 object-cover shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={removeThumb}
                    className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full border border-red-100 bg-white text-red-500 shadow-md transition-colors hover:bg-red-500 hover:text-white"
                  >
                    <X size={12} />
                  </button>
                </div>
              ) : (
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => pickFile(e, false)}
                  className="cursor-pointer rounded-xl border-orange-100 bg-white file:mr-3 file:rounded-lg file:border-0 file:bg-orange-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-orange-700 hover:file:bg-orange-200"
                />
              )}
            </Field>

            <Field label="Ảnh sản phẩm">
              <Input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => pickFile(e, true)}
                className="cursor-pointer rounded-xl border-orange-100 bg-white file:mr-3 file:rounded-lg file:border-0 file:bg-orange-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-orange-700 hover:file:bg-orange-200"
              />
              {images.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {images.map(({ preview }, i) => (
                    <div key={preview} className="relative h-20 w-20">
                      <img
                        src={preview}
                        alt={`img-${i}`}
                        className="h-full w-full rounded-xl border border-orange-100 object-cover shadow-sm"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full border border-red-100 bg-white text-red-500 shadow-md transition-colors hover:bg-red-500 hover:text-white"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </Field>
          </CardContent>
        </Card>

        {/* ===== Cột phải: specifications ===== */}
        <Card className="overflow-hidden rounded-2xl border-orange-100 shadow-lg shadow-orange-500/10">
          <div className="h-1.5 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-400" />
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100 text-orange-600">
                <SlidersHorizontal className="h-4 w-4" />
              </span>
              Thông số kỹ thuật
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            {!form.categoryId ? (
              <div className="rounded-2xl border-2 border-dashed border-orange-200 bg-orange-50/40 p-6 text-center">
                <SlidersHorizontal className="mx-auto h-6 w-6 text-orange-300" />
                <p className="mt-2 text-sm text-zinc-600">
                  Chọn danh mục ở cột trái để nhập thông số kỹ thuật.
                </p>
              </div>
            ) : loadingSpecs ? (
              <div className="flex items-center justify-center gap-2 rounded-2xl border border-orange-100 bg-orange-50/40 p-6 text-sm text-zinc-600">
                <Loader2 className="animate-spin text-orange-500" size={16} />
                Đang tải thông số...
              </div>
            ) : specTemplates.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-orange-200 bg-orange-50/40 p-6 text-center text-sm text-zinc-600">
                Danh mục này chưa có thông số mẫu.
              </div>
            ) : (
              <div className="space-y-2">
                {specTemplates.map((t) => (
                  <div
                    key={idOf(t)}
                    className="grid grid-cols-3 items-center gap-3 rounded-xl border border-orange-100 bg-orange-50/40 px-3 py-2"
                  >
                    <span className="text-sm font-medium text-zinc-700">
                      {nameOf(t)}
                    </span>
                    <Input
                      className={`col-span-2 ${inputCls}`}
                      placeholder={`Nhập ${nameOf(t)}`}
                      value={specValues[idOf(t)] ?? ""}
                      onChange={(e) =>
                        setSpecValues((v) => ({
                          ...v,
                          [idOf(t)]: e.target.value,
                        }))
                      }
                    />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Hàng dưới: nút hành động */}
      <div className="flex justify-end gap-2">
        {embedded && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="rounded-xl"
          >
            Hủy
          </Button>
        )}
        <Button
          type="submit"
          disabled={submitting}
          className="rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-8 font-semibold text-white shadow-md shadow-orange-500/25 hover:from-orange-600 hover:to-amber-600"
        >
          {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {submitting ? "Đang xử lý..." : isEdit ? "Cập nhật" : "Tạo sản phẩm"}
        </Button>
      </div>
    </form>
  );
};

export default CreateProductForm;
