export type Role='admin'|'executive'|'treasurer'|'secretary'|'auditor'|'member'
export type Member={id:string;member_no:string;full_name:string;email?:string|null;phone?:string|null;membership_status:string;joined_at:string;has_login_account:boolean}
export type Dashboard={members:number;users:number;meetings:number;transactions:number;dues_due:string;dues_paid:string;savings_deposits:string}
export type MemberDashboard={member:{id:string;member_no:string;full_name:string;status:string};balances:{dues_outstanding:string;savings:string;loan_outstanding:string};attendance_records:number;unread_notifications:number}
export type Election={id:string;title:string;description?:string|null;opens_at:string;closes_at:string;status:string}
export type ElectionDetail=Election & {positions:any[];candidates:any[];voting_method:string}
