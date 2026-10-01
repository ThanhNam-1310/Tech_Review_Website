import React from "react";
import { Heart } from "lucide-react";
import { Link } from "react-router-dom";
import {
  todayHighlights,
  mainFeatured,
  favorites,
  topicCards,
  section3Featured,
  section3List,
} from "@/utils/demo/postDemo";
import SectionSplit from "@/components/posts/sections/SectionSplit";
import SectionTodayPicks from "@/components/posts/sections/SectionTodayPicks";
import SectionTopics from "@/components/posts/sections/SectionTopics";

const PostReviewPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-10 md:py-14 space-y-16 md:space-y-20">
        <SectionTodayPicks
          highlights={todayHighlights}
          featured={mainFeatured}
          favorites={favorites}
        />

        <SectionTopics topics={topicCards} />

        <SectionSplit
          featured={section3Featured}
          posts={section3List}
          title="Điện thoại thông minh"
        />
      </div>
    </div>
  );
};

export default PostReviewPage;
