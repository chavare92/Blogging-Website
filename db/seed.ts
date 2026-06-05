import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { posts } from "./schema";
import * as dotenv from "dotenv";

dotenv.config();

const samplePosts = [
  {
    title: "The Art of Deep Work in a Distracted World",
    content: `In an age of constant notifications and endless scrolling, the ability to focus deeply has become a rare and valuable skill. Deep work is not just about putting in more hours — it is about the quality of attention you bring to each task.\n\nI have found that the most impactful work happens in uninterrupted blocks of time. Whether you are writing code, designing a product, or crafting a story, the magic emerges when you give yourself the space to think deeply.\n\nHere are three practices that have transformed my workflow:\n\n1. **Time Blocking**: Dedicate specific hours to deep work and guard them fiercely. Treat these blocks as non-negotiable appointments with yourself.\n\n2. **Environment Design**: Create a workspace that signals to your brain that it is time to focus. This might mean a clean desk, noise-canceling headphones, or a specific playlist.\n\n3. **Digital Minimalism**: Turn off all non-essential notifications. Use app blockers during focus sessions. The goal is to remove friction between you and your work.\n\nThe resistance to deep work is real. Our brains are wired for novelty, and focusing on one thing for an extended period can feel uncomfortable at first. But like any muscle, your ability to concentrate strengthens with practice.\n\nStart small. Even 25 minutes of uninterrupted focus can produce remarkable results. The key is consistency — showing up day after day, training your mind to go deeper.\n\nIn a world that rewards shallow engagement, choosing depth is a radical act. It is also the path to creating work that matters.`,
    excerpt: "In an age of constant notifications and endless scrolling, the ability to focus deeply has become a rare and valuable skill. Here are three practices that transformed my workflow.",
    topic: "Productivity",
    authorName: "Sarah Mitchell",
  },
  {
    title: "Why Design Systems Are the Foundation of Great Products",
    content: `When I first started as a product designer, I treated every screen as a unique creative challenge. Each button, each color choice, each spacing decision was made from scratch. It felt artistic, but it was also incredibly inefficient.\n\nThen I discovered design systems, and everything changed.\n\nA design system is more than a component library. It is a shared language that connects designers, engineers, and product managers. It captures the principles, patterns, and practices that guide how a product looks and feels.\n\nThe benefits are immediate and compounding:\n\n**Consistency**: Users learn patterns once and apply them everywhere. A button should behave like a button, whether it appears in a settings panel or a checkout flow.\n\n**Efficiency**: Teams stop reinventing the wheel. Instead of debating button border radius for the hundredth time, they can focus on solving real user problems.\n\n**Scalability**: As products grow, design systems ensure quality does not degrade. New features naturally adopt established patterns.\n\nBuilding a design system is an investment. It requires buy-in from leadership, dedicated resources, and ongoing maintenance. But the return is a product that feels cohesive, a team that moves faster, and users who feel confident navigating your interface.\n\nStart with the basics: colors, typography, spacing, and core components. Document your decisions. Share them widely. And most importantly, treat your design system as a living product — one that evolves with your team's understanding of what great design looks like.`,
    excerpt: "A design system is more than a component library. It is a shared language that connects designers, engineers, and product managers, creating consistency and efficiency.",
    topic: "Design",
    authorName: "James Chen",
  },
  {
    title: "The Science of Creative Breakthroughs",
    content: `We have all experienced it — that moment when a solution appears seemingly out of nowhere. You have been wrestling with a problem for hours, days, or weeks, and then in the shower, on a walk, or just as you are falling asleep, the answer arrives fully formed.\n\nNeuroscience calls this the "incubation effect," and it is not magic — it is your brain's default mode network at work.\n\nWhen you step away from a problem, your brain does not stop working on it. Instead, it shifts into a different mode of processing, making connections between ideas that your conscious mind might never have linked. This is why the best ideas often come when you are not actively trying to solve the problem.\n\nResearch suggests several strategies to cultivate creative breakthroughs:\n\n**Embrace Boredom**: In a world of infinite entertainment, boredom has become a rare state. But boredom creates the mental space where new ideas can germinate. Try spending time without your phone, letting your mind wander freely.\n\n**Change Your Environment**: Novel experiences stimulate the brain in ways that familiar routines cannot. A new cafe, a different walking route, or even rearranging your desk can spark fresh perspectives.\n\n**Sleep on It**: Sleep is when your brain consolidates learning and makes unexpected connections. Keeping a notebook by your bed captures the ideas that surface in those liminal moments between waking and dreaming.\n\n**Talk It Through**: Explaining a problem to someone else forces you to articulate your thinking in new ways. Often, the solution emerges not from their advice, but from the clarity that comes with articulation.\n\nCreativity is not a gift bestowed on a chosen few. It is a skill that can be cultivated through intentional practice — and a willingness to step away and let your mind do its best work.`,
    excerpt: "Neuroscience calls it the incubation effect — when you step away from a problem, your brain shifts into a different mode, making unexpected connections.",
    topic: "Creativity",
    authorName: "Emily Nakamura",
  },
  {
    title: "Building Resilient Teams: Lessons from Open Source",
    content: `Open source software development has taught us something profound about how resilient teams operate. When you have contributors from different time zones, cultures, and backgrounds working on the same codebase, you need systems that transcend individual personalities.\n\nThe most successful open source projects share several characteristics that any team can learn from:\n\n**Clear Communication Protocols**: Every interaction happens through written communication — issues, pull requests, documentation. This creates a natural record of decisions and reasoning that new team members can reference.\n\n**Modular Architecture**: Code is organized into independent modules with well-defined interfaces. This means contributors can work on different parts simultaneously without stepping on each other's toes.\n\n**Emphasis on Documentation**: Great open source projects invest heavily in documentation. Not just API docs, but architectural decisions, contribution guidelines, and project philosophy. This reduces the bus factor and makes onboarding new contributors seamless.\n\n**Asynchronous Collaboration**: Work does not require everyone to be online simultaneously. Decisions are made through proposals and RFCs, giving everyone time to think before responding.\n\n**Meritocracy of Ideas**: The best idea wins, regardless of who proposed it. Junior developers can challenge senior architects, and the codebase benefits from diverse perspectives.\n\nTranslating these principles to traditional teams requires intentional effort. It means documenting decisions that were previously verbal, creating space for async work, and building the psychological safety needed for anyone to question the status quo.\n\nThe result is a team that is not dependent on any single person, where knowledge is shared broadly, and where the best ideas rise to the surface naturally.`,
    excerpt: "Open source has taught us how resilient teams operate. Here are five principles any team can apply to become more collaborative and resilient.",
    topic: "Leadership",
    authorName: "Sarah Mitchell",
  },
  {
    title: "The Future of Writing in the Age of AI",
    content: `When large language models first became publicly available, many writers felt a mix of curiosity and existential dread. If a machine could generate coherent paragraphs in seconds, what was the point of human writing?\n\nAfter two years of working alongside these tools, I have come to a different conclusion: AI does not replace writing — it transforms what writing can be.\n\nThe most profound impact of AI on writing is not on the act of putting words on a page. It is on the thinking that happens before and after. AI can help you brainstorm, organize your thoughts, and explore angles you might not have considered. It can serve as a tireless editor, catching inconsistencies and suggesting improvements.\n\nBut what AI cannot do — at least not yet — is have a genuine human experience and communicate it with authentic emotion. It cannot sit with grief and find the words to describe it. It cannot experience the joy of a breakthrough and share that excitement in a way that resonates with others who have felt the same.\n\nThe writers who will thrive are those who see AI as a collaborator, not a competitor. They use it to handle the mechanical aspects of writing — first drafts, grammar checks, structural suggestions — so they can focus on what matters most: the ideas, the emotion, and the human connection.\n\nWriting has always been a technology for thought. AI is simply the latest tool in that evolution. The question is not whether machines can write, but how we can use them to think more clearly, feel more deeply, and connect more authentically with each other.\n\nThe future of writing belongs not to those who write the fastest or the most, but to those who have something worth saying — and the courage to say it.`,
    excerpt: "AI does not replace writing — it transforms what writing can be. The future belongs to those who use it as a collaborator while focusing on authentic human connection.",
    topic: "Writing",
    authorName: "James Chen",
  },
  {
    title: "Minimalism in the Digital Age: Less is More Focus",
    content: `Digital minimalism is not about having fewer apps or spending less time online. It is about being intentional with your technology use — choosing tools that serve your values and eliminating those that do not.\n\nIn a world designed to capture and hold your attention, minimalism is an act of rebellion. Every app, every notification, every infinite scroll feed is competing for the most valuable resource you have: your time and attention.\n\nThe philosophy is simple but powerful: use technology to support your goals, not to fill your time.\n\nHere is how I apply digital minimalism in my life:\n\n**Curate Your Home Screen**: Only apps that serve a clear purpose get prime placement. Everything else goes into folders or gets deleted. The goal is to make intentionality the default.\n\n**Batch Your Communications**: Instead of responding to messages as they arrive, I check email and messages at set times. This reduces context switching and gives me longer blocks of uninterrupted focus.\n\n**Embrace Single-Purpose Devices**: Reading on a dedicated e-reader instead of a tablet. Writing in a distraction-free editor. The device shapes the behavior.\n\n**Regular Digital Decluttering**: Once a month, I review my subscriptions, apps, and digital tools. Anything that has not provided value gets removed.\n\nThe result is not a Spartan digital existence — it is a curated one. I still use technology extensively, but each tool has a clear purpose. My phone serves me rather than the other way around.\n\nDigital minimalism is ultimately about reclaiming agency. In a world that wants your attention, choosing where to focus it is the most powerful decision you can make.`,
    excerpt: "In a world designed to capture your attention, digital minimalism is an act of rebellion. Here is how to curate a more intentional digital life.",
    topic: "Wellness",
    authorName: "Emily Nakamura",
  },
];

async function seed() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not set");
    process.exit(1);
  }

  const queryClient = postgres(process.env.DATABASE_URL, { prepare: false, ssl: "require" });
  const db = drizzle(queryClient);

  console.log("Seeding database with sample posts...");

  for (const post of samplePosts) {
    await db.insert(posts).values(post);
    console.log(`  Created: "${post.title}"`);
  }

  console.log(`Successfully seeded ${samplePosts.length} posts!`);
  await queryClient.end();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
