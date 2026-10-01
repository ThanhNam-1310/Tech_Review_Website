import React from "react";
import PostCard from "../PostCard";

const SectionTopics = ({ topics = [] }) => {
  return (
    <section>
      <div className="relative mb-6">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-primary" />
        <h3 className="relative inline-block text-[11px] font-bold uppercase tracking-wider px-2 py-1 bg-primary text-primary-foreground">
          Khám phá theo chủ đề
        </h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {topics.map((topic) => (
          <PostCard key={topic.id} post={topic} variant="topic" />
        ))}
      </div>
    </section>
  );
};

export default SectionTopics;
