
import React from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { SparklesIcon } from './icons';

interface AskAIButtonProps {
    prompt: string;
    onAsk: (prompt: string) => void;
    className?: string;
}

const AskAIButton: React.FC<AskAIButtonProps> = ({ prompt, onAsk, className = '' }) => {
    const { t } = useLanguage();

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // prevent any parent click handlers
        onAsk(prompt);
    };

    return (
        <button
            onClick={handleClick}
            className={`
                absolute
                flex items-center gap-1.5 whitespace-nowrap
                bg-brand-accent/90 backdrop-blur-sm text-white
                px-2.5 py-1.5 rounded-full
                text-xs font-semibold
                opacity-0 group-hover:opacity-100
                transition-all duration-300 transform
                hover:scale-105 hover:bg-brand-accent
                focus:outline-none
                shadow-lg shadow-brand-accent/30
                ${className}
            `}
            aria-label={t('aiAssistant.askAboutThis')}
        >
            <SparklesIcon className="w-4 h-4" />
            <span>{t('aiAssistant.askAction')}</span>
        </button>
    );
};

export default AskAIButton;
