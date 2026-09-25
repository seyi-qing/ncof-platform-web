'use client';

import { useCallback, useEffect, useState } from 'react';
import { AppShell } from '@/components/AppShell';
import { Protected } from '@/components/Protected';
import { Badge, Button, Card, Empty, ErrorBox, Loading, PageHeader } from '@/components/UI';
import { api } from '@/lib/api';

type Notification = {
  id: string;
  title: string;
  body?: string | null;
  read?: boolean;
  created_at?: string;
};

export default function NotificationsPage() {
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get<Notification[]>('/member-experience/notifications');
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
          title="Notifications"
          subtitle="In-app alerts and announcements"
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
          <Empty title="No notifications" description="You are all caught up." />
        ) : (
          <Card>
            <div className="table-wrap">
              <table className="data">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Status</th>
                    <th>When</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((n) => (
                    <tr key={n.id}>
                      <td>
                        <div>{n.title}</div>
                        {n.body && <div className="muted" style={{ fontSize: '0.85rem' }}>{n.body}</div>}
                      </td>
                      <td>
                        <Badge tone={n.read ? 'muted' : 'info'}>{n.read ? 'Read' : 'Unread'}</Badge>
                      </td>
                      <td className="muted">
                        {n.created_at ? new Date(n.created_at).toLocaleString() : '—'}
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
