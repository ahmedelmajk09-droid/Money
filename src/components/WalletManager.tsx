
"use client";

import { useState } from "react";
import { useFinancialStore } from "@/lib/store";
import { ArrowLeft, Landmark, Plus, Minus, History as HistoryIcon, Pencil, TrendingUp, TrendingDown, Clock } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { ScrollArea } from "./ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

export function WalletManager({ store, onBack }: { store: ReturnType<typeof useFinancialStore>, onBack: () => void }) {
  const { data, depositCash, withdrawCash, updateCashBalance } = store;
  const [isDepositing, setIsDepositing] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [isEditingBalance, setIsEditingBalance] = useState(false);
  const [amount, setAmount] = useState("");
  const [editAmount, setEditAmount] = useState(data.cashBalance.toString());
  const [reason, setReason] = useState("");

  const handleDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;
    depositCash(parseFloat(amount), reason);
    setAmount("");
    setReason("");
    setIsDepositing(false);
  };

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;
    withdrawCash(parseFloat(amount), reason);
    setAmount("");
    setReason("");
    setIsWithdrawing(false);
  };

  const handleUpdateBalance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editAmount) return;
    updateCashBalance(parseFloat(editAmount));
    setIsEditingBalance(false);
  };

  const cashHistory = data.history.filter(h => h.type === 'cash_deposit' || h.type === 'cash_withdraw' || h.type === 'balance_update');

  return (
    <div className="space-y-10 flex flex-col min-h-full pb-10">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="w-11 h-11 rounded-full bg-white/5 flex items-center justify-center border border-white/10 active:scale-90 transition-transform">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="text-center">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Liquid Assets</h2>
          <p className="text-lg font-bold">My Wallet</p>
        </div>
        <div className="w-11" />
      </div>

      <div className="flex flex-col items-center justify-center gap-10">
        <div className="bg-white/5 backdrop-blur-2xl rounded-[3rem] p-10 w-full flex flex-col items-center gap-5 border border-white/10 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl" />
          
          <Dialog open={isEditingBalance} onOpenChange={setIsEditingBalance}>
            <DialogTrigger asChild>
              <button className="absolute top-6 right-6 p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors shadow-xl">
                <Pencil className="w-4 h-4 text-primary" />
              </button>
            </DialogTrigger>
            <DialogContent className="bg-[#1c1f2e] border-white/10 text-white rounded-[2.8rem] max-w-[90vw] mx-auto p-8 shadow-2xl">
              <DialogHeader><DialogTitle className="text-xl font-bold">Edit Total Cash</DialogTitle></DialogHeader>
              <form onSubmit={handleUpdateBalance} className="space-y-6 pt-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">Total Cash Balance (EGP)</Label>
                  <Input type="number" value={editAmount} onChange={(e) => setEditAmount(e.target.value)} className="bg-white/5 h-16 text-center text-3xl font-bold rounded-2xl border-white/10" />
                </div>
                <Button type="submit" className="w-full h-16 bg-primary rounded-2xl font-bold shadow-xl shadow-primary/20">Update Balance</Button>
              </form>
            </DialogContent>
          </Dialog>

          <div className="w-20 h-20 rounded-[2.2rem] bg-primary/10 flex items-center justify-center shadow-inner border border-primary/5">
            <Landmark className="w-10 h-10 text-primary" />
          </div>
          
          <div className="text-center space-y-1">
            <p className="text-[11px] font-bold text-white/40 uppercase tracking-widest">Available Balance</p>
            <div className="flex items-baseline justify-center gap-1.5">
              <span className="text-4xl font-bold font-headline">{data.cashBalance.toLocaleString()}</span>
              <span className="text-sm font-bold opacity-30">EGP</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 w-full">
          <Dialog open={isDepositing} onOpenChange={setIsDepositing}>
            <DialogTrigger asChild>
              <Button className="h-20 rounded-[1.8rem] bg-green-600/10 hover:bg-green-600/20 text-green-500 border border-green-500/20 flex flex-col gap-1 active:scale-95 transition-all shadow-lg">
                <Plus className="w-6 h-6" />
                <span className="text-xs font-bold uppercase tracking-widest">Deposit</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#1c1f2e] border-white/10 text-white rounded-[2.8rem] max-w-[90vw] mx-auto p-8 shadow-2xl">
              <DialogHeader><DialogTitle className="text-xl font-bold">Deposit Cash</DialogTitle></DialogHeader>
              <form onSubmit={handleDeposit} className="space-y-6 pt-4">
                <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" className="bg-white/5 h-16 text-center text-3xl font-bold rounded-2xl border-white/10" />
                <Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Monthly Salary" className="bg-white/5 h-14 rounded-2xl border-white/10" />
                <Button type="submit" className="w-full h-16 bg-green-600 rounded-2xl font-bold shadow-xl shadow-green-600/20 text-lg">Confirm Deposit</Button>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={isWithdrawing} onOpenChange={setIsWithdrawing}>
            <DialogTrigger asChild>
              <Button className="h-20 rounded-[1.8rem] bg-red-600/10 hover:bg-red-600/20 text-red-500 border border-red-500/20 flex flex-col gap-1 active:scale-95 transition-all shadow-lg">
                <Minus className="w-6 h-6" />
                <span className="text-xs font-bold uppercase tracking-widest">Withdraw</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#1c1f2e] border-white/10 text-white rounded-[2.8rem] max-w-[90vw] mx-auto p-8 shadow-2xl">
              <DialogHeader><DialogTitle className="text-xl font-bold">Withdraw Cash</DialogTitle></DialogHeader>
              <form onSubmit={handleWithdraw} className="space-y-6 pt-4">
                <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" className="bg-white/5 h-16 text-center text-3xl font-bold rounded-2xl border-white/10" />
                <Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Groceries, Rent" className="bg-white/5 h-14 rounded-2xl border-white/10" />
                <Button type="submit" className="w-full h-16 bg-red-600 rounded-2xl font-bold shadow-xl shadow-red-600/20 text-lg">Confirm Withdrawal</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2 text-white/30 text-[10px] uppercase font-bold tracking-[0.2em] px-2">
          <HistoryIcon className="w-3.5 h-3.5" /> Transaction History
        </div>
        <ScrollArea className="h-72 rounded-[3rem] bg-white/2 backdrop-blur-xl p-6 border border-white/5">
          <div className="space-y-6">
            {cashHistory.length === 0 && (
              <p className="text-center text-white/10 text-xs py-20 italic">No transactions yet.</p>
            )}
            {cashHistory.map((action) => (
              <div key={action.id} className="flex justify-between items-start">
                <div className="flex gap-4">
                  <div className={cn(
                    "w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border",
                    action.type === 'cash_deposit' ? 'bg-green-500/10 border-green-500/20 text-green-500' : 
                    action.type === 'cash_withdraw' ? 'bg-red-500/10 border-red-500/20 text-red-500' : 
                    'bg-primary/10 border-primary/20 text-primary'
                  )}>
                    {action.type === 'cash_deposit' ? <TrendingUp className="w-5 h-5" /> : 
                     action.type === 'cash_withdraw' ? <TrendingDown className="w-5 h-5" /> : 
                     <Landmark className="w-5 h-5" />}
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-white/90 leading-none pt-1">{action.description}</p>
                    <p className="text-[10px] text-white/20 uppercase font-bold tracking-tight">
                      {formatDistanceToNow(new Date(action.timestamp), { addSuffix: true })}
                    </p>
                  </div>
                </div>
                {action.amount !== undefined && (
                  <p className={cn(
                    "text-sm font-bold font-headline pt-1",
                    action.type === 'cash_deposit' ? 'text-green-500' : 
                    action.type === 'cash_withdraw' ? 'text-red-500' : 
                    'text-primary'
                  )}>
                    {action.type === 'cash_deposit' ? '+' : action.type === 'cash_withdraw' ? '-' : ''}{action.amount.toLocaleString()}
                  </p>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
