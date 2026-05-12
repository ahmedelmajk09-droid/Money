
"use client";

import { useState } from "react";
import { useFinancialStore } from "@/lib/store";
import { ArrowLeft, Square, CheckSquare, Plus, History as HistoryIcon, Clock, Trash2, CheckCircle2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { ScrollArea } from "./ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

export function BillManager({ store, onBack }: { store: ReturnType<typeof useFinancialStore>, onBack: () => void }) {
  const { data, totalBills, toggleBill, removeBill, addBill } = store;
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [day, setDay] = useState(new Date().getDate().toString());
  const [isRecurring, setIsRecurring] = useState(false);

  const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !amount || !day) return;
    addBill({ name, amount: parseFloat(amount), dueDay: parseInt(day), isRecurring });
    setName(""); setAmount(""); setDay(new Date().getDate().toString()); setIsRecurring(false); setIsOpen(false);
  };

  const billHistory = data.history.filter(h => h.type === 'bill_paid' || h.type === 'bill_unpaid' || h.type === 'bill_add');

  return (
    <div className="space-y-8 flex flex-col min-h-full pb-8">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="w-11 h-11 rounded-full bg-white/5 flex items-center justify-center border border-white/10 active:scale-90 transition-transform">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="text-center">
          <h2 className="text-xs font-bold text-white/70 uppercase tracking-widest">Bills Due</h2>
          <p className="text-xl font-bold text-white">{totalBills.toLocaleString()} <span className="text-[10px] opacity-40">EGP</span></p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <button className="w-11 h-11 rounded-[1.2rem] bg-[#5e5ce6] flex items-center justify-center text-white shadow-xl shadow-[#5e5ce6]/20 active:scale-90 transition-transform">
              <Plus className="w-6 h-6" />
            </button>
          </DialogTrigger>
          <DialogContent className="bg-[#1c1f2e] border-white/10 text-white rounded-[2.8rem] max-w-[90vw] mx-auto p-8 shadow-2xl">
            <DialogHeader><DialogTitle className="text-xl font-bold">New Monthly Bill</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6 pt-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">Description</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Internet, Electricity" className="bg-white/5 h-14 rounded-2xl border-white/10 focus:ring-primary" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">Amount (EGP)</Label>
                <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" className="bg-white/5 h-14 rounded-2xl border-white/10 focus:ring-primary" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">Payment Day</Label>
                <Select value={day} onValueChange={setDay}>
                  <SelectTrigger className="bg-white/5 h-14 rounded-2xl border-white/10">
                    <SelectValue placeholder="Due Day" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1c1f2e] text-white border-white/10 rounded-2xl max-h-64">
                    {days.map(d => <SelectItem key={d} value={d} className="rounded-xl">Day {d}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between py-2 px-1">
                <div className="space-y-0.5">
                  <Label className="text-sm font-bold">Monthly Recurring</Label>
                  <p className="text-[10px] text-white/40">Resets on the 1st of every month</p>
                </div>
                <Switch checked={isRecurring} onCheckedChange={setIsRecurring} className="data-[state=checked]:bg-primary" />
              </div>
              <Button type="submit" className="w-full h-16 bg-primary rounded-[1.5rem] text-lg font-bold shadow-xl shadow-primary/20">Add Bill</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {data.bills.length === 0 && (
          <div className="py-20 text-center space-y-4">
            <div className="w-16 h-16 rounded-[2rem] bg-white/5 mx-auto flex items-center justify-center">
              <Clock className="w-8 h-8 text-white/20" />
            </div>
            <p className="text-white/30 text-xs italic">No bills recorded yet.</p>
          </div>
        )}
        {data.bills.map((bill, i) => (
          <div key={bill.id} className={cn(
            "rounded-[2.2rem] p-6 flex items-center justify-between border transition-all active:scale-95 stagger-item",
            bill.isPaid 
              ? 'bg-white/2 border-white/5 opacity-40 grayscale' 
              : 'bg-white/5 border-white/10 shadow-lg'
          )} style={{ animationDelay: `${i * 0.05}s` }}>
            <div className="flex items-center gap-5">
              <button 
                onClick={() => toggleBill(bill.id)}
                className="w-8 h-8 flex items-center justify-center"
              >
                {bill.isPaid ? (
                  <CheckSquare className="w-7 h-7 text-primary" />
                ) : (
                  <Square className="w-7 h-7 text-white/20" />
                )}
              </button>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white">{bill.name}</h3>
                <div className="px-1.5 py-0.5 rounded-md bg-white/5 border border-white/5 text-[9px] font-bold text-white/40 uppercase w-fit">Day {bill.dueDay}</div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <p className="text-sm font-bold text-white">{bill.amount.toLocaleString()} <span className="text-[9px] opacity-40">EGP</span></p>
              <button onClick={() => removeBill(bill.id)} className="p-2 -mr-2 text-destructive/20 hover:text-destructive active:scale-90 transition-all">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-auto space-y-4">
        <div className="flex items-center gap-2 text-white/30 text-[10px] uppercase font-bold tracking-[0.2em] px-2">
          <HistoryIcon className="w-3.5 h-3.5" /> Settlement History
        </div>
        <ScrollArea className="h-64 rounded-[2.5rem] bg-white/2 backdrop-blur-md p-6 border border-white/5">
          <div className="space-y-6 relative">
            <div className="absolute left-4 top-2 bottom-2 w-px bg-white/10" />
            {billHistory.length === 0 && (
              <p className="text-center text-white/10 text-[10px] py-10">No recent activity.</p>
            )}
            {billHistory.map(h => (
              <div key={h.id} className="flex gap-4 items-start relative z-10">
                <div className={cn(
                  "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border shadow-lg",
                  h.type === 'bill_paid' ? 'bg-green-500/10 border-green-500/20 text-green-500' :
                  h.type === 'bill_unpaid' ? 'bg-white/5 border-white/10 text-white/40' :
                  'bg-primary/10 border-primary/20 text-primary'
                )}>
                  {h.type === 'bill_paid' ? <CheckCircle2 className="w-4 h-4" /> : 
                   h.type === 'bill_unpaid' ? <Clock className="w-4 h-4" /> : 
                   <Plus className="w-4 h-4" />}
                </div>
                <div className="flex-1 space-y-1 pt-0.5">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-white/80">{h.description}</span>
                    <span className="text-[8px] font-bold text-white/20 uppercase">
                      {formatDistanceToNow(new Date(h.timestamp), { addSuffix: true })}
                    </span>
                  </div>
                  <div className="h-px w-full bg-white/5" />
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
