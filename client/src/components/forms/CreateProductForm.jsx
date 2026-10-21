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
import { ArrowLeft, Loader2, X } from "lucide-react";
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

const Field = ({ label, children }) => (
  <div>
    <label className="text-sm font-medium">{label}</label>
    <div className="mt-1">{children}</div>
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
        embedded ? "space-y-4" : "mx-auto max-w-6xl space-y-4 p-4 md:p-6"
      }
    >
      {/* Hàng trên: nút quay lại + tiêu đề — chỉ hiện ở dạng page */}
      {!embedded && (
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Quay lại
          </Button>
          <h1 className="text-lg font-semibold">
            {isEdit ? "Chỉnh sửa sản phẩm" : "Tạo sản phẩm"}
          </h1>
        </div>
      )}

      <div className="grid items-start gap-6 lg:grid-cols-2">
        {/* ===== Cột trái: thông tin cơ bản ===== */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Thông tin cơ bản</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Field label="Tên sản phẩm">
              <Input value={form.name} onChange={set("name")} required />
            </Field>

            <Field label="Thương hiệu">
              <Input value={form.brand} onChange={set("brand")} required />
            </Field>

            <Field label="Danh mục">
              <Select
                value={form.categoryId}
                onValueChange={(v) => setForm((f) => ({ ...f, categoryId: v }))}
              >
                <SelectTrigger>
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
              />
            </Field>

            <Field label="Mô tả">
              <Textarea
                value={form.description}
                onChange={set("description")}
              />
            </Field>

            <Field label="Thumbnail">
              {thumb ? (
                <div className="relative w-28 h-28">
                  <img
                    src={thumb.preview}
                    alt="thumbnail"
                    className="w-full h-full object-cover rounded border"
                  />
                  <button
                    type="button"
                    onClick={removeThumb}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
                  >
                    <X size={12} />
                  </button>
                </div>
              ) : (
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => pickFile(e, false)}
                />
              )}
            </Field>

            <Field label="Ảnh sản phẩm">
              <Input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => pickFile(e, true)}
              />
              {images.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {images.map(({ preview }, i) => (
                    <div key={preview} className="relative w-20 h-20">
                      <img
                        src={preview}
                        alt={`img-${i}`}
                        className="w-full h-full object-cover rounded border"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
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
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Thông số kỹ thuật</CardTitle>
          </CardHeader>
          <CardContent>
            {!form.categoryId ? (
              <p className="text-sm text-muted-foreground">
                Chọn danh mục ở cột trái để nhập thông số kỹ thuật.
              </p>
            ) : loadingSpecs ? (
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="animate-spin" size={16} />
                Đang tải thông số...
              </p>
            ) : specTemplates.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Danh mục này chưa có thông số mẫu.
              </p>
            ) : (
              <div className="space-y-2">
                {specTemplates.map((t) => (
                  <div
                    key={idOf(t)}
                    className="grid grid-cols-3 items-center gap-2"
                  >
                    <span className="text-sm">{nameOf(t)}</span>
                    <Input
                      className="col-span-2"
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
          <Button type="button" variant="outline" onClick={onCancel}>
            Hủy
          </Button>
        )}
        <Button type="submit" disabled={submitting} className="px-8">
          {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {submitting ? "Đang xử lý..." : isEdit ? "Cập nhật" : "Tạo sản phẩm"}
        </Button>
      </div>
    </form>
  );
};

export default CreateProductForm;
