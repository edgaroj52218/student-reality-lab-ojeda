import ChatWidget from "@/components/chat/chat-widget";

export default function Home() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-4xl px-4 py-8 sm:px-6">
      {/* your existing page content here */}
      <ChatWidget />
    </main>
  );
}