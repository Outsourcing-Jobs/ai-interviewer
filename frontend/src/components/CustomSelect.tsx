import React, { useState, useRef, useEffect } from "react";
import type { Option, CustomSelectProps } from "../types/components";

const CustomSelect: React.FC<CustomSelectProps> = ({
    options,
    value,
    onChange,
    name,
    label,
    placeholder
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const normalizedOptions: Option[] = options.map(opt => {
        if (typeof opt === 'object') return opt;
        return { label: String(opt), value: opt };
    });

    const selectedOption = normalizedOptions.find(opt => opt.value === value) || normalizedOptions[0];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (val: string | number) => {
        onChange(name, val);
        setIsOpen(false);
    };

    return (
        <div className={`relative ${isOpen ? 'z-50' : 'z-10'}`} ref={containerRef}>
            {label && <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.15em] ml-1 block mb-2.5">{label}</label>}
            
            <div className="relative">
                <div 
                    onClick={() => setIsOpen(!isOpen)}
                    className={`w-full bg-slate-50 overflow-hidden border border-slate-200 rounded-xl p-3 px-5 text-xs font-bold text-slate-800 cursor-pointer transition-all hover:bg-slate-100/80 flex items-center justify-between shadow-2xs ${isOpen ? 'ring-2 ring-teal-500/20 border-teal-500 bg-white' : ''}`}
                >
                <span className="truncate">{selectedOption?.label || placeholder}</span>
                <div className={`absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-teal-600' : ''}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"></path></svg>
                </div>
            </div>

            {isOpen && (
                <div className="absolute z-50 top-[calc(100%+8px)] left-0 w-full bg-white border border-slate-200 rounded-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 shadow-xl shadow-slate-200/80">
                    <div className="max-h-60 overflow-y-auto py-2 scrollbar-thin">
                        {normalizedOptions.map((opt) => (
                            <div
                                key={opt.value}
                                onClick={() => handleSelect(opt.value)}
                                className={`px-5 py-2.5 text-xs font-bold cursor-pointer transition-colors ${opt.value === value ? 'bg-teal-50 text-teal-700 font-extrabold' : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'}`}
                            >
                                {opt.label}
                            </div>
                        ))}
                    </div>
                </div>
            )}
            </div>
        </div>
    );
};

export default CustomSelect;
