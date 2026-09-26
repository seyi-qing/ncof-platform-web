'use client'

import { useEffect, useState } from 'react'
import AppShell from '@/components/AppShell'
import { api } from '@/lib/api'
import { getRole } from '@/lib/auth'
import {
  Card,
  PageHeader,
  Table,
  Button,
  Modal,
  Field,
  Select,
  Textarea,
  ErrorBox,
  SuccessBox,
  Empty,
} from '@/components/UI'

const REQUEST_ROLES = new Set([
  'admin',
  'executive',
  'treasurer',
])

export default function Operations() {
  const role = getRole()
  const canCreate =
    role === 'member' || REQUEST_ROLES.has(role)

  const [tab, setTab] = useState<
    'loans' | 'withdrawals' | 'welfare'
  >('loans')

  const [data, setData] = useState<any[]>([])
  const [members, setMembers] = useState<any[]>([])
  const [open, setOpen] = useState<string | null>(null)
  const [err, setErr] = useState('')
  const [viewItem, setViewItem] = useState<any>(null)
  const [success, setSuccess] = useState('')

  const [form, setForm] = useState<any>({
    member_id: '',
    amount: '',
    term_months: '12',
    purpose: '',
    category: '',
    reason: '',
    note: '',
  })

  const load = async () => {
    setErr('')
    try {
      const path =
        tab === 'loans'
          ? '/operations/loans/applications'
          : tab === 'withdrawals'
            ? '/operations/savings/withdrawals'
            : '/operations/welfare/claims'
      const records = await api<any[]>(path)
      setData(records)
      if (role !== 'member') {
        setMembers(await api<any[]>('/members'))
      }
    } catch (e: any) {
      setErr(e.message)
    }
  }

  useEffect(() => {
    void load()
  }, [tab])

  const memberMap = new Map(
    members.map((member) => [member.id, member]),
  )

  function memberDisplay(memberId: string) {
    const member = memberMap.get(memberId)
    if (!member) {
      return (
        <span>
          <b>{memberId}</b>
        </span>
      )
    }
    return (
      <span>
        <b>{member.member_no}</b>
        <small style={{ display: 'block', opacity: 0.7 }}>
          {member.full_name}
        </small>
      </span>
    )
  }

  function openRequest(kind: string) {
    setErr('')
    setSuccess('')
    setOpen(kind)
    setForm({
      member_id: '',
      amount: '',
      term_months: '12',
      purpose: '',
      category: '',
      reason: '',
      note: '',
    })
  }

  async function create(e: any) {
    e.preventDefault()
    setErr('')
    setSuccess('')
    try {
      let path = ''
      let body: any = {}
      if (open === 'loan') {
        path = '/operations/loans/applications'
        body = {
          member_id: form.member_id,
          amount: Number(form.amount),
          term_months: Number(form.term_months),
          purpose: form.purpose,
        }
      }
      if (open === 'withdrawal') {
        path = '/operations/savings/withdrawals'
        body = {
          member_id: form.member_id,
          amount: Number(form.amount),
          reason: form.reason || null,
        }
      }
      if (open === 'welfare') {
        path = '/operations/welfare/claims'
        body = {
          member_id: form.member_id,
          amount: Number(form.amount),
          category: form.category,
          reason: form.reason,
        }
      }
      await api(path, {
        method: 'POST',
        body: JSON.stringify(body),
      })
      setSuccess('Request submitted.')
      setOpen(null)
      await load()
    } catch (e: any) {
      setErr(e.message)
    }
  }

  async function decision(
    path: string,
    id: string,
    decisionValue: string,
  ) {
    setErr('')
    setSuccess('')
    try {
      await api(`${path}/${id}/decision`, {
        method: 'POST',
        body: JSON.stringify({
          decision: decisionValue,
          note: form.note || null,
        }),
      })
      setSuccess('Decision recorded.')
      await load()
    } catch (e: any) {
      setErr(e.message)
    }
  }

  function actionCell(x: any) {
    if (role === 'member') return null
    if (x.status === 'pending') {
      const base =
        tab === 'loans'
          ? '/operations/loans/applications'
          : tab === 'withdrawals'
            ? '/operations/savings/withdrawals'
            : '/operations/welfare/claims'
      return (
        <div className="pill-row">
          <Button
            variant="secondary"
            onClick={() => decision(base, x.id, 'approved')}
          >
            Approve
          </Button>
          <Button
            variant="danger"
            onClick={() => decision(base, x.id, 'rejected')}
          >
            Reject
          </Button>
        </div>
      )
    }
    return (
      <Button
        variant="secondary"
        onClick={() => setViewItem({ ...x, _kind: tab })}
      >
        View
      </Button>
    )
  }

  return (
    <AppShell title="Operations">
      <div className="content">
        <PageHeader
          title="Operations"
          description="Savings withdrawals, loans and welfare workflows."
          action={
            canCreate ? (
              <Button
                onClick={() =>
                  openRequest(
                    tab === 'loans'
                      ? 'loan'
                      : tab === 'withdrawals'
                        ? 'withdrawal'
                        : 'welfare',
                  )
                }
              >
                New request
              </Button>
            ) : undefined
          }
        />

        {err && <ErrorBox message={err} />}
        {success && <SuccessBox message={success} />}

        <div className="tabs">
          <button
            className={tab === 'loans' ? 'selected' : ''}
            onClick={() => setTab('loans')}
          >
            Loans
          </button>
          <button
            className={tab === 'withdrawals' ? 'selected' : ''}
            onClick={() => setTab('withdrawals')}
          >
            Withdrawals
          </button>
          <button
            className={tab === 'welfare' ? 'selected' : ''}
            onClick={() => setTab('welfare')}
          >
            Welfare
          </button>
        </div>

        <Card>
          {tab === 'loans' && (
            <Table
              headers={['Member', 'Amount', 'Term', 'Purpose', 'Status', 'Action']}
              rows={data.map((x) => [
                memberDisplay(x.member_id),
                x.amount,
                x.term_months,
                x.purpose,
                <span
                  key="s"
                  className={
                    'badge ' +
                    (x.status === 'approved' || x.status === 'disbursed'
                      ? 'green'
                      : x.status === 'rejected'
                        ? 'red'
                        : 'amber')
                  }
                >
                  {x.status}
                </span>,
                actionCell(x),
              ])}
            />
          )}

          {tab === 'withdrawals' && (
            <Table
              headers={['Member', 'Amount', 'Reason', 'Status', 'Action']}
              rows={data.map((x) => [
                memberDisplay(x.member_id),
                x.amount,
                x.reason || '\u2014',
                <span
                  key="s"
                  className={
                    'badge ' +
                    (x.status === 'approved'
                      ? 'green'
                      : x.status === 'rejected'
                        ? 'red'
                        : 'amber')
                  }
                >
                  {x.status}
                </span>,
                actionCell(x),
              ])}
            />
          )}

          {tab === 'welfare' && (
            <Table
              headers={['Member', 'Category', 'Amount', 'Reason', 'Status', 'Action']}
              rows={data.map((x) => [
                memberDisplay(x.member_id),
                x.category,
                x.amount,
                x.reason,
                <span
                  key="s"
                  className={
                    'badge ' +
                    (x.status === 'approved'
                      ? 'green'
                      : x.status === 'rejected'
                        ? 'red'
                        : 'amber')
                  }
                >
                  {x.status}
                </span>,
                actionCell(x),
              ])}
            />
          )}

          {!data.length && (
            <Empty text="No operational records found." />
          )}
        </Card>
      </div>

      {open && (
        <Modal
          title={
            open === 'loan'
              ? 'New loan application'
              : open === 'withdrawal'
                ? 'Savings withdrawal'
                : 'Welfare claim'
          }
          onClose={() => setOpen(null)}
        >
          <form onSubmit={create}>
            {role !== 'member' && (
              <Select
                label="Member"
                value={form.member_id}
                onChange={(e) =>
                  setForm({ ...form, member_id: e.target.value })
                }
                required
              >
                <option value="">Select member</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.member_no} \u2014 {m.full_name}
                  </option>
                ))}
              </Select>
            )}
            <Field
              label="Amount"
              type="number"
              step="0.01"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              required
            />
            {open === 'loan' ? (
              <>
                <Field
                  label="Term (months)"
                  type="number"
                  min="1"
                  max="120"
                  value={form.term_months}
                  onChange={(e) =>
                    setForm({ ...form, term_months: e.target.value })
                  }
                />
                <Textarea
                  label="Purpose"
                  value={form.purpose}
                  onChange={(e) =>
                    setForm({ ...form, purpose: e.target.value })
                  }
                  required
                />
              </>
            ) : (
              <>
                <Field
                  label={open === 'welfare' ? 'Category' : 'Reason'}
                  value={open === 'welfare' ? form.category : form.reason}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      [open === 'welfare' ? 'category' : 'reason']:
                        e.target.value,
                    })
                  }
                />
                {open === 'welfare' && (
                  <Textarea
                    label="Reason"
                    value={form.reason}
                    onChange={(e) =>
                      setForm({ ...form, reason: e.target.value })
                    }
                    required
                  />
                )}
              </>
            )}
            <div className="form-actions">
              <Button
                variant="ghost"
                type="button"
                onClick={() => setOpen(null)}
              >
                Cancel
              </Button>
              <Button>Submit</Button>
            </div>
          </form>
        </Modal>
      )}

      {viewItem && (
        <Modal
          title={`${viewItem._kind || 'Request'} \u2014 ${viewItem.status}`}
          onClose={() => setViewItem(null)}
        >
          <div style={{ fontSize: 13, lineHeight: 1.6 }}>
            <p>
              <b>Member:</b> {memberDisplay(viewItem.member_id)}
            </p>
            <p>
              <b>Amount:</b> {viewItem.amount}
            </p>
            {viewItem.purpose && (
              <p>
                <b>Purpose:</b> {viewItem.purpose}
              </p>
            )}
            {viewItem.reason && (
              <p>
                <b>Reason:</b> {viewItem.reason}
              </p>
            )}
            {viewItem.category && (
              <p>
                <b>Category:</b> {viewItem.category}
              </p>
            )}
            {viewItem.term_months && (
              <p>
                <b>Term:</b> {viewItem.term_months} months
              </p>
            )}
            <p>
              <b>Status:</b> {viewItem.status}
            </p>
            {viewItem.id && (
              <p className="muted" style={{ fontSize: 11 }}>
                ID: {viewItem.id}
              </p>
            )}
          </div>
          <div className="form-actions">
            <Button variant="ghost" onClick={() => setViewItem(null)}>
              Close
            </Button>
          </div>
        </Modal>
      )}
    </AppShell>
  )
}
