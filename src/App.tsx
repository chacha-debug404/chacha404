import React, { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Plus, Wallet, CreditCard, Coins, ArrowDownCircle, PiggyBank, Receipt, Trash2, X, Star, Heart, Sparkles, Calendar } from 'lucide-react';
import { Transaction, TransactionType, ExpenseCategory, PaymentMethod } from './types';

const getCurrentMonth = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

export default function App() {
  const [currentMonth, setCurrentMonth] = useState(getCurrentMonth());
  const [budgets, setBudgets] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('budgets');
    return saved ? JSON.parse(saved) : {};
  });
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('transactions');
    return saved ? JSON.parse(saved) : [];
  });
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [budgetInput, setBudgetInput] = useState('');

  useEffect(() => {
    localStorage.setItem('budgets', JSON.stringify(budgets));
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }, [budgets, transactions]);

  const monthTransactions = useMemo(() => {
    return transactions.filter(t => t.date.startsWith(currentMonth)).sort((a, b) => b.date.localeCompare(a.date));
  }, [transactions, currentMonth]);

  const { totalIncome, totalExpense, totalConsumption, totalSavings, totalCard, totalCash, totalFixed, totalFixedCard, totalFixedCash } = useMemo(() => {
    return monthTransactions.reduce(
      (acc, t) => {
        if (t.type === 'income') {
          acc.totalIncome += t.amount;
        } else if (t.type === 'expense') {
          acc.totalExpense += t.amount;
          if (t.isFixed) {
            acc.totalFixed += t.amount;
            if (t.paymentMethod === 'card') acc.totalFixedCard += t.amount;
            if (t.paymentMethod === 'cash') acc.totalFixedCash += t.amount;
          } else {
            if (t.category === 'consumption') {
              acc.totalConsumption += t.amount;
              if (t.paymentMethod === 'card') acc.totalCard += t.amount;
              if (t.paymentMethod === 'cash') acc.totalCash += t.amount;
            } else if (t.category === 'savings') {
              acc.totalSavings += t.amount;
            }
          }
        }
        return acc;
      },
      { totalIncome: 0, totalExpense: 0, totalConsumption: 0, totalSavings: 0, totalCard: 0, totalCash: 0, totalFixed: 0, totalFixedCard: 0, totalFixedCash: 0 }
    );
  }, [monthTransactions]);

  const baseBudget = budgets[currentMonth] || 0;
  const remainingBudget = baseBudget - totalConsumption;

  const handlePrevMonth = () => {
    const [year, month] = currentMonth.split('-').map(Number);
    const d = new Date(year, month - 2);
    setCurrentMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  };

  const handleNextMonth = () => {
    const [year, month] = currentMonth.split('-').map(Number);
    const d = new Date(year, month);
    setCurrentMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  };

  const handleSetBudget = () => {
    setBudgetInput(baseBudget === 0 ? '' : baseBudget.toLocaleString());
    setIsBudgetModalOpen(true);
  };

  const saveBudget = (e: React.FormEvent) => {
    e.preventDefault();
    const newBudget = parseInt(budgetInput.replace(/[^0-9]/g, ''), 10);
    if (!isNaN(newBudget)) {
      setBudgets(prev => ({ ...prev, [currentMonth]: newBudget }));
    } else if (budgetInput.trim() === '') {
      setBudgets(prev => ({ ...prev, [currentMonth]: 0 }));
    }
    setIsBudgetModalOpen(false);
  };

  const saveTransaction = (t: Transaction) => {
    setTransactions(prev => {
      const exists = prev.find(x => x.id === t.id);
      if (exists) {
        return prev.map(x => x.id === t.id ? t : x);
      }
      return [...prev, t];
    });
    closeForm();
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
    closeForm();
  };

  const openEditModal = (t: Transaction) => {
    setEditingTx(t);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingTx(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center sm:p-4 font-sans">
      {/* Soft Pastel Device Shell */}
      <div className="w-full sm:w-[420px] h-[100dvh] sm:h-[860px] bg-white/80 backdrop-blur-md sm:rounded-[3rem] sm:border-4 border-white sm:shadow-[0_15px_40px_rgba(255,182,193,0.6)] sm:p-3 flex flex-col relative">
        
        {/* Inner Screen */}
        <div className="flex-1 bg-[#fffafb] sm:rounded-[2.2rem] overflow-hidden flex flex-col relative border-2 border-[#ffe4e1] shadow-inner">
          
          {/* Header */}
          <header className="bg-white/90 backdrop-blur-sm border-b-2 border-[#ffe4e1] z-10 shrink-0">
            <div className="px-5 h-16 flex items-center justify-between">
              <button onClick={handlePrevMonth} className="p-2 bg-[#fff0f5] text-[#ff99cc] rounded-full hover:bg-[#ffe4e1] hover:scale-105 transition-all">
                <ChevronLeft className="w-5 h-5" strokeWidth={3} />
              </button>
              <h1 className="text-xl font-bold text-[#ff8da1] tracking-widest flex items-center gap-2">
                <Star className="w-4 h-4 fill-[#ffb6c1] text-[#ffb6c1] animate-twinkle" />
                {currentMonth.split('-')[0]}.{currentMonth.split('-')[1]}
                <Star className="w-4 h-4 fill-[#ffb6c1] text-[#ffb6c1] animate-twinkle" />
              </h1>
              <button onClick={handleNextMonth} className="p-2 bg-[#fff0f5] text-[#ff99cc] rounded-full hover:bg-[#ffe4e1] hover:scale-105 transition-all">
                <ChevronRight className="w-5 h-5" strokeWidth={3} />
              </button>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto px-5 py-6 space-y-7 pb-28 custom-scrollbar">
            
            {/* Soft Tamagotchi LCD Screen (Budget) */}
            <section className="bg-gradient-to-b from-[#ffb6c1] to-[#ff99cc] rounded-[2.5rem] p-3 shadow-[0_6px_0_#ff8da1] relative animate-float">
              <div className="bg-[#f0f8ea] rounded-3xl p-5 border-4 border-[#e2eedc] shadow-inner relative overflow-hidden">
                {/* LCD Screen Glare */}
                <div className="absolute top-0 left-0 w-full h-1/2 bg-white/20 rounded-b-full"></div>
                
                <div className="flex justify-between items-end mb-3 relative z-10">
                  <div className="flex items-center gap-3 pt-2">
                    <h2 className="text-sm font-bold text-[#5c6b56] flex items-center gap-1.5">
                      <Heart className="w-4 h-4 fill-[#ff99cc] text-[#ff99cc]" /> 남은 예산
                    </h2>
                    {/* Y2K Sparkles Decoration */}
                    <div className="relative flex items-center justify-center w-10 h-10">
                      <Sparkles className="absolute -top-1 -right-1 w-5 h-5 text-yellow-300 animate-ping" />
                      <Sparkles className="absolute top-2 left-0 w-4 h-4 text-blue-300 animate-bounce delay-75" />
                      <Sparkles className="absolute -bottom-1 right-2 w-3 h-3 text-[#ff99cc] animate-pulse delay-150" />
                      <div className="w-1 h-1 bg-white rounded-full absolute top-1 right-3 animate-ping"></div>
                    </div>
                  </div>
                  <button onClick={handleSetBudget} className="text-[11px] font-bold bg-[#e2eedc] text-[#5c6b56] px-2.5 py-1 rounded-full hover:bg-[#d0e4cd] transition-colors">
                    [설정]
                  </button>
                </div>
                
                <div className="text-4xl font-bold text-[#4a5d4e] mb-5 tracking-tighter flex items-end gap-1 relative z-10">
                  {remainingBudget.toLocaleString()} <span className="text-lg mb-1.5 text-[#7a8c76]">원</span>
                </div>
                
                <div className="grid grid-cols-2 gap-3 pt-4 border-t-2 border-[#d0e4cd] border-dashed relative z-10">
                  <div>
                    <div className="text-[11px] font-bold text-[#7a8c76] mb-1">INCOME</div>
                    <div className="text-sm font-bold text-[#5c6b56]">
                      +{ totalIncome.toLocaleString() }
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-[#7a8c76] mb-1">EXPENSE</div>
                    <div className="text-sm font-bold text-[#ff8da1]">
                      -{ totalExpense.toLocaleString() }
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Pastel Summary Stickers */}
            <section className="grid grid-cols-2 gap-4">
              <div className="bg-[#e0ffff] rounded-3xl p-4 border-2 border-white shadow-[0_4px_15px_rgba(176,224,230,0.5)] flex flex-col items-center text-center space-y-2 hover:-translate-y-1 transition-transform">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-[#00ced1] shadow-sm mb-1">
                  <Receipt className="w-5 h-5" strokeWidth={2.5} />
                </div>
                <div className="text-xs font-bold text-[#008b8b] bg-white/50 px-3 py-1 rounded-full">소비</div>
                <div className="flex flex-col items-center">
                  <div className="font-bold text-[#008b8b] text-lg">{totalConsumption.toLocaleString()}원</div>
                  <div className="text-[10px] font-bold text-[#008b8b] opacity-70 mt-0.5">
                    카드 {totalCard.toLocaleString()} | 현금 {totalCash.toLocaleString()}
                  </div>
                </div>
              </div>
              <div className="bg-[#f0e6ff] rounded-3xl p-4 border-2 border-white shadow-[0_4px_15px_rgba(216,191,216,0.5)] flex flex-col items-center text-center space-y-2 hover:-translate-y-1 transition-transform">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-[#ba55d3] shadow-sm mb-1">
                  <PiggyBank className="w-5 h-5" strokeWidth={2.5} />
                </div>
                <div className="text-xs font-bold text-[#8a2be2] bg-white/50 px-3 py-1 rounded-full">저축</div>
                <div className="font-bold text-[#8a2be2] text-lg">{totalSavings.toLocaleString()}원</div>
              </div>
              <div className="col-span-2 bg-[#ffebd6] rounded-3xl p-4 border-2 border-white shadow-[0_4px_15px_rgba(255,218,185,0.5)] flex flex-col items-center text-center space-y-2 hover:-translate-y-1 transition-transform">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-[#ff8c00] shadow-sm mb-1">
                  <Calendar className="w-5 h-5" strokeWidth={2.5} />
                </div>
                <div className="text-xs font-bold text-[#d2691e] bg-white/50 px-3 py-1 rounded-full">고정지출</div>
                <div className="flex flex-col items-center">
                  <div className="font-bold text-[#d2691e] text-lg">{totalFixed.toLocaleString()}원</div>
                  <div className="text-[10px] font-bold text-[#d2691e] opacity-70 mt-0.5">
                    카드 {totalFixedCard.toLocaleString()} | 현금 {totalFixedCash.toLocaleString()}
                  </div>
                </div>
              </div>
            </section>

            {/* Transaction List */}
            <section>
              <h3 className="text-sm font-bold text-[#ff8da1] mb-4 px-2 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#ffb6c1]" /> ♡ 상세 내역 ♡
              </h3>
              {monthTransactions.length === 0 ? (
                <div className="text-center py-12 bg-white/60 backdrop-blur-sm border-2 border-[#ffb6c1] border-dashed rounded-[2rem] shadow-[0_4px_20px_rgba(255,182,193,0.2)]">
                  <div className="text-lg font-bold text-[#ff8da1] mb-3">§ 고생 많았어 §</div>
                  <div className="text-sm font-bold text-[#ffb6c1] mb-8">♥오늘 하루 푹 쉬어♥</div>
                  <div className="inline-block bg-gradient-to-r from-[#ffb6c1] to-[#ff99cc] text-white px-4 py-2 text-xs font-bold rounded-full shadow-md animate-pulse">
                    난 성공할 수 밖에 없어^-^
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {monthTransactions.map(t => (
                    <div 
                      key={t.id} 
                      onClick={() => openEditModal(t)}
                      className="bg-white p-4 rounded-2xl border-2 border-[#fff0f5] shadow-[0_4px_15px_rgba(255,182,193,0.25)] flex items-center justify-between cursor-pointer hover:-translate-y-1 hover:shadow-[0_8px_20px_rgba(255,182,193,0.4)] transition-all"
                    >
                      <div className="flex items-center space-x-4 min-w-0">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 shadow-inner ${
                          t.type === 'income' ? 'bg-[#e0ffff] text-[#00ced1]' :
                          t.category === 'savings' ? 'bg-[#f0e6ff] text-[#ba55d3]' : 'bg-[#ffe4e1] text-[#ff8da1]'
                        }`}>
                          {t.type === 'income' ? <ArrowDownCircle className="w-6 h-6" strokeWidth={2} /> :
                           t.category === 'savings' ? <PiggyBank className="w-6 h-6" strokeWidth={2} /> : <Receipt className="w-6 h-6" strokeWidth={2} />}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-[#555] truncate text-base mb-1">{t.description}</div>
                          <div className="text-[11px] font-bold text-[#aaa] flex items-center space-x-1.5">
                            <span className="bg-[#f5f5f5] px-2 py-0.5 rounded-full">{t.date.split('-')[2]}일</span>
                            {t.type === 'expense' && (
                              <>
                                <span className="text-[#ddd]">|</span>
                                <span className="bg-[#f5f5f5] px-2 py-0.5 rounded-full">{t.paymentMethod === 'cash' ? '현금' : t.paymentMethod === 'card' ? '카드' : '포인트'}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center shrink-0 ml-3">
                        <div className={`font-bold text-base ${t.type === 'income' ? 'text-[#00ced1]' : t.category === 'savings' ? 'text-[#ba55d3]' : 'text-[#ff8da1]'}`}>
                          {t.type === 'income' ? '+' : t.category === 'savings' ? '' : '-'}{t.amount.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </main>

          {/* Floating Action Button */}
          <div className="absolute bottom-6 right-5 z-20">
            <button
              onClick={() => setIsFormOpen(true)}
              className="w-16 h-16 bg-gradient-to-br from-[#ff99cc] to-[#ff69b4] text-white rounded-full shadow-[0_8px_20px_rgba(255,105,180,0.5)] flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
            >
              <Plus className="w-8 h-8" strokeWidth={3} />
            </button>
          </div>

          {/* Budget Modal */}
          {isBudgetModalOpen && (
            <div className="absolute inset-0 bg-[#ffb6c1]/30 backdrop-blur-sm z-50 flex items-center justify-center p-5">
              <div className="bg-white w-full max-w-xs rounded-3xl border-4 border-[#ffe4e1] shadow-[0_15px_40px_rgba(255,182,193,0.5)] animate-in zoom-in-95 duration-300 flex flex-col overflow-hidden">
                <div className="bg-[#ffe4e1] px-5 py-3 flex justify-between items-center shrink-0">
                  <h2 className="text-[#ff8da1] font-bold text-base flex items-center gap-2">
                    <Heart className="w-4 h-4 fill-[#ff8da1] text-[#ff8da1]" />
                    예산 설정.exe
                  </h2>
                  <button onClick={() => setIsBudgetModalOpen(false)} className="bg-white text-[#ff8da1] rounded-full p-1 hover:bg-[#ffb6c1] hover:text-white transition-colors">
                    <X className="w-4 h-4" strokeWidth={3} />
                  </button>
                </div>
                <form onSubmit={saveBudget} className="p-6 bg-[#fffafb] space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-[#ff8da1] mb-4 text-center">★ 이번 달 예산을 입력해줘 ★</label>
                    <div className="relative">
                      <input 
                        type="text" 
                        autoFocus
                        placeholder="0"
                        value={budgetInput}
                        onChange={e => {
                          const val = e.target.value.replace(/[^0-9]/g, '');
                          setBudgetInput(val ? Number(val).toLocaleString() : '');
                        }}
                        className="w-full px-4 py-3 bg-white border-2 border-[#ffe4e1] rounded-2xl focus:border-[#ffb6c1] focus:ring-4 focus:ring-[#fff0f5] outline-none text-right pr-10 text-lg font-bold text-[#555] transition-all"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#aaa] font-bold text-sm">원</span>
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3.5 bg-gradient-to-r from-[#ffb6c1] to-[#ff99cc] text-white rounded-2xl font-bold shadow-[0_4px_15px_rgba(255,182,193,0.5)] hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    확인 (OK)
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Modal */}
          {isFormOpen && (
            <TransactionModal 
              onClose={closeForm} 
              onSave={saveTransaction} 
              onDelete={deleteTransaction}
              currentMonth={currentMonth}
              initialData={editingTx}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function TransactionModal({ 
  onClose, 
  onSave, 
  onDelete,
  currentMonth, 
  initialData 
}: { 
  onClose: () => void, 
  onSave: (t: Transaction) => void, 
  onDelete: (id: string) => void,
  currentMonth: string,
  initialData: Transaction | null
}) {
  const [type, setType] = useState<TransactionType>(initialData?.type || 'expense');
  const [category, setCategory] = useState<ExpenseCategory>(initialData?.category || 'consumption');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(initialData?.paymentMethod || 'card');
  const [isFixed, setIsFixed] = useState(initialData?.isFixed || false);
  const [amount, setAmount] = useState(initialData ? initialData.amount.toLocaleString() : '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [date, setDate] = useState(initialData?.date || `${currentMonth}-01`);
  
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (!initialData) {
      const today = new Date();
      const todayMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
      if (currentMonth === todayMonth) {
        setDate(`${todayMonth}-${String(today.getDate()).padStart(2, '0')}`);
      } else {
        setDate(`${currentMonth}-01`);
      }
    }
  }, [currentMonth, initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description || !date) return;

    const numAmount = parseInt(amount.replace(/[^0-9]/g, ''), 10);
    if (isNaN(numAmount) || numAmount <= 0) return;

    const newTx: Transaction = {
      id: initialData ? initialData.id : Math.random().toString(36).substr(2, 9),
      date,
      type,
      amount: numAmount,
      description,
      ...(type === 'expense' ? { category, paymentMethod, isFixed } : {})
    };

    onSave(newTx);
  };

  return (
    <div className="absolute inset-0 bg-[#ffb6c1]/30 backdrop-blur-sm z-50 flex items-center justify-center p-5">
      {/* Cute Pastel Window Popup */}
      <div className="bg-white w-full max-w-sm rounded-3xl border-4 border-[#ffe4e1] shadow-[0_15px_40px_rgba(255,182,193,0.5)] animate-in zoom-in-95 duration-300 flex flex-col max-h-[90%] overflow-hidden">
        
        {/* Window Title Bar */}
        <div className="bg-[#ffe4e1] px-5 py-3 flex justify-between items-center shrink-0">
          <h2 className="text-[#ff8da1] font-bold text-base flex items-center gap-2">
            <Heart className="w-4 h-4 fill-[#ff8da1] text-[#ff8da1]" />
            {initialData ? '기록 수정.exe' : '새 기록.exe'}
          </h2>
          <button onClick={onClose} className="bg-white text-[#ff8da1] rounded-full p-1 hover:bg-[#ffb6c1] hover:text-white transition-colors">
            <X className="w-4 h-4" strokeWidth={3} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex-1 overflow-y-auto space-y-6 bg-[#fffafb]">
          
          {/* Type Toggle */}
          <div className="flex gap-3 shrink-0 bg-white p-1.5 rounded-2xl border-2 border-[#ffe4e1]">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${type === 'expense' ? 'bg-[#ffb6c1] text-white shadow-md' : 'text-[#ffb6c1] hover:bg-[#fff0f5]'}`}
            >
              지출
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${type === 'income' ? 'bg-[#87ceeb] text-white shadow-md' : 'text-[#87ceeb] hover:bg-[#f0f8ff]'}`}
            >
              수입
            </button>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-[#ff8da1] mb-1.5 ml-1">▶ DATE</label>
              <input 
                type="date" 
                required
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-4 py-3 bg-white border-2 border-[#ffe4e1] rounded-2xl focus:border-[#ffb6c1] focus:ring-4 focus:ring-[#fff0f5] outline-none text-[#555] font-bold text-sm transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#ff8da1] mb-1.5 ml-1">▶ AMOUNT</label>
              <div className="relative">
                <input 
                  type="text" 
                  required
                  placeholder="0"
                  value={amount}
                  onChange={e => {
                    const val = e.target.value.replace(/[^0-9]/g, '');
                    setAmount(val ? Number(val).toLocaleString() : '');
                  }}
                  className="w-full px-4 py-3 bg-white border-2 border-[#ffe4e1] rounded-2xl focus:border-[#ffb6c1] focus:ring-4 focus:ring-[#fff0f5] outline-none text-right pr-10 text-lg font-bold text-[#555] transition-all"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#aaa] font-bold text-sm">원</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#ff8da1] mb-1.5 ml-1">▶ MEMO</label>
              <input 
                type="text" 
                required
                placeholder="내용 입력..."
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full px-4 py-3 bg-white border-2 border-[#ffe4e1] rounded-2xl focus:border-[#ffb6c1] focus:ring-4 focus:ring-[#fff0f5] outline-none text-[#555] font-bold text-sm transition-all"
              />
            </div>

            {type === 'expense' && (
              <>
                <div className="pt-2">
                  <label className="block text-xs font-bold text-[#ff8da1] mb-2 ml-1">▶ CATEGORY</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setCategory('consumption')}
                      className={`py-3 px-2 rounded-2xl text-sm font-bold transition-all border-2 ${category === 'consumption' ? 'bg-[#ffe4e1] border-[#ffb6c1] text-[#ff8da1]' : 'bg-white border-[#ffe4e1] text-[#ccc] hover:border-[#ffb6c1]'}`}
                    >
                      소비
                    </button>
                    <button
                      type="button"
                      onClick={() => setCategory('savings')}
                      className={`py-3 px-2 rounded-2xl text-sm font-bold transition-all border-2 ${category === 'savings' ? 'bg-[#f0e6ff] border-[#d8bfd8] text-[#ba55d3]' : 'bg-white border-[#ffe4e1] text-[#ccc] hover:border-[#d8bfd8]'}`}
                    >
                      저축
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#ff8da1] mb-2 ml-1">▶ METHOD</label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('cash')}
                      className={`py-3 rounded-2xl text-xs font-bold transition-all border-2 ${paymentMethod === 'cash' ? 'bg-[#e0ffff] border-[#afeeee] text-[#008b8b]' : 'bg-white border-[#ffe4e1] text-[#ccc] hover:border-[#afeeee]'}`}
                    >
                      현금
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('card')}
                      className={`py-3 rounded-2xl text-xs font-bold transition-all border-2 ${paymentMethod === 'card' ? 'bg-[#ffe4e1] border-[#ffb6c1] text-[#ff8da1]' : 'bg-white border-[#ffe4e1] text-[#ccc] hover:border-[#ffb6c1]'}`}
                    >
                      카드
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('point')}
                      className={`py-3 rounded-2xl text-xs font-bold transition-all border-2 ${paymentMethod === 'point' ? 'bg-[#fffacd] border-[#eee8aa] text-[#b8860b]' : 'bg-white border-[#ffe4e1] text-[#ccc] hover:border-[#eee8aa]'}`}
                    >
                      포인트
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-4 ml-1">
                  <input 
                    type="checkbox" 
                    id="isFixed"
                    checked={isFixed}
                    onChange={(e) => setIsFixed(e.target.checked)}
                    className="w-4 h-4 text-[#ffb6c1] bg-white border-2 border-[#ffe4e1] rounded focus:ring-[#ffb6c1] focus:ring-2"
                  />
                  <label htmlFor="isFixed" className="text-sm font-bold text-[#ff8da1] cursor-pointer">
                    매달 나가는 고정지출이야!
                  </label>
                </div>
              </>
            )}
          </div>

          <div className="flex space-x-3 mt-8 shrink-0 pt-4">
            {initialData && (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="px-5 py-4 bg-white border-2 border-[#ffe4e1] text-[#ff8da1] rounded-2xl font-bold hover:bg-[#fff0f5] transition-all flex items-center justify-center"
              >
                삭제
              </button>
            )}
            <button
              type="submit"
              className="flex-1 py-4 bg-gradient-to-r from-[#ffb6c1] to-[#ff99cc] text-white rounded-2xl font-bold shadow-[0_4px_15px_rgba(255,182,193,0.5)] hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              {initialData ? '수정 완료 (OK)' : '저장 (SAVE)'}
            </button>
          </div>
        </form>
      </div>

      {/* Soft Retro Delete Confirmation Popup */}
      {showDeleteConfirm && (
        <div className="absolute inset-0 bg-[#ffb6c1]/40 backdrop-blur-sm z-[60] flex items-center justify-center p-5">
          <div className="bg-white border-4 border-[#ffe4e1] rounded-3xl p-1 shadow-[0_15px_40px_rgba(255,182,193,0.6)] text-center max-w-[80%] animate-in zoom-in-95 duration-200 overflow-hidden">
            <div className="bg-[#ffb6c1] px-4 py-2 flex justify-center items-center mb-1">
              <span className="text-white font-bold text-sm">경고.exe</span>
            </div>
            <div className="bg-[#fffafb] p-8">
              <p className="text-base mb-8 font-bold text-[#ff8da1]">정말 지울거야? (ㅠ_ㅠ)</p>
              <div className="flex gap-3 justify-center">
                <button 
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)} 
                  className="flex-1 py-3 bg-white border-2 border-[#ffe4e1] text-[#aaa] rounded-xl font-bold text-sm hover:bg-[#fff0f5] transition-all"
                >
                  아니오(N)
                </button>
                <button 
                  type="button"
                  onClick={() => onDelete(initialData!.id)} 
                  className="flex-1 py-3 bg-[#ffb6c1] text-white rounded-xl font-bold text-sm shadow-md hover:bg-[#ff99cc] transition-all"
                >
                  예(Y)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
