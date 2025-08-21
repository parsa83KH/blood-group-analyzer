



import React, { useState, useEffect, useMemo, useRef } from 'react';
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

// Component to parse and style the error messages with highlighted parts
const FormattedErrorMessage: React.FC<{ message: string }> = ({ message }) => {
    // Split the message by custom delimiters (__...__ for titles, *...* for highlights)
    const parts = message.split(/(__.*?__|\*.*?\*)/g).filter(Boolean);

    return (
        <>
            {parts.map((part, i) => {
                if (part.startsWith('__') && part.endsWith('__')) {
                    // Style for titles like "ABO Error:"
                    return (
                        <span key={i} className="font-bold text-red-400 mr-2">
                            {part.substring(2, part.length - 2)}
                        </span>
                    );
                }
                if (part.startsWith('*') && part.endsWith('*')) {
                     // Style for highlighted keywords
                    return (
                        <strong key={i} className="text-rose-300 bg-rose-900/50 rounded px-1.5 py-0.5 font-mono font-bold not-italic mx-0.5">
                            {part.substring(1, part.length - 1)}
                        </strong>
                    );
                }
                // Regular text part
                return <span key={i}>{part}</span>;
            })}
        </>
    );
};

interface ProbabilityDisplayBlockProps {
    title: string;
    data: ProbabilityMap;
    onAskAI: (prompt: string) => void;
    promptContext: {
        family: Person[];
        member: MemberAnalysisResult;
    }
}

const ProbabilityDisplayBlock: React.FC<ProbabilityDisplayBlockProps> = ({ title, data, onAskAI, promptContext }) => {
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
                    <ProbabilityDisplayBlock title={t('charts.aboPheno')} data={analysis.abo_phenotype_probabilities} onAskAI={onAskAI} promptContext={promptContext} />
                    <ProbabilityDisplayBlock title={t('charts.aboGeno')} data={analysis.abo_genotype_probabilities} onAskAI={onAskAI} promptContext={promptContext} />
                    <ProbabilityDisplayBlock title={t('charts.rhPheno')} data={analysis.rh_phenotype_probabilities} onAskAI={onAskAI} promptContext={promptContext} />
                    <ProbabilityDisplayBlock title={t('charts.rhGeno')} data={analysis.rh_genotype_probabilities} onAskAI={onAskAI} promptContext={promptContext} />
                    <ProbabilityDisplayBlock title={t('charts.hybridGeno')} data={formattedHybridGenoProbs} onAskAI={onAskAI} promptContext={promptContext} />
                    <ProbabilityDisplayBlock title={t('charts.hybridPheno')} data={analysis.hybrid_phenotype_probabilities} onAskAI={onAskAI} promptContext={promptContext} />
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
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ isLoading, analysisResult, memberAnalyses, family, onAskAI }) => {
    const { t } = useLanguage();
    const [selectedMember, setSelectedMember] = useState<string | null>(null);
    const [isStickyActive, setIsStickyActive] = useState(false);
    const memberSelectorRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (memberAnalyses.length > 0) {
            setSelectedMember(memberAnalyses[0].member);
        } else {
            setSelectedMember(null);
        }
    }, [memberAnalyses]);
    
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
        return (
             <div className="text-center p-8">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-brand-primary mx-auto"></div>
                <p className="mt-4 text-lg">{t('loading')}</p>
            </div>
        )
    }

    if (!analysisResult) return null;

    if (analysisResult.errors && analysisResult.errors.length > 0) {
        const familyInputs = formatFamilyForPrompt(family, t);

        const combinedErrorMessages = analysisResult.errors.map(error => {
            let message = t(error);
            try {
                const errObj = JSON.parse(error);
                if (errObj.key && errObj.options) {
                    const finalOptions = { ...errObj.options };
                    if (Array.isArray(finalOptions.child_indices) && finalOptions.child_indices.length > 0) {
                        const indices: number[] = finalOptions.child_indices;
                        if (indices.length > 1) {
                            finalOptions.child_entity = t('error.entities.children_list', { list: indices.join(', ') });
                        } else {
                            finalOptions.child_entity = t('error.entities.child_single', { number: indices[0] });
                        }
                        delete finalOptions.child_indices;
                    }
                    message = t(errObj.key, finalOptions);
                }
            } catch (e) { /* Not a JSON error string */ }
            return message;
        }).join('\n');

        const errorPrompt = t('error.aiPrompt', {
            familyInputs: familyInputs,
            error: combinedErrorMessages,
        });
        
        return (
            <div className="relative group mt-8">
                <Card 
                    className="text-center border-red-500/50 bg-gray-900/50 animate-fade-in"
                >
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <WarningIcon className="h-12 w-12 text-red-400 flex-shrink-0" />
                        <div>
                            <h3 className="text-2xl font-bold text-red-400 mb-2">{t('error.title')}</h3>
                            <div className="space-y-2">
                              {analysisResult.errors.map((error, i) => {
                                  let message = t(error);
                                  try {
                                      const errObj = JSON.parse(error);
                                      if (errObj.key && errObj.options) {
                                          const finalOptions = { ...errObj.options };
                                          if (Array.isArray(finalOptions.child_indices) && finalOptions.child_indices.length > 0) {
                                              const indices: number[] = finalOptions.child_indices;
                                              if (indices.length > 1) {
                                                  finalOptions.child_entity = t('error.entities.children_list', { list: indices.join(', ') });
                                              } else {
                                                  finalOptions.child_entity = t('error.entities.child_single', { number: indices[0] });
                                              }
                                              delete finalOptions.child_indices;
                                          }
                                          message = t(errObj.key, finalOptions);
                                      }
                                  } catch (e) { /* Fallback to default message */ }
                                  return (
                                    <p key={i} className="text-red-300 ltr:text-left rtl:text-right text-sm sm:text-base leading-relaxed">
                                        <FormattedErrorMessage message={message} />
                                    </p>
                                  );
                              })}
                            </div>
                        </div>
                    </div>
                </Card>
                <AskAIButton
                    prompt={errorPrompt}
                    onAsk={onAskAI}
                    className="top-2 right-2 rtl:left-2 rtl:right-auto"
                />
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