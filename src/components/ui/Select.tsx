import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { CheckIcon, ChevronUpDownIcon } from '../icons';

const getGroups = (options: string[], t: (key: string) => string) => {
    const uniqueOptions = [...new Set(options)];
    const isAboSet = uniqueOptions.includes('A');

    const groups: { label: string; options: string[] }[] = [];

    if (uniqueOptions.includes('Unknown')) {
        groups.push({ label: '', options: ['Unknown'] });
    }

    let phenos: string[] = [];
    let genos: string[] = [];

    if (isAboSet) {
        phenos = ['A', 'B', 'AB', 'O'].filter(o => uniqueOptions.includes(o));
        genos = ['AA', 'AO', 'BB', 'BO', 'AB', 'OO'].filter(o => uniqueOptions.includes(o));
    } else { // is RH set
        phenos = ['+', '-'].filter(o => uniqueOptions.includes(o));
        genos = ['DD', 'Dd', 'dd'].filter(o => uniqueOptions.includes(o));
    }
    
    if (phenos.length > 0) groups.push({ label: t('select.phenotypes'), options: phenos });
    if (genos.length > 0) groups.push({ label: t('select.genotypes'), options: genos });

    if (groups.length <= 1 && !groups.some(g => g.label)) {
        return [{ label: '', options: uniqueOptions }];
    }
    
    return groups;
}


interface SelectProps {
    label: string;
    options: string[];
    value: string;
    onChange: (value: string) => void;
    className?: string;
    id?: string;
    maxHeightClass?: string;
}

const Select: React.FC<SelectProps> = ({ label, options, value, onChange, className, id, maxHeightClass = 'max-h-60' }) => {
    const { t } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const groups = useMemo(() => getGroups(options, t), [options, t]);

    useEffect(() => {
        const handleOutsideClick = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleOutsideClick);
        return () => document.removeEventListener('mousedown', handleOutsideClick);
    }, []);

    const handleSelect = (optionValue: string) => {
        onChange(optionValue);
        setIsOpen(false);
    };

    const selectedLabel = value === 'Unknown' ? t('unknown') : value;

    return (
        <div ref={containerRef} className={`relative w-full ${className} ${isOpen ? 'select-is-open' : ''}`}>
            <label htmlFor={id || label} className="block text-sm font-medium text-gray-400 mb-1">{label}</label>
            <button
                type="button"
                id={id || label}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                onClick={() => setIsOpen(!isOpen)}
                className="relative w-full cursor-pointer rounded-md bg-gray-900/70 py-2.5 pl-3 pr-10 text-left text-white shadow-sm ring-1 ring-inset ring-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-accent sm:text-sm sm:leading-6 transition-all"
            >
                <span className="block truncate">{selectedLabel}</span>
                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                    <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </span>
            </button>

            {isOpen && (
                <ul
                    className={`absolute z-50 mt-1 ${maxHeightClass} w-full overflow-auto rounded-md bg-gray-800 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm animate-fade-in-down custom-scrollbar`}
                    style={{'--fade-in-down-translate': 'translateY(-10px)'} as React.CSSProperties}
                    role="listbox"
                    aria-labelledby={label}
                >
                    {groups.map((group, groupIndex) => (
                        <React.Fragment key={group.label || groupIndex}>
                            {group.label && (
                                <li className="text-xs font-bold text-gray-500 uppercase px-3 pt-2 pb-1">
                                    {group.label}
                                </li>
                            )}
                            {group.options.map((option) => (
                                <li
                                    key={option}
                                    className="text-gray-200 relative cursor-pointer select-none py-2 pl-3 pr-9 m-1 rounded-md hover:bg-brand-accent/20 transition-colors"
                                    role="option"
                                    aria-selected={value === option}
                                    onClick={() => handleSelect(option)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSelect(option)}
                                    tabIndex={0}
                                >
                                    <span className={`block truncate ${value === option ? 'font-semibold text-white' : 'font-normal'}`}>
                                        {option === 'Unknown' ? t('unknown') : option}
                                    </span>
                                    {value === option ? (
                                        <span className="text-brand-accent absolute inset-y-0 right-0 flex items-center pr-4">
                                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                        </span>
                                    ) : null}
                                </li>
                            ))}
                             {groupIndex < groups.length - 1 && group.label !== '' && group.options.length > 0 && <div className="border-t border-gray-700/50 my-1" />}
                        </React.Fragment>
                    ))}
                </ul>
            )}
        </div>
    );
};


export default Select;