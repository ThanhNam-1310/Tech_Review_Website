import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";

const SectionTopics = ({ topics = [], getHref }) => {
  const hrefOf = getHref ?? ((topic) => `/post?categoryId=${topic.id}`);

  return (
    <section>
      <div className="relative mb-6">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-primary" />
        <h3 className="relative inline-block text-[11px] font-bold uppercase tracking-wider px-2 py-1 bg-primary text-primary-foreground">
          Khám phá theo chủ đề
        </h3>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {topics.map((topic) => (
          <Link key={topic.id} to={hrefOf(topic)}>
            <Card className="transition-colors hover:border-primary hover:bg-muted/50">
              <CardContent className="flex items-center justify-center px-4 py-8">
                <span className="text-sm font-semibold text-center">
                  {topic.name}
                </span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default SectionTopics;
