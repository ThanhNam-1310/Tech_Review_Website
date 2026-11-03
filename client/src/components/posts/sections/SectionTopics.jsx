import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { getCategoryStyle } from "@/utils/constants/categoryColors";

const SectionTopics = ({ topics = [], getHref }) => {
  const hrefOf = getHref ?? ((topic) => `/post?categoryId=${topic.id}`);

  return (
    <section>
      <div className="relative mb-6">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-orange-500 via-amber-400 to-transparent" />
        <h3 className="relative inline-block rounded-b-lg bg-gradient-to-r from-orange-500 to-amber-500 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white shadow-sm shadow-orange-500/25">
          Khám phá theo chủ đề
        </h3>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {topics.map((topic) => {
          const cat = getCategoryStyle(topic.id ?? topic.name);
          return (
            <Link key={topic.id} to={hrefOf(topic)}>
              <Card
                className={`${cat.bg} ${cat.border} transition-all hover:-translate-y-0.5 hover:shadow-md`}
              >
                <CardContent className="flex items-center justify-center px-4 py-8">
                  <span
                    className={`text-sm font-semibold text-center ${cat.text}`}
                  >
                    {topic.name}
                  </span>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default SectionTopics;
