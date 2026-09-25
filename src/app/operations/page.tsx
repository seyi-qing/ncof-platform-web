'use client';

import { useCallback, useEffect, useState } from 'react';
import { AppShell } from '@/components/AppShell';
import { Protected } from '@/components/Protected';
import { Badge, Button, Card, Empty, ErrorBox, Loading, PageHeader } from '@/components/UI';
import { api } from '@/lib/api';

type Incident = {
  id: string;
  title: string;
  severity?: string;
  status?: string;
  created_at?: string;
};

type Asset = {
  id: string;
  name: string;
  category?: string;
  status?: string;
};

export default function OperationsPage() {
  const [tab, setTab] = useState<'incidents' | 'assets'>('incidents');
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [inc, ast] = await Promise.all([
        api.get<Incident[]>('/operations/incidents').catch(() => []),
        api.get<Asset[]>('/operations/assets').catch(() => []),
      ]);
      setIncidents(Array.isArray(inc) ? inc : []);
      setAssets(Array.isArray(ast) ? ast : []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const severityTone = (s?: string) => {
    if (!s) return 'muted' as const;
    const x = s.toLowerCase();
    if (x.includes('critical') || x.includes('high')) return 'danger' as const;
    if (x.includes('medium')) return 'warning' as const;
    return 'info' as const;
  };

  return (
    <Protected>
      <AppShell>
        <PageHeader
          title="Operations"
          subtitle="Incidents and assets"
          actions={
            <Button variant="secondary" onClick={load}>
              Refresh
            </Button>
          }
        />
        {error && <ErrorBox message={error} onDismiss={() => setError(null)} />}

        <div className="tabs">
          <button className={`tab ${tab === 'incidents' ? 'active' : ''}`} onClick={() => setTab('incidents')}>
            Incidents
          </button>
          <button className={`tab ${tab === 'assets' ? 'active' : ''}`} onClick={() => setTab('assets')}>
            Assets
          </button>
        </div>

        {loading ? (
          <Loading />
        ) : tab === 'incidents' ? (
          incidents.length === 0 ? (
            <Empty title="No incidents" description="Operational incidents will appear here." />
          ) : (
            <Card>
              <div className="table-wrap">
                <table className="data">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Severity</th>
                      <th>Status</th>
                      <th>Opened</th>
                    </tr>
                  </thead>
                  <tbody>
                    {incidents.map((i) => (
                      <tr key={i.id}>
                        <td>{i.title}</td>
                        <td>
                          <Badge tone={severityTone(i.severity)}>{i.severity || '—'}</Badge>
                        </td>
                        <td>
                          <Badge tone="muted">{i.status || '—'}</Badge>
                        </td>
                        <td className="muted">
                          {i.created_at ? new Date(i.created_at).toLocaleDateString() : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )
        ) : assets.length === 0 ? (
          <Empty title="No assets" description="Register assets via the operations API." />
        ) : (
          <Card>
            <div className="table-wrap">
              <table className="data">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {assets.map((a) => (
                    <tr key={a.id}>
                      <td>{a.name}</td>
                      <td className="muted">{a.category || '—'}</td>
                      <td>
                        <Badge tone="info">{a.status || '—'}</Badge>
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
