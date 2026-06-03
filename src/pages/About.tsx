import { Link } from "react-router";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { PenLine, Heart, MessageCircle, Users, Zap, Globe } from "lucide-react";

const features = [
  {
    icon: PenLine,
    title: "Write",
    description:
      "A distraction-free writing environment designed to help you focus on what matters — your words and ideas.",
  },
  {
    icon: Heart,
    title: "Engage",
    description:
      "Like posts that resonate with you. Build a collection of favorite reads and show appreciation to fellow writers.",
  },
  {
    icon: MessageCircle,
    title: "Connect",
    description:
      "Leave thoughtful comments, start conversations, and build relationships with writers who share your interests.",
  },
  {
    icon: Users,
    title: "Community",
    description:
      "Join a growing community of writers, thinkers, and storytellers from around the world.",
  },
  {
    icon: Zap,
    title: "Discover",
    description:
      "Find content tailored to your interests with trending topics and curated recommendations.",
  },
  {
    icon: Globe,
    title: "Share",
    description:
      "Your stories reach readers globally. Share your unique perspective with the world.",
  },
];

export default function About() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero */}
      <section className="pt-28 pb-16 bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight tracking-tight">
            About Flowbotiq
          </h1>
          <p className="mt-5 text-lg text-gray-500 leading-relaxed">
            We believe everyone has a story worth sharing. Flowbotiq is a space
            where writers and readers come together to exchange ideas, spark
            conversations, and build a community around the written word.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <img
                src="/cover-writing.jpg"
                alt="Writing"
                className="rounded-xl w-full object-cover aspect-[4/3] bg-gray-100"
              />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                Our Mission
              </h2>
              <p className="text-gray-500 leading-relaxed mb-4">
                In a world of fleeting content and endless scrolling, we wanted
                to create a space for depth — where ideas are explored, stories
                are told with care, and readers find substance.
              </p>
              <p className="text-gray-500 leading-relaxed">
                Flowbotiq is built on the belief that writing is thinking, and
                sharing your thinking is one of the most valuable things you can
                do. Whether you are an experienced writer or just starting out,
                your perspective matters.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 bg-white border-t border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              What You Can Do
            </h2>
            <p className="mt-3 text-gray-500">
              Everything you need to write, share, and connect
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-gray-50 rounded-xl border border-gray-200 p-5 hover:border-blue-200 hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon size={18} className="text-blue-600" />
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to start writing?
          </h2>
          <p className="text-gray-500 mb-8">
            Join writers who are already sharing their stories on Flowbotiq. No account needed.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/write"
              className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-7 py-3 rounded-full transition-colors"
            >
              <PenLine size={16} />
              Start Writing
            </Link>
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 bg-white border border-gray-200 hover:border-gray-300 text-gray-700 font-medium px-7 py-3 rounded-full transition-all"
            >
              Explore Feed
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}