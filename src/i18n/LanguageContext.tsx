import React, { createContext, useState, useContext, useMemo, useCallback, FC, useEffect } from 'react';

// Define a type for our translations object
type Translations = Record<string, unknown>;
interface LanguageFiles {
    en: Translations;
    fa: Translations;
}

type Language = 'en' | 'fa';

// Fix: Define TFunction type with overloads for better type inference, allowing `returnObjects: true`.
type TFunction = {
    (key: string, options: { returnObjects: true } & Record<string, unknown>): unknown;
    (key: string, options?: Record<string, string | number>): string;
};

interface LanguageContextType {
    language: Language;
    setLanguage: (language: Language) => void;
    t: TFunction;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: FC<{ children: React.ReactNode }> = ({ children }) => {
    const [language, setLanguage] = useState<Language>('en');
    const [translations, setTranslations] = useState<LanguageFiles | null>(null);

    useEffect(() => {
        const loadTranslations = async () => {
            try {
                const enResponse = await fetch('./i18n/locales/en.json');
                const faResponse = await fetch('./i18n/locales/fa.json');
                
                if (!enResponse.ok || !faResponse.ok) {
                    throw new Error('Failed to fetch translation files');
                }

                const en = await enResponse.json();
                const fa = await faResponse.json();

                setTranslations({ en, fa });
            } catch (error) {
                console.error("Failed to load translations:", error);
                // In case of error, you might want to set some default minimal translations
                // or render an error message to the user. For now, it will hang on loading.
            }
        };

        loadTranslations();
    }, []);

    // Fix: Implement `t` function to match the TFunction overloads.
    const t: TFunction = useCallback((key: string, options?: Record<string, unknown>): string => {
        if (!translations) {
            return key; // Return key as fallback during loading
        }
        
        const langFile = translations[language];
        let value: unknown = key.split('.').reduce((obj: unknown, k: string) => (obj && typeof obj === 'object' ? (obj as Record<string, unknown>)[k] : undefined), langFile);

        if (value === undefined || value === null) {
            // Fallback to English if translation is missing in the current language
            const fallbackLangFile = translations.en;
            value = key.split('.').reduce((obj: unknown, k: string) => (obj && typeof obj === 'object' ? (obj as Record<string, unknown>)[k] : undefined), fallbackLangFile) || key;
        }

        if (options?.returnObjects) {
            return value as string;
        }

        if (typeof value !== 'string') {
            return key; // Fallback to key if the value is not a string and we are not returning an object.
        }
        
        let text = value;

        if (text && options) {
            Object.keys(options).forEach((k) => {
                text = text.replace(new RegExp(`{{${k}}}`, 'g'), String(options[k]));
            });
        }
        
        return text || key;
    }, [translations, language]);
    
    const value = useMemo(() => ({ language, setLanguage, t }), [language, t]);

    // Do not render children until translations are loaded to prevent showing keys
    if (!translations) {
        return null;
    }

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
