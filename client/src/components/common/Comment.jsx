import { useState, useEffect } from "react";
import { MessageSquare, ThumbsUp } from "lucide-react";

import {
  GetAllCommentPost,
  GetAllCommentProduct,
  AddNewCommentForPost,
  AddNewCommentForProduct,
} from "@/apis/comment.api";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Comments({ type, targetId }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);

  const isPost = type === "post";

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
    if (!newComment.trim()) return;

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
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <MessageSquare className="h-5 w-5" />
        <h2 className="text-xl font-bold">Bình luận ({comments.length})</h2>
      </div>

      <div className="mb-8 space-y-3">
        <Textarea
          placeholder="Viết bình luận của bạn..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="min-h-[100px] resize-none"
        />

        <div className="flex justify-end">
          <Button
            onClick={handleSubmit}
            disabled={!newComment.trim() || loading}
          >
            Gửi bình luận
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {loading ? (
          <p>Đang tải bình luận...</p>
        ) : comments.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            Chưa có bình luận nào. Hãy là người đầu tiên!
          </p>
        ) : (
          comments.map((c) => (
            <div key={c.commentId ?? c.id} className="flex gap-3">
              <Avatar className="h-10 w-10 shrink-0">
                <AvatarImage src={c.avatarUrl ?? c.avatar} />
                <AvatarFallback>
                  {(c.userName ?? c.user)?.[0] ?? "U"}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">
                    {c.userName ?? c.user}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {c.createdAt
                      ? new Date(c.createdAt).toLocaleString("vi-VN")
                      : ""}
                  </span>
                </div>

                <p className="text-sm leading-relaxed">
                  {c.commentContent ?? c.content}
                </p>

                <button
                  type="button"
                  className="flex items-center gap-1.5 text-xs text-muted-foreground"
                >
                  <ThumbsUp className="h-3.5 w-3.5" />
                  {(c.likeCount ?? c.likes) > 0 && (
                    <span>{c.likeCount ?? c.likes}</span>
                  )}
                  <span>Thích</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
