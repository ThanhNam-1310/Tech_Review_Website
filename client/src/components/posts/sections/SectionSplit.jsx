import React from "react";
import PostCard from "../PostCard";

const SectionSplit = ({ featured, posts = [], title }) => {
  return (
    <section>
      {/* Title */}
      <div className="relative mb-6">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-orange-500 via-amber-400 to-transparent" />
        <h3 className="relative inline-block rounded-b-lg bg-gradient-to-r from-orange-500 to-amber-500 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white shadow-sm shadow-orange-500/25">
          {title}
        </h3>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Trái: 1 bài tiêu biểu */}
        <div>{featured && <PostCard post={featured} variant="featured" />}</div>

        {/* Phải: list dọc */}
        <div className="flex flex-col gap-3">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} variant="row" />
          ))}
        </div>
      </div>
    </section>
  );
};

export default SectionSplit;
