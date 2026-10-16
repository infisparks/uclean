'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { X, Search, Check, Layers, Sparkles, Filter } from 'lucide-react';
import {
  ALL_SERVICES_CATALOG,
  CATALOG_CATEGORIES,
  CatalogService,
  searchCatalog,
  isServiceMatch,
} from '@/lib/servicesCatalog';

interface AllServicesModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedServices: string[];
  onToggleService: (serviceId: string) => void;
  onClearAllServices?: () => void;
}

export function AllServicesModal({
  isOpen,
  onClose,
  selectedServices,
  onToggleService,
  onClearAllServices,
}: AllServicesModalProps) {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  // Lock background scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const filteredServices = useMemo(() => {
    return searchCatalog(query, activeCategory);
  }, [query, activeCategory]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      
      {/* Modal Dialog */}
      <div
        className="w-full max-w-2xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[90vh] border border-[#DECBB0] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* 1. Header */}
        <div className="p-4 sm:p-5 border-b border-[#ECE0C6] bg-[#FAF6EE] flex items-center justify-between shrink-0">
          <div className="min-w-0 pr-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-[#008f51] text-white flex items-center justify-center text-xs font-bold shadow-xs">
                ⊞
              </span>
              <h2 className="text-base sm:text-lg font-bold text-[#111827] truncate">
                All Laundry &amp; Garment Services
              </h2>
            </div>
            <p className="text-xs text-[#6B7280] mt-0.5 truncate">
              Select any services to include in your doorstep pickup order
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white border border-[#DECBB0] text-[#6B7280] hover:text-[#111827] hover:bg-[#FAF6EE] flex items-center justify-center transition-colors shrink-0 cursor-pointer"
            title="Close services catalog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 2. Sticky Search Bar inside Modal */}
        <div className="p-3 sm:p-4 bg-white border-b border-[#F3F4F6] shrink-0 space-y-2.5">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-[#008f51] absolute left-3 shrink-0" />
            <input
              type="text"
              autoFocus
              placeholder="Search by garment (e.g. Suit, Saree, Sofa, Shoes, Bedsheet, Leather)..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full h-10 pl-9 pr-8 bg-[#FAF6EE]/60 border border-[#DECBB0] rounded-xl text-xs sm:text-[13px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#008f51] focus:bg-white focus:ring-2 focus:ring-[#008f51]/15 transition-all"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-2.5 text-xs text-[#9CA3AF] hover:text-[#111827] w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center"
              >
                ✕
              </button>
            )}
          </div>

          {/* Category Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
            {CATALOG_CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1 rounded-full whitespace-nowrap font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#008f51] text-white shadow-xs'
                      : 'bg-[#FAF6EE] text-[#4B5563] border border-[#DECBB0] hover:bg-[#ECE0C6]'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Services List / Grid (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 bg-[#FAF6EE]/30 space-y-2">
          
          <div className="flex items-center justify-between text-[11px] text-[#6B7280] px-1 mb-1">
            <span>
              Showing <strong className="text-[#111827]">{filteredServices.length}</strong> services
              {activeCategory !== 'All' ? ` in ${activeCategory}` : ''}
              {query ? ` for "${query}"` : ''}
            </span>
            <span>
              <strong className="text-[#008f51]">{selectedServices.length}</strong> selected
            </span>
          </div>

          {filteredServices.length === 0 ? (
            <div className="text-center py-12 px-4 bg-white rounded-2xl border border-dashed border-[#DECBB0]">
              <span className="text-3xl block mb-2">🔍</span>
              <p className="text-xs font-semibold text-[#111827]">
                No services matched &ldquo;{query}&rdquo;
              </p>
              <p className="text-[11px] text-[#6B7280] mt-1">
                Try searching for everyday items like Suit, Saree, Curtain, Carpet, or Shoes.
              </p>
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setActiveCategory('All');
                }}
                className="mt-3 px-3 py-1.5 rounded-lg bg-[#FAF6EE] text-[#008f51] border border-[#DECBB0] text-xs font-medium hover:bg-[#ECE0C6]"
              >
                Clear Search Filter
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {filteredServices.map((srv) => {
                const isChecked = selectedServices.some(
                  (s) => isServiceMatch(s, srv.id) || isServiceMatch(s, srv.name)
                );
                return (
                  <label
                    key={srv.id}
                    onClick={() => onToggleService(srv.id)}
                    className={`relative flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all ${
                      isChecked
                        ? 'bg-[#eaf8f1] border-[#008f51] ring-1.5 ring-[#008f51] shadow-xs'
                        : 'bg-white border-[#E5E7EB] hover:border-[#008f51]/60 hover:bg-[#FAF6EE]/50'
                    }`}
                  >
                    <div className="flex items-start gap-2.5 min-w-0 pr-2 flex-1">
                      <span className="text-xl shrink-0 p-1 bg-[#FAF6EE] rounded-lg border border-[#DECBB0]/50 mt-0.5">
                        {srv.icon}
                      </span>
                      <div className="min-w-0 flex-1">
                        <span className="block text-xs font-semibold text-[#111827] leading-snug break-words">
                          {srv.name}
                        </span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[10px] text-[#6B7280] truncate">
                            {srv.category}
                          </span>
                          <span className="text-[10px] font-bold text-[#008f51] bg-[#eaf8f1] px-1.5 py-0.2 rounded border border-[#a7f3d0]">
                            {srv.rate}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Checkbox indicator */}
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border transition-all ${
                        isChecked
                          ? 'bg-[#008f51] border-[#008f51] text-white shadow-xs'
                          : 'bg-white border-[#D1D5DB]'
                      }`}
                    >
                      {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {/* 4. Sticky Modal Footer */}
        <div className="p-3 sm:p-4 border-t border-[#ECE0C6] bg-white flex items-center justify-between gap-3 shrink-0">
          <div className="min-w-0">
            <span className="text-xs font-bold text-[#111827] block truncate">
              {selectedServices.length} service{selectedServices.length === 1 ? '' : 's'} selected
            </span>
            <span className="text-[10px] text-[#6B7280] hidden sm:block">
              Free doorstep pickup &bull; Zero advance fee
            </span>
          </div>

          <div className="flex items-center gap-2">
            {selectedServices.length > 0 && onClearAllServices && (
              <button
                type="button"
                onClick={onClearAllServices}
                className="px-3 py-2 rounded-xl text-xs font-medium text-[#6B7280] hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              >
                Clear All
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-[#008f51] hover:bg-[#007a3e] text-white font-semibold text-xs sm:text-sm flex items-center gap-1.5 shadow-sm active:scale-98 transition-all cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Done / Apply Selection</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
