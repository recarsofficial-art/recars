'use client';

import { useState } from 'react';
import { X, ArrowRight, ArrowLeft, Car, Check } from 'lucide-react';
import { CAR_TYPES } from '@/lib/data';

interface DreamCarWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: {
    minPrice: number;
    maxPrice: number;
    bodyTypes: string[];
    fuels: string[];
    transmissions: string[];
  }) => void;
  totalMatchingCars: (filters: {
    minPrice: number;
    maxPrice: number;
    bodyTypes: string[];
    fuels: string[];
    transmissions: string[];
  }) => number;
}

export const BUDGET_BRACKETS = [
  { id: 'under-3', label: 'Under ₹3 Lakhs', min: 0, max: 300000 },
  { id: '3-6', label: '₹3 - ₹6 lakhs', min: 300000, max: 600000 },
  { id: '6-10', label: '₹6 - ₹10 lakhs', min: 600000, max: 1000000 },
  { id: '10-15', label: '₹10 - ₹15 lakhs', min: 1000000, max: 1500000 },
  { id: 'above-15', label: 'Above ₹15 Lakhs', min: 1500000, max: 7000000 },
] as const;

export default function DreamCarWizardModal({
  isOpen,
  onClose,
  onApply,
  totalMatchingCars,
}: DreamCarWizardModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedBudget, setSelectedBudget] = useState<string>('6-10');
  const [selectedBodyTypes, setSelectedBodyTypes] = useState<string[]>([]);
  const [selectedFuels, setSelectedFuels] = useState<string[]>([]);
  const [selectedTransmissions, setSelectedTransmissions] = useState<string[]>([]);

  if (!isOpen) return null;

  const currentBracket = BUDGET_BRACKETS.find((b) => b.id === selectedBudget) || BUDGET_BRACKETS[2];

  const currentFilters = {
    minPrice: currentBracket.min,
    maxPrice: currentBracket.max,
    bodyTypes: selectedBodyTypes,
    fuels: selectedFuels,
    transmissions: selectedTransmissions,
  };

  const matchCount = totalMatchingCars(currentFilters);

  const toggleItem = (list: string[], setList: (v: string[]) => void, item: string) => {
    if (list.includes(item)) {
      setList(list.filter((x) => x !== item));
    } else {
      setList([...list, item]);
    }
  };

  const handleFinish = () => {
    onApply(currentFilters);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-[#E5E7EB] overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header matching Screenshot 1 */}
        <div className="p-6 pb-3">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-700 flex items-center justify-center text-sm font-bold shadow-2xs">
                🔑
              </div>
              <span className="font-extrabold text-sm sm:text-base text-purple-900 tracking-tight">
                Your dream car, in 3 steps
              </span>
            </div>
            <button
              onClick={onClose}
              className="text-xs font-bold text-purple-700 hover:text-purple-900 underline cursor-pointer"
            >
              Skip
            </button>
          </div>

          {/* 3-Step Progress Bar */}
          <div className="grid grid-cols-3 gap-2">
            <div
              className={`h-1.5 rounded-full transition-colors ${
                step >= 1 ? 'bg-purple-700' : 'bg-gray-200'
              }`}
            />
            <div
              className={`h-1.5 rounded-full transition-colors ${
                step >= 2 ? 'bg-purple-700' : 'bg-gray-200'
              }`}
            />
            <div
              className={`h-1.5 rounded-full transition-colors ${
                step >= 3 ? 'bg-purple-700' : 'bg-gray-200'
              }`}
            />
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 pt-2 flex-1 overflow-y-auto space-y-6">
          {/* STEP 1: What's your budget? */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <h2 className="text-xl sm:text-2xl font-black text-[#101216]">
                What&apos;s your budget?
              </h2>

              <div className="space-y-3">
                {BUDGET_BRACKETS.map((bracket) => {
                  const isSelected = selectedBudget === bracket.id;
                  return (
                    <button
                      key={bracket.id}
                      type="button"
                      onClick={() => {
                        setSelectedBudget(bracket.id);
                        setTimeout(() => setStep(2), 200);
                      }}
                      className={`w-full py-4 px-5 rounded-2xl border text-center font-bold text-sm sm:text-base transition-all cursor-pointer shadow-2xs flex items-center justify-between ${
                        isSelected
                          ? 'border-purple-600 bg-purple-50/70 text-purple-950 ring-2 ring-purple-200'
                          : 'border-gray-200 bg-white text-gray-800 hover:border-purple-400 hover:bg-gray-50'
                      }`}
                    >
                      <span className="flex-1 text-center">{bracket.label}</span>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center flex-shrink-0">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: Preferred Body Type */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-[#101216]">
                  What body style do you prefer?
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">Select one or more styles (optional)</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {CAR_TYPES.map((bt) => {
                  const isSelected = selectedBodyTypes.includes(bt.type);
                  return (
                    <button
                      key={bt.type}
                      type="button"
                      onClick={() => toggleItem(selectedBodyTypes, setSelectedBodyTypes, bt.type)}
                      className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer shadow-2xs ${
                        isSelected
                          ? 'border-purple-600 bg-purple-50 text-purple-950 ring-2 ring-purple-200'
                          : 'border-gray-200 bg-white text-gray-800 hover:border-purple-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-sm">{bt.label}</span>
                        {isSelected && (
                          <div className="w-4 h-4 rounded-full bg-purple-600 text-white flex items-center justify-center">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        )}
                      </div>
                      <span className="block text-[11px] text-gray-500 mt-1">{bt.startingPrice}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3: Fuel & Transmission */}
          {step === 3 && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-[#101216]">
                  Fuel & transmission?
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">Customise your driving preference</p>
              </div>

              {/* Fuel Type */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Fuel Type
                </label>
                <div className="flex flex-wrap gap-2">
                  {['Petrol', 'Diesel', 'Electric', 'Hybrid', 'CNG'].map((fuel) => {
                    const isSelected = selectedFuels.includes(fuel);
                    return (
                      <button
                        key={fuel}
                        type="button"
                        onClick={() => toggleItem(selectedFuels, setSelectedFuels, fuel)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-purple-600 text-white border-purple-600 shadow-2xs'
                            : 'bg-white text-gray-700 border-gray-200 hover:border-purple-300'
                        }`}
                      >
                        {fuel}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Transmission */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Transmission
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {['Automatic', 'Manual'].map((tr) => {
                    const isSelected = selectedTransmissions.includes(tr);
                    return (
                      <button
                        key={tr}
                        type="button"
                        onClick={() => toggleItem(selectedTransmissions, setSelectedTransmissions, tr)}
                        className={`p-3 rounded-xl text-center text-xs font-bold border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-purple-600 text-white border-purple-600 shadow-2xs'
                            : 'bg-white text-gray-700 border-gray-200 hover:border-purple-300'
                        }`}
                      >
                        {tr}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation Buttons */}
        <div className="p-5 border-t border-[#E5E7EB] bg-gray-50 flex items-center justify-between gap-3">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => (s - 1) as any)}
              className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-white transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={() => setStep((s) => (s + 1) as any)}
              className="px-6 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold transition-all shadow-md cursor-pointer flex items-center gap-1.5 ml-auto"
            >
              <span>Next</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              className="px-6 py-3 rounded-xl bg-[#E5325C] hover:bg-[#D4264E] text-white text-xs font-extrabold transition-all shadow-md cursor-pointer flex items-center gap-2 ml-auto"
            >
              <span>View {matchCount} Matching Cars</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
