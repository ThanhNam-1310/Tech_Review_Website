import React from "react";
import { Link } from "react-router-dom";
import { Eye, Heart, Lock, Star } from "lucide-react";

const formatDate = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  return isNaN(d) ? "" : d.toLocaleDateString("vi-VN");
};

const PostBadges = ({ post }) => {
  if (!post.isHightLight && !post.isPrivate) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {post.isHightLight && (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500 px-2 py-0.5 text-[11px] font-semibold text-white">
          <Star className="h-3 w-3 fill-white" />
          Nổi bật
        </span>
      )}
      {post.isPrivate && (
        <span className="inline-flex items-center gap-1 rounded-full bg-zinc-700 px-2 py-0.5 text-[11px] font-semibold text-white">
          <Lock className="h-3 w-3" />
          Riêng tư
        </span>
      )}
    </div>
  );
};

const PostMeta = ({ post, className = "" }) => (
  <p
    className={`flex flex-wrap items-center gap-x-3 gap-y-1 text-muted-foreground ${className}`}
  >
    {post.authorName && (
      <span className="font-medium text-foreground/80">{post.authorName}</span>
    )}
    {post.publicDate && <span>{formatDate(post.publicDate)}</span>}
    <span className="inline-flex items-center gap-1">
      <Eye className="h-3.5 w-3.5" />
      {post.viewCount ?? 0}
    </span>
    <span className="inline-flex items-center gap-1">
      <Heart className="h-3.5 w-3.5" />
      {post.likeCount ?? 0}
    </span>
  </p>
);

export default function PostCard({ post, variant = "row" }) {
  if (!post) return null;
  const href = `/post/${post.id}`;

  // ===== Card lớn (bài hero ở giữa mục Nổi bật hôm nay) =====
  if (variant === "featured") {
    return (
      <Link to={href} className="group block">
        <div className="relative overflow-hidden rounded-xl border">
          {post.thumbnailUrl ? (
            <img
              src={post.thumbnailUrl}
              alt={post.title}
              className="aspect-[16/9] w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="aspect-[16/9] w-full bg-muted" />
          )}
          <div className="absolute left-3 top-3">
            <PostBadges post={post} />
          </div>
        </div>
        <h3 className="mt-3 text-xl font-bold leading-snug transition-colors group-hover:text-primary line-clamp-2 md:text-2xl">
          {post.title}
        </h3>
        <PostMeta post={post} className="mt-2 text-sm" />
      </Link>
    );
  }

  // ===== Card dọc (dùng cho lưới bài viết nếu cần) =====
  if (variant === "card") {
    return (
      <Link to={href} className="group block">
        <div className="relative overflow-hidden rounded-xl border">
          {post.thumbnailUrl ? (
            <img
              src={post.thumbnailUrl}
              alt={post.title}
              className="aspect-video w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="aspect-video w-full bg-muted" />
          )}
          <div className="absolute left-3 top-3">
            <PostBadges post={post} />
          </div>
        </div>
        <h3 className="mt-3 font-semibold leading-snug transition-colors group-hover:text-primary line-clamp-2">
          {post.title}
        </h3>
        <PostMeta post={post} className="mt-1.5 text-xs" />
      </Link>
    );
  }

  // ===== Dạng hàng ngang (list theo chủ đề) =====
  return (
    <Link to={href} className="group flex gap-4 py-4">
      {post.thumbnailUrl ? (
        <img
          src={post.thumbnailUrl}
          alt={post.title}
          className="aspect-[4/3] w-36 shrink-0 rounded-lg border object-cover md:w-44"
        />
      ) : (
        <div className="aspect-[4/3] w-36 shrink-0 rounded-lg border bg-muted md:w-44" />
      )}
      <div className="min-w-0 flex-1">
        <PostBadges post={post} />
        <h3 className="mt-1 font-semibold leading-snug transition-colors group-hover:text-primary line-clamp-2">
          {post.title}
        </h3>
        <PostMeta post={post} className="mt-1.5 text-xs" />
      </div>
    </Link>
  );
}
