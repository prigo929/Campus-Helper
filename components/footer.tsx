import Link from 'next/link';
import Logo from '@/components/Logo';

export function Footer() {
  return (
    <footer className="bg-[#1e3a5f] text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center md:text-left">
          <div>
            <div className="flex items-center justify-center md:justify-start space-x-2 mb-4">
              <Logo className="w-12 h-12" />
              <span className="text-lg font-bold">Campus Helper</span>
            </div>
            <p className="text-sm text-gray-300">
              Connecting students for jobs, materials, and community.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Platform</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><Link href="/jobs" className="hover:text-[#d4af37]">Find Jobs</Link></li>
              <li><Link href="/marketplace" className="hover:text-[#d4af37]">Marketplace</Link></li>
              <li><Link href="/forum" className="hover:text-[#d4af37]">Forum</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">
              <Link href="/support" className="hover:text-[#d4af37]">Support</Link>
            </h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><Link href="/support/help-center" className="hover:text-[#d4af37]">Help Center</Link></li>
              <li><Link href="/support/safety-tips" className="hover:text-[#d4af37]">Safety Tips</Link></li>
              <li><Link href="/support/contact" className="hover:text-[#d4af37]">Contact Us</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">
              <Link href="/legal" className="hover:text-[#d4af37]">Legal</Link>
            </h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><Link href="/legal/terms" className="hover:text-[#d4af37]">Terms of Service</Link></li>
              <li><Link href="/legal/privacy" className="hover:text-[#d4af37]">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-sm text-gray-400 text-center">
          © {new Date().getFullYear()} Campus Helper. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
