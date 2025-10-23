import React, { useState, useEffect, useMemo, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { FamilyAnalysisResult, MemberAnalysisResult, ProbabilityMap, Person } from '../types';
import Card from './ui/Card';
import AnimatedPieChart from './AnimatedPieChart';
import ResultsTable from './ResultsTable';
import TransfusionVisualizer from './TransfusionVisualizer';
import { WarningIcon } from './icons';
import { useLanguage } from '../i18n/LanguageContext';
import AskAIButton from './AskAIButton';
import Typewriter from './ui/Typewriter';

// Helper to format family data for the AI prompt
const formatFamilyForPrompt = (family: Person[], t: (key: string) => string): string => {
    return family.map((p, i) => {
        const name = i === 0 ? t('father') : i === 1 ? t('mother') : `${t('child')} ${i - 1}`;
        return `${name}: ABO=${p.ABO}, RH=${p.RH}`;
    }).join('; ');
};

// Helper to format probability data for the AI prompt
const formatProbabilitiesForPrompt = (data: ProbabilityMap): string => {
    if (Object.keys(data).length === 0) return 'N/A';
    return Object.entries(data)
        .map(([type, prob]) => `${type}: ${prob.toFixed(2)}%`)
        .join(', ');
};

// Helper to get a consistent, translated member name
const getMemberName = (name: string, t: (key: string, options?: Record<string, string | number>) => string): string => {
    if (name === 'father') return t('father');
    if (name === 'mother') return t('mother');
    const match = name.match(/child(\d+)/);
    if (match) {
        return `${t('child')} ${parseInt(match[1], 10)}`;
    }
    return name;
};

// Helper function to detect RTL text
const isRTL = (text: string): boolean => {
    if (!text) return false;
    const rtlRegex = /[\u0600-\u06FF]/;
    return rtlRegex.test(text);
};

const AIExplanation: React.FC<{ text: string }> = ({ text }) => {
    const [displayedText, setDisplayedText] = useState('');

    useEffect(() => {
        setDisplayedText(''); // Reset on new text
    }, [text]);

    useEffect(() => {
        if (displayedText.length < text.length) {
            const timeoutId = setTimeout(() => {
                const nextLength = Math.min(displayedText.length + 25, text.length);
                setDisplayedText(text.slice(0, nextLength));
            }, 5);
            return () => clearTimeout(timeoutId);
        }
    }, [displayedText, text]);

    const isTyping = displayedText.length < text.length;
    const messageIsRtl = isRTL(text);
    const messageDir = messageIsRtl ? 'rtl' : 'ltr';
    const fontClass = messageIsRtl ? 'font-persian' : '';

    return (
        <div
            className={`bg-gray-800 text-gray-300 p-3 rounded-xl markdown-content ${fontClass} ${isTyping ? 'blinking-cursor' : ''}`}
            dir={messageDir}
        >
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{displayedText || '\u00A0'}</ReactMarkdown>
        </div>
    );
};


interface ProbabilityDisplayBlockProps {
    title: string;
    data: ProbabilityMap;
    onAskAI: (prompt: string, contextType?: string, contextData?: Record<string, any>) => void;
    promptContext: {
        family: Person[];
        member: MemberAnalysisResult;
    };
    contextType: string;
}

const ProbabilityDisplayBlock: React.FC<ProbabilityDisplayBlockProps> = ({ title, data, onAskAI, promptContext, contextType }) => {
    const { t } = useLanguage();
    if (Object.keys(data).length === 0) return null;

    const familyInputs = formatFamilyForPrompt(promptContext.family, t);
    const chartData = formatProbabilitiesForPrompt(data);
    const memberName = getMemberName(promptContext.member.member, t);
    
    const aiPrompt = t('charts.aiPrompt', {
        familyInputs: familyInputs,
        member: memberName,
        chartTitle: title,
        chartData: chartData
    });

    return (
        <div className="relative group bg-gray-800/30 p-4 rounded-lg border border-gray-700/50">
             <AskAIButton
                prompt={aiPrompt}
                onAsk={onAskAI}
                className="top-2 right-2 rtl:left-2 rtl:right-auto z-10"
                contextType={contextType}
                contextData={{ member: memberName }}
            />
            <h5 className="text-lg font-medium mb-4 text-center text-gray-300">{title}</h5>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-center">
                <div className="order-2 xl:order-1">
                    <ResultsTable data={data} />
                </div>
                <div className="h-64 w-full order-1 xl:order-2">
                    <AnimatedPieChart data={data} />
                </div>
            </div>
        </div>
    );
};

interface MemberResultCardProps {
    analysis: MemberAnalysisResult;
    family: Person[];
    onAskAI: (prompt: string) => void;
    isStickyActive: boolean;
}

const MemberResultCard: React.FC<MemberResultCardProps> = ({ analysis, family, onAskAI, isStickyActive }) => {
    const { t } = useLanguage();
    const promptContext = { family, member: analysis };

    const formattedHybridGenoProbs = useMemo(() => {
        return Object.fromEntries(
            Object.entries(analysis.hybrid_genotype_probabilities).map(([key, value]) => {
                const formattedKey = key.length === 4 ? `${key.substring(0, 2)}_${key.substring(2)}` : key;
                return [formattedKey, value];
            })
        );
    }, [analysis.hybrid_genotype_probabilities]);

    const parentSummary = useMemo(() => {
        const formatParentType = (p: Person) => {
            const abo = p.ABO === 'Unknown' ? '' : p.ABO;
            const rh = p.RH === 'Unknown' ? '' : p.RH;
            const fullType = `${abo}${rh}`;
            return fullType || t('unknown');
        };
        const fatherType = formatParentType(family[0]);
        const motherType = formatParentType(family[1]);
        return `(${t('father')}: ${fatherType}, ${t('mother')}: ${motherType})`;
    }, [family, t]);

    return (
        <div className="animate-fade-in-up">
            <Card className="bg-gray-900/50 border-gray-800">
                <h3 className="sticky top-0 z-30 flex items-center justify-center gap-x-4 flex-wrap text-2xl font-bold text-center -mx-6 -mt-6 sm:-mx-8 sm:-mt-8 mb-6 bg-gray-900/80 backdrop-blur-sm py-4 rounded-t-xl border-b border-gray-700/50 shadow-lg shadow-black/30">
                     <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-rose-500">
                        {t('memberAnalysisTitle', { member: getMemberName(analysis.member, t) })}
                    </span>
                    <Typewriter 
                        text={parentSummary}
                        active={isStickyActive}
                        className="text-base font-normal text-gray-400"
                    />
                </h3>
                
                <div className="space-y-6 mb-8">
                    <ProbabilityDisplayBlock title={t('charts.aboPheno')} data={analysis.abo_phenotype_probabilities} onAskAI={onAskAI} promptContext={promptContext} contextType="aboPhenotype" />
                    <ProbabilityDisplayBlock title={t('charts.aboGeno')} data={analysis.abo_genotype_probabilities} onAskAI={onAskAI} promptContext={promptContext} contextType="aboGenotype" />
                    <ProbabilityDisplayBlock title={t('charts.rhPheno')} data={analysis.rh_phenotype_probabilities} onAskAI={onAskAI} promptContext={promptContext} contextType="rhPhenotype" />
                    <ProbabilityDisplayBlock title={t('charts.rhGeno')} data={analysis.rh_genotype_probabilities} onAskAI={onAskAI} promptContext={promptContext} contextType="rhGenotype" />
                    <ProbabilityDisplayBlock title={t('charts.hybridGeno')} data={formattedHybridGenoProbs} onAskAI={onAskAI} promptContext={promptContext} contextType="hybridGenotype" />
                    <ProbabilityDisplayBlock title={t('charts.hybridPheno')} data={analysis.hybrid_phenotype_probabilities} onAskAI={onAskAI} promptContext={promptContext} contextType="hybridPhenotype" />
                </div>
                
                <h4 className="text-xl font-semibold text-center mb-4 text-gray-300">{t('transfusion.title')}</h4>
                <TransfusionVisualizer 
                    compatibility={analysis.transfusion_compatibility}
                    analysis={analysis}
                    family={family}
                    onAskAI={onAskAI}
                />
            </Card>
        </div>
    );
};

interface ResultsDisplayProps {
    isLoading: boolean;
    analysisResult: FamilyAnalysisResult | null;
    memberAnalyses: MemberAnalysisResult[];
    family: Person[];
    onAskAI: (prompt: string) => void;
    isAiExplaining: boolean;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ isLoading, analysisResult, memberAnalyses, family, onAskAI, isAiExplaining }) => {
    const { t } = useLanguage();
    const [selectedMember, setSelectedMember] = useState<string | null>(null);
    const [isStickyActive, setIsStickyActive] = useState(false);
    const [errorLoadingTextIndex, setErrorLoadingTextIndex] = useState(0);
    const [analysisLoadingTextIndex, setAnalysisLoadingTextIndex] = useState(0);
    const memberSelectorRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (memberAnalyses.length > 0) {
            setSelectedMember(memberAnalyses[0].member);
        } else {
            setSelectedMember(null);
        }
    }, [memberAnalyses]);
    
     useEffect(() => {
        let interval: NodeJS.Timeout | null = null;
        if (isAiExplaining) {
            const loadingTexts = t('aiErrorLoadingTexts', { returnObjects: true }) as string[];
            interval = setInterval(() => {
                setErrorLoadingTextIndex(prev => (prev + 1) % loadingTexts.length);
            }, 2000); // Change text every 2 seconds
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isAiExplaining, t]);

    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;
        if (isLoading) {
            const loadingTexts = t('aiErrorLoadingTexts', { returnObjects: true }) as string[];
            interval = setInterval(() => {
                setAnalysisLoadingTextIndex(prev => (prev + 1) % loadingTexts.length);
            }, 2000); // Change text every 2 seconds
        } else {
            setAnalysisLoadingTextIndex(0); // Reset index when not loading
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isLoading, t]);

    useEffect(() => {
        const selectorElement = memberSelectorRef.current;
        if (!selectorElement || memberAnalyses.length === 0) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                // The header becomes "sticky" when the selector element is scrolled completely above the viewport.
                setIsStickyActive(!entry.isIntersecting && entry.boundingClientRect.bottom < 0);
            },
            { threshold: [0, 1] }
        );

        observer.observe(selectorElement);

        return () => {
            if (selectorElement) {
                observer.unobserve(selectorElement);
            }
        };
    }, [memberAnalyses]); // Rerun when analyses load, so ref is available.


    if (isLoading) {
        const analysisLoadingTexts = t('aiErrorLoadingTexts', { returnObjects: true }) as string[];
        const currentAnalysisLoadingText = analysisLoadingTexts[analysisLoadingTextIndex];
        return (
             <div className="text-center p-8">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-brand-primary mx-auto"></div>
                <p key={currentAnalysisLoadingText} className="mt-4 text-lg text-gray-400 min-h-[1.75rem] text-glow-animation">
                    {currentAnalysisLoadingText}
                </p>
            </div>
        )
    }

    if (!analysisResult) return null;

    if (analysisResult.errors && analysisResult.errors.length > 0) {
        const isAiLoading = analysisResult.errors[0] === 'ai_loading_placeholder';
        const loadingTexts = t('aiErrorLoadingTexts', { returnObjects: true }) as string[];
        const currentLoadingText = loadingTexts[errorLoadingTextIndex];
        
        return (
            <div className="mt-8">
                <Card 
                    className="border-red-500/50 bg-gray-900/50 animate-fade-in"
                >
                     <h3 className="flex items-center justify-center gap-3 text-2xl font-bold text-red-400 mb-4">
                        <WarningIcon className="h-8 w-8" />
                        <span>{t('error.title')}</span>
                    </h3>
                    <div className="space-y-2 min-h-[4rem] flex flex-col justify-center">
                      {isAiLoading ? (
                        <div className="text-gray-400 flex items-center justify-center gap-3">
                           <svg className="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                           </svg>
                            <p key={currentLoadingText} className="text-glow-animation">{currentLoadingText}</p>
                        </div>
                      ) : (
                         <div className="text-white text-sm sm:text-base leading-relaxed animate-fade-in">
                            {analysisResult.errors.map((error, i) => {
                                const translatedError = t(error);
                                // Heuristic: AI explanations are raw text (t(err) === err) and usually long.
                                const isAiExplanation = translatedError === error && error.length > 50;
                                if (isAiExplanation) {
                                    return <AIExplanation key={i} text={error} />;
                                }
                                return <p key={i}>{translatedError}</p>;
                            })}
                        </div>
                      )}
                    </div>
                </Card>
            </div>
        );
    }
    
    if (!analysisResult.valid) {
        return null;
    }
    
    return (
        <div className="space-y-8 mt-12">
            <div ref={memberSelectorRef} className="flex flex-wrap justify-center gap-3 mb-8 animate-fade-in">
                {memberAnalyses.map((analysis) => (
                    <button
                        key={analysis.member}
                        onClick={() => setSelectedMember(analysis.member)}
                        className={`relative px-5 py-2.5 text-sm font-bold rounded-full transition-all duration-300 ease-in-out focus:outline-none
                            ${selectedMember === analysis.member
                                ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/40'
                                : 'bg-gray-800/60 text-gray-300 hover:bg-gray-700/80 hover:text-white'
                            }`}
                    >
                        {getMemberName(analysis.member, t)}
                    </button>
                ))}
            </div>

            {memberAnalyses
                .filter(analysis => analysis.valid && analysis.member === selectedMember)
                .map((analysis) => (
                    <MemberResultCard 
                        key={analysis.member} 
                        analysis={analysis} 
                        family={family} 
                        onAskAI={onAskAI}
                        isStickyActive={isStickyActive}
                    />
            ))}
        </div>
    );
};

export default ResultsDisplay;