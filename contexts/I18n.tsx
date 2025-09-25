
import React, { createContext, useContext, useEffect, useCallback, useState } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';

type Locale = 'en' | 'ar';

interface I18nContextType {
    locale: Locale;
    setLocale: (locale: Locale) => void;
    t: (key: string, replacements?: { [key: string]: string | number }) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [locale, setLocale] = useLocalStorage<Locale>('locale', 'en');
    const [messages, setMessages] = useState<any>({});

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const response = await fetch(`/${locale}.json`);
                if (!response.ok) {
                   throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setMessages(data);
            } catch (error) {
                console.error(`Could not load locale file for: ${locale}`, error);
                // Fallback to English on error
                if (locale !== 'en') {
                    const fallbackResponse = await fetch('/en.json');
                    const fallbackData = await fallbackResponse.json();
                    setMessages(fallbackData);
                }
            }
        };
        fetchMessages();
        document.documentElement.lang = locale;
        document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
    }, [locale]);

    const t = useCallback<I18nContextType['t']>((key, replacements) => {
        if (Object.keys(messages).length === 0) return key; // Return key if messages not loaded

        const keys = key.split('.');
        let text = keys.reduce((obj, k) => (obj && obj[k] !== undefined) ? obj[k] : key, messages);
        
        if (typeof text !== 'string') {
            // Do not warn if the object traversal is incomplete, it might still be loading.
            if (Object.keys(messages).length > 0) {
                console.warn(`Translation key '${key}' not found for locale '${locale}'.`);
            }
            return key;
        }

        if (replacements) {
            Object.keys(replacements).forEach(placeholder => {
                const regex = new RegExp(`{${placeholder}}`, 'g');
                text = text.replace(regex, String(replacements[placeholder]));
            });
        }

        return text;
    }, [locale, messages]);

    return (
        <I18nContext.Provider value={{ locale, setLocale, t }}>
            {children}
        </I18nContext.Provider>
    );
};

export const useTranslation = () => {
    const context = useContext(I18nContext);
    if (context === undefined) {
        throw new Error('useTranslation must be used within an I18nProvider');
    }
    return context;
};
