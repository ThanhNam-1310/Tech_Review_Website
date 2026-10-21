// src/components/admin/UserFormDialog.jsx

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowRight, Shield } from "lucide-react";
import { GetAllRole, SetRoleUser } from "@/apis/roles.api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Nhãn tiếng Việt cho role — không hiển thị tên thô của BE
const ROLE_LABELS = {
  user: "Người dùng thường",
  expert: "Chuyên gia",
  admin: "Quản trị viên",
};

// Màu badge theo role
const ROLE_STYLES = {
  user: "bg-sky-100 text-sky-700 dark:bg-sky-950/50 dark:text-sky-400",
  expert:
    "bg-violet-100 text-violet-700 dark:bg-violet-950/50 dark:text-violet-400",
  admin: "bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400",
};
const ROLE_STYLE_DEFAULT =
  "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300";

const roleLabel = (name) =>
  ROLE_LABELS[(name || "").toLowerCase()] ?? name ?? "—";

const RoleBadge = ({ name }) =>
  name ? (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
        ROLE_STYLES[(name || "").toLowerCase()] ?? ROLE_STYLE_DEFAULT
      }`}
    >
      <Shield className="size-3" />
      {roleLabel(name)}
    </span>
  ) : (
    <span className="inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-500 dark:bg-zinc-800">
      Chưa rõ
    </span>
  );

const normalizeRole = (r) => ({
  id: r.id ?? r.Id,
  name: r.name ?? r.Name ?? "",
});

const initials = (user) =>
  (user?.fullName || user?.userName || "?")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const UserFormDialog = ({
  open,
  onOpenChange,
  initialData = null,
  onSubmit,
}) => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [roles, setRoles] = useState([]);
  const [currentRoleId, setCurrentRoleId] = useState("");
  const [selectedRoleId, setSelectedRoleId] = useState("");

  useEffect(() => {
    if (!open) return;
    setFullName(initialData?.fullName ?? "");
    setEmail(initialData?.email ?? "");
    setCurrentRoleId("");
    setSelectedRoleId("");

    // Load roles + khớp role hiện tại của user theo roleName
    GetAllRole()
      .then((res) => {
        const raw = res.data?.data ?? res.data ?? [];
        const list = (Array.isArray(raw) ? raw : []).map(normalizeRole);
        setRoles(list);
        const current = list.find(
          (r) =>
            r.name.toLowerCase() ===
            (initialData?.roleName ?? "").toLowerCase(),
        );
        if (current) {
          setCurrentRoleId(String(current.id));
          setSelectedRoleId(String(current.id));
        }
      })
      .catch((err) => console.error("Lỗi load roles:", err));
  }, [open, initialData]);

  const oldRole = roles.find((r) => String(r.id) === currentRoleId);
  const newRole = roles.find((r) => String(r.id) === selectedRoleId);
  const roleChanged = selectedRoleId !== "" && selectedRoleId !== currentRoleId;

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      // 1. Cập nhật họ tên / email qua page
      await onSubmit({
        fullName: fullName.trim(),
        email: email.trim(),
      });
    } catch {
      // toast ở page
      setSubmitting(false);
      return;
    }

    // 2. Đổi role nếu có thay đổi
    if (roleChanged) {
      try {
        await SetRoleUser(initialData.id, selectedRoleId);
        toast.success(`Đã đổi vai trò thành ${roleLabel(newRole?.name)}`);
      } catch {
        toast.error("Đổi vai trò thất bại");
        setSubmitting(false);
        return;
      }
    }

    setSubmitting(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cập nhật người dùng</DialogTitle>
          <DialogDescription>
            Chỉnh sửa thông tin và vai trò của tài khoản.
          </DialogDescription>
        </DialogHeader>

        {/* Thẻ tóm tắt user */}
        <div className="flex items-center gap-3 rounded-xl bg-muted/50 p-3">
          <Avatar className="size-10">
            <AvatarImage
              src={initialData?.avatarUrl || undefined}
              alt={initialData?.userName}
            />
            <AvatarFallback>{initials(initialData)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">
              {initialData?.fullName || initialData?.userName || "—"}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              @{initialData?.userName ?? ""}
            </p>
          </div>
          <div className="ml-auto shrink-0">
            <RoleBadge name={oldRole?.name ?? initialData?.roleName} />
          </div>
        </div>

        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label>Tên đăng nhập</Label>
            <Input value={initialData?.userName ?? ""} disabled />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="fullName">Họ tên</Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* ===== Vai trò ===== */}
          <div className="grid gap-2">
            <Label>Vai trò</Label>
            <Select
              value={selectedRoleId || undefined}
              onValueChange={setSelectedRoleId}
              disabled={roles.length === 0}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    roles.length === 0 ? "Đang tải vai trò..." : "Chọn vai trò"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {roles.map((r) => (
                  <SelectItem key={r.id} value={String(r.id)}>
                    {roleLabel(r.name)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Dải chuyển đổi: role cũ → role mới */}
            <div
              className={`flex items-center gap-2 rounded-xl border p-3 transition-colors ${
                roleChanged
                  ? "border-orange-300 bg-orange-50 dark:border-orange-900 dark:bg-orange-950/30"
                  : "border-transparent bg-muted/40"
              }`}
            >
              <RoleBadge name={oldRole?.name} />
              <ArrowRight
                className={`size-4 shrink-0 ${
                  roleChanged ? "text-orange-500" : "text-muted-foreground"
                }`}
              />
              <RoleBadge name={newRole?.name} />
              <span
                className={`ml-auto shrink-0 text-xs font-medium ${
                  roleChanged
                    ? "text-orange-600 dark:text-orange-400"
                    : "text-muted-foreground"
                }`}
              >
                {roleChanged ? "Sẽ đổi khi lưu" : "Không thay đổi"}
              </span>
            </div>
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
            {submitting ? "Đang lưu..." : "Cập nhật"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UserFormDialog;
