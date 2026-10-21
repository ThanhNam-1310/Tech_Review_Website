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
  }, [open, initialData]);

  const parseImages = () =>
    imagesText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

  const handleSubmit = async () => {
    if (!name.trim()) return;
    if (mode === "create" && !categoryId) return;

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
              onChange={(e) => setName(e.target.value)}
              placeholder="Nhập tên sản phẩm"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="p-brand">Thương hiệu *</Label>
            <Input
              id="p-brand"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="VD: Asus, Dell..."
            />
          </div>

          <div className="grid gap-2">
            <Label>Danh mục {mode === "create" ? "*" : ""}</Label>
            <Select
              value={categoryId || undefined}
              onValueChange={setCategoryId}
            >
              <SelectTrigger>
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
          </div>

          <div className="grid gap-2">
            <Label htmlFor="p-price">Giá</Label>
            <Input
              id="p-price"
              type="number"
              min={0}
              step="1000"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="VD: 15000000"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="p-desc">Mô tả</Label>
            <Textarea
              id="p-desc"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả ngắn..."
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="p-thumb">Thumbnail URL</Label>
            <Input
              id="p-thumb"
              value={thumnailUrl}
              onChange={(e) => setThumnailUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="p-images">Ảnh (mỗi dòng 1 URL)</Label>
            <Textarea
              id="p-images"
              rows={3}
              value={imagesText}
              onChange={(e) => setImagesText(e.target.value)}
              placeholder={"https://img1.jpg\nhttps://img2.jpg"}
            />
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
          <Button
            onClick={handleSubmit}
            disabled={
              submitting ||
              !name.trim() ||
              (mode === "create" && (!brand.trim() || !categoryId))
            }
          >
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
