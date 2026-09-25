export type Member = {
  id: string
  member_no: string
  full_name: string
  email?: string | null
  phone?: string | null
  membership_status: string
  joined_at: string
}

export type Meeting = {
  id: string
  title: string
  meeting_date: string
  location?: string | null
  status: string
}

export type ElectionEnvelope = {
  election: {
    id: string
    title: string
    description?: string | null
    opens_at: string
    closes_at: string
    status: string
  }
  positions: Array<{
    id: string
    name: string
    description?: string | null
    sort_order: number
    max_selections: number
  }>
  candidates: Array<{
    id: string
    member_id: string
    position: string
    position_id?: string | null
  }>
}
