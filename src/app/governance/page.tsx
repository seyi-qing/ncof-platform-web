'use client';

import { useCallback, useEffect, useState } from 'react';
import { AppShell } from '@/components/AppShell';
import { Protected } from '@/components/Protected';
import { Badge, Button, Card, Empty, ErrorBox, Loading, PageHeader } from '@/components/UI';
import { api } from '@/lib/api';

type MotionsItem = {
  id: string;
  title: string;
  status?: string;
  created_at?: string;
};

export default function GovernancePage() {
  const [motions, setMotions] = useState<MotionsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get<MotionsItem[]>('/governance/motions');
      setMotions(Array.isArray(data) ? data : []);
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
          title="Governance"
          subtitle="Motions, resolutions, and policy tracking"
          actions={
            <Button variant="secondary" onClick={load}>
              Refresh
            </Button>
          }
        />
        {error && <ErrorBox message={error} onDismiss={() => setError(null)} />}
        {loading ? (
          <Loading />
        ) : motions.length === 0 ? (
          <Empty title="No motions" description="Governance motions will appear here when created." />
        ) : (
          <Card>
            <div className="table-wrap">
              <table className="data">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Status</th>
                    <th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {motions.map((m) => (
                    <tr key={m.id}>
                      <td>{m.title}</td>
                      <td>
                        <Badge tone="info">{m.status || '—'}</Badge>
                      </td>
                      <td className="muted">
                        {m.created_at ? new Date(m.created_at).toLocaleDateString() : '—'}
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
