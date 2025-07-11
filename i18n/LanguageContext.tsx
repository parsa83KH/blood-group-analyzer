import React, { createContext, useState, useContext, useMemo, FC, useEffect } from 'react';

type Translations = Record<string, any>;
interface LanguageFiles {
    en: Translations;
    fa: Translations;
}

type Language = 'en' | 'fa';

interface LanguageContextType {
    language: Language;
    setLanguage: (language: Language) => void;
    t: (key: string, options?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: FC<{ children: React.ReactNode }> = ({ children }) => {
    const [language, setLanguage] = useState<Language>('en');
    const [translations, setTranslations] = useState<LanguageFiles | null>(null);

    useEffect(() => {
        const loadTranslations = async () => {
            try {
                const BASE_URL = import.meta.env.BASE_URL;
                const enResponse = await fetch(`${BASE_URL}i18n/locales/en.json`);
                const faResponse = await fetch(`${BASE_URL}i18n/locales/fa.json`);

                if (!enResponse.ok || !faResponse.ok) {
                    throw new Error('Failed to fetch translation files');
                }

                const en = await enResponse.json();
                const fa = await faResponse.json();

                setTranslations({ en, fa });
            } catch (error) {
                console.error("Failed to load translations:", error);
            }
        };

        loadTranslations();
    }, []);

    const t = (key: string, options?: Record<string, string | number>): string => {
        if (!translations) {
            return key;
        }
        const langFile = translations[language];
        let text: string = key.split('.').reduce((obj, k) => (obj && typeof obj === 'object' ? obj[k] : undefined), langFile);

        if (text === undefined || text === null) {
            const fallbackLangFile = translations.en;
            text = key.split('.').reduce((obj, k) => (obj && typeof obj === 'object' ? obj[k] : undefined), fallbackLangFile) || key;
        }

        if (text && options) {
            Object.keys(options).forEach((k) => {
                text = text.replace(new RegExp(`{{${k}}}`, 'g'), String(options[k]));
            });
        }
        return text || key;
    };

    const value = useMemo(() => ({ language, setLanguage, t }), [language, translations]);

    if (!translations) {
        return null;
    }

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
