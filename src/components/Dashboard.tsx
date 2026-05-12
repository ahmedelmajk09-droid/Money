
"use client";

import { useState, useEffect } from "react";
import { useFinancialStore } from "@/lib/store";
import { ChevronRight, Clock, ListChecks, User, TrendingUp, Sparkles, Pencil, History as HistoryIcon, TrendingDown, AlertCircle } from "lucide-react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { ScrollArea } from "./ui/scroll-area";
import { formatDistanceToNow } from "date-fns";

export function Dashboard({ store, onNavigate }: { store: ReturnType<typeof useFinancialStore>, onNavigate: (tab: string) => void }) {
  const { data, totalBalance, totalMoneyOutside, totalOriginalMoneyOutside, totalBills, hasUrgentBills, updateGoldPrice, updateUserName } = store;
  const [isEditingGold, setIsEditingGold] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [newGoldPrice, setNewGoldPrice] = useState(data.goldPrice.toString());
  const [newName, setNewName] = useState(data.userName);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setNewGoldPrice(data.goldPrice.toString());
    setNewName(data.userName);
  }, [data.goldPrice, data.userName]);

  if (!mounted) return null;

  const handleGoldUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    updateGoldPrice(parseFloat(newGoldPrice) || 0);
    setIsEditingGold(false);
  };

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserName(newName);
    setIsProfileOpen(false);
  };

  const collectionProgress = data.goldDebts.length > 0 ? 
    Math.round((data.goldDebts.reduce((acc, d) => {
      const total = d.amountEGP || d.amountGrams;
      const paid = d.amountEGP ? d.paidAmountEGP : (d.paidAmountGrams + (d.paidAmountEGP / data.goldPrice));
      return acc + (paid / total);
    }, 0) / data.goldDebts.length) * 100) : 0;

  const totalDiff = totalMoneyOutside - totalOriginalMoneyOutside;
  const totalPercent = totalOriginalMoneyOutside > 0 ? (totalDiff / totalOriginalMoneyOutside) * 100 : 0;

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-start">
        <div className="space-y-1">
          <p className="text-white/40 text-sm">Welcome back!</p>
          <h1 className="text-2xl font-bold">Hello, {data.userName}!</h1>
        </div>
        
        <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
          <DialogTrigger asChild>
            <button className="relative">
              <div className="w-12 h-12 rounded-full bg-[#1c1f2e] flex items-center justify-center border border-white/10 shadow-lg hover:border-primary/50 transition-colors">
                <User className="w-6 h-6 text-white/70" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full border-2 border-[#0a0c1a]" />
            </button>
          </DialogTrigger>
          <DialogContent className="bg-[#1c1f2e] border-white/10 text-white rounded-[2rem] max-w-[90vw] mx-auto p-6">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold mb-4">Profile & Activity</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs text-white/40 uppercase tracking-widest font-bold">Your Name</Label>
                  <div className="flex gap-2">
                    <Input 
                      value={newName} 
                      onChange={(e) => setNewName(e.target.value)}
                      className="bg-white/5 border-white/10 rounded-xl"
                    />
                    <Button type="submit" size="sm" className="rounded-xl bg-primary">Save</Button>
                  </div>
                </div>
              </form>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-white/40 uppercase tracking-widest font-bold text-[10px]">
                  <HistoryIcon className="w-3 h-3" /> Recent Activity
                </div>
                <ScrollArea className="h-64 rounded-xl bg-white/5 p-4 border border-white/5">
                  <div className="space-y-4">
                    {data.history.map((action) => (
                      <div key={action.id} className="flex gap-3 items-start">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                        <div className="space-y-0.5">
                          <p className="text-xs text-white/90">{action.description}</p>
                          <p className="text-[10px] text-white/30">
                            {formatDistanceToNow(new Date(action.timestamp), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    ))}
                    {data.history.length === 0 && (
                      <p className="text-center text-white/20 text-xs py-8">No actions recorded yet.</p>
                    )}
                  </div>
                </ScrollArea>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </header>

      <div className="flex items-center gap-3 text-sm">
        <Dialog open={isEditingGold} onOpenChange={setIsEditingGold}>
          <DialogTrigger asChild>
            <button className="flex items-center gap-2 hover:bg-white/5 px-3 py-1 rounded-full transition-colors border border-transparent hover:border-white/10">
              <span className="text-white/60">Gold 24: {data.goldPrice.toLocaleString()} EGP</span>
              <Pencil className="w-3 h-3 text-primary" />
            </button>
          </DialogTrigger>
          <DialogContent className="bg-[#1c1f2e] border-white/10 text-white rounded-[2.5rem] p-8">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Update Market Price</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleGoldUpdate} className="space-y-6 pt-4">
              <div className="space-y-2">
                <Label className="text-xs text-white/60">Current Price per Gram (EGP)</Label>
                <Input 
                  type="number" 
                  value={newGoldPrice} 
                  onChange={(e) => setNewGoldPrice(e.target.value)}
                  className="bg-white/5 border-white/10 rounded-2xl h-14 text-center text-2xl font-bold"
                />
              </div>
              <Button type="submit" className="w-full h-14 bg-primary rounded-2xl font-bold text-lg">
                Update Gold Price
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="main-balance-card">
        <p className="text-white/70 text-sm mb-1">Total Net Balance</p>
        <div className="flex items-baseline gap-1">
          <h2 className="text-4xl font-bold font-headline">{Math.round(totalBalance).toLocaleString()}</h2>
          <span className="text-xl opacity-70">EGP</span>
        </div>
        <div className="mt-4 flex gap-2">
          <Button 
            onClick={() => onNavigate('advisor')}
            variant="secondary" 
            className="h-10 rounded-xl bg-primary/40 border-0 hover:bg-primary/50 text-xs font-bold"
          >
            <Sparkles className="w-4 h-4 mr-1.5" /> AI Advisor
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <button onClick={() => onNavigate('debts')} className="w-full text-left space-y-3">
          <div className="status-row-card">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">Money outside</p>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 ${totalPercent >= 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {totalPercent >= 0 ? <TrendingUp className="w-2 h-2" /> : <TrendingDown className="w-2 h-2" />}
                    {Math.abs(totalPercent).toFixed(1)}%
                  </span>
                </div>
                <p className="text-white/40 text-xs">{Math.round(totalMoneyOutside).toLocaleString()} EGP</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-white/20" />
          </div>
          <div className="px-1 space-y-1.5">
            <div className="flex justify-between text-[10px] text-white/40 font-bold uppercase tracking-wider">
              <span>Collection Progress</span>
              <span>{collectionProgress}%</span>
            </div>
            <div className="progress-line">
              <div className="progress-fill" style={{ width: `${collectionProgress}%` }} />
            </div>
          </div>
        </button>

        <button onClick={() => onNavigate('wallet')} className="status-row-card w-full">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 text-lg font-bold">
              $
            </div>
            <div>
              <p className="text-sm font-medium">Cash Liquidity</p>
              <p className="text-white/40 text-xs">{data.cashBalance.toLocaleString()} EGP</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-white/20" />
        </button>

        <button onClick={() => onNavigate('bills')} className="status-row-card w-full relative">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
              <ListChecks className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium">Monthly Bills</p>
              <p className="text-white/40 text-xs">{totalBills.toLocaleString()} EGP Remaining</p>
              <p className="text-[9px] text-white/20 mt-0.5 italic">*Bills do not affect net balance</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {hasUrgentBills && (
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-destructive/20 text-destructive text-[9px] font-bold animate-pulse">
                <AlertCircle className="w-3 h-3" /> DUE
              </div>
            )}
            <ChevronRight className="w-5 h-5 text-white/20" />
          </div>
          
          {hasUrgentBills && (
            <div className="absolute -top-1 -left-1 w-3 h-3 bg-destructive rounded-full border-2 border-background animate-bounce" />
          )}
        </button>
      </div>
    </div>
  );
}
