import React from 'react';
import { useLanguage } from '../i18n/LanguageContext';

const LanguageSwitcher: React.FC = () => {
    const { language, setLanguage } = useLanguage();

    const switchLanguage = (lang: 'en' | 'fa') => {
        setLanguage(lang);
    };

    return (
        <div className="flex items-center space-x-1 rtl:space-x-reverse rounded-full bg-gray-800/50 p-1 border border-gray-700">
            <button
                onClick={() => switchLanguage('en')}
                aria-pressed={language === 'en'}
                className={`w-10 h-8 text-sm font-bold rounded-full transition-all duration-300 ${
                    language === 'en' ? 'bg-brand-primary text-white shadow-md' : 'text-gray-400 hover:bg-gray-700/50'
                }`}
            >
                EN
            </button>
            <button
                onClick={() => switchLanguage('fa')}
                aria-pressed={language === 'fa'}
                className={`w-10 h-8 text-sm font-bold rounded-full transition-all duration-300 ${
                    language === 'fa' ? 'bg-brand-primary text-white shadow-md' : 'text-gray-400 hover:bg-gray-700/50'
                }`}
            >
                FA
            </button>
        </div>
    );
};

export default LanguageSwitcher;
