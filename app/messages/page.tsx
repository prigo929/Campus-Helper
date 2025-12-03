'use client';

import { useEffect, useRef, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ArrowLeft, Send, MessageSquare } from 'lucide-react';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

type DisplayMessage = {
  id: string;
  body: string;
  sender_id: string;
  created_at: string;
  author: string;
};

type ConversationSummary = {
  id: string;
  title: string;
  lastMessage?: string;
  lastAt?: string;
};

export default function ConversationPage() {
  const params = useSearchParams();
  const router = useRouter();
  const conversationId = params.get('id') || '';

  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [otherName, setOtherName] = useState('Conversation');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [conversationsLoading, setConversationsLoading] = useState(true);
  const [newEmail, setNewEmail] = useState('');
  const [startError, setStartError] = useState('');
  const [startLoading, setStartLoading] = useState(false);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const loadConversations = async () => {
      if (!supabase) {
        setConversationsLoading(false);
        return;
      }
      const { data: sessionData } = await supabase.auth.getSession();
      const currentUserId = sessionData.session?.user?.id;
      if (!currentUserId) {
        setConversationsLoading(false);
        return;
      }

      const { data: participantRows } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', currentUserId);

      const ids = participantRows?.map((p) => p.conversation_id) || [];
      if (ids.length === 0) {
        setConversations([]);
        setConversationsLoading(false);
        return;
      }

      const { data: convRows, error: convError } = await supabase
        .from('conversations')
        .select(
          'id, updated_at, conversation_participants(user_id, profiles(full_name,email)), messages(body, created_at, sender_id)'
        )
        .in('id', ids)
        .order('updated_at', { ascending: false });

      if (convError) {
        console.error('Conversation list error', convError);
        setConversationsLoading(false);
        return;
      }

      const mapped: ConversationSummary[] =
        convRows?.map((c: any) => {
          const others = (c.conversation_participants || []).filter((p: any) => p.user_id !== currentUserId);
          const other =
            others[0]?.profiles?.full_name || others[0]?.profiles?.email || 'Conversation';
          const last = (c.messages || []).sort(
            (a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          )[0];
          return {
            id: c.id,
            title: other,
            lastMessage: last?.body,
            lastAt: last?.created_at || c.updated_at,
          };
        }) || [];

      setConversations(mapped);
      setConversationsLoading(false);
    };

    loadConversations();
  }, []);

  useEffect(() => {
    const load = async () => {
      if (!supabase) {
        setError('Supabase is not configured.');
        setLoading(false);
        return;
      }

      const { data: sessionData } = await supabase.auth.getSession();
      const currentUserId = sessionData.session?.user?.id;
      if (!currentUserId) {
        router.push('/sign-in');
        return;
      }
      setUserId(currentUserId);

      if (!conversationId) {
        setLoading(false);
        return;
      }

      // Ensure current user is marked as a participant in case they were missing
      await supabase.from('conversation_participants').upsert(
        { conversation_id: conversationId, user_id: currentUserId },
        { onConflict: 'conversation_id,user_id' }
      );

      const { data: participantRows, error: participantsError } = await supabase
        .from('conversation_participants')
        .select('user_id, profiles(full_name,email)')
        .eq('conversation_id', conversationId);

      if (participantsError) {
        setError(participantsError.message);
        setLoading(false);
        return;
      }

      const other = participantRows?.find((p) => p.user_id !== currentUserId);
      setOtherName(
        (other as any)?.profiles?.full_name || (other as any)?.profiles?.email || 'Conversation'
      );
      setConversations((prev) =>
        prev.map((c) => (c.id === conversationId ? { ...c, title: (other as any)?.profiles?.full_name || (other as any)?.profiles?.email || c.title } : c))
      );

      const { data: messageRows, error: messagesError } = await supabase
        .from('messages')
        .select('id, body, sender_id, created_at, profiles(full_name,email)')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (messagesError) {
        setError(messagesError.message);
        setLoading(false);
        return;
      }

      const mapped =
        messageRows?.map((m) => ({
          id: m.id,
          body: m.body,
          sender_id: m.sender_id,
          created_at: m.created_at,
          author: (m as any).profiles?.full_name || (m as any).profiles?.email || 'Campus Helper user',
        })) || [];
      setMessages(mapped);
      setLoading(false);

      if (!channelRef.current) {
        channelRef.current = supabase
          .channel(`conversation-${conversationId}`)
          .on(
            'postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversationId}` },
            (payload) => {
              const newMessage = payload.new as any;
              setMessages((prev) => {
                if (prev.find((m) => m.id === newMessage.id)) return prev;
                const author = newMessage.profiles?.full_name || newMessage.profiles?.email || 'Campus Helper user';
                return [
                  ...prev,
                  {
                    id: newMessage.id,
                    body: newMessage.body,
                    sender_id: newMessage.sender_id,
                    created_at: newMessage.created_at,
                    author,
                  },
                ];
              });
              scrollToBottom();
            }
          )
          .subscribe();
      }
    };

    load();

    return () => {
      if (channelRef.current) {
        supabase?.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [conversationId, router]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!supabase) {
      setError('Supabase is not configured.');
      return;
    }
    if (!userId) {
      setError('Please sign in to send messages.');
      return;
    }
    if (!message.trim() || !conversationId) return;
    setSending(true);
    const { error: insertError } = await supabase.from('messages').insert({
      conversation_id: conversationId,
      sender_id: userId,
      body: message.trim(),
    });
    if (insertError) {
      setError(insertError.message);
      setSending(false);
      return;
    }
    setMessage('');
    setSending(false);
  };

  const startConversation = async () => {
    setStartError('');
    if (!supabase) {
      setStartError('Supabase is not configured.');
      return;
    }
    if (!newEmail.trim()) {
      setStartError('Enter an email to start a chat.');
      return;
    }
    const { data: sessionData } = await supabase.auth.getSession();
    const currentUserId = sessionData.session?.user?.id;
    if (!currentUserId) {
      router.push('/sign-in');
      return;
    }
    setStartLoading(true);
    const targetEmail = newEmail.trim().toLowerCase();
    const { data: targetProfile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      .ilike('email', targetEmail)
      .maybeSingle();
    if (profileError || !targetProfile?.id) {
      setStartError(profileError?.message || 'User not found with that email.');
      setStartLoading(false);
      return;
    }
    if (targetProfile.id === currentUserId) {
      setStartError('You cannot start a chat with yourself.');
      setStartLoading(false);
      return;
    }

    // Check for existing conversation between both users
    const { data: myConvs } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('user_id', currentUserId);
    const myIds = (myConvs || []).map((c) => c.conversation_id);
    let conversationId = myIds[0] || null;
    if (myIds.length > 0) {
      const { data: shared } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .in('conversation_id', myIds)
        .eq('user_id', targetProfile.id);
      conversationId = shared?.[0]?.conversation_id || null;
    }

    if (!conversationId) {
      const { data: newConv, error: convError } = await supabase
        .from('conversations')
        .insert({ started_by: currentUserId })
        .select('id')
        .single();
      if (convError || !newConv?.id) {
        setStartError(convError?.message || 'Could not start conversation.');
        setStartLoading(false);
        return;
      }
      conversationId = newConv.id;
      await supabase.from('conversation_participants').insert([
        { conversation_id: conversationId, user_id: currentUserId },
        { conversation_id: conversationId, user_id: targetProfile.id },
      ]);
    } else {
      await supabase.from('conversation_participants').upsert(
        [
          { conversation_id: conversationId, user_id: currentUserId },
          { conversation_id: conversationId, user_id: targetProfile.id },
        ],
        { onConflict: 'conversation_id,user_id' }
      );
    }

    setStartLoading(false);
    setNewEmail('');
    router.push(`/messages?id=${conversationId}`);
  };

  const formatTime = (value?: string | null) =>
    value ? new Date(value).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : '';

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navigation />

      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-3 mb-4">
            <Button variant="ghost" className="text-[#1e3a5f] hover:text-[#d4af37]" onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
            <div>
              <p className="text-sm text-gray-500">Chat</p>
              <p className="text-lg font-semibold text-[#1e3a5f]">{otherName}</p>
            </div>
          </div>

          <Card className="border-2">
            <CardHeader>
              <CardTitle className="text-[#1e3a5f]">Conversation</CardTitle>
              <CardDescription className="text-gray-600">
                Realtime messages between you and {otherName || 'your contact'}.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="md:col-span-1 space-y-3">
                  <div className="flex items-center gap-2 text-[#1e3a5f]">
                    <MessageSquare className="w-4 h-4" />
                    <span className="font-semibold">Conversations</span>
                  </div>
                  <div className="rounded-lg border border-gray-200 bg-white p-2 max-h-96 overflow-y-auto space-y-2">
                    {conversationsLoading ? (
                      <p className="text-sm text-gray-500">Loading...</p>
                    ) : conversations.length === 0 ? (
                      <p className="text-sm text-gray-500">No conversations yet.</p>
                    ) : (
                      conversations.map((conv) => (
                        <button
                          key={conv.id}
                          onClick={() => router.push(`/messages?id=${conv.id}`)}
                          className={`w-full text-left rounded-md px-3 py-2 border ${
                            conv.id === conversationId ? 'border-[#1e3a5f] bg-[#1e3a5f]/5' : 'border-transparent hover:bg-gray-50'
                          }`}
                        >
                          <p className="text-sm font-semibold text-[#1e3a5f]">{conv.title}</p>
                          {conv.lastMessage && (
                            <p className="text-xs text-gray-600 truncate">{conv.lastMessage}</p>
                          )}
                          {conv.lastAt && (
                            <p className="text-[11px] text-gray-400 mt-1">
                              {new Date(conv.lastAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}{' '}
                              {new Date(conv.lastAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                            </p>
                          )}
                        </button>
                      ))
                    )}
                  </div>
                  <div className="rounded-lg border border-dashed border-gray-300 bg-white p-3 space-y-2">
                    <p className="text-sm font-semibold text-[#1e3a5f]">Start new chat</p>
                    <Textarea
                      placeholder="Enter campus email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      rows={2}
                      className="text-sm"
                    />
                    {startError && <p className="text-xs text-red-600">{startError}</p>}
                    <Button
                      size="sm"
                      className="bg-[#1e3a5f] text-white hover:bg-[#2a4a6f] w-full"
                      onClick={startConversation}
                      disabled={startLoading}
                    >
                      {startLoading ? 'Starting...' : 'Start conversation'}
                    </Button>
                  </div>
                </div>

                <div className="md:col-span-2 space-y-4">
              {loading && <p className="text-sm text-gray-600">Loading conversation...</p>}
              {error && (
                <div className="text-sm text-red-700 bg-red-50 border border-red-200 px-3 py-2 rounded-md">{error}</div>
              )}
              <div className="h-96 overflow-y-auto rounded-lg border border-gray-200 bg-white px-3 py-2 space-y-2">
                {messages.length === 0 && !loading ? (
                  <p className="text-sm text-gray-500">No messages yet. Start the conversation.</p>
                ) : (
                  messages.map((msg) => {
                    const isMe = msg.sender_id === userId;
                    return (
                      <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div
                          className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${
                            isMe ? 'bg-[#1e3a5f] text-white' : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          <div className="text-xs opacity-80 flex justify-between gap-2">
                            <span>{isMe ? 'You' : msg.author}</span>
                            <span>{formatTime(msg.created_at)}</span>
                          </div>
                          <p className="whitespace-pre-line mt-1">{msg.body}</p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={bottomRef} />
              </div>

              <div className="space-y-2">
                <Textarea
                  placeholder="Write a message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  disabled={sending}
                />
                <div className="flex justify-end">
                  <Button
                    className="bg-[#1e3a5f] text-white hover:bg-[#2a4a6f]"
                    onClick={sendMessage}
                    disabled={sending}
                  >
                    {sending ? 'Sending...' : <span className="flex items-center gap-2">Send <Send className="w-4 h-4" /></span>}
                  </Button>
                </div>
              </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
