'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, ShieldAlert, CheckCircle, Trash2, Ban } from 'lucide-react';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';

type Report = {
  id: string;
  target_type: string;
  target_table: string;
  target_id: string | null;
  target_user_id: string | null;
  reporter_user_id: string;
  reason: string;
  details: string | null;
  status: string;
  created_at: string;
};

export default function AdminReportsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState<Report[]>([]);
  const [error, setError] = useState('');
  const [actionMessage, setActionMessage] = useState('');

  useEffect(() => {
    const load = async () => {
      if (!supabase) {
        setError('Supabase is not configured.');
        setLoading(false);
        return;
      }

      const { data: sessionData } = await supabase.auth.getSession();
      const isAdmin = sessionData.session?.user?.user_metadata?.role === 'admin';
      if (!isAdmin) {
        setError('You must be an admin to view this page.');
        setLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('reports')
        .select('id, target_type, target_table, target_id, target_user_id, reporter_user_id, reason, details, status, created_at')
        .order('created_at', { ascending: false });

      if (fetchError) {
        setError(fetchError.message);
      } else {
        setReports(data || []);
      }

      setLoading(false);
    };

    load();
  }, []);

  const handleMarkReviewed = async (id: string) => {
    if (!supabase) return;
    const { error: updateError } = await supabase.from('reports').update({ status: 'reviewed' }).eq('id', id);
    if (updateError) {
      setActionMessage(updateError.message);
      return;
    }
    setReports((prev) => prev.map((r) => (r.id === id ? { ...r, status: 'reviewed' } : r)));
    setActionMessage('Marked as reviewed.');
  };

  const handleDeleteContent = async (report: Report) => {
    if (!supabase || !report.target_table || !report.target_id) return;
    const { error: deleteError } = await supabase.from(report.target_table).delete().eq('id', report.target_id);
    if (deleteError) {
      setActionMessage(deleteError.message);
      return;
    }
    setActionMessage('Content deleted.');
  };

  const handleBanUser = async (userId: string | null) => {
    if (!supabase || !userId) return;
    const { error: banError } = await supabase.from('profiles').update({ role: 'banned' }).eq('id', userId);
    if (banError) {
      setActionMessage(banError.message);
      return;
    }
    setActionMessage('User banned.');
  };

  const openReports = useMemo(() => reports.filter((r) => r.status === 'open'), [reports]);
  const reviewedReports = useMemo(() => reports.filter((r) => r.status !== 'open'), [reports]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navigation />
      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-[#1e3a5f]">Admin Reports</h1>
              <p className="text-sm text-gray-600">Review and act on user reports.</p>
            </div>
            <Button variant="ghost" onClick={() => router.refresh()}>
              Refresh
            </Button>
          </div>

          {loading && (
            <div className="flex items-center gap-2 text-gray-600 text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading reports...
            </div>
          )}

          {error && (
            <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700 mb-4">
              {error}
            </div>
          )}

          {actionMessage && (
            <div className="rounded-md bg-blue-50 border border-blue-200 px-3 py-2 text-sm text-blue-800 mb-4">
              {actionMessage}
            </div>
          )}

          {!loading && !error && (
            <div className="space-y-6">
              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="text-lg text-[#1e3a5f] flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4" />
                    Open Reports
                  </CardTitle>
                  <CardDescription>{openReports.length} open</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {openReports.length === 0 && <p className="text-sm text-gray-600">No open reports.</p>}
                  {openReports.map((report) => (
                    <div key={report.id} className="border rounded-md p-3 space-y-2 bg-white">
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-700">
                          <span className="font-semibold text-[#1e3a5f]">{report.target_type}</span>{' '}
                          on <span className="text-gray-800">{report.target_table}</span>
                        </div>
                        <Badge>{report.status}</Badge>
                      </div>
                      <div className="text-sm text-gray-600">
                        Reason: <span className="font-semibold text-gray-800">{report.reason}</span>
                        {report.details && <div className="mt-1">Details: {report.details}</div>}
                      </div>
                      <div className="text-xs text-gray-500">Reported at {new Date(report.created_at).toLocaleString()}</div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleMarkReviewed(report.id)}>
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Mark reviewed
                        </Button>
                        <Button variant="outline" size="sm" className="border-red-200 text-red-600 hover:bg-red-50" onClick={() => handleDeleteContent(report)}>
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete content
                        </Button>
                        <Button variant="outline" size="sm" className="border-red-200 text-red-600 hover:bg-red-50" onClick={() => handleBanUser(report.target_user_id)}>
                          <Ban className="w-4 h-4 mr-1" />
                          Ban user
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="text-lg text-[#1e3a5f] flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Reviewed Reports
                  </CardTitle>
                  <CardDescription>{reviewedReports.length} reviewed</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {reviewedReports.length === 0 && <p className="text-sm text-gray-600">No reviewed reports.</p>}
                  {reviewedReports.map((report) => (
                    <div key={report.id} className="border rounded-md p-3 space-y-2 bg-white">
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-700">
                          <span className="font-semibold text-[#1e3a5f]">{report.target_type}</span>{' '}
                          on <span className="text-gray-800">{report.target_table}</span>
                        </div>
                        <Badge>{report.status}</Badge>
                      </div>
                      <div className="text-sm text-gray-600">
                        Reason: <span className="font-semibold text-gray-800">{report.reason}</span>
                        {report.details && <div className="mt-1">Details: {report.details}</div>}
                      </div>
                      <div className="text-xs text-gray-500">Reported at {new Date(report.created_at).toLocaleString()}</div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
