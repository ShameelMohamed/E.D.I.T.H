import { Suspense } from "react";
import HudHeader from "@/components/HudHeader";
import FeedList from "@/components/FeedList";
import FeedLoader from "@/components/FeedLoader";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <HudHeader />
      
      {/* Tactical Data Feed */}
      <div className="flex-1 flex flex-col items-center justify-start p-4 md:p-8 pt-12">
        <Suspense fallback={<FeedLoader />}>
          <FeedList />
        </Suspense>
      </div>
    </div>
  );
}
