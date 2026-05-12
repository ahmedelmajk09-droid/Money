
"use client";

import { useState, useEffect, useCallback } from 'react';

export interface GoldDebt {
  id: string;
  name: string;
  photoSeed: string;
  photoDataUrl?: string; 
  amountGrams: number;
  paidAmountGrams: number;
  amountEGP?: number; 
  paidAmountEGP: number; 
  initialPriceUSDPerGram: number; 
  date: string;
}

export interface Bill {
  id: string;
  name: string;
  amount: number;
  dueDay: number; 
  isPaid: boolean;
  isRecurring: boolean;
  lastPaidMonth?: string; 
}

export interface HistoryAction {
  id: string;
  type: 'debt_add' | 'debt_repay' | 'bill_add' | 'bill_paid' | 'bill_unpaid' | 'balance_update' | 'gold_price_update' | 'cash_deposit' | 'cash_withdraw';
  description: string;
  timestamp: string;
  amount?: number; 
}

export interface FinancialData {
  userName: string;
  cashBalance: number;
  goldDebts: GoldDebt[];
  bills: Bill[];
  goldPrice: number;
  history: HistoryAction[];
}

const STORAGE_KEY = 'gilded_pulse_master_v1';

const DEFAULT_DATA: FinancialData = {
  userName: 'Ahmed',
  cashBalance: 14000,
  goldDebts: [],
  bills: [],
  goldPrice: 4500,
  history: [],
};

