import React, { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { User, Mail, Camera, Loader2 } from "lucide-react";

import { UpdateUser, UpdateAvatarUser } from "@/apis/user.api";

const initials = (name) =>
  (name || "?")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

export default function EditProfileDialog({
  open,
  onOpenChange,
  profile,
  onSuccess,
}) {
  const [form, setForm] = useState({ fullName: "", email: "" });
  const [fileAnh, setFileAnh] = useState(null);
  const [xemTruoc, setXemTruoc] = useState("");
  const [dangLuu, setDangLuu] = useState(false);
  const fileInputRef = useRef(null);

  // Mỗi lần mở dialog: nạp dữ liệu hiện tại, bỏ file đang chọn dở
  useEffect(() => {
    if (open && profile) {
      setForm({
        fullName: profile.fullName ?? "",
        email: profile.email ?? "",
      });
      setFileAnh(null);
      setXemTruoc(profile.avatarUrl ?? "");
    }
  }, [open, profile]);

  // Giải phóng URL xem trước (blob:) khi thay ảnh khác
  useEffect(() => {
    return () => {
      if (xemTruoc?.startsWith("blob:")) URL.revokeObjectURL(xemTruoc);
    };
  }, [xemTruoc]);

  const chonAnh = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn file ảnh.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ảnh tối đa 5MB.");
      return;
    }

    setFileAnh(file);
    setXemTruoc(URL.createObjectURL(file));
  };

  const luu = async () => {
    setDangLuu(true);
    try {
      // 1) Có chọn ảnh mới thì upload trước
      let avatarUrlMoi;
      if (fileAnh) {
        const res = await UpdateAvatarUser(profile.id, fileAnh);
        avatarUrlMoi = res.data?.avatarUrl ?? res.data?.AvatarUrl ?? undefined;
      }

      // 2) Cập nhật họ tên/email theo UpdateUserDTO; chỉ kèm avatarUrl
      //    khi upload trả về URL mới, không thì bỏ hẳn field để BE
      //    giữ nguyên avatar cũ
      const duLieu = {
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        ...(avatarUrlMoi ? { avatarUrl: avatarUrlMoi } : {}),
      };
      await UpdateUser(profile.id, duLieu);

      toast.success("Đã cập nhật thông tin cá nhân.");
      onOpenChange(false);
      onSuccess?.();
    } catch {
      toast.error("Cập nhật thất bại, vui lòng thử lại.");
    } finally {
      setDangLuu(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa thông tin</DialogTitle>
          <DialogDescription>
            Cập nhật họ tên, email và ảnh đại diện của bạn.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          {/* Ảnh đại diện: bấm vào nút camera để chọn file */}
          <div className="flex flex-col items-center gap-2">
            <div className="relative">
              <Avatar className="h-20 w-20">
                <AvatarImage src={xemTruoc || undefined} alt={form.fullName} />
                <AvatarFallback className="bg-orange-100 text-xl font-semibold text-orange-700 dark:bg-orange-950 dark:text-orange-400">
                  {initials(form.fullName)}
                </AvatarFallback>
              </Avatar>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="Đổi ảnh đại diện"
                className="absolute -bottom-1 -right-1 flex size-7 items-center justify-center rounded-full bg-orange-500 text-white shadow transition-colors hover:bg-orange-600"
              >
                <Camera className="size-4" />
              </button>
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-sm font-medium text-orange-600 hover:underline dark:text-orange-400"
            >
              Đổi ảnh đại diện
            </button>
            <p className="text-xs text-muted-foreground">
              JPG, PNG, WebP — tối đa 5MB
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={chonAnh}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="pf-fullname">Họ và tên</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="pf-fullname"
                value={form.fullName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, fullName: e.target.value }))
                }
                className="pl-9"
                placeholder="Nguyễn Văn A"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="pf-email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="pf-email"
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm((f) => ({ ...f, email: e.target.value }))
                }
                className="pl-9"
                placeholder="ban@example.com"
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={dangLuu}
          >
            Hủy
          </Button>
          <Button onClick={luu} disabled={dangLuu}>
            {dangLuu && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {dangLuu ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
