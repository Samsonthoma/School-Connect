import React from 'react';
import { Student, Bus, Route, Stop } from '../../types/transport';
import { generateQrSvgDataUri } from '../../utils/qrCode';
import { QrCode, X, Printer, ShieldCheck, Bus as BusIcon, MapPin } from 'lucide-react';

interface QrCardModalProps {
  student: Student;
  bus?: Bus;
  route?: Route;
  stop?: Stop;
  onClose: () => void;
  onSimulateScan?: (token: string) => void;
}

export const QrCardModal: React.FC<QrCardModalProps> = ({
  student,
  bus,
  route,
  stop,
  onClose,
  onSimulateScan
}) => {
  const qrSvgUri = generateQrSvgDataUri(student.qrCodeToken);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden p-6 text-slate-900">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-5">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider text-sky-600 uppercase mb-1">
            <ShieldCheck className="w-4 h-4" />
            Oakridge Transport Pass
          </div>
          <h3 className="text-xl font-bold tracking-tight text-slate-900">Student Boarding Pass</h3>
          <p className="text-xs text-slate-500 mt-0.5">Scan at bus door to register attendance</p>
        </div>

        {/* Physical Card Mockup */}
        <div className="relative bg-gradient-to-br from-slate-50 via-white to-sky-50/40 border-2 border-slate-300 rounded-2xl p-5 shadow-md">
          {/* Card Header Strip */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-sky-600 flex items-center justify-center text-white">
                <BusIcon className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold tracking-wide uppercase text-slate-800">Oakridge Academy</span>
            </div>
            <span className="text-[11px] font-mono text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200 font-semibold">
              2026-2027
            </span>
          </div>

          <div className="flex items-center gap-4 mb-4">
            {/* Circular Photo Avatar */}
            <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-sky-500 shadow-sm shrink-0 bg-slate-100">
              <img
                src={student.photoUrl}
                alt={student.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>

            <div className="min-w-0 flex-1">
              <div className="text-lg font-bold text-slate-900 truncate">{student.name}</div>
              <div className="text-xs text-sky-700 font-semibold">{student.grade}</div>

              <div className="mt-2 text-xs text-slate-600 space-y-0.5">
                <div className="flex items-center gap-1.5 truncate">
                  <BusIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate font-medium">{bus?.busName || 'Assigned Bus'}</span>
                </div>
                <div className="flex items-center gap-1.5 truncate">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate text-slate-500">{stop?.name || 'Assigned Stop'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* QR Code Container */}
          <div className="flex flex-col items-center justify-center bg-white border border-slate-200 rounded-xl p-3 shadow-inner">
            <img
              src={qrSvgUri}
              alt={`QR Code for ${student.name}`}
              className="w-36 h-36 object-contain"
            />
            <span className="text-[10px] font-mono font-bold text-slate-800 tracking-wider mt-1">
              {student.qrCodeToken}
            </span>
          </div>

          <div className="mt-3 text-center">
            <span className="text-[11px] text-slate-500">
              Guardian: {student.parentName}
            </span>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="mt-5 flex gap-2">
          {onSimulateScan && (
            <button
              onClick={() => {
                onSimulateScan(student.qrCodeToken);
                onClose();
              }}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-xs transition-colors"
            >
              <QrCode className="w-4 h-4" />
              Simulate Driver Scan
            </button>
          )}

          <button
            onClick={handlePrint}
            className="flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-xl transition-colors"
          >
            <Printer className="w-4 h-4" />
            Print Pass
          </button>
        </div>
      </div>
    </div>
  );
};
