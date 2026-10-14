'use client';

import { useState } from 'react';
import { MapPin, X, Check, Search } from 'lucide-react';
import { CITIES } from '@/lib/data';

interface CitySelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCity: string;
  onSelectCity: (city: string) => void;
}

export default function CitySelectorModal({
  isOpen,
  onClose,
  selectedCity,
  onSelectCity,
}: CitySelectorModalProps) {
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const filteredCities = CITIES.filter((c) =>
    c.toLowerCase().includes(searchTerm.toLowerCase().trim())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-[#E5E7EB] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-[#E5E7EB]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#FFF0F3] text-[#E5325C]">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-[#101216]">Select Your City</h3>
              <p className="text-xs text-[#6B7078]">Browse verified used cars in your region</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search input */}
        <div className="p-4 border-b border-[#E5E7EB] bg-[#F8F9FA]">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search Indian city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-[#E5325C] text-[#101216] transition-colors"
              autoFocus
            />
          </div>
        </div>

        {/* City list */}
        <div className="p-3 max-h-80 overflow-y-auto grid grid-cols-2 gap-2">
          {filteredCities.map((city) => {
            const isCurrent = city === selectedCity;
            return (
              <button
                key={city}
                onClick={() => {
                  onSelectCity(city);
                  onClose();
                }}
                className={`flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-all text-left ${
                  isCurrent
                    ? 'bg-[#FFF0F3] text-[#E5325C] border border-[#E5325C]/40 font-semibold shadow-xs'
                    : 'text-[#24262A] hover:bg-[#F8F9FA] hover:text-[#101216]'
                }`}
              >
                <span>{city}</span>
                {isCurrent && <Check className="w-4 h-4 text-[#E5325C]" />}
              </button>
            );
          })}
          {filteredCities.length === 0 && (
            <div className="col-span-2 py-8 text-center text-sm text-[#6B7078]">
              No hubs found in &quot;{searchTerm}&quot;. We are expanding rapidly!
            </div>
          )}
        </div>

        <div className="p-3 bg-[#FFF0F3] border-t border-[#E5E7EB] text-center">
          <p className="text-xs text-[#6B7078]">
            Free doorstep delivery and inspection available in all listed hubs.
          </p>
        </div>
      </div>
    </div>
  );
}
