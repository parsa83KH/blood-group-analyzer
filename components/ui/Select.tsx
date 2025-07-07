import React from 'react';
import { useLanguage } from '../../i18n/LanguageContext';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label: string;
    options: string[];
}

const Select: React.FC<SelectProps> = ({ label, options, className, ...props }) => {
    const { t } = useLanguage();
    return (
        <div className="w-full">
            <label htmlFor={props.id || label} className="block text-sm font-medium text-gray-400 mb-1">{label}</label>
            <select
                id={props.id || label}
                aria-label={label}
                className={`
                    w-full px-3 py-2
                    bg-gray-900 border border-gray-600 rounded-md
                    text-white placeholder-gray-500
                    focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-brand-accent
                    transition-all duration-200
                    ${className}
                `}
                {...props}
            >
                {options.map(option => (
                    <option key={option} value={option}>
                        {option === 'Unknown' ? t('unknown') : option}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default Select;