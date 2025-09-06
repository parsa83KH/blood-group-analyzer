import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { ChatMessage, AIAssistantHandle } from '../types';
import { apiService } from '../services/api';
import Card from './ui/Card';
import { PaperAirplaneIcon, SparklesIcon } from './icons';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Helper function to detect RTL text by checking for characters in the Arabic script range.
const isRTL = (text: string): boolean => {
    if (!text) return false;
    const rtlRegex = /[\u0600-\u06FF]/;
    return rtlRegex.test(text);
};

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface AIAssistantProps {
  // No props needed for now
}

const AIAssistant = forwardRef<AIAssistantHandle, AIAssistantProps>((_props, ref) => {
    const { t, language } = useLanguage();
    
    const initialMessageText = t('aiAssistant.initialMessage');
    const [messages, setMessages] = useState<ChatMessage[]>([{ role: 'model', text: initialMessageText }]);
    
    useEffect(() => {
        // This effect updates the initial message text if the app's language changes,
        // but only if the user hasn't started a conversation yet.
        if (messages.length === 1 && messages[0].role === 'model') {
            setMessages([{ role: 'model', text: initialMessageText }]);
        }
    }, [initialMessageText, messages]);
    
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [, setError] = useState<string | null>(null);
    // Note: error state is kept for future error handling implementation

    const chatContainerRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);
    
    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            const scrollHeight = textarea.scrollHeight;
            textarea.style.height = `${scrollHeight}px`;
        }
    }, [input]);

    const sendPrompt = async (promptToSend: string) => {
        if (isLoading) return;

        const newUserMessage: ChatMessage = { role: 'user', text: promptToSend };
        setMessages(prev => [...prev, newUserMessage, { role: 'model', text: '' }]);
        setInput(''); // Clear input in case user was typing something else
        setIsLoading(true);
        setError(null);
        
        try {
            // Determine prompt language to guide the AI's response language
            const promptLanguage = isRTL(promptToSend) ? 'fa' : 'en';

            const response = await apiService.sendChatMessage({
                message: promptToSend,
                language: promptLanguage
            });

            if (response.error) {
                throw new Error(response.error);
            }

            const aiResponse = response.data?.response || t('aiAssistant.error');
            
            setMessages(prev => {
                const lastMessageIndex = prev.length - 1;
                const updatedMessages = [...prev];
                if (updatedMessages[lastMessageIndex] && updatedMessages[lastMessageIndex].role === 'model') {
                    updatedMessages[lastMessageIndex] = { ...updatedMessages[lastMessageIndex], text: aiResponse };
                }
                return updatedMessages;
            });

        } catch (err) {
            console.error("AI Assistant Error:", err);
            const errorMessage = t('aiAssistant.error');
            setError(errorMessage);
            setMessages(prev => {
                const updatedMessages = [...prev];
                const lastMessageIndex = updatedMessages.length - 1;
                if (updatedMessages[lastMessageIndex] && updatedMessages[lastMessageIndex].role === 'model') {
                   updatedMessages[lastMessageIndex].text = errorMessage;
                }
                return updatedMessages;
            });
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleSend = () => {
        if (!input.trim() || isLoading) return;
        sendPrompt(input);
    };

    useImperativeHandle(ref, () => ({
        sendPrompt,
    }));

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const userIconText = language === 'fa' ? 'من' : 'me';
    
    const handleGlowMouseMove = (e: React.MouseEvent<HTMLElement>) => {
        const el = e.currentTarget;
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        el.style.setProperty('--mouse-x', `${x}px`);
        el.style.setProperty('--mouse-y', `${y}px`);
    };
    const handleGlowMouseEnter = (e: React.MouseEvent<HTMLElement>) => {
        e.currentTarget.classList.add('is-hovering');
    };
    const handleGlowMouseLeave = (e: React.MouseEvent<HTMLElement>) => {
        e.currentTarget.classList.remove('is-hovering');
    };

    return (
        <Card className="flex flex-col h-[600px] max-h-[80vh]">
            <div className="flex items-center gap-3 mb-4">
                <SparklesIcon className="w-8 h-8 text-brand-primary" />
                <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-rose-500">
                    {t('aiAssistant.title')}
                </h2>
            </div>
            <div ref={chatContainerRef} className="flex-grow overflow-y-auto pr-2 -mr-2 space-y-4 mb-4 custom-scrollbar">
                {messages.map((msg, index) => {
                    const isThinkingPlaceholder = msg.role === 'model' && msg.text === '' && isLoading && index === messages.length - 1;
                    const messageIsRtl = isRTL(msg.text);
                    const messageDir = messageIsRtl ? 'rtl' : 'ltr';

                    return (
                        <div key={index} className={`flex items-start gap-3 animate-fade-in ${msg.role === 'user' ? 'justify-end' : ''}`}>
                            {msg.role === 'model' && <div className="w-8 h-8 rounded-full bg-brand-primary/80 flex items-center justify-center flex-shrink-0 text-white font-bold text-sm leading-none">AI</div>}
                            <div
                                className={`max-w-xl p-3 rounded-xl ${
                                    msg.role === 'model'
                                        ? 'bg-gray-800 text-gray-300 markdown-content'
                                        : 'bg-brand-accent text-white'
                                } ${messageIsRtl ? 'font-persian' : ''}`}
                                dir={messageDir}
                            >
                               {isThinkingPlaceholder ? (
                                    <div className="loading-dots">
                                        <span></span><span></span><span></span>
                                    </div>
                               ) : msg.role === 'model' ? (
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text || '\u00A0'}</ReactMarkdown>
                               ) : (
                                    <div className="whitespace-pre-wrap">{msg.text}</div>
                               )}
                            </div>
                             {msg.role === 'user' && <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center flex-shrink-0 text-white font-bold text-sm leading-none">{userIconText}</div>}
                        </div>
                    );
                })}
            </div>
            <div className="flex-shrink-0 mt-auto pt-4 border-t border-gray-700/50">
                 <div
                    className="interactive-glow-border flex items-end gap-2 bg-gray-900 border border-gray-600 rounded-xl p-1 transition-all duration-300 focus-within:ring-2 focus-within:ring-brand-accent focus-within:border-transparent"
                    onMouseMove={handleGlowMouseMove}
                    onMouseEnter={handleGlowMouseEnter}
                    onMouseLeave={handleGlowMouseLeave}
                    style={{ borderRadius: '0.75rem' }}
                >
                    <textarea
                        ref={textareaRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={isLoading ? t('aiAssistant.thinking') : t('aiAssistant.placeholder')}
                        disabled={isLoading}
                        className={`flex-grow w-full bg-transparent pl-3 pr-1 py-2 text-white placeholder-gray-500 focus:outline-none resize-none overflow-y-hidden custom-scrollbar ${isRTL(input) || (language === 'fa' && !input) ? 'font-persian' : 'font-sans'}`}
                        aria-label={t('aiAssistant.placeholder')}
                        rows={1}
                        dir={input ? (isRTL(input) ? 'rtl' : 'ltr') : (language === 'fa' ? 'rtl' : 'ltr')}
                    />
                    <button
                        onClick={handleSend}
                        disabled={isLoading || !input.trim()}
                        className="flex-shrink-0 self-end p-2.5 mb-1 rounded-full bg-brand-primary text-white hover:bg-brand-secondary focus:outline-none focus:ring-2 focus:ring-brand-primary disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-300"
                        aria-label={t('aiAssistant.send')}
                    >
                        <PaperAirplaneIcon className="w-5 h-5 rtl:rotate-180" />
                    </button>
                </div>
            </div>
        </Card>
    );
});

export default AIAssistant;