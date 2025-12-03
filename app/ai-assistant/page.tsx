import type { Metadata } from 'next';
import { Sparkles, Shield, MessageSquare } from 'lucide-react';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AiChatPanel } from '@/components/ai-chat-panel';

export const metadata: Metadata = {
  title: 'AI Assistant | Campus Helper',
  description: 'Chat with the Campus Helper AI to draft posts, improve listings, and get quick campus tips.',
};

export default function AiAssistantPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-white">
      <Navigation />

      <main className="flex-1">
        <section className="py-12">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            <Card className="border-0 bg-gradient-to-br from-[#1e3a5f] via-[#1f3f65] to-[#162b48] text-white shadow-xl">
              <CardContent className="p-6 md:p-8 space-y-4">
                <Badge className="bg-white/15 text-white border-white/30 w-fit">New</Badge>
                <h1 className="text-3xl md:text-4xl font-bold leading-tight flex items-center gap-3">
                  <Sparkles className="w-7 h-7 text-[#f4d03f]" />
                  Campus Helper AI
                </h1>
                <p className="text-lg text-gray-200 max-w-3xl">
                  Draft job posts, improve marketplace listings, and get forum replies faster with the Next.js AI SDK,
                  running securely on Vercel.
                </p>
                <div className="flex flex-wrap gap-3 text-sm text-white/90">
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1">
                    <MessageSquare className="w-4 h-4 text-[#f4d03f]" />
                    Streaming responses
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1">
                    <Shield className="w-4 h-4 text-[#f4d03f]" />
                    Campus-safe guidance
                  </span>
                </div>
              </CardContent>
            </Card>

            <AiChatPanel />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
