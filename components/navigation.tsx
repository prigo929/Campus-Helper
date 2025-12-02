'use client';

import Link from 'next/link';
import { Briefcase, ShoppingBag, MessageSquare, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Navigation() {
  return (
    <nav className="bg-[#1e3a5f] text-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-[#d4af37] to-[#f4d03f] rounded-lg flex items-center justify-center font-bold text-[#1e3a5f]">
              CH
            </div>
            <span className="text-xl font-bold">Campus Helper</span>
          </Link>

          <div className="hidden md:flex items-center space-x-1">
            <Link href="/jobs">
              <Button variant="ghost" className="text-white hover:text-[#d4af37] hover:bg-[#2a4a6f]">
                <Briefcase className="w-4 h-4 mr-2" />
                Jobs
              </Button>
            </Link>
            <Link href="/marketplace">
              <Button variant="ghost" className="text-white hover:text-[#d4af37] hover:bg-[#2a4a6f]">
                <ShoppingBag className="w-4 h-4 mr-2" />
                Marketplace
              </Button>
            </Link>
            <Link href="/forum">
              <Button variant="ghost" className="text-white hover:text-[#d4af37] hover:bg-[#2a4a6f]">
                <MessageSquare className="w-4 h-4 mr-2" />
                Forum
              </Button>
            </Link>
          </div>

          <div className="flex items-center space-x-2">
            <Link href="/profile">
              <Button variant="ghost" className="text-white hover:text-[#d4af37] hover:bg-[#2a4a6f]">
                <User className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Profile</span>
              </Button>
            </Link>
            <Link href="/sign-in">
              <Button className="bg-[#d4af37] text-[#1e3a5f] hover:bg-[#c19b2e] font-semibold">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
