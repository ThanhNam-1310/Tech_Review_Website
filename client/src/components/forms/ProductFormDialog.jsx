// src/components/admin/ProductFormDialog.jsx

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  productDialogCreateSchema,
  productDialogUpdateSchema,
  validateSchema,
  errCls,
} from "@/validation/schemas";

/**
 * @param {"create" | "update"} mode
 * @param {{ id: string, name: string }[]} categories  // list phẳng để chọn
 */
const ProductFormDialog = ({
  open,
  onOpenChange,
  mode = "create",
  initialData = null,
  categories = [],
  onSubmit,
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [brand, setBrand] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [price, setPrice] = useState("");
  const [thumnailUrl, setThumnailUrl] = useState("");
  const [imagesText, setImagesText] = useState(""); // mỗi dòng 1 URL
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const clearError = (field) =>
    setErrors((prev) => {
      let changed = false;
      const next = { ...prev };
      Object.keys(next).forEach((k) => {
        if (k === field || k.startsWith(`${field}[`)) {
          delete next[k];
          changed = true;
        }
      });
      return changed ? next : prev;
    });

  useEffect(() => {
    if (!open) return;
    setName(initialData?.name ?? "");
    setDescription(initialData?.description ?? "");
    setBrand(initialData?.brand ?? "");
    setCategoryId(
      initialData?.categoryId ? String(initialData.categoryId) : "",
    );
    setPrice(
      initialData?.price != null && initialData.price !== ""
        ? String(initialData.price)
        : "",
    );
    setThumnailUrl(initialData?.thumnailUrl ?? "");
    setImagesText(
      Array.isArray(initialData?.images) ? initialData.images.join("\n") : "",
    );
    setErrors({});
  }, [open, initialData]);

  const parseImages = () =>
    imagesText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

  const handleSubmit = async () => {
    const errs = await validateSchema(
      mode === "create" ? productDialogCreateSchema : productDialogUpdateSchema,
      {
        name,
        brand,
        categoryId,
        price: price === "" ? null : Number(price),
        description,
        thumnailUrl,
        images: parseImages(),
      },
    );
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);
    try {
      if (mode === "create") {
        // CreateProductDTO
        await onSubmit({
          name: name.trim(),
          description: description.trim() || null,
          brand: brand.trim(),
          categoryId,
          price: price === "" ? null : Number(price),
          thumnailUrl: thumnailUrl.trim() || null,
          images: parseImages(),
        });
      } else {
        // UpdateProductDTO
        await onSubmit({
          name: name.trim() || null,
          description: description.trim() || null,
          brand: brand.trim() || null,
          categoryId: categoryId || null,
          price: price === "" ? null : Number(price),
          thumnailUrl: thumnailUrl.trim() || null,
          images: parseImages().length ? parseImages() : null,
        });
      }
      onOpenChange(false);
    } catch {
      // toast ở page
    } finally {
      setSubmitting(false);
    }
  };

  const imagesErrorKey = Object.keys(errors).find((k) =>
    k.startsWith("images["),
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Thêm sản phẩm" : "Cập nhật sản phẩm"}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="p-name">Tên sản phẩm *</Label>
            <Input
              id="p-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                clearError("name");
              }}
              placeholder="Nhập tên sản phẩm"
              className={errCls(errors.name)}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="p-brand">Thương hiệu *</Label>
            <Input
              id="p-brand"
              value={brand}
              onChange={(e) => {
                setBrand(e.target.value);
                clearError("brand");
              }}
              placeholder="VD: Asus, Dell..."
              className={errCls(errors.brand)}
            />
            {errors.brand && (
              <p className="text-xs text-destructive">{errors.brand}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label>Danh mục {mode === "create" ? "*" : ""}</Label>
            <Select
              value={categoryId || undefined}
              onValueChange={(v) => {
                setCategoryId(v);
                clearError("categoryId");
              }}
            >
              <SelectTrigger className={errCls(errors.categoryId)}>
                <SelectValue placeholder="Chọn danh mục" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.categoryId && (
              <p className="text-xs text-destructive">{errors.categoryId}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="p-price">Giá</Label>
            <Input
              id="p-price"
              type="number"
              min={0}
              step="1000"
              value={price}
              onChange={(e) => {
                setPrice(e.target.value);
                clearError("price");
              }}
              placeholder="VD: 15000000"
              className={errCls(errors.price)}
            />
            {errors.price && (
              <p className="text-xs text-destructive">{errors.price}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="p-desc">Mô tả</Label>
            <Textarea
              id="p-desc"
              rows={3}
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                clearError("description");
              }}
              placeholder="Mô tả ngắn..."
              className={errCls(errors.description)}
            />
            {errors.description && (
              <p className="text-xs text-destructive">{errors.description}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="p-thumb">Thumbnail URL</Label>
            <Input
              id="p-thumb"
              value={thumnailUrl}
              onChange={(e) => {
                setThumnailUrl(e.target.value);
                clearError("thumnailUrl");
              }}
              placeholder="https://..."
              className={errCls(errors.thumnailUrl)}
            />
            {errors.thumnailUrl && (
              <p className="text-xs text-destructive">{errors.thumnailUrl}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="p-images">Ảnh (mỗi dòng 1 URL)</Label>
            <Textarea
              id="p-images"
              rows={3}
              value={imagesText}
              onChange={(e) => {
                setImagesText(e.target.value);
                clearError("images");
              }}
              placeholder={"https://img1.jpg\nhttps://img2.jpg"}
              className={errCls(imagesErrorKey)}
            />
            {imagesErrorKey && (
              <p className="text-xs text-destructive">
                {errors[imagesErrorKey]}
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Hủy
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting
              ? "Đang lưu..."
              : mode === "create"
                ? "Tạo mới"
                : "Cập nhật"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProductFormDialog;
