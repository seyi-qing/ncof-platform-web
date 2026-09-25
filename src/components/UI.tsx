'use client'
import {Loader2,Plus,RefreshCw,AlertCircle,CheckCircle2} from 'lucide-react';
export function Card({children,className='' }:{children:React.ReactNode;className?:string}){return <section className={'card '+className}>{children}</section>}
export function Stat({label,value,meta,icon:Icon}:{label:string;value:React.ReactNode;meta?:string;icon?:any}){return <Card className="stat"><div className="stat-top"><span>{label}</span>{Icon&&<div className="stat-icon"><Icon size={18}/></div>}</div><strong>{value}</strong>{meta&&<small>{meta}</small>}</Card>}
export function Button({children,loading=false,variant='primary',...p}:any){return <button className={'btn '+variant} disabled={loading||p.disabled} {...p}>{loading&&<Loader2 className="spin" size={15}/>} {children}</button>}
export function ErrorBox({message}:{message:string}){return <div className="alert error"><AlertCircle size={17}/>{message}</div>}
export function SuccessBox({message}:{message:string}){return <div className="alert success"><CheckCircle2 size={17}/>{message}</div>}
export function PageHeader({title,description,action}:{title:string;description?:string;action?:React.ReactNode}){return <div className="page-header"><div><h2>{title}</h2>{description&&<p>{description}</p>}</div>{action}</div>}
export function Empty({text='No records found.'}:{text?:string}){return <div className="empty">{text}</div>}
export function Refresh({onClick}:{onClick:()=>void}){return <button className="iconbtn" onClick={onClick} title="Refresh"><RefreshCw size={16}/></button>}
export function Modal({title,onClose,children}:{title:string;onClose:()=>void;children:React.ReactNode}){return <div className="modal-backdrop" onMouseDown={onClose}><div className="modal" onMouseDown={e=>e.stopPropagation()}><div className="modal-head"><h3>{title}</h3><button className="iconbtn" onClick={onClose}>×</button></div>{children}</div></div>}
export function Field({label,...p}:any){return <label className="field"><span>{label}</span><input {...p}/></label>}
export function Select({label,children,...p}:any){return <label className="field"><span>{label}</span><select {...p}>{children}</select></label>}
export function Textarea({label,...p}:any){return <label className="field"><span>{label}</span><textarea {...p}/></label>}
export function Table({headers,rows}:{headers:string[];rows:React.ReactNode[][]}){return <div className="table-wrap"><table><thead><tr>{headers.map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{rows.map((r,i)=><tr key={i}>{r.map((c,j)=><td key={j}>{c}</td>)}</tr>)}</tbody></table></div>}

export function Badge({children, tone='gray'}:{children:React.ReactNode;tone?:'gray'|'green'|'red'|'amber'|'blue'}){return <span className={'badge '+tone}>{children}</span>}
export function Loading({text='Loading…'}:{text?:string}){return <div className="empty"><Loader2 className="spin" size={18}/> {text}</div>}
