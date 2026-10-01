import React from "react";
import { Link, useParams } from "react-router-dom";
import { ChevronLeft, Eye, Heart, Clock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import Comments from "@/components/common/Comment";
import { postDetail, postComments } from "@/utils/demo/postDetailDemo";

const PostDetail = () => {
  const { id } = useParams(); // sau này dùng gọi API

  const post = postDetail;
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Back */}
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild className="gap-1.5 -ml-2">
            <Link to="/post">
              <ChevronLeft className="h-4 w-4" />
              Quay lại
            </Link>
          </Button>
        </div>

        <article className="max-w-3xl mx-auto">
          {/* Category + tags */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <Badge variant="secondary">{post.category}</Badge>
            {post.tags?.map((tag) => (
              <Badge key={tag} variant="outline" className="font-normal">
                {tag}
              </Badge>
            ))}
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight mb-4">
            {post.title}
          </h1>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
            <div className="flex items-center gap-2">
              <Avatar className="h-9 w-9">
                <AvatarImage src={post.author?.avatar} />
                <AvatarFallback>{post.author?.name?.[0]}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-foreground text-sm">
                  {post.author?.name}
                </p>
                <p className="text-xs">
                  {post.author?.role === "expert" ? "Chuyên gia" : "Thành viên"}
                </p>
              </div>
            </div>

            <span>·</span>
            <span>{post.publishedAt}</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {post.readTime}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" />
              {post.views}
            </span>
            <span className="flex items-center gap-1">
              <Heart className="h-3.5 w-3.5" />
              {post.likes}
            </span>
          </div>

          {/* Cover */}
          {post.coverImage && (
            <div className="aspect-[16/9] overflow-hidden rounded-2xl border bg-muted mb-8">
              <img
                src={post.coverImage}
                alt={post.title}
                className="h-full w-full object-cover"
              />
            </div>
          )}

          {/* Excerpt */}
          {post.excerpt && (
            <p className="text-lg text-muted-foreground leading-relaxed mb-8 border-l-4 border-primary/40 pl-4">
              {post.excerpt}
            </p>
          )}

          {/* Content */}
          <div
            className="prose prose-neutral dark:prose-invert max-w-none
              prose-headings:font-semibold
              prose-p:leading-relaxed
              prose-a:text-primary mb-4"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </article>

        <Separator className="my-10 md:my-14 max-w-3xl mx-auto" />

        {/* Comments dùng chung */}
        <div className="max-w-3xl mx-auto">
          <Comments comments={postComments} title="Bình luận" />
        </div>
      </div>
    </div>
  );
};

export default PostDetail;
