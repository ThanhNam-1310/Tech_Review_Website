import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CreateNewSpecification } from "@/apis/specification.api";
import { Loader2, Plus, SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";
import {
  specificationSchema,
  validateSchema,
  errCls,
} from "@/validation/schemas";

export default function CreateSpecificationDialog({ categoryId, onCreated }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [displayOrder, setDisplayOrder] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!categoryId) return;

    const errs = await validateSchema(specificationSchema, { name });
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    try {
      const res = await CreateNewSpecification({
        name: name.trim(),
        categoryId,
        displayOrder: Number(displayOrder) || 0,
      });
      const created = res.data?.data ?? res.data;
      onCreated?.(created);
      setName("");
      setDisplayOrder(0);
      setOpen(false);
    } catch (err) {
      console.error(err);
      //   alert("Tạo specification thất bại");
      toast.error("Tạo mới thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (v) setErrors({});
      }}
    >
      <DialogTrigger asChild>
        <Button
          size="sm"
          disabled={!categoryId}
          className="rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 font-semibold text-white shadow-md shadow-indigo-600/20 hover:from-indigo-600 hover:to-indigo-700"
        >
          <Plus className="mr-1 h-4 w-4" />
          Thêm
        </Button>
      </DialogTrigger>

      <DialogContent className="rounded-2xl border-indigo-100 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-700 text-white shadow-sm shadow-indigo-600/20">
              <SlidersHorizontal className="size-4" />
            </span>
            Thêm thông số kỹ thuật
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="spec-name">Tên</Label>
            <Input
              id="spec-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setErrors((prev) => {
                  if (!prev.name) return prev;
                  const next = { ...prev };
                  delete next.name;
                  return next;
                });
              }}
              placeholder="VD: CPU, RAM, Màn hình..."
              autoFocus
              className={`rounded-xl border-indigo-100 focus-visible:border-indigo-300 focus-visible:ring-indigo-400${errCls(errors.name)}`}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="rounded-xl"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 font-semibold text-white shadow-md shadow-indigo-600/20 hover:from-indigo-600 hover:to-indigo-700"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Tạo
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
