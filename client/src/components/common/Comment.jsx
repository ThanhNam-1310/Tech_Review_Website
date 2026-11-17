import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  MessageSquare,
  ThumbsUp,
  Loader2,
  Eye,
  EyeOff,
  Pencil,
  Trash2,
  Reply,
} from "lucide-react";
import { toast } from "sonner";

import {
  GetAllCommentPost,
  GetAllCommentProduct,
  AddNewCommentForPost,
  AddNewCommentForProduct,
  UpdateCommentById,
  DeleteCommentById,
  HideCommentById,
  UnHideCommentById,
  ActionLikeComment,
  ActionDisLikeComment,
} from "@/apis/comment.api";
import { getMe } from "@/apis/auth.api";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Comments({ type, targetId, authorId }) {
  const navigate = useNavigate();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [likingIds, setLikingIds] = useState(new Set());
  const [actingIds, setActingIds] = useState(new Set());
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState("");
  const [replySubmitting, setReplySubmitting] = useState(false);

  const isPost = type === "post";
  const viewerId = currentUser?.id ?? currentUser?.userId ?? null;
  const isAdminViewer =
    String(currentUser?.roleName ?? "").toLowerCase() === "admin";

  const commentIdOf = (c) => c.commentId ?? c.id;
  const isOwn = (c) =>
    viewerId != null &&
    c.userId != null &&
    String(c.userId).toLowerCase() === String(viewerId).toLowerCase();
  const isAuthorComment = (c) =>
    isPost &&
    authorId != null &&
    c.userId != null &&
    String(c.userId).toLowerCase() === String(authorId).toLowerCase();

  // Hỏi BE "tôi là ai" để biết có được quyền bình luận không
  useEffect(() => {
    let cancelled = false;
    getMe()
      .then((res) => {
        if (!cancelled) setCurrentUser(res.data?.data ?? res.data ?? null);
      })
      .catch(() => {
        if (!cancelled) setCurrentUser(null);
      })
      .finally(() => {
        if (!cancelled) setCheckingAuth(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const loadComments = async () => {
    try {
      setLoading(true);

      const res = isPost
        ? await GetAllCommentPost(targetId)
        : await GetAllCommentProduct(targetId);

      const data = res.data;
      setComments(Array.isArray(data) ? data : (data.items ?? []));
    } catch (error) {
      console.error("Lỗi lấy bình luận:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (targetId) loadComments();
  }, [targetId, type]);

  const handleSubmit = async () => {
    if (!newComment.trim() || submitting) return;
    if (!currentUser) {
      toast.error("Bạn cần đăng nhập để bình luận.");
      return;
    }

    setSubmitting(true);
    try {
      const comment = {
        commentContent: newComment.trim(),
      };

      if (isPost) {
        await AddNewCommentForPost(targetId, comment);
      } else {
        await AddNewCommentForProduct(targetId, comment);
      }

      setNewComment("");
      await loadComments();
    } catch (error) {
      console.error("Lỗi gửi bình luận:", error);
      if (error.response?.status === 401) {
        // Phiên hết hạn giữa chừng: về trạng thái chưa đăng nhập
        setCurrentUser(null);
        toast.error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.");
      } else {
        toast.error("Gửi bình luận thất bại, vui lòng thử lại.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Enter để gửi, Shift + Enter để xuống dòng
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleActionError = (error, fallbackMessage) => {
    const status = error.response?.status;
    if (status === 401) {
      setCurrentUser(null);
      toast.error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.");
    } else if (status === 403) {
      toast.error("Bạn không có quyền thực hiện thao tác này.");
    } else {
      toast.error(fallbackMessage);
    }
  };

  const withActing = async (commentId, fn) => {
    if (actingIds.has(commentId)) return;
    setActingIds((prev) => new Set(prev).add(commentId));
    try {
      await fn();
    } finally {
      setActingIds((prev) => {
        const next = new Set(prev);
        next.delete(commentId);
        return next;
      });
    }
  };

  const handleToggleLike = async (comment) => {
    if (!currentUser) {
      toast.error("Bạn cần đăng nhập để thích bình luận.");
      return;
    }
    const commentId = commentIdOf(comment);
    if (likingIds.has(commentId)) return;

    setLikingIds((prev) => new Set(prev).add(commentId));
    try {
      const res = comment.isLiked
        ? await ActionDisLikeComment(commentId)
        : await ActionLikeComment(commentId);
      const data = res.data?.data ?? res.data;
      // Cập nhật đệ quy vì bình luận nằm trong cây trả lời
      const updateTree = (list) =>
        list.map((x) => {
          if (commentIdOf(x) === commentId)
            return { ...x, isLiked: data.isLiked, likeCount: data.likeCount };
          if (x.replies?.length)
            return { ...x, replies: updateTree(x.replies) };
          return x;
        });
      setComments((prev) => updateTree(prev));
    } catch (error) {
      console.error("Lỗi thích bình luận:", error);
      if (error.response?.status === 401) {
        setCurrentUser(null);
        toast.error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.");
      } else {
        toast.error("Không thể thích bình luận, vui lòng thử lại.");
      }
    } finally {
      setLikingIds((prev) => {
        const next = new Set(prev);
        next.delete(commentId);
        return next;
      });
    }
  };

  const handleDelete = async (comment) => {
    const commentId = commentIdOf(comment);
    if (
      !window.confirm(
        "Bạn có chắc muốn xóa bình luận này? Các trả lời bên dưới cũng sẽ bị xóa.",
      )
    )
      return;
    await withActing(commentId, async () => {
      try {
        await DeleteCommentById(commentId);
        toast.success("Đã xóa bình luận.");
        await loadComments();
      } catch (error) {
        console.error("Lỗi xóa bình luận:", error);
        handleActionError(error, "Không thể xóa bình luận, vui lòng thử lại.");
      }
    });
  };

  const handleHide = async (comment) => {
    const commentId = commentIdOf(comment);
    await withActing(commentId, async () => {
      try {
        await HideCommentById(commentId);
        await loadComments();
      } catch (error) {
        console.error("Lỗi ẩn bình luận:", error);
        handleActionError(error, "Không thể ẩn bình luận, vui lòng thử lại.");
      }
    });
  };

  const handleUnhide = async (comment) => {
    const commentId = commentIdOf(comment);
    await withActing(commentId, async () => {
      try {
        await UnHideCommentById(commentId);
        await loadComments();
      } catch (error) {
        console.error("Lỗi hiện bình luận:", error);
        handleActionError(error, "Không thể hiện bình luận, vui lòng thử lại.");
      }
    });
  };

  const startEdit = (comment) => {
    setEditingId(commentIdOf(comment));
    setEditContent(comment.commentContent ?? comment.content ?? "");
    setReplyingTo(null);
  };

  const handleSaveEdit = async (comment) => {
    if (!editContent.trim()) return;
    const commentId = commentIdOf(comment);
    await withActing(commentId, async () => {
      try {
        await UpdateCommentById(commentId, {
          commentContent: editContent.trim(),
        });
        setEditingId(null);
        setEditContent("");
        await loadComments();
      } catch (error) {
        console.error("Lỗi sửa bình luận:", error);
        handleActionError(error, "Không thể sửa bình luận, vui lòng thử lại.");
      }
    });
  };

  const handleEditKeyDown = (e, comment) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSaveEdit(comment);
    } else if (e.key === "Escape") {
      setEditingId(null);
      setEditContent("");
    }
  };

  const startReply = (comment) => {
    if (!currentUser) {
      toast.error("Bạn cần đăng nhập để trả lời bình luận.");
      return;
    }
    setReplyingTo(commentIdOf(comment));
    setReplyContent("");
    setEditingId(null);
  };

  const handleReplySubmit = async (comment) => {
    if (!replyContent.trim() || replySubmitting) return;
    const parentId = commentIdOf(comment);
    setReplySubmitting(true);
    try {
      const payload = {
        commentContent: replyContent.trim(),
        parentCommentId: parentId,
      };
      if (isPost) {
        await AddNewCommentForPost(targetId, payload);
      } else {
        await AddNewCommentForProduct(targetId, payload);
      }
      setReplyContent("");
      setReplyingTo(null);
      await loadComments();
    } catch (error) {
      console.error("Lỗi trả lời bình luận:", error);
      handleActionError(error, "Không thể gửi trả lời, vui lòng thử lại.");
    } finally {
      setReplySubmitting(false);
    }
  };

  const handleReplyKeyDown = (e, comment) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleReplySubmit(comment);
    } else if (e.key === "Escape") {
      setReplyingTo(null);
      setReplyContent("");
    }
  };

  const renderComment = (c) => {
    const commentId = commentIdOf(c);
    const isAdmin = String(c.roleName ?? "").toLowerCase() === "admin";
    const isAuthor = isAuthorComment(c);
    const own = isOwn(c);
    const busy = actingIds.has(commentId);

    const repliesBlock = c.replies?.length > 0 && (
      <div className="mt-3 space-y-3 border-l-2 border-sky-100 pl-3 sm:pl-4">
        {c.replies.map((r) => renderComment(r))}
      </div>
    );

    if (c.isHidden) {
      return (
        <div key={commentId}>
          <div className="flex items-center gap-3 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3">
            <EyeOff className="h-4 w-4 shrink-0 text-slate-400" />
            <p className="flex-1 text-sm italic text-slate-400">
              Bình luận này đã bị ẩn bởi quản trị viên.
            </p>
            {isAdminViewer && (
              <Button
                size="sm"
                variant="outline"
                disabled={busy}
                onClick={() => handleUnhide(c)}
                className="rounded-lg"
              >
                <Eye className="mr-1.5 h-3.5 w-3.5" />
                Hiện
              </Button>
            )}
          </div>
          {repliesBlock}
        </div>
      );
    }

    return (
      <div key={commentId}>
        <div className="flex gap-3 rounded-xl border border-sky-100 bg-white p-4 shadow-sm transition hover:border-sky-200 hover:shadow">
          <Avatar className="h-10 w-10 shrink-0 ring-2 ring-sky-100">
            <AvatarImage src={c.userAvatarUrl} />
            <AvatarFallback className="bg-sky-100 text-sky-700">
              {(c.userName ?? c.user)?.[0] ?? "U"}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`font-semibold text-sm ${isAdmin ? "rounded bg-yellow-200 px-1.5 py-0.5 text-yellow-900" : ""}`}
              >
                {c.userName ?? c.user}
              </span>
              {isAuthor && (
                <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[11px] font-semibold text-sky-700 ring-1 ring-inset ring-sky-200">
                  Tác giả
                </span>
              )}
              <span className="text-xs text-slate-400">
                {c.createdAt
                  ? new Date(c.createdAt).toLocaleString("vi-VN")
                  : ""}
              </span>
            </div>

            {editingId === commentId ? (
              <div className="space-y-2 pt-1">
                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  onKeyDown={(e) => handleEditKeyDown(e, c)}
                  className="min-h-[70px] resize-none rounded-xl border-sky-100 focus-visible:border-sky-300 focus-visible:ring-sky-400"
                />
                <div className="flex justify-end gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditingId(null);
                      setEditContent("");
                    }}
                    className="rounded-lg"
                  >
                    Hủy
                  </Button>
                  <Button
                    size="sm"
                    disabled={!editContent.trim() || busy}
                    onClick={() => handleSaveEdit(c)}
                    className="rounded-lg bg-gradient-to-r from-sky-500 to-teal-500 font-semibold text-white hover:from-sky-600 hover:to-teal-600"
                  >
                    Lưu
                  </Button>
                </div>
              </div>
            ) : (
              <p className="break-words text-sm leading-relaxed text-zinc-700">
                {c.commentContent ?? c.content}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1">
              <button
                type="button"
                onClick={() => handleToggleLike(c)}
                disabled={likingIds.has(commentId)}
                className={`flex items-center gap-1.5 text-xs transition-colors ${c.isLiked ? "text-red-500" : "text-slate-400 hover:text-sky-600"}`}
              >
                <ThumbsUp
                  className={`h-3.5 w-3.5 ${c.isLiked ? "fill-red-500" : ""}`}
                />
                {(c.likeCount ?? 0) > 0 && <span>{c.likeCount}</span>}
                <span>Thích</span>
              </button>

              <button
                type="button"
                onClick={() => startReply(c)}
                className="flex items-center gap-1.5 text-xs text-slate-400 transition-colors hover:text-sky-600"
              >
                <Reply className="h-3.5 w-3.5" />
                <span>Phản hồi</span>
              </button>

              {own && (
                <>
                  <button
                    type="button"
                    onClick={() => startEdit(c)}
                    className="flex items-center gap-1.5 text-xs text-slate-400 transition-colors hover:text-sky-600"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    <span>Sửa</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(c)}
                    disabled={busy}
                    className="flex items-center gap-1.5 text-xs text-slate-400 transition-colors hover:text-red-500"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Xóa</span>
                  </button>
                </>
              )}

              {isAdminViewer && (
                <button
                  type="button"
                  onClick={() => handleHide(c)}
                  disabled={busy}
                  className="flex items-center gap-1.5 text-xs text-slate-400 transition-colors hover:text-amber-600"
                >
                  <EyeOff className="h-3.5 w-3.5" />
                  <span>Ẩn</span>
                </button>
              )}
            </div>

            {replyingTo === commentId && (
              <div className="space-y-2 pt-2">
                <Textarea
                  placeholder={`Trả lời ${c.userName ?? ""}...`}
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  onKeyDown={(e) => handleReplyKeyDown(e, c)}
                  className="min-h-[70px] resize-none rounded-xl border-sky-100 focus-visible:border-sky-300 focus-visible:ring-sky-400"
                />
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs text-slate-400">
                    Nhấn Enter để gửi, Shift + Enter để xuống dòng.
                  </p>
                  <div className="flex shrink-0 gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setReplyingTo(null);
                        setReplyContent("");
                      }}
                      className="rounded-lg"
                    >
                      Hủy
                    </Button>
                    <Button
                      size="sm"
                      disabled={!replyContent.trim() || replySubmitting}
                      onClick={() => handleReplySubmit(c)}
                      className="rounded-lg bg-gradient-to-r from-sky-500 to-teal-500 font-semibold text-white hover:from-sky-600 hover:to-teal-600"
                    >
                      {replySubmitting ? "Đang gửi..." : "Gửi"}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        {repliesBlock}
      </div>
    );
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6 flex items-center gap-2.5">
        <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-teal-500 text-white shadow-sm shadow-sky-600/20">
          <MessageSquare className="size-4" />
        </span>
        <h2 className="text-xl font-bold">Bình luận</h2>
        <span className="rounded-full bg-sky-100 px-2.5 py-0.5 text-xs font-semibold text-sky-700 ring-1 ring-inset ring-sky-200">
          {comments.length}
        </span>
      </div>

      {checkingAuth ? (
        <div className="mb-8 flex items-center justify-center gap-2 rounded-xl border border-sky-100 bg-sky-50/50 px-4 py-6 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin text-sky-500" />
          Đang kiểm tra đăng nhập...
        </div>
      ) : !currentUser ? (
        <div className="mb-8 flex flex-col items-center gap-3 rounded-xl border border-sky-100 bg-sky-50/50 px-4 py-6 text-center">
          <p className="text-sm text-slate-500">
            Đăng nhập để tham gia bình luận.
          </p>
          <Button
            onClick={() => navigate("/login")}
            className="rounded-xl bg-gradient-to-r from-sky-500 to-teal-500 font-semibold text-white shadow-md shadow-sky-600/20 hover:from-sky-600 hover:to-teal-600"
          >
            Đăng nhập
          </Button>
        </div>
      ) : (
        <div className="mb-8 space-y-3">
          <Textarea
            placeholder="Viết bình luận của bạn..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={handleKeyDown}
            className="min-h-[100px] resize-none rounded-xl border-sky-100 bg-white focus-visible:border-sky-300 focus-visible:ring-sky-400"
          />

          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-400">
              Nhấn Enter để gửi, Shift + Enter để xuống dòng.
            </p>
            <Button
              onClick={handleSubmit}
              disabled={!newComment.trim() || loading || submitting}
              className="rounded-xl bg-gradient-to-r from-sky-500 to-teal-500 font-semibold text-white shadow-md shadow-sky-600/20 hover:from-sky-600 hover:to-teal-600"
            >
              {submitting ? "Đang gửi..." : "Gửi bình luận"}
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {loading ? (
          <p className="flex items-center justify-center gap-2 py-8 text-sm text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin text-sky-500" />
            Đang tải bình luận...
          </p>
        ) : comments.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-sky-200 bg-sky-50/50 px-4 py-10 text-center">
            <span className="flex size-11 items-center justify-center rounded-full bg-sky-100 text-sky-500">
              <MessageSquare className="size-5" />
            </span>
            <p className="text-sm text-slate-500">
              Chưa có bình luận nào. Hãy là người đầu tiên!
            </p>
          </div>
        ) : (
          comments.map((c) => renderComment(c))
        )}
      </div>
    </div>
  );
}
