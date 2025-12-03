import { openai } from '@ai-sdk/openai';
import { streamText, type CoreMessage } from 'ai';

export const runtime = 'edge';

export async function POST(req: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return new Response(JSON.stringify({ error: 'Missing OPENAI_API_KEY' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { messages }: { messages?: CoreMessage[] } = await req.json();

  if (!messages?.length) {
    return new Response(JSON.stringify({ error: 'No messages provided' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const result = await streamText({
    model: openai('gpt-4o-mini'),
    system:
      'You are Campus Helper AI, a concise assistant for students. Keep answers short, helpful, and focused on jobs, marketplace, forum, and campus life. If asked about account data, remind them you cannot see their private information.',
    messages,
    temperature: 0.6,
  });

  return result.toTextStreamResponse();
}
