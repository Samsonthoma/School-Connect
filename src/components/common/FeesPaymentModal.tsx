import React, { useState } from 'react';
import { FeeItem, Student } from '../../types/transport';
import {
  CreditCard,
  CheckCircle2,
  Clock,
  Printer,
  ShieldCheck,
  X,
  Bus as BusIcon,
  BookOpen,
  Sparkles,
  ArrowRight,
  Download,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface FeesPaymentModalProps {
  student: Student;
  fees: FeeItem[];
  onClose: () => void;
  onPayFee: (feeId: string, method: string) => void;
}

export const FeesPaymentModal: React.FC<FeesPaymentModalProps> = ({
  student,
  fees,
  onClose,
  onPayFee
}) => {
  const [selectedFee, setSelectedFee] = useState<FeeItem | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [upiId, setUpiId] = useState('parent@okhdfcbank');
  const [cardNumber, setCardNumber] = useState('6071 •••• •••• 4218');
  const [cardExpiry, setCardExpiry] = useState('08/29');
  const [cardCvc, setCardCvc] = useState('881');
  const [selectedBank, setSelectedBank] = useState('State Bank of India (SBI)');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccessReceipt, setPaymentSuccessReceipt] = useState<FeeItem | null>(null);

  const studentFees = fees.filter(f => f.studentId === student.id);
  const pendingFees = studentFees.filter(f => f.status === 'pending' || f.status === 'overdue');
  const paidFees = studentFees.filter(f => f.status === 'paid');

  const totalPending = pendingFees.reduce((acc, f) => acc + f.amount, 0);

  const handleProcessPayment = (fee: FeeItem) => {
    setIsProcessing(true);
    setTimeout(() => {
      const methodLabel =
        paymentMethod === 'upi'
          ? `UPI (${upiId})`
          : paymentMethod === 'card'
          ? 'RuPay / Debit Card (••4218)'
          : `Net Banking (${selectedBank})`;

      onPayFee(fee.id, methodLabel);
      setIsProcessing(false);

      const updatedFee: FeeItem = {
        ...fee,
        status: 'paid',
        paidAt: new Date().toISOString().split('T')[0],
        receiptNumber: `REC-SIS-${Math.floor(100000 + Math.random() * 900000)}`,
        paymentMethod: methodLabel
      };

      setPaymentSuccessReceipt(updatedFee);
      setSelectedFee(null);

      try {
        confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
      } catch {
        // fallback
      }
    }, 1200);
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden p-6 text-slate-900 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-600 uppercase tracking-wider mb-0.5">
              <ShieldCheck className="w-4 h-4" />
              THE SOUTH INDIAN SCHOOL · Fee Portal
            </div>
            <h2 className="text-xl font-bold text-slate-900">School & Transport Fees</h2>
            <p className="text-xs text-slate-500">
              Student: {student.name} · {student.grade} · Shahganj, Jaunpur
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Receipt View */}
        {paymentSuccessReceipt ? (
          <div className="py-6 space-y-4 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto border-2 border-emerald-200 shadow-md">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900">Payment Successful!</h3>
              <p className="text-xs text-slate-500">
                Official school transport receipt has been issued and registered with THE SOUTH INDIAN SCHOOL.
              </p>
            </div>

            {/* Receipt Box */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left text-xs space-y-2">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="font-bold text-slate-800 uppercase tracking-wide">Receipt Reference</span>
                <span className="font-mono font-bold text-sky-700">{paymentSuccessReceipt.receiptNumber}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Fee Item:</span>
                <strong className="text-slate-900">{paymentSuccessReceipt.title}</strong>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Student:</span>
                <strong className="text-slate-900">{student.name} ({student.grade})</strong>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>School:</span>
                <strong className="text-slate-900">THE SOUTH INDIAN SCHOOL, Shahganj</strong>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Amount Paid:</span>
                <strong className="text-emerald-700 text-sm font-mono font-bold">
                  ₹{paymentSuccessReceipt.amount.toLocaleString('en-IN')}
                </strong>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Payment Method:</span>
                <span className="font-medium text-slate-800">{paymentSuccessReceipt.paymentMethod}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Timestamp:</span>
                <span>{paymentSuccessReceipt.paidAt}</span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={handlePrintReceipt}
                className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>Print / Download Receipt</span>
              </button>
              <button
                onClick={() => setPaymentSuccessReceipt(null)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        ) : selectedFee ? (
          /* Payment Checkout Screen */
          <div className="py-4 space-y-4 overflow-y-auto">
            <button
              onClick={() => setSelectedFee(null)}
              className="text-xs text-sky-600 font-semibold hover:underline flex items-center gap-1"
            >
              ← Back to all fees
            </button>

            <div className="bg-sky-50 border border-sky-100 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <span className="text-xs text-sky-700 font-medium">Paying for:</span>
                <div className="font-bold text-sm text-slate-900">{selectedFee.title}</div>
                <div className="text-[11px] text-slate-500">Student: {student.name} ({student.grade})</div>
              </div>
              <div className="text-right">
                <span className="text-xl font-bold font-mono text-slate-900">
                  ₹{selectedFee.amount.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 block">Select Payment Method</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('upi')}
                  className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                    paymentMethod === 'upi'
                      ? 'border-sky-500 bg-sky-50/50 text-sky-800 shadow-sm'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span className="font-black text-sky-700">UPI</span>
                  <span className="text-[10px]">GPay / PhonePe</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                    paymentMethod === 'card'
                      ? 'border-sky-500 bg-sky-50/50 text-sky-800 shadow-sm'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-sky-600" />
                  <span className="text-[10px]">RuPay / Card</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('netbanking')}
                  className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                    paymentMethod === 'netbanking'
                      ? 'border-sky-500 bg-sky-50/50 text-sky-800 shadow-sm'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <span className="text-[10px]">Net Banking</span>
                </button>
              </div>
            </div>

            {/* UPI Input */}
            {paymentMethod === 'upi' && (
              <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
                <div>
                  <label className="text-slate-600 font-medium block mb-1">UPI VPA / ID</label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="e.g. mobile@upi or name@okaxis"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono text-xs focus:outline-none focus:border-sky-500"
                  />
                  <span className="text-[10px] text-slate-500 block mt-1">
                    Accepts Google Pay, PhonePe, Paytm, BHIM UPI
                  </span>
                </div>
              </div>
            )}

            {/* Card Inputs */}
            {paymentMethod === 'card' && (
              <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
                <div>
                  <label className="text-slate-600 font-medium block mb-1">RuPay / Debit / Credit Card Number</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono text-xs focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-slate-600 font-medium block mb-1">Expiry</label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono text-xs focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 font-medium block mb-1">CVV</label>
                    <input
                      type="password"
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono text-xs focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Net Banking Inputs */}
            {paymentMethod === 'netbanking' && (
              <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
                <div>
                  <label className="text-slate-600 font-medium block mb-1">Select Bank</label>
                  <select
                    value={selectedBank}
                    onChange={(e) => setSelectedBank(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 text-xs focus:outline-none focus:border-sky-500"
                  >
                    <option value="State Bank of India (SBI)">State Bank of India (SBI)</option>
                    <option value="HDFC Bank">HDFC Bank</option>
                    <option value="ICICI Bank">ICICI Bank</option>
                    <option value="Punjab National Bank (PNB)">Punjab National Bank (PNB)</option>
                    <option value="Bank of Baroda">Bank of Baroda</option>
                    <option value="Union Bank of India">Union Bank of India</option>
                  </select>
                </div>
              </div>
            )}

            <button
              onClick={() => handleProcessPayment(selectedFee)}
              disabled={isProcessing}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl text-sm transition-all shadow-lg shadow-emerald-200 flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>Securing & Authorizing Payment...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Confirm & Pay ₹{selectedFee.amount.toLocaleString('en-IN')}</span>
                </>
              )}
            </button>
          </div>
        ) : (
          /* Fees Overview & List */
          <div className="py-4 space-y-4 overflow-y-auto">
            {/* Total Balance Banner */}
            <div className="bg-gradient-to-r from-sky-600 to-indigo-700 rounded-2xl p-4 text-white shadow-md flex items-center justify-between">
              <div>
                <span className="text-xs text-sky-200 font-medium">Pending Dues:</span>
                <div className="text-2xl font-black font-mono tracking-tight">
                  ₹{totalPending.toLocaleString('en-IN')}
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-sky-200 block">Next Due Date:</span>
                <span className="font-semibold text-xs">Nov 15, 2026</span>
              </div>
            </div>

            {/* Outstanding Fees */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Pending Fees ({pendingFees.length})
              </span>

              {pendingFees.length === 0 ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center text-xs text-emerald-800 font-medium">
                  All school and transport fees are fully paid!
                </div>
              ) : (
                pendingFees.map(fee => (
                  <div
                    key={fee.id}
                    className="p-3.5 bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-sky-300 transition-all flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center shrink-0">
                        {fee.category === 'transport' ? (
                          <BusIcon className="w-5 h-5" />
                        ) : (
                          <BookOpen className="w-5 h-5" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-xs text-slate-900 truncate">{fee.title}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <Clock className="w-3 h-3 text-amber-500" />
                          <span>Due: {fee.dueDate}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="font-mono font-bold text-slate-900 text-sm">
                        ₹{fee.amount.toLocaleString('en-IN')}
                      </span>
                      <button
                        onClick={() => setSelectedFee(fee)}
                        className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors flex items-center gap-1"
                      >
                        <span>Pay</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Paid Invoices & Receipts */}
            {paidFees.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Paid Receipts ({paidFees.length})
                </span>

                {paidFees.map(fee => (
                  <div
                    key={fee.id}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-slate-800">{fee.title}</div>
                      <div className="text-[11px] text-emerald-600 font-mono mt-0.5">
                        Paid on {fee.paidAt} · Ref: {fee.receiptNumber}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-slate-700">₹{fee.amount.toLocaleString('en-IN')}</div>
                      <span className="text-[10px] text-slate-500 font-medium">{fee.paymentMethod}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
