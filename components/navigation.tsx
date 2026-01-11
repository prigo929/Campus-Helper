'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import {
  Briefcase,
  ShoppingBag,
  MessageSquare,
  User,
  LogOut,
  Loader2,
  Shield,
  Sparkles,
  Search,
  Menu,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { supabase } from '@/lib/supabase';
import { NotificationsDropdown } from '@/components/notifications-dropdown';
import { getSafeSession } from '@/lib/get-safe-session';
import Logo from '@/components/Logo';
import { toast } from 'sonner';

export function Navigation() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadUser = async () => {
      if (!supabase) return;

      setLoading(true);
      const { session, error } = await getSafeSession({ silent: true });
      if (!isMounted) return;

      setIsAuthed(Boolean(session));

      if (error) {
        console.error('Failed to load auth session', error);
      }

      if (!session?.user) {
        setDisplayName('');
        setEmail('');
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      const baseEmail = session.user.email || '';
      setEmail(baseEmail);
      setIsAdmin(session.user.user_metadata?.role === 'admin');

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, role')
        .eq('id', session.user.id)
        .single();

      setDisplayName(profile?.full_name || baseEmail || 'Profile');
      if (profile?.role === 'admin') {
        setIsAdmin(true);
      }
      setLoading(false);
    };

    loadUser();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const client = supabase;
    if (!client) return;

    const { data: listener } = client.auth.onAuthStateChange(async (event) => {
      // Cast to string to handle non-typed Supabase events like TOKEN_REFRESH_FAILED without type errors.
      if ((event as string) === 'TOKEN_REFRESH_FAILED') {
        toast.error('Your session expired. Please sign in again.');
        await client.auth.signOut();
        setIsAuthed(false);
        setDisplayName('');
        setEmail('');
        setIsAdmin(false);
      }
    });

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  const initials = useMemo(() => {
    const source = displayName || email || 'CH';
    return source
      .split(' ')
      .filter(Boolean)
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }, [displayName, email]);

  const handleSignOut = async () => {
    if (!supabase) return;
    setLoading(true);
    await supabase.auth.signOut();
    setIsAuthed(false);
    setDisplayName('');
    setEmail('');
    setIsAdmin(false);
    setLoading(false);
    router.push('/home');
  };

  return (
    <nav className="bg-[#0f1c16]/95 text-[#f1df9c] shadow-md sticky top-0 z-50 border-b border-[#caa35d]/25 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="flex items-center gap-2 py-3">
          <div className="flex items-center space-x-2 flex-shrink-0">
            <Link href="/home" className="group relative flex items-center space-x-2 px-4 py-2 hover:bg-[#0f1c16] transition-all duration-300">
              {/* Scanline Container */}
              <div className="absolute inset-px overflow-hidden pointer-events-none">
                <div className="absolute left-0 right-0 h-0.5 bg-[#caa35d]/50 shadow-[0_0_10px_#caa35d] animate-scan-vertical opacity-50 z-0" />
              </div>

              {/* Targeting Corners */}
              <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#caa35d] opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-50" />
              <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-[#caa35d] opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-50" />
              <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-[#caa35d] opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-50" />
              <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[#caa35d] opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-50" />

              <div className="relative z-10 flex items-center space-x-3">
                {/* Logo with pulse */}
                <div className="relative">
                  <div className="absolute inset-0 bg-[#caa35d]/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 animate-pulse transition-opacity" />
                  <Logo className="w-10 h-10 shrink-0 drop-shadow-[0_0_5px_rgba(202,163,93,0.5)] transition-all duration-300 group-hover:scale-105 group-hover:drop-shadow-[0_0_15px_rgba(202,163,93,0.8)]" />
                </div>

                {/* Glitch Text Wrapper */}
                <div className="relative font-bold tracking-[0.14em] uppercase text-xl text-[#f1df9c]">
                  <span className="relative z-10 group-hover:text-[#caa35d] transition-colors duration-300">Military Helper</span>
                  {/* Glitch Layers (Visible on Hover) */}
                  <span className="absolute top-0 left-0 -ml-0.5 translate-x-[2px] text-red-500 opacity-0 group-hover:opacity-70 group-hover:animate-glitch-1" aria-hidden="true">Military Helper</span>
                  <span className="absolute top-0 left-0 -ml-0.5 -translate-x-[2px] text-cyan-500 opacity-0 group-hover:opacity-70 group-hover:animate-glitch-1" style={{ animationDirection: 'reverse' }} aria-hidden="true">Military Helper</span>
                </div>
              </div>
            </Link>
            {isAdmin && (
              <Link href="/admin/reports" className="hidden md:inline-flex">
                <Button
                  variant="default"
                  className="bg-[#caa35d] text-[#0f1c16] hover:bg-[#a57c2c] font-semibold border border-[#caa35d]"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Admin
                </Button>
              </Link>
            )}
          </div>

          <div className="hidden lg:flex items-center space-x-1 justify-center flex-1 min-w-0">
            <Link href="/jobs">
              <Button variant="ghost" className="text-[#f1df9c] hover:text-[#caa35d] hover:bg-[#1a2217]">
                <Briefcase className="w-4 h-4 mr-2" />
                Jobs
              </Button>
            </Link>
            <Link href="/marketplace">
              <Button variant="ghost" className="text-[#f1df9c] hover:text-[#caa35d] hover:bg-[#1a2217]">
                <ShoppingBag className="w-4 h-4 mr-2" />
                Marketplace
              </Button>
            </Link>
            <Link href="/forum">
              <Button variant="ghost" className="text-[#f1df9c] hover:text-[#caa35d] hover:bg-[#1a2217]">
                <MessageSquare className="w-4 h-4 mr-2" />
                Forum
              </Button>
            </Link>
            <Link href="/search">
              <Button variant="ghost" className="text-[#f1df9c] hover:text-[#caa35d] hover:bg-[#1a2217]">
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
            </Link>
            <Link href="/ai-assistant">
              <Button
                variant="ghost"
                className="group relative overflow-hidden text-[#0f1c16] bg-gradient-to-r from-[#caa35d] via-[#b66b2e] to-[#34452f] hover:from-[#d9c8a5] hover:to-[#a57c2c] border border-[#caa35d]/60 shadow-[0_8px_30px_rgba(0,0,0,0.35)] transition-all duration-300 hover:-translate-y-0.5"
              >
                <span className="pointer-events-none absolute inset-[-10%] blur-2xl bg-[#caa35d]/30 group-hover:bg-[#caa35d]/40 transition-colors duration-500" />
                <span className="pointer-events-none absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-25 transition-opacity" />
                <span className="pointer-events-none absolute inset-0 translate-x-[-150%] bg-gradient-to-r from-transparent via-white/60 to-transparent opacity-70 animate-[shimmer_2.5s_ease-in-out_infinite]" />
                <span className="pointer-events-none absolute -inset-px rounded-lg border border-white/15 opacity-0 group-hover:opacity-80 transition-opacity duration-500 animate-[pulse_2.8s_ease-in-out_infinite]" />
                <Sparkles className="w-4 h-4 mr-2 drop-shadow-[0_0_10px_rgba(255,255,255,0.35)] text-[#0f1c16]" />
                AI
              </Button>
            </Link>
          </div>

          <div className="flex items-center gap-2 justify-end ml-auto flex-shrink-0">
            {isAuthed ? (
              <>
                <NotificationsDropdown />
                <Link href="/messages" aria-label="Messages" className="hidden lg:inline-flex">                  <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 text-[#f1df9c] hover:text-[#caa35d] hover:bg-[#1a2217]"
                >
                  <MessageSquare className="w-5 h-5" />
                </Button>
                </Link>
                <Link href="/profile" className="hidden lg:inline-flex">
                  <Button
                    variant="ghost"
                    className="text-[#f1df9c] hover:text-[#caa35d] hover:bg-[#1a2217] flex items-center gap-2 h-10 px-2"
                  >
                    <Avatar className="h-8 w-8 border border-[#caa35d]/40 bg-white/5">
                      <AvatarFallback className="bg-[#caa35d] text-[#0f1c16] text-xs font-semibold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden xl:inline">{displayName || 'Profile'}</span>
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className="border-[#caa35d]/40 bg-white/5 text-[#f1df9c] hover:bg-[#caa35d] hover:text-[#0f1c16] hidden lg:inline-flex"
                  onClick={handleSignOut}
                  disabled={loading}
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
                </Button>
              </>
            ) : (
              <>
                <Link href="/profile" className="hidden lg:inline-flex">
                  <Button variant="ghost" className="text-[#f1df9c] hover:text-[#caa35d] hover:bg-[#1a2217]">
                    <User className="w-4 h-4 mr-2" />
                    <span>Profile</span>
                  </Button>
                </Link>
                <Link href="/sign-in" className="hidden lg:inline-flex">
                  <Button className="bg-[#caa35d] text-[#0f1c16] hover:bg-[#a57c2c] font-semibold">
                    Sign In
                  </Button>
                </Link>
              </>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 text-[#f1df9c] hover:text-[#caa35d] hover:bg-[#1a2217] lg:hidden"
              aria-label="Toggle menu"
              onClick={() => setMobileOpen((prev) => !prev)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
        {mobileOpen && (
          <div className="lg:hidden mt-3 space-y-2 border-t border-white/10 pt-3 pb-4">
            <div className="grid grid-cols-2 gap-3 px-1">
              <Link href="/jobs" onClick={() => setMobileOpen(false)}>
                <Button variant="ghost" className="w-full justify-center bg-[#0f1c16]/70 text-[#f1df9c] border border-[#caa35d]/25 hover:bg-[#1a2217]">
                  <Briefcase className="w-4 h-4 mr-2" />
                  Jobs
                </Button>
              </Link>
              <Link href="/marketplace" onClick={() => setMobileOpen(false)}>
                <Button variant="ghost" className="w-full justify-center bg-[#0f1c16]/70 text-[#f1df9c] border border-[#caa35d]/25 hover:bg-[#1a2217]">
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  Market
                </Button>
              </Link>
              <Link href="/forum" onClick={() => setMobileOpen(false)}>
                <Button variant="ghost" className="w-full justify-center bg-[#0f1c16]/70 text-[#f1df9c] border border-[#caa35d]/25 hover:bg-[#1a2217]">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Forum
                </Button>
              </Link>
              <Link href="/search" onClick={() => setMobileOpen(false)}>
                <Button variant="ghost" className="w-full justify-center bg-[#0f1c16]/70 text-[#f1df9c] border border-[#caa35d]/25 hover:bg-[#1a2217]">
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </Button>
              </Link>
              <Link href="/ai-assistant" onClick={() => setMobileOpen(false)}>
                <Button className="w-full justify-center bg-gradient-to-r from-[#caa35d] via-[#b66b2e] to-[#34452f] text-[#0f1c16] border border-[#caa35d]/50 shadow-[0_8px_20px_rgba(0,0,0,0.35)]">
                  <Sparkles className="w-4 h-4 mr-2" />
                  AI
                </Button>
              </Link>
              {isAuthed ? (
                <>
                  <Link href="/profile" onClick={() => setMobileOpen(false)}>
                    <Button variant="ghost" className="w-full justify-center bg-[#0f1c16]/70 text-[#f1df9c] border border-[#caa35d]/25 hover:bg-[#1a2217]">
                      <User className="w-4 h-4 mr-2" />
                      Profile
                    </Button>
                  </Link>
                  <Link href="/messages" onClick={() => setMobileOpen(false)}>
                    <Button variant="ghost" className="w-full justify-center bg-[#0f1c16]/70 text-[#f1df9c] border border-[#caa35d]/25 hover:bg-[#1a2217]">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Messages
                    </Button>
                  </Link>
                  {isAdmin && (
                    <Link href="/admin/reports" onClick={() => setMobileOpen(false)}>
                      <Button className="w-full justify-center bg-[#caa35d] text-[#0f1c16]">
                        <Shield className="w-4 h-4 mr-2" />
                        Admin
                      </Button>
                    </Link>
                  )}
                  <Button
                    className="w-full justify-center bg-[#caa35d]/10 text-[#f1df9c] border border-[#caa35d]/40 hover:bg-[#caa35d] hover:text-[#0f1c16]"
                    onClick={() => {
                      setMobileOpen(false);
                      handleSignOut();
                    }}
                    disabled={loading}
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4 mr-2" />}
                    Sign out
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/profile" onClick={() => setMobileOpen(false)}>
                    <Button variant="ghost" className="w-full justify-center bg-[#0f1c16]/70 text-[#f1df9c] border border-[#caa35d]/25 hover:bg-[#1a2217]">
                      <User className="w-4 h-4 mr-2" />
                      Profile
                    </Button>
                  </Link>
                  <Link href="/sign-in" onClick={() => setMobileOpen(false)}>
                    <Button className="w-full justify-center bg-[#caa35d] text-[#0f1c16]">Sign In</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav >
  );
}
