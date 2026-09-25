'use client';

import { useCallback, useEffect, useState } from 'react';
import { AppShell } from '@/components/AppShell';
import { Protected } from '@/components/Protected';
import { Badge, Button, Card, Empty, ErrorBox, Loading, PageHeader } from '@/components/UI';
import { api } from '@/lib/api';

type Meeting = {
  id: string;
  title: string;
  scheduled_at?: string | null;
  status?: string;
  location?: string | null;
};

export default function MeetingsPage() {
  const [items, setItems] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get<Meeting[]>('/meetings');
      setItems(Array.isArray(data) ? data : []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <Protected>
      <AppShell>
        <PageHeader
          title="Meetings"
          subtitle="Scheduled sessions and attendance"
          actions={
            <Button variant="secondary" onClick={load}>
              Refresh
            </Button>
          }
        />
        {error && <ErrorBox message={error} onDismiss={() => setError(null)} />}
        {loading ? (
          <Loading />
        ) : items.length === 0 ? (
          <Empty title="No meetings" description="Upcoming and past meetings will list here." />
        ) : (
          <Card>
            <div className="table-wrap">
              <table className="data">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>When</th>
                    <th>Location</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((m) => (
                    <tr key={m.id}>
                      <td>{m.title}</td>
                      <td className="muted">
                        {m.scheduled_at ? new Date(m.scheduled_at).toLocaleString() : '—'}
                      </td>
                      <td>{m.location || '—'}</td>
                      <td>
                        <Badge tone="info">{m.status || '—'}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </AppShell>
    </Protected>
  );
}
