import { useSearchParams, Link } from "react-router";
import { trpc } from "@/providers/trpc";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PostCard from "@/components/PostCard";
import { PenLine, Hash, Home as HomeIcon, Info, TrendingUp } from "lucide-react";

const ALL_TOPICS = [
  "Technology", "Design", "Productivity", "Creativity",
  "Leadership", "Wellness", "Writing", "Startup",
];

const TOPIC_DOT: Record<string, string> = {
  Technology: "text-blue-500",
  Design: "text-purple-500",
  Productivity: "text-green-500",
  Creativity: "text-orange-500",
  Leadership: "text-red-500",
  Wellness: "text-teal-500",
  Writing: "text-yellow-500",
  Startup: "text-pink-500",
};

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get("q") ?? "";
  const selectedTopic = searchParams.get("topic") ?? undefined;

  const { data: posts, isLoading } = trpc.post.list.useQuery({
    search: searchQuery || undefined,
    topic: selectedTopic,
  });

  const allPosts = posts ?? [];

  const setTopic = (topic: string | undefined) => {
    const params = new URLSearchParams(searchParams);
    if (topic) params.set("topic", topic);
    else params.delete("topic");
    params.delete("q");
    setSearchParams(params, { replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14">
        <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] xl:grid-cols-[220px_1fr_280px] gap-8 py-8">

          {/* Left Sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-20 space-y-6">
              {/* Nav */}
              <nav className="space-y-0.5">
                <Link
                  to="/"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-blue-700 bg-blue-50"
                >
                  <HomeIcon size={16} />
                  Home
                </Link>
                <Link
                  to="/write"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  <PenLine size={16} />
                  Write
                </Link>
                <Link
                  to="/about"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  <Info size={16} />
                  About
                </Link>
              </nav>

              <div className="border-t border-gray-200" />

              {/* Topics */}
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest px-3 mb-2">Topics</p>
                <nav className="space-y-0.5">
                  {ALL_TOPICS.map((t) => (
                    <button
                      key={t}
                      onClick={() => setTopic(selectedTopic === t ? undefined : t)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors text-left ${
                        selectedTopic === t
                          ? "bg-blue-50 text-blue-700 font-semibold"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      <Hash size={13} className={selectedTopic === t ? "text-blue-600" : (TOPIC_DOT[t] ?? "text-gray-400")} />
                      {t}
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          </aside>

          {/* Main Feed */}
          <main className="min-w-0">
            {/* Mobile topic pills */}
            <div className="lg:hidden flex items-center gap-2 overflow-x-auto pb-3 mb-4 scrollbar-hide">
              <button
                onClick={() => setTopic(undefined)}
                className={`shrink-0 text-xs font-medium px-3 py-1.5 rounded-full border transition-all ${
                  !selectedTopic
                    ? "bg-blue-600 text-white border-blue-600"
                    : "border-gray-200 text-gray-600 hover:border-blue-400"
                }`}
              >
                All
              </button>
              {ALL_TOPICS.map((t) => (
                <button
                  key={t}
                  onClick={() => setTopic(selectedTopic === t ? undefined : t)}
                  className={`shrink-0 flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-full border transition-all ${
                    selectedTopic === t
                      ? "bg-blue-600 text-white border-blue-600"
                      : "border-gray-200 text-gray-600 hover:border-blue-400"
                  }`}
                >
                  <Hash size={10} />{t}
                </button>
              ))}
            </div>

            {/* Feed header */}
            <div className="flex items-center justify-between mb-1 pb-3 border-b border-gray-200">
              <h1 className="text-base font-bold text-gray-900">
                {selectedTopic
                  ? `#${selectedTopic.toLowerCase()}`
                  : searchQuery
                  ? `Results for "${searchQuery}"`
                  : "Latest articles"}
              </h1>
              {allPosts.length > 0 && (
                <span className="text-xs text-gray-400">{allPosts.length} article{allPosts.length !== 1 ? "s" : ""}</span>
              )}
            </div>

            {isLoading ? (
              <div>
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex gap-4 py-6 border-b border-gray-100 animate-pulse px-3">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-gray-200" />
                        <div className="w-24 h-3 rounded bg-gray-200" />
                      </div>
                      <div className="w-3/4 h-5 rounded bg-gray-200" />
                      <div className="w-full h-4 rounded bg-gray-200" />
                      <div className="w-1/2 h-3 rounded bg-gray-200" />
                    </div>
                    <div className="w-24 h-16 rounded-lg bg-gray-200 shrink-0" />
                  </div>
                ))}
              </div>
            ) : allPosts.length > 0 ? (
              <div>
                {allPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    id={post.id}
                    title={post.title}
                    excerpt={post.excerpt}
                    authorName={post.authorName}
                    authorAvatar={post.authorAvatar}
                    coverImage={post.coverImage}
                    publishedAt={post.publishedAt}
                    likeCount={post.likeCount}
                    commentCount={post.commentCount}
                    topic={post.topic}
                  />
                ))}
              </div>
            ) : (
              <div className="py-20 text-center">
                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                  <PenLine size={24} className="text-gray-400" />
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-1">No articles yet</h3>
                <p className="text-sm text-gray-500 mb-6">
                  {searchQuery
                    ? `No results for "${searchQuery}"`
                    : "Be the first to share your thoughts."}
                </p>
                <Link
                  to="/write"
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2.5 rounded-full transition-colors"
                >
                  <PenLine size={14} />
                  Write a post
                </Link>
              </div>
            )}
          </main>

          {/* Right Sidebar */}
          <aside className="hidden xl:block">
            <div className="sticky top-20 space-y-5">
              {/* Trending Tags */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp size={14} className="text-blue-600" />
                  <h3 className="text-sm font-semibold text-gray-900">Trending Tags</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {ALL_TOPICS.map((t) => (
                    <button
                      key={t}
                      onClick={() => setTopic(selectedTopic === t ? undefined : t)}
                      className={`text-xs font-medium px-2.5 py-1 rounded-full border transition-all ${
                        selectedTopic === t
                          ? "bg-blue-600 text-white border-blue-600"
                          : "border-gray-200 text-gray-600 hover:border-blue-400 hover:text-blue-600"
                      }`}
                    >
                      #{t.toLowerCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Write CTA */}
              <div className="bg-blue-600 rounded-xl p-5 text-white">
                <h3 className="text-sm font-bold mb-1">Start writing today</h3>
                <p className="text-xs text-blue-100 leading-relaxed mb-4">
                  Share your knowledge and ideas with a global community. No account needed.
                </p>
                <Link
                  to="/write"
                  className="inline-flex items-center gap-1.5 bg-white text-blue-600 text-xs font-semibold px-4 py-2 rounded-full hover:bg-blue-50 transition-colors"
                >
                  <PenLine size={12} />
                  Write an article
                </Link>
              </div>

              {/* Stats */}
              {allPosts.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Community</h3>
                  <div className="space-y-2.5">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Total articles</span>
                      <span className="font-semibold text-gray-900">{allPosts.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Topics</span>
                      <span className="font-semibold text-gray-900">
                        {new Set(allPosts.map((p) => p.topic).filter(Boolean)).size}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Total likes</span>
                      <span className="font-semibold text-gray-900">
                        {allPosts.reduce((sum, p) => sum + p.likeCount, 0)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </aside>

        </div>
      </div>

      <Footer />
    </div>
  );
}