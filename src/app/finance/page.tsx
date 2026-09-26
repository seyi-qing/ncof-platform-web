'use client'

import { useEffect, useState } from 'react'
import {
  Plus,
  RefreshCw,
  WalletCards,
} from 'lucide-react'

import AppShell from '@/components/AppShell'
import { api } from '@/lib/api'
import { printAsPdf, escapeHtmlPublic as esc } from '@/lib/printPdf'
import { getRole } from '@/lib/auth'

import {
  Card,
  PageHeader,
  Table,
  Button,
  Modal,
  Field,
  Select,
  ErrorBox,
  SuccessBox,
  Empty,
  Stat,
} from '@/components/UI'

const naira = (v: any) => {
  const n = Number(v)
  if (!Number.isFinite(n)) return '\u20A60.00'
  return '\u20A6' + n.toLocaleString('en-NG', {minimumFractionDigits: 2, maximumFractionDigits: 2})
}

export default function Finance() {
  const role = getRole()

  const [dues, setDues] = useState<any[]>([])
  const [members, setMembers] = useState<any[]>([])

  const [viewDues, setViewDues] = useState<any>(null)
  const [open, setOpen] =
    useState<'dues' | 'tx' | null>(null)

  const [err, setErr] = useState('')
  const [success, setSuccess] = useState('')

  const now = new Date()

  const [period, setPeriod] = useState({
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    amount: '0',
  })

  const [tx, setTx] = useState({
    member_id: '',
    account_type: 'dues',
    transaction_type: 'payment',
    amount: '',
    direction: 'credit',
    description: '',
  })

  const load = async () => {
    setErr('')

    try {
      const duesData = await api<any[]>(
        `/finance/dues?year=${period.year}&month=${period.month}`,
      )

      setDues(duesData)

      if (role !== 'member') {
        const memberData =
          await api<any[]>('/members')

        setMembers(memberData)
      }
    } catch (e: any) {
      setErr(e.message)
    }
  }

  useEffect(() => {
    void load()
  }, [period.year, period.month])

  async function gen(e: any) {
    e.preventDefault()
    setErr('')

    try {
      const r = await api<any>(
        '/finance/dues/generate',
        {
          method: 'POST',
          body: JSON.stringify({
            year: Number(period.year),
            month: Number(period.month),
            amount: Number(period.amount),
          }),
        },
      )

      setSuccess(
        `Generated ${r.created} dues records.`,
      )

      setOpen(null)
      load()
    } catch (e: any) {
      setErr(e.message)
    }
  }

  async function post(e: any) {
    e.preventDefault()
    setErr('')

    try {
      const r = await api<any>(
        '/finance/transactions',
        {
          method: 'POST',
          body: JSON.stringify({
            ...tx,
            amount: Number(tx.amount),
          }),
        },
      )

      setSuccess(
        `Transaction ${r.reference} posted.`,
      )

      setOpen(null)
      load()
    } catch (e: any) {
      setErr(e.message)
    }
  }

  const memberMap = new Map(
    members.map((m) => [m.id, m]),
  )

  function exportDuesPdf() {
    if (!dues.length) {
      setErr('No dues records to export for this period.')
      return
    }
    const periodLabel = `${period.year}-${String(period.month).padStart(2, '0')}`
    const rows = dues
      .map((x) => {
        const name = esc(x.member_name || x.member_no || 'Member')
        const status = esc(x.status || '')
        const badge =
          x.status === 'paid' ? 'ok' : x.status === 'partial' ? 'warn' : 'bad'
        return `<tr>
          <td>${name}</td>
          <td>${esc(periodLabel)}</td>
          <td class="right">${esc(naira(x.amount_due))}</td>
          <td class="right">${esc(naira(x.amount_paid))}</td>
          <td><span class="badge ${badge}">${status}</span></td>
        </tr>`
      })
      .join('')
    const totalDue = dues.reduce((s, x) => s + Number(x.amount_due || 0), 0)
    const totalPaid = dues.reduce((s, x) => s + Number(x.amount_paid || 0), 0)
    const body = `
      <h1>Monthly dues statement</h1>
      <p class="muted">Period: <b>${esc(periodLabel)}</b> · Records: ${dues.length}</p>
      <table>
        <thead>
          <tr><th>Member</th><th>Period</th><th class="right">Due</th><th class="right">Paid</th><th>Status</th></tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <p class="totals">Total due: ${esc(naira(totalDue))} · Total paid: ${esc(naira(totalPaid))}</p>
    `
    printAsPdf(`NCOF dues ${periodLabel}`, body)
  }

  return (
    <AppShell title="Finance">
      <div className="content">
        <PageHeader
          title="Finance"
          description="Dues, member transactions and financial controls."
          action={
            <div
              style={{
                display: 'flex',
                gap: 8,
              }}
            >
              {role !== 'member' && (
                <>
                  <Button
                    variant="secondary"
                    onClick={() =>
                      setOpen('dues')
                    }
                  >
                    Generate dues
                  </Button>

                  <Button
                    onClick={() =>
                      setOpen('tx')
                    }
                  >
                    <Plus size={15} />
                    Post transaction
                  </Button>
                </>
              )}
            </div>
          }
        />

        {err && <ErrorBox message={err} />}
        {success && (
          <SuccessBox message={success} />
        )}

        <div className="grid grid-3">
          <Stat
            label="Dues records"
            value={dues.length}
            icon={WalletCards}
          />

          <Stat
            label="Paid"
            value={
              dues.filter(
                (x) => x.status === 'paid',
              ).length
            }
          />

          <Stat
            label="Outstanding"
            value={
              dues.filter(
                (x) => x.status !== 'paid',
              ).length
            }
          />
        </div>

        <Card>
          <div className="section-title">
            <h3>Monthly dues</h3>

            <div
              style={{
                display: 'flex',
                gap: 8,
                alignItems: 'center',
                flexWrap: 'wrap',
              }}
            >
              <Button variant="secondary" type="button" onClick={exportDuesPdf}>
                Export PDF
              </Button>
              <Field
                label="Year"
                type="number"
                value={period.year}
                onChange={(e: any) =>
                  setPeriod({
                    ...period,
                    year: Number(e.target.value),
                  })
                }
              />

              <Field
                label="Month"
                type="number"
                min="1"
                max="12"
                value={period.month}
                onChange={(e: any) =>
                  setPeriod({
                    ...period,
                    month: Number(e.target.value),
                  })
                }
              />

              <button
                className="iconbtn"
                onClick={load}
              >
                <RefreshCw size={15} />
              </button>
            </div>
          </div>

          {dues.length ? (
            <Table
              headers={[
                'Member',
                'Period',
                'Due',
                'Paid',
                'Status',
                'Actions',
              ]}
              rows={dues.map((x) => {
                const member =
                  memberMap.get(x.member_id)
                const displayName =
                  x.member_name || member?.full_name || null
                const displayNo =
                  x.member_no || member?.member_no || null

                return [
                  <span key="m">
                    <b>{displayNo || displayName || 'Member'}</b>
                    {displayName && (
                      <small
                        style={{
                          display: 'block',
                          opacity: 0.7,
                        }}
                      >
                        {displayName}
                      </small>
                    )}
                  </span>,

                  `${x.year}-${String(
                    x.month,
                  ).padStart(2, '0')}`,

                  naira(x.amount_due),

                  naira(x.amount_paid),

                  <span
                    className={
                      'badge ' +
                      (x.status === 'paid'
                        ? 'green'
                        : x.status === 'partial'
                          ? 'amber'
                          : 'red')
                    }
                  >
                    {x.status}
                  </span>,
                  <Button
                    key="v"
                    variant="secondary"
                    onClick={() => setViewDues(x)}
                  >
                    View
                  </Button>,
                ]
              })}
            />
          ) : (
            <Empty text="No dues records for this period." />
          )}
        </Card>
      </div>

      {open === 'dues' && (
        <Modal
          title="Generate monthly dues"
          onClose={() => setOpen(null)}
        >
          <form onSubmit={gen}>
            <div className="form-grid">
              <Field
                label="Year"
                type="number"
                value={period.year}
                onChange={(e) =>
                  setPeriod({
                    ...period,
                    year: Number(
                      e.target.value,
                    ),
                  })
                }
              />

              <Field
                label="Month"
                type="number"
                min="1"
                max="12"
                value={period.month}
                onChange={(e) =>
                  setPeriod({
                    ...period,
                    month: Number(
                      e.target.value,
                    ),
                  })
                }
              />
            </div>

            <Field
              label="Amount"
              type="number"
              step="0.01"
              value={period.amount}
              onChange={(e) =>
                setPeriod({
                  ...period,
                  amount: e.target.value,
                })
              }
              required
            />

            <div className="form-actions">
              <Button
                variant="ghost"
                type="button"
                onClick={() =>
                  setOpen(null)
                }
              >
                Cancel
              </Button>

              <Button>
                Generate
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {open === 'tx' && (
        <Modal
          title="Post financial transaction"
          onClose={() => setOpen(null)}
        >
          <form onSubmit={post}>
            <Select
              label="Member"
              value={tx.member_id}
              onChange={(e) =>
                setTx({
                  ...tx,
                  member_id:
                    e.target.value,
                })
              }
              required
            >
              <option value="">
                Select member
              </option>

              {members.map((m) => (
                <option
                  key={m.id}
                  value={m.id}
                >
                  {m.member_no} - {m.full_name}
                </option>
              ))}
            </Select>

            <div className="form-grid">
              <Select
                label="Account"
                value={tx.account_type}
                onChange={(e) =>
                  setTx({
                    ...tx,
                    account_type:
                      e.target.value,
                  })
                }
              >
                <option value="dues">
                  Dues
                </option>
                <option value="savings">
                  Savings
                </option>
                <option value="welfare">
                  Welfare
                </option>
                <option value="loan">
                  Loan
                </option>
              </Select>

              <Select
                label="Direction"
                value={tx.direction}
                onChange={(e) =>
                  setTx({
                    ...tx,
                    direction:
                      e.target.value,
                  })
                }
              >
                <option value="credit">
                  Credit
                </option>
                <option value="debit">
                  Debit
                </option>
              </Select>
            </div>

            <Field
              label="Transaction type"
              value={tx.transaction_type}
              onChange={(e) =>
                setTx({
                  ...tx,
                  transaction_type:
                    e.target.value,
                })
              }
              required
            />

            <Field
              label="Amount"
              type="number"
              step="0.01"
              value={tx.amount}
              onChange={(e) =>
                setTx({
                  ...tx,
                  amount: e.target.value,
                })
              }
              required
            />

            <Field
              label="Description"
              value={tx.description}
              onChange={(e) =>
                setTx({
                  ...tx,
                  description:
                    e.target.value,
                })
              }
            />

            <div className="form-actions">
              <Button
                variant="ghost"
                type="button"
                onClick={() =>
                  setOpen(null)
                }
              >
                Cancel
              </Button>

              <Button>
                Post transaction
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {viewDues && (
        <Modal title="Dues record" onClose={() => setViewDues(null)}>
          <p className="muted" style={{fontSize: 13}}>
            Period: <b>{viewDues.year}-{String(viewDues.month).padStart(2, '0')}</b>
          </p>
          <p className="muted" style={{fontSize: 13}}>
            Member: <b>{viewDues.member_name || memberMap.get(viewDues.member_id)?.full_name || viewDues.member_no || 'Member'}</b>
          </p>
          <p className="muted" style={{fontSize: 13}}>
            Due: <b>{naira(viewDues.amount_due)}</b>
          </p>
          <p className="muted" style={{fontSize: 13}}>
            Paid: <b>{naira(viewDues.amount_paid)}</b>
          </p>
          <p className="muted" style={{fontSize: 13}}>
            Status:{' '}
            <span className={'badge ' + (viewDues.status === 'paid' ? 'green' : viewDues.status === 'partial' ? 'amber' : 'red')}>
              {viewDues.status}
            </span>
          </p>
          <div className="form-actions">
            <Button variant="ghost" onClick={() => setViewDues(null)}>Close</Button>
          </div>
        </Modal>
      )}
    </AppShell>
  )
}
