import React from "react";
import PostCard from "../PostCard";

const SectionSplit = ({ featured, posts = [], title }) => {
  return (
    <section>
      {/* Title */}
      <div className="relative mb-6">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-primary" />
        <h3 className="relative inline-block text-[11px] font-bold uppercase tracking-wider px-2 py-1 bg-primary text-primary-foreground">
          {title}
        </h3>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Trái: 1 bài tiêu biểu */}
        <div>{featured && <PostCard post={featured} variant="featured" />}</div>

        {/* Phải: list dọc */}
        <div className="flex flex-col divide-y">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} variant="row" />
          ))}
        </div>
      </div>
    </section>
  );
};

export default SectionSplit;
