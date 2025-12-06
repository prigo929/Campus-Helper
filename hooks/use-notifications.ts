'use client';

import { useEffect, useMemo, useState } from 'react';
import { supabase, type Notification } from '@/lib/supabase';
import { toast } from 'sonner';
import { getSafeSession } from '@/lib/get-safe-session';

export type NotificationType = Notification['type'];

const STORAGE_KEY = 'ch-notifications';

const SEED_NOTIFICATIONS: Notification[] = [
  {
    id: 'seed-1',
    user_id: 'seed',
    title: 'New message',
    body: 'Alex replied to your chat about the tutoring job.',
    type: 'message',
    created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    read: false,
  },
  {
    id: 'seed-2',
    user_id: 'seed',
    title: 'Job interest',
    body: 'Jamie wants to help with “Event setup on Saturday”.',
    type: 'job',
    created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    read: false,
  },
  {
    id: 'seed-3',
    user_id: 'seed',
    title: 'Comment on your post',
    body: 'Taylor commented on “Best places to study late?”.',
    type: 'comment',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    read: false,
  },
];

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const load = async () => {
      if (!supabase) {
        setNotifications(SEED_NOTIFICATIONS);
        setLoading(false);
        toast.error('Supabase is not configured. Showing sample notifications.');
        return;
      }

      const { session, error: sessionError } = await getSafeSession({ silent: true });

      if (!session) {
        setNotifications(SEED_NOTIFICATIONS);
        setLoading(false);
        return;
      }

      if (sessionError) {
        console.error('Failed to load auth session for notifications', sessionError);
      }

      const { data, error } = await supabase
        .from('notifications')
        .select('id, user_id, type, title, body, read, metadata, created_at')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (!active) return;

      if (error) {
        console.error('Failed to load notifications', error);
        setNotifications(SEED_NOTIFICATIONS);
        toast.error('Could not load your notifications. Showing recent sample alerts.');
      } else {
        setNotifications(data || []);
      }
      setLoading(false);
    };

    load();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && notifications.length) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
      }
    } catch (error) {
      console.error('Failed to persist notifications', error);
    }
  }, [notifications]);

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

  const markAsRead = async (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));

    if (!supabase) return;
    const { session } = await getSafeSession({ silent: true });
    if (!session) return;

    const { error } = await supabase.from('notifications').update({ read: true }).eq('id', id).eq('user_id', session.user.id);
    if (error) {
      console.error('Failed to mark notification read', error);
      toast.error('Could not update that notification.');
    }
  };

  const markAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

    if (!supabase) return;
    const { session } = await getSafeSession({ silent: true });
    if (!session) return;

    const { error } = await supabase.from('notifications').update({ read: true }).eq('user_id', session.user.id);
    if (error) {
      console.error('Failed to mark all notifications read', error);
      toast.error('Could not mark all notifications as read.');
    } else {
      toast.success('All notifications marked as read.');
    }
  };

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    loading,
  };
}
