
"use client";

import { useState, useRef } from "react";
import { useFinancialStore, GoldDebt } from "@/lib/store";
import { ArrowLeft, Plus, HandCoins, History as HistoryIcon, TrendingUp, TrendingDown, Trash2, Camera, Copy, Scale, Clock, Info, AlertTriangle } from "lucide-react";
import Image from "next/image";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { GlassCard } from "./GlassCard";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export function DebtLedger({ store, onBack }: { store: ReturnType<typeof useFinancialStore>, onBack: () => void }) {
  const { data, totalMoneyOutside, addDebt, repayDebt, removeDebt, updateDebtPhoto, reorderDebts } = store;
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);
  
  const [isOpen, setIsOpen] = useState(false);
  const [settleDebtId, setSettleDebtId] = useState<string | null>(null);
  const [infoDebt, setInfoDebt] = useState<GoldDebt | null>(null);
  const [repaymentAmount, setRepaymentAmount] = useState("");
  const [repaymentType, setRepaymentType] = useState<'grams' | 'egp'>('grams');
  const [isDragging, setIsDragging] = useState<number | null>(null);

  const [showSummary, setShowSummary] = useState(false);
  const [summaryText, setSummaryText] = useState("");

  const [name, setName] = useState("");
  const [photoSeed, setPhotoSeed] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"grams" | "egp">("grams");
  const [initialPrice, setInitialPrice] = useState(data.goldPrice.toString());

  const handleDragStart = (e: React.DragEvent, index: number) => {
    dragItem.current = index;
    setIsDragging(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnter = (index: number) => {
    dragOverItem.current = index;
  };

  const handleDragEnd = () => {
    if (dragItem.current !== null && dragOverItem.current !== null && dragItem.current !== dragOverItem.current) {
      const newList = [...data.goldDebts];
      const draggedItemContent = newList[dragItem.current];
      newList.splice(dragItem.current, 1);
      newList.splice(dragOverItem.current, 0, draggedItemContent);
      reorderDebts(newList);
    }
    dragItem.current = null;
    dragOverItem.current = null;
    setIsDragging(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !amount) return;

    addDebt({
      name,
      photoSeed: photoSeed || name.toLowerCase().replace(/\s/g, '-'),
      amountGrams: type === "grams" ? parseFloat(amount) : 0,
      amountEGP: type === "egp" ? parseFloat(amount) : undefined,
      initialPriceUSDPerGram: parseFloat(initialPrice) || data.goldPrice,
      date: new Date().toISOString().split('T')[0]
    });

    setName(""); setAmount(""); setPhotoSeed(""); setIsOpen(false);
  };

  const handleSettle = (e: React.FormEvent) => {
    e.preventDefault();
    if (settleDebtId && repaymentAmount) {
      const debt = data.goldDebts.find(d => d.id === settleDebtId);
      if (!debt) return;

      const amt = parseFloat(repaymentAmount);
      const isGrams = repaymentType === 'grams';
      const currentPrice = data.goldPrice;
      
      if (!debt.amountEGP) {
        const paidGms = isGrams ? amt : amt / currentPrice;
        const paidEGP = isGrams ? amt * currentPrice : amt;
        
        const newTotalPaidGms = debt.paidAmountGrams + paidGms;
        const remGms = Math.max(0, debt.amountGrams - newTotalPaidGms);
        const remEGP = remGms * currentPrice;

        const msg = `سعر الدهب النهاردة: ${currentPrice.toLocaleString()} جنيه
المدفوع بالجرام: ${paidGms.toFixed(3)} جرام
اللي فاضل بالجرام: ${remGms.toFixed(3)} جرام
المدفوع كاش: ${Math.round(paidEGP).toLocaleString()} جنيه
اللي فاضل كاش: ${Math.round(remEGP).toLocaleString()} جنيه`;

        setSummaryText(msg);
        setShowSummary(true);
      }

      repayDebt(settleDebtId, amt, repaymentType);
      setSettleDebtId(null);
      setRepaymentAmount("");
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(summaryText);
    toast({ title: "تم النسخ", description: "تم نسخ ملخص العملية بنجاح" });
    setShowSummary(false);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && infoDebt) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        updateDebtPhoto(infoDebt.id, infoDebt.photoSeed, base64String);
        setInfoDebt({ ...infoDebt, photoDataUrl: base64String });
        toast({ title: "Photo Updated", description: "Profile picture saved successfully." });
      };
      reader.readAsDataURL(file);
    }
  };

  const getPhotoUrl = (debt: GoldDebt) => {
    if (debt.photoDataUrl) return debt.photoDataUrl;
    return `https://picsum.photos/seed/${debt.photoSeed}/200/200`;
  };

  return (
    <div className="space-y-6 flex flex-col min-h-full pb-10">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="w-11 h-11 rounded-full bg-white/5 flex items-center justify-center border border-white/10 active:scale-90 transition-transform">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="text-center">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">MONEY OUTSIDE</h2>
          <p className="text-lg font-bold">{Math.round(totalMoneyOutside).toLocaleString()} <span className="text-[10px] opacity-40">EGP</span></p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <button className="w-11 h-11 rounded-2xl bg-primary/20 text-primary flex items-center justify-center border border-primary/20 active:scale-90 transition-transform">
              <Plus className="w-6 h-6" />
            </button>
          </DialogTrigger>
          <DialogContent className="bg-[#1c1f2e] border-white/10 text-white rounded-[2.5rem] max-w-[90vw] mx-auto p-6 shadow-2xl">
            <DialogHeader><DialogTitle className="text-lg font-bold">New Debt Record</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-5 pt-2">
              <div className="space-y-1.5">
                <Label className="text-[9px] font-bold uppercase tracking-widest text-white/40 ml-1">Debtor Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full Name" className="bg-white/5 border-white/10 rounded-xl h-12" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[9px] font-bold uppercase tracking-widest text-white/40 ml-1">Avatar Key</Label>
                <Input value={photoSeed} onChange={(e) => setPhotoSeed(e.target.value)} placeholder="e.g. car, watch" className="bg-white/5 border-white/10 rounded-xl h-12" />
              </div>
              <div className="space-y-3">
                <Tabs value={type} onValueChange={(v: any) => setType(v)}>
                  <TabsList className="grid grid-cols-2 bg-white/5 rounded-xl h-11">
                    <TabsTrigger value="grams" className="rounded-lg text-xs">Grams</TabsTrigger>
                    <TabsTrigger value="egp" className="rounded-lg text-xs">EGP</TabsTrigger>
                  </TabsList>
                </Tabs>
                <div className={cn("gap-3", type === "grams" ? "grid grid-cols-2" : "flex flex-col")}>
                  <div className="space-y-1.5">
                    <Label className="text-[9px] font-bold uppercase tracking-widest text-white/40 ml-1">{type === "grams" ? "Weight" : "Amount"}</Label>
                    <Input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" className="bg-white/5 border-white/10 rounded-xl h-12" />
                  </div>
                  {type === "grams" && (
                    <div className="space-y-1.5">
                      <Label className="text-[9px] font-bold uppercase tracking-widest text-white/40 ml-1">Buy Rate</Label>
                      <Input type="number" value={initialPrice} onChange={(e) => setInitialPrice(e.target.value)} className="bg-white/5 border-white/10 rounded-xl h-12" />
                    </div>
                  )}
                </div>
              </div>
              <Button type="submit" className="w-full h-14 bg-primary rounded-xl font-bold shadow-xl shadow-primary/20">Save Record</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {data.goldDebts.length === 0 && (
          <div className="py-20 text-center space-y-4">
            <div className="w-16 h-16 rounded-[2rem] bg-white/5 mx-auto flex items-center justify-center">
              <Scale className="w-8 h-8 text-white/10" />
            </div>
            <p className="text-white/20 text-[11px] font-medium">No active debts.</p>
          </div>
        )}
        {data.goldDebts.map((debt, i) => {
          const remainingGrams = debt.amountEGP ? 0 : (debt.amountGrams - debt.paidAmountGrams);
          const currentValue = debt.amountEGP ? (debt.amountEGP - debt.paidAmountEGP) : remainingGrams * data.goldPrice;
          const progress = debt.amountEGP ? (debt.paidAmountEGP / debt.amountEGP) * 100 : (debt.paidAmountGrams / debt.amountGrams) * 100;
          const marketChangePercent = debt.initialPriceUSDPerGram > 0 
            ? ((data.goldPrice - debt.initialPriceUSDPerGram) / debt.initialPriceUSDPerGram) * 100 
            : 0;

          return (
            <div 
              key={debt.id} 
              draggable 
              onDragStart={(e) => handleDragStart(e, i)}
              onDragEnter={() => handleDragEnter(i)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => e.preventDefault()}
              className={cn(
                "bg-white/5 backdrop-blur-2xl rounded-[2.2rem] p-5 space-y-4 border border-white/10 shadow-xl transition-all cursor-grab active:cursor-grabbing",
                isDragging === i ? "opacity-30 scale-95 border-primary/50" : "opacity-100",
                "stagger-item"
              )} 
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full border-2 border-primary/40 p-0.5 overflow-hidden">
                    <Image src={getPhotoUrl(debt)} alt={debt.name} width={40} height={40} className="rounded-full h-full w-full object-cover" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-bold text-sm leading-none">{debt.name}</h3>
                      {!debt.amountEGP && (
                        <span className={cn(
                          "text-[8px] px-1 py-0.5 rounded font-bold uppercase tracking-tight",
                          marketChangePercent >= 0 ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                        )}>
                          {marketChangePercent >= 0 ? '+' : ''}{marketChangePercent.toFixed(1)}%
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] font-bold text-white/40 uppercase">
                      {debt.amountEGP ? `${(debt.amountEGP - debt.paidAmountEGP).toLocaleString()} EGP` : `${remainingGrams.toFixed(2)} g`} Left
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onMouseDown={(e) => e.stopPropagation()} 
                    onTouchStart={(e) => e.stopPropagation()}
                    onClick={() => { setSettleDebtId(debt.id); setRepaymentType(debt.amountEGP ? 'egp' : 'grams'); }} 
                    className="w-9 h-9 bg-primary/20 rounded-xl border border-primary/20 text-primary flex items-center justify-center active:scale-90 transition-transform"
                  >
                    <HandCoins className="w-4 h-4" />
                  </button>
                  <button 
                    onMouseDown={(e) => e.stopPropagation()} 
                    onTouchStart={(e) => e.stopPropagation()}
                    onClick={() => setInfoDebt(debt)} 
                    className="w-9 h-9 bg-white/5 rounded-xl border border-white/10 text-white/60 flex items-center justify-center active:scale-90 transition-transform"
                  >
                    <Info className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-baseline px-0.5">
                  <span className="text-[9px] text-white/30 font-bold uppercase">Valuation: {Math.round(currentValue).toLocaleString()} EGP</span>
                  <span className="text-[10px] font-bold text-white/60">{Math.round(progress)}%</span>
                </div>
                <div className="progress-line h-1.5">
                  <div className="progress-fill" style={{ width: `${progress}%` }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Dialog open={!!settleDebtId} onOpenChange={(open) => !open && setSettleDebtId(null)}>
        <DialogContent className="bg-[#1c1f2e] border-white/10 text-white rounded-[2.5rem] max-w-[90vw] mx-auto p-6 shadow-2xl">
          <DialogHeader><DialogTitle className="text-lg font-bold">Register Payment</DialogTitle></DialogHeader>
          <div className="space-y-5 pt-2">
            {settleDebtId && !data.goldDebts.find(d => d.id === settleDebtId)?.amountEGP && (
              <Tabs value={repaymentType} onValueChange={(v: any) => setRepaymentType(v)}>
                <TabsList className="grid grid-cols-2 bg-white/5 rounded-xl h-11">
                  <TabsTrigger value="grams" className="rounded-lg text-xs">Grams</TabsTrigger>
                  <TabsTrigger value="egp" className="rounded-lg text-xs">Cash</TabsTrigger>
                </TabsList>
              </Tabs>
            )}
            <form onSubmit={handleSettle} className="space-y-5">
              <div className="space-y-1.5">
                <Label className="text-[9px] font-bold uppercase tracking-widest text-white/40 text-center block">Amount Paid ({repaymentType.toUpperCase()})</Label>
                <Input type="number" step="0.01" value={repaymentAmount} onChange={(e) => setRepaymentAmount(e.target.value)} className="bg-white/5 h-14 text-center text-2xl font-bold rounded-xl border-white/10" />
              </div>
              <Button type="submit" className="w-full h-14 bg-primary rounded-xl font-bold shadow-xl shadow-primary/20">Confirm</Button>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showSummary} onOpenChange={setShowSummary}>
        <DialogContent className="bg-[#1c1f2e] border-white/10 text-white rounded-[2.5rem] max-w-[90vw] mx-auto p-8 shadow-2xl">
          <DialogHeader><DialogTitle className="text-lg font-bold text-center">ملخص العملية</DialogTitle></DialogHeader>
          <div className="space-y-6 pt-2">
            <div className="bg-white/5 p-6 rounded-2xl border border-white/10 whitespace-pre-line leading-relaxed font-bold text-center text-sm" dir="rtl">
              {summaryText}
            </div>
            <Button onClick={copyToClipboard} className="h-14 bg-primary rounded-xl font-bold w-full">
              <Copy className="w-4 h-4 ml-2" /> نسخ الملخص
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!infoDebt} onOpenChange={(open) => !open && setInfoDebt(null)}>
        <DialogContent className="bg-[#1c1f2e] border-white/10 text-white rounded-[2.5rem] max-w-[92vw] mx-auto p-5 overflow-y-auto max-h-[85vh] shadow-2xl">
          <DialogHeader className="mb-2">
            <DialogTitle className="text-lg font-bold truncate pr-8">{infoDebt?.name}</DialogTitle>
          </DialogHeader>
          {infoDebt && (() => {
            const remainingGrams = infoDebt.amountGrams - infoDebt.paidAmountGrams;
            const currentVal = infoDebt.amountEGP ? (infoDebt.amountEGP - infoDebt.paidAmountEGP) : remainingGrams * data.goldPrice;
            const diff = data.goldPrice - infoDebt.initialPriceUSDPerGram;
            const pnl = infoDebt.amountEGP ? 0 : (remainingGrams * diff);
            const marketChange = infoDebt.initialPriceUSDPerGram > 0 ? (diff / infoDebt.initialPriceUSDPerGram) * 100 : 0;
            
            return (
              <div className="space-y-5 pt-1">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-2xl border-2 border-primary/30 p-0.5 shadow-lg overflow-hidden">
                      <Image src={getPhotoUrl(infoDebt)} alt={infoDebt.name} width={64} height={64} className="rounded-xl h-full w-full object-cover" />
                    </div>
                    <button onClick={() => fileInputRef.current?.click()} className="absolute -bottom-1 -right-1 w-7 h-7 rounded-lg bg-primary flex items-center justify-center border-2 border-[#1c1f2e] shadow-lg">
                      <Camera className="w-3.5 h-3.5" />
                    </button>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                  </div>
                  <div className="flex-1 grid grid-cols-2 gap-2">
                    <div className="bg-white/5 p-2 rounded-xl border border-white/5">
                      <p className="text-[7px] text-white/40 uppercase font-bold">Entry Rate</p>
                      <p className="text-[10px] font-bold">{infoDebt.initialPriceUSDPerGram.toLocaleString()} <span className="text-[7px] opacity-40">EGP</span></p>
                    </div>
                    <div className="bg-white/5 p-2 rounded-xl border border-white/5">
                      <p className="text-[7px] text-white/40 uppercase font-bold">Total Grams</p>
                      <p className="text-[10px] font-bold">{infoDebt.amountGrams.toFixed(2)} g</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-white/30 uppercase tracking-[0.2em] font-bold text-[8px] px-1">
                    <HistoryIcon className="w-3.5 h-3.5" /> Total Settlement
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <GlassCard variant="indigo" className="p-4 flex flex-col gap-1 rounded-[1.8rem]">
                      <p className="text-[8px] text-primary/70 uppercase font-bold">Paid in Grams</p>
                      <p className="text-sm font-bold">{infoDebt.paidAmountGrams.toFixed(2)} g</p>
                    </GlassCard>
                    <GlassCard variant="indigo" className="p-4 flex flex-col gap-1 rounded-[1.8rem]">
                      <p className="text-[8px] text-primary/70 uppercase font-bold">Paid in Cash</p>
                      <p className="text-sm font-bold">{Math.round(infoDebt.paidAmountEGP).toLocaleString()} <span className="text-[8px] opacity-40">EGP</span></p>
                    </GlassCard>
                  </div>
                </div>

                {!infoDebt.amountEGP && (
                  <GlassCard className={cn(
                    "p-4 rounded-[2rem] flex items-center justify-between shadow-lg",
                    pnl >= 0 ? "bg-green-500/10 border-green-500/20" : "bg-red-500/10 border-red-500/20"
                  )}>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <p className="text-[8px] text-white/40 uppercase font-bold tracking-widest">Market P&L</p>
                        <span className={cn(
                          "text-[8px] font-bold px-1 py-0.5 rounded",
                          marketChange >= 0 ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                        )}>
                          {marketChange >= 0 ? '+' : ''}{marketChange.toFixed(1)}%
                        </span>
                      </div>
                      <h4 className={cn(
                        "text-lg font-bold font-headline leading-none",
                        pnl >= 0 ? 'text-green-400' : 'text-red-400'
                      )}>
                        {pnl >= 0 ? '+' : ''}{Math.round(pnl).toLocaleString()} <span className="text-[9px]">EGP</span>
                      </h4>
                    </div>
                    {pnl >= 0 ? <TrendingUp className="w-5 h-5 text-green-400" /> : <TrendingDown className="w-5 h-5 text-red-400" />}
                  </GlassCard>
                )}

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-white/30 uppercase tracking-[0.2em] font-bold text-[8px] px-1">
                    <Clock className="w-3.5 h-3.5" /> Current Outstanding
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <GlassCard className="p-4 rounded-[1.8rem] bg-white/5 border-white/10">
                      <p className="text-[8px] text-white/40 uppercase font-bold">Remaining g</p>
                      <p className="text-sm font-bold">{infoDebt.amountEGP ? 0 : remainingGrams.toFixed(2)} g</p>
                    </GlassCard>
                    <GlassCard className="p-4 rounded-[1.8rem] bg-primary/5 border-primary/10">
                      <p className="text-[8px] text-primary uppercase font-bold">Cash Value</p>
                      <p className="text-sm font-bold text-primary">{Math.round(currentVal).toLocaleString()} EGP</p>
                    </GlassCard>
                  </div>
                </div>

                <div className="pt-6 mt-4 border-t border-white/5 space-y-3">
                  <div className="flex items-center gap-2 text-destructive uppercase tracking-[0.2em] font-bold text-[8px] px-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> Danger Zone
                  </div>
                  <Button 
                    variant="destructive" 
                    className="w-full h-12 rounded-2xl bg-destructive/10 hover:bg-destructive text-destructive hover:text-white border border-destructive/20 font-bold text-[10px]"
                    onClick={() => {
                      if (infoDebt) {
                        removeDebt(infoDebt.id);
                        setInfoDebt(null);
                        toast({ title: "Record Deleted", description: "Debt record has been permanently removed." });
                      }
                    }}
                  >
                    <Trash2 className="w-4 h-4 mr-2" /> Delete Debt Record
                  </Button>
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
