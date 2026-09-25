'use client';

import { useCallback, useEffect, useState } from 'react';
import { AppShell } from '@/components/AppShell';
import { Protected } from '@/components/Protected';
import { Badge, Button, Card, Empty, ErrorBox, Loading, PageHeader } from '@/components/UI';
import { api } from '@/lib/api';

type Election = {
  id: string;
  title: string;
  status: string;
  starts_at?: string | null;
  ends_at?: string | null;
  description?: string | null;
};

type Candidate = {
  id: string;
  name: string;
  position?: string | null;
  bio?: string | null;
};

type ControlRoom = {
  election: Election;
  candidates: Candidate[];
  ballot_count?: number;
  eligible_voters?: number;
  turnout_pct?: number | null;
};

export default function ElectionsPage() {
  const [list, setList] = useState<Election[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [room, setRoom] = useState<ControlRoom | null>(null);
  const [loading, setLoading] = useState(true);
  const [roomLoading, setRoomLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get<Election[]>('/governance/elections');
      setList(Array.isArray(data) ? data : []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openRoom = async (id: string) => {
    setSelected(id);
    setRoomLoading(true);
    setRoom(null);
    setActionMsg(null);
    try {
      const data = await api.get<ControlRoom>(`/governance/elections/${id}`);
      setRoom(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setRoomLoading(false);
    }
  };

  const runAction = async (action: string) => {
    if (!selected) return;
    setActionMsg(null);
    try {
      await api.post(`/governance/elections/${selected}/${action}`, {});
      setActionMsg(`Action "${action}" succeeded`);
      await openRoom(selected);
      await load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  const statusBadge = (s: string) => {
    const map: Record<string, 'success' | 'warning' | 'danger' | 'muted' | 'info'> = {
      draft: 'muted',
      scheduled: 'info',
      open: 'success',
      closed: 'warning',
      archived: 'muted',
    };
    return <Badge tone={map[s] || 'muted'}>{s}</Badge>;
  };

  return (
    <Protected>
      <AppShell>
        <PageHeader
          title="Elections"
          subtitle="Secret-ballot control room — open, monitor, close"
          actions={
            <Button variant="secondary" onClick={load}>
              Refresh
            </Button>
          }
        />
        {error && <ErrorBox message={error} onDismiss={() => setError(null)} />}
        {actionMsg && (
          <div className="alert alert-success" style={{ marginBottom: '1rem' }}>
            {actionMsg}
          </div>
        )}

        {loading ? (
          <Loading />
        ) : list.length === 0 ? (
          <Empty title="No elections" description="Create elections from the API or governance tools." />
        ) : (
          <div className="grid-2" style={{ alignItems: 'start' }}>
            <Card>
              <div className="card-title">Elections</div>
              <div className="table-wrap">
                <table className="data">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Status</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {list.map((e) => (
                      <tr key={e.id}>
                        <td>{e.title}</td>
                        <td>{statusBadge(e.status)}</td>
                        <td className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => openRoom(e.id)}>
                            Control
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            <Card>
              <div className="card-title">Control room</div>
              {!selected && <Empty title="Select an election" description="Open control room from the list." />}
              {selected && roomLoading && <Loading />}
              {selected && !roomLoading && room && (
                <div>
                  <h3 style={{ margin: '0 0 0.5rem' }}>{room.election.title}</h3>
                  <div className="mb-2">{statusBadge(room.election.status)}</div>
                  <div className="grid-3 mb-2">
                    <div>
                      <div className="card-title">Ballots</div>
                      <div className="stat-value" style={{ fontSize: '1.25rem' }}>
                        {room.ballot_count ?? '—'}
                      </div>
                    </div>
                    <div>
                      <div className="card-title">Eligible</div>
                      <div className="stat-value" style={{ fontSize: '1.25rem' }}>
                        {room.eligible_voters ?? '—'}
                      </div>
                    </div>
                    <div>
                      <div className="card-title">Turnout</div>
                      <div className="stat-value" style={{ fontSize: '1.25rem' }}>
                        {room.turnout_pct != null ? `${room.turnout_pct}%` : '—'}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1 mb-2" style={{ flexWrap: 'wrap' }}>
                    <Button size="sm" onClick={() => runAction('open')}>
                      Open
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => runAction('close')}>
                      Close
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => runAction('publish-results')}>
                      Publish results
                    </Button>
                  </div>
                  <div className="card-title">Candidates</div>
                  {(!room.candidates || room.candidates.length === 0) && (
                    <p className="muted">No candidates listed.</p>
                  )}
                  {room.candidates?.map((c) => (
                    <div
                      key={c.id}
                      style={{
                        padding: '0.5rem 0',
                        borderBottom: '1px solid var(--border)',
                      }}
                    >
                      <strong>{c.name}</strong>
                      {c.position && <span className="muted"> — {c.position}</span>}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}
      </AppShell>
    </Protected>
  );
}