export function useFinancialStore() {
  const [data, setData] = useState<FinancialData>(DEFAULT_DATA);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed: FinancialData = JSON.parse(saved);
        const now = new Date();
        const currentMonthStr = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
        
        const updatedBills = (parsed.bills || []).map(bill => {
          if (bill.isRecurring && bill.isPaid && bill.lastPaidMonth !== currentMonthStr) {
            return { ...bill, isPaid: false };
          }
          return bill;
        });

        setData({ ...parsed, bills: updatedBills });
      } catch (e) {
        console.error("Failed to parse saved data", e);
      }
    }
    setIsLoaded(true);
  }, []);

  const saveData = useCallback((newData: FinancialData) => {
    setData(newData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
  }, []);

  const addHistory = (type: HistoryAction['type'], description: string, amount?: number) => {
    return {
      id: Math.random().toString(36).substring(2, 11),
      type,
      description,
      timestamp: new Date().toISOString(),
      amount
    };
  };

  const addDebt = (debt: Omit<GoldDebt, 'id' | 'paidAmountGrams' | 'paidAmountEGP'>) => {
    const newDebt: GoldDebt = { 
      ...debt, 
      id: Math.random().toString(36).substring(2, 11),
      paidAmountGrams: 0,
      paidAmountEGP: 0
    };
    saveData({ 
      ...data, 
      goldDebts: [...data.goldDebts, newDebt],
      history: [addHistory('debt_add', `Added debt for ${debt.name}`), ...data.history]
    });
  };

  const reorderDebts = (newDebts: GoldDebt[]) => {
    saveData({ ...data, goldDebts: newDebts });
  };

  const updateDebtPhoto = (id: string, seed: string, dataUrl?: string) => {
    const updatedDebts = data.goldDebts.map(d => 
      d.id === id ? { ...d, photoSeed: seed, photoDataUrl: dataUrl } : d
    );
    saveData({ ...data, goldDebts: updatedDebts });
  };

  const removeDebtPhoto = (id: string) => {
    const updatedDebts = data.goldDebts.map(d => 
      d.id === id ? { ...d, photoDataUrl: undefined } : d
    );
    saveData({ ...data, goldDebts: updatedDebts });
  };

  const repayDebt = (id: string, amount: number, type: 'grams' | 'egp') => {
    const target = data.goldDebts.find(d => d.id === id);
    if (!target) return;

    const cashToAdd = type === 'egp' ? amount : amount * data.goldPrice;

    const updatedDebts = data.goldDebts.map(d => {
      if (d.id === id) {
        if (d.amountEGP) {
          return { ...d, paidAmountEGP: d.paidAmountEGP + amount };
        } else {
          if (type === 'grams') {
            return { 
              ...d, 
              paidAmountGrams: d.paidAmountGrams + amount,
              paidAmountEGP: d.paidAmountEGP + (amount * data.goldPrice)
            };
          } else {
            const gramsEquiv = amount / data.goldPrice;
            return { 
              ...d, 
              paidAmountGrams: d.paidAmountGrams + gramsEquiv,
              paidAmountEGP: d.paidAmountEGP + amount
            };
          }
        }
      }
      return d;
    }).filter(d => {
      if (d.amountEGP) return d.paidAmountEGP < d.amountEGP - 0.01;
      return d.paidAmountGrams < d.amountGrams - 0.001;
    });

    saveData({ 
      ...data, 
      cashBalance: data.cashBalance + cashToAdd,
      goldDebts: updatedDebts,
      history: [
        addHistory('debt_repay', `Received from ${target.name}: ${amount} ${type.toUpperCase()}`, cashToAdd), 
        ...data.history
      ]
    });
  };

  const removeDebt = (id: string) => {
    saveData({ ...data, goldDebts: data.goldDebts.filter(d => d.id !== id) });
  };

  const addBill = (bill: Omit<Bill, 'id' | 'isPaid' | 'lastPaidMonth'>) => {
    const newBill: Bill = {
      ...bill,
      id: Math.random().toString(36).substring(2, 11),
      isPaid: false
    };
    saveData({
      ...data,
      bills: [...data.bills, newBill],
      history: [addHistory('bill_add', `New bill added: ${bill.name} (${bill.amount} EGP)`), ...data.history]
    });
  };

  const toggleBill = (id: string) => {
    const bill = data.bills.find(b => b.id === id);
    if (!bill) return;
    
    const newStatus = !bill.isPaid;
    const now = new Date();
    const currentMonthStr = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;

    saveData({ 
      ...data, 
      bills: data.bills.map(b => b.id === id ? { 
        ...b, 
        isPaid: newStatus,
        lastPaidMonth: newStatus ? currentMonthStr : b.lastPaidMonth 
      } : b),
      history: [addHistory(newStatus ? 'bill_paid' : 'bill_unpaid', `${newStatus ? 'Paid' : 'Unmarked'} ${bill.name}`), ...data.history]
    });
  };

  const removeBill = (id: string) => {
    saveData({ ...data, bills: data.bills.filter(b => b.id !== id) });
  };

  const depositCash = (amount: number, reason: string) => {
    saveData({
      ...data,
      cashBalance: data.cashBalance + amount,
      history: [addHistory('cash_deposit', reason || `Deposited ${amount.toLocaleString()} EGP`, amount), ...data.history]
    });
  };

  const withdrawCash = (amount: number, reason: string) => {
    saveData({
      ...data,
      cashBalance: Math.max(0, data.cashBalance - amount),
      history: [addHistory('cash_withdraw', reason || `Withdrew ${amount.toLocaleString()} EGP`, amount), ...data.history]
    });
  };

  const updateCashBalance = (amount: number) => {
    saveData({
      ...data,
      cashBalance: amount,
      history: [addHistory('balance_update', `Updated total cash to ${amount.toLocaleString()} EGP`, amount), ...data.history]
    });
  };

  const updateGoldPrice = (price: number) => {
    saveData({ 
      ...data, 
      goldPrice: price,
      history: [addHistory('gold_price_update', `Updated gold price to ${price.toLocaleString()} EGP`), ...data.history]
    });
  };

  const updateUserName = (name: string) => {
    saveData({ ...data, userName: name });
  };

  const totalMoneyOutside = data.goldDebts.reduce((acc, d) => {
    if (d.amountEGP) return acc + (d.amountEGP - d.paidAmountEGP);
    const remainingGrams = d.amountGrams - d.paidAmountGrams;
    return acc + (remainingGrams * data.goldPrice);
  }, 0);

  const totalOriginalMoneyOutside = data.goldDebts.reduce((acc, d) => {
    if (d.amountEGP) return acc + (d.amountEGP - d.paidAmountEGP);
    const remainingGrams = d.amountGrams - d.paidAmountGrams;
    return acc + (remainingGrams * d.initialPriceUSDPerGram);
  }, 0);

  const totalBills = data.bills.reduce((acc, b) => acc + (b.isPaid ? 0 : b.amount), 0);
  const totalBalance = data.cashBalance + totalMoneyOutside;

  const hasUrgentBills = data.bills.some(bill => {
    if (bill.isPaid) return false;
    const now = new Date();
    const currentDay = now.getDate();
    return bill.dueDay <= currentDay;
  });

  return {
    data,
    isLoaded,
    totalBalance,
    totalMoneyOutside,
    totalOriginalMoneyOutside,
    totalBills,
    hasUrgentBills,
    addDebt,
    reorderDebts,
    updateDebtPhoto,
    removeDebtPhoto,
    repayDebt,
    removeDebt,
    addBill,
    toggleBill,
    removeBill,
    depositCash,
    withdrawCash,
    updateCashBalance,
    updateGoldPrice,
    updateUserName,
  };
}
