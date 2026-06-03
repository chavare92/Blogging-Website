import { Link } from "react-router";
import { Heart, MessageCircle, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const TOPIC_COLORS: Record<string, string> = {
  Technology:   "bg-blue-50 text-blue-700",
  Design:       "bg-purple-50 text-purple-700",
  Productivity: "bg-green-50 text-green-700",
  Creativity:   "bg-orange-50 text-orange-700",
  Leadership:   "bg-red-50 text-red-700",
  Wellness:     "bg-teal-50 text-teal-700",
  Writing:      "bg-yellow-50 text-yellow-700",
  Startup:      "bg-pink-50 text-pink-700",
};

function getInitials(name: string) {
  return name.split(" ").map((p) => p[0]).join("").toUpperCase().slice(0, 2);
}

interface PostCardProps {
  id: number;
  title: string;
  excerpt: string | null;
  authorName: string;
  authorAvatar?: string | null;
  coverImage?: string | null;
  publishedAt: Date;
  likeCount: number;
  commentCount: number;
  topic: string | null;
}

export default function PostCard({
  id, title, excerpt, authorName, authorAvatar, coverImage,
  publishedAt, likeCount, commentCount, topic,
}: PostCardProps) {
  const wordCount = (excerpt ?? title).split(/\s+/).length;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));
  const topicClass = topic ? (TOPIC_COLORS[topic] ?? "bg-gray-100 text-gray-600") : null;

  return (
    <Link
      to={`/post/${id}`}
      className="flex items-start gap-4 py-6 border-b border-gray-100 hover:bg-gray-50 rounded-lg px-3 -mx-3 transition-colors group"
    >
      {/* Text content */}
      <div className="flex-1 min-w-0">
        {/* Author row */}
        <div className="flex items-center gap-2 mb-2">
          {authorAvatar ? (
            <img src={authorAvatar} alt={authorName} className="w-5 h-5 rounded-full object-cover shrink-0" />
          ) : (
            <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-white text-[8px] font-bold shrink-0">
              {getInitials(authorName)}
            </div>
          )}
          <span className="text-xs font-medium text-gray-700 truncate">{authorName}</span>
          <span className="text-gray-300 shrink-0">·</span>
          <span className="text-xs text-gray-400 shrink-0">
            {formatDistanceToNow(new Date(publishedAt), { addSuffix: true })}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-gray-900 leading-snug group-hover:text-blue-600 transition-colors line-clamp-2 mb-1">
          {title}
        </h3>

        {/* Excerpt */}
        {excerpt && (
          <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 mb-3">{excerpt}</p>
        )}

        {/* Footer: topic + meta */}
        <div className="flex items-center gap-3 flex-wrap">
          {topicClass && topic && (
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${topicClass}`}>
              #{topic.toLowerCase()}
            </span>
          )}
          <span className="flex items-center gap-1 text-xs text-gray-400">
            <Clock size={11} />{readTime} min read
          </span>
          <span className="flex items-center gap-1 text-xs text-gray-400">
            <Heart size={11} />{likeCount}
          </span>
          <span className="flex items-center gap-1 text-xs text-gray-400">
            <MessageCircle size={11} />{commentCount}
          </span>
        </div>
      </div>

      {/* Cover image */}
      {coverImage && (
        <div className="shrink-0 w-24 h-16 sm:w-28 sm:h-20 rounded-lg overflow-hidden bg-gray-100">
          <img src={coverImage} alt={title} className="w-full h-full object-cover" />
        </div>
      )}
    </Link>
  );
}
