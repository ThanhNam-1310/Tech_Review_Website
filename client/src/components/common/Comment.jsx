import { useState } from "react";
import { MessageSquare, ThumbsUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Comments({
  comments: initialComments = [],
  title = "Bình luận",
}) {
  const [comments, setComments] = useState(initialComments);
  const [newComment, setNewComment] = useState("");

  const handleSubmit = () => {
    if (!newComment.trim()) return;

    const comment = {
      id: Date.now(),
      user: "Bạn",
      avatar: "https://i.pravatar.cc/100?img=12",
      content: newComment.trim(),
      createdAt: "Vừa xong",
      likes: 0,
    };

    setComments([comment, ...comments]);
    setNewComment("");
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <MessageSquare className="h-5 w-5" />
        <h2 className="text-xl font-bold">
          {title} ({comments.length})
        </h2>
      </div>

      {/* Form */}
      <div className="mb-8 space-y-3">
        <Textarea
          placeholder="Viết bình luận của bạn..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="min-h-[100px] resize-none"
        />
        <div className="flex justify-end">
          <Button onClick={handleSubmit} disabled={!newComment.trim()}>
            Gửi bình luận
          </Button>
        </div>
      </div>

      {/* List */}
      <div className="space-y-6">
        {comments.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            Chưa có bình luận nào. Hãy là người đầu tiên!
          </p>
        ) : (
          comments.map((c) => (
            <div key={c.id} className="flex gap-3">
              <Avatar className="h-10 w-10 shrink-0">
                <AvatarImage src={c.avatar} />
                <AvatarFallback>{c.user?.[0] || "U"}</AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">{c.user}</span>
                  <span className="text-xs text-muted-foreground">
                    {c.createdAt}
                  </span>
                </div>
                <p className="text-sm leading-relaxed">{c.content}</p>
                <button
                  type="button"
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mt-1"
                >
                  <ThumbsUp className="h-3.5 w-3.5" />
                  {c.likes > 0 && <span>{c.likes}</span>}
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
