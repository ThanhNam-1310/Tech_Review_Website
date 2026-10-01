import React from "react";
import { Link } from "react-router-dom";

const PostCard = ({ post, variant = "default" }) => {
  // variant: "default" | "featured" | "row" | "topic"
  if (variant === "topic") {
    return (
      <Link
        to={`/posts?category=${post.slug}`}
        className="group relative aspect-[4/3] overflow-hidden rounded-xl block"
      >
        <img
          src={post.image}
          alt={post.title}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <h4 className="font-bold text-lg">{post.title}</h4>
          {post.description && (
            <p className="text-sm text-white/80 mt-0.5">{post.description}</p>
          )}
        </div>
      </Link>
    );
  }

  if (variant === "row") {
    return (
      <Link
        to={`/post/${post.slug || post.id}`}
        className="group flex gap-4 py-5 first:pt-0 last:pb-0"
      >
        <div className="w-28 h-20 shrink-0 overflow-hidden rounded-lg bg-muted">
          <img
            src={post.coverImage}
            alt={post.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1">
            {post.category}
          </p>
          <h4 className="font-semibold leading-snug group-hover:text-primary transition-colors line-clamp-2">
            {post.title}
          </h4>
          <p className="text-xs text-muted-foreground mt-1.5">
            {post.author} · {post.publishedAt}
          </p>
        </div>
      </Link>
    );
  }

  // default + featured
  const isFeatured = variant === "featured";

  return (
    <Link to={`/posts/${post.slug || post.id}`} className="group block">
      <div
        className={`overflow-hidden bg-muted mb-4 ${
          isFeatured ? "aspect-[16/10] rounded-xl" : "aspect-[16/10] rounded-lg"
        }`}
      >
        <img
          src={post.coverImage}
          alt={post.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
        {post.category}
      </p>

      <h3
        className={`font-bold leading-tight group-hover:text-primary transition-colors ${
          isFeatured ? "text-2xl md:text-3xl mb-3" : "text-base mb-2"
        }`}
      >
        {post.title}
      </h3>

      {post.excerpt && (
        <p className="text-muted-foreground leading-relaxed mb-3 line-clamp-2 text-sm md:text-base">
          {post.excerpt}
        </p>
      )}

      <p className="text-sm text-muted-foreground">
        {post.author}
        {post.publishedAt && ` · ${post.publishedAt}`}
        {post.readTime && ` · ${post.readTime}`}
      </p>
    </Link>
  );
};

export default PostCard;
