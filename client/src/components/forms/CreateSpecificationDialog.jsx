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
// import { CreateNewSpecification } from "@/lib/api/specification";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";

export default function CreateSpecificationDialog({ categoryId, onCreated }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [displayOrder, setDisplayOrder] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !categoryId) return;

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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" disabled={!categoryId}>
          <Plus className="h-4 w-4 mr-1" />
          Thêm
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Thêm thông số kỹ thuật</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="spec-name">Tên</Label>
            <Input
              id="spec-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: CPU, RAM, Màn hình..."
              required
              autoFocus
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={loading || !name.trim()}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Tạo
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
