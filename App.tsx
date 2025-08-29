import React, { useState, useCallback, useEffect, useRef } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Person, FamilyAnalysisResult, MemberAnalysisResult, AIAssistantHandle } from './types';
import BloodInputForm from './components/BloodInputForm';
import ResultsDisplay from './components/ResultsDisplay';
import HowItWorks from './components/HowItWorks';
import LanguageSwitcher from './components/LanguageSwitcher';
import { QuestionMarkCircleIcon } from './components/icons';
import { BloodTypeCalculator } from './services/bloodCalculator';
import { useLanguage } from './i18n/LanguageContext';
import AnimatedSection from './components/ui/AnimatedSection';
import AIAssistant from './components/AIAssistant';

type AnalysisCompletionStatus = 'idle' | 'success' | 'error';

const App: React.FC = () => {
    const { language, t } = useLanguage();
    const [family, setFamily] = useState<Person[]>([
        { name: 'father', ABO: 'Unknown', RH: 'Unknown' },
        { name: 'mother', ABO: 'Unknown', RH: 'Unknown' },
    ]);
    const [analysisResult, setAnalysisResult] = useState<FamilyAnalysisResult | null>(null);
    const [memberAnalyses, setMemberAnalyses] = useState<MemberAnalysisResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isAiExplaining, setIsAiExplaining] = useState(false);
    const [showHowItWorks, setShowHowItWorks] = useState(false);
    const [analysisCompletionStatus, setAnalysisCompletionStatus] = useState<AnalysisCompletionStatus>('idle');
    const [resultKey, setResultKey] = useState(0);

    const aiAssistantRef = useRef<AIAssistantHandle>(null);
    const aiSectionRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        document.documentElement.lang = language;
        document.documentElement.dir = language === 'fa' ? 'rtl' : 'ltr';
        document.body.classList.toggle('font-persian', language === 'fa');
        document.body.classList.toggle('font-sans', language !== 'fa');
    }, [language]);
    
    useEffect(() => {
        if (analysisCompletionStatus === 'success' || analysisCompletionStatus === 'error') {
            const timer = setTimeout(() => {
                setAnalysisCompletionStatus('idle');
            }, 2500); // Revert button state after 2.5 seconds
            return () => clearTimeout(timer);
        }
    }, [analysisCompletionStatus]);


    const handleAnalysis = useCallback(async () => {
        setIsLoading(true);
        setAnalysisCompletionStatus('idle');
        setResultKey(k => k + 1); // Force re-mount of results display
        setAnalysisResult(null);
        setMemberAnalyses([]);
        setIsAiExplaining(false);

        try {
            const calculator = new BloodTypeCalculator();
            const father = family[0];
            const mother = family[1];
            const children = family.slice(2);

            const familyResult = calculator.analyze_family(father, mother, children);

            // Prioritize checking for AI-explainable genetic impossibilities.
            // This is crucial because a result can have `valid: true` (if one system like ABO is valid)
            // but still contain a genetic error in another system (like RH) that needs explanation.
            const aiErrors = (familyResult.errors || []).map(err => {
                try {
                    const parsed = JSON.parse(err);
                    if (parsed.type === 'ai_explanation_required') return parsed;
                } catch (e) { /* not a JSON error */ }
                return null;
            }).filter(Boolean);

            if (aiErrors.length > 0) {
                setAnalysisCompletionStatus('error');
                // Force the result to be invalid and show a loading state for the AI explanation.
                setAnalysisResult({ ...familyResult, valid: false, errors: ["ai_loading_placeholder"] });
                setIsAiExplaining(true);
                
                await (async () => {
                    try {
                        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
                    
                        const formatPersonForPrompt = (p: Person, name: string) => `${name}: ABO=${p.ABO}, RH=${p.RH}`;
                        const familyInputsString = [
                            formatPersonForPrompt(father, t('father')),
                            formatPersonForPrompt(mother, t('mother')),
                            ...children.map((c, i) => formatPersonForPrompt(c, `${t('child')} ${i + 1}`))
                        ].join('\n');
                        
                        const systems = [...new Set(aiErrors.map(e => e.system))].join(language === 'fa' ? ' و ' : ' and ');
                        
                        const prompt = `You are a world-class expert in human blood genetics. Given the following family blood types, explain the genetic incompatibility in the ${systems} system(s).

**Response Structure:**
- Start with a "### Summary" section containing a brief, one or two-sentence explanation of the core problem.
- Follow with a "### Detailed Explanation" section for a comprehensive analysis.

**Formatting Rules:**
- Respond ONLY in ${language === 'fa' ? 'Persian (Farsi)' : 'English'}.
- Use Markdown headings (e.g., ### Summary).
- Use double asterisks for bolding key terms (e.g., **genotype**, **allele**).
- When referring to ABO genotypes, use the standard two-letter format (e.g., **AO**, **BB**, **OO**). Do NOT use superscript notations like Iᴬ or i.
- Be direct and scientific. Do not add conversational filler, greetings, or conclusions.

**Family Inputs:**
${familyInputsString}`;

                        const response = await ai.models.generateContent({
                            model: 'gemini-2.5-flash',
                            contents: prompt
                        });

                        const aiExplanation = response.text || '';
                        // Set the AI explanation and ensure the final state is marked as invalid.
                        setAnalysisResult(prev => ({ ...prev!, valid: false, errors: [aiExplanation] }));
                    } catch (error) {
                         console.error("AI explanation fetch failed:", error);
                         setAnalysisResult(prev => ({...prev!, valid: false, errors: [t('aiAssistant.error')]}));
                    } finally {
                         setIsAiExplaining(false);
                    }
                })();
            } else {
                // If no AI errors, handle valid results or standard errors.
                setAnalysisResult(familyResult);

                const hasErrors = familyResult.errors && familyResult.errors.length > 0;

                if (familyResult.valid && !hasErrors) {
                    setAnalysisCompletionStatus('success');
                    const membersToAnalyze = ['father', 'mother', ...children.map((_, i) => `child${i + 1}`)];
                    const results = membersToAnalyze.map(memberIdentifier => {
                        return calculator.analyze_member_probabilities(memberIdentifier, familyResult);
                    });
                    setMemberAnalyses(results);
                } else {
                    setAnalysisCompletionStatus('error');
                }
            }
        } catch (error: any) {
            console.error("Analysis failed:", error);
            setAnalysisCompletionStatus('error');
            const errorMessage = error.message && error.message.includes('API') 
                ? t('aiAssistant.error') 
                : t('error.unexpected');

            setAnalysisResult({
                valid: false,
                errors: [errorMessage],
                abo_result: { valid: false, errors: [], combinations: [], father_genotypes: new Set(), mother_genotypes: new Set(), children_genotypes: [] },
                rh_result: { valid: false, errors: [], combinations: [], father_genotypes: new Set(), mother_genotypes: new Set(), children_genotypes: [] },
                abo_valid: false,
                rh_valid: false
            });
        } finally {
            setIsLoading(false);
        }
    }, [family, t, language]);

    const handleAskAI = (prompt: string) => {
        if (aiAssistantRef.current) {
            aiAssistantRef.current.sendPrompt(prompt);
        }
        if (aiSectionRef.current) {
            aiSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

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
        <>
            <div className="fixed inset-0 -z-10 site-background" />
            <div className="relative min-h-screen text-brand-light p-4 sm:p-6 lg:p-8">
                <main className="max-w-7xl mx-auto">
                    <header className="relative text-center mb-12 pt-4 animate-fade-in-down">
                       <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-rose-400 via-red-500 to-amber-500 bg-[length:200%_auto] animate-text-gradient mb-2">
                           {t('appTitle')}
                       </h1>
                        <p className="text-lg text-gray-400 max-w-3xl mx-auto">
                           {t('appTagline')}
                        </p>
                       <div className="flex justify-center items-center gap-4 mt-6">
                           <LanguageSwitcher />
                           <button
                               onClick={() => setShowHowItWorks(prev => !prev)}
                               className="interactive-glow-border inline-flex items-center gap-2 text-gray-300 hover:text-white transition-all duration-300 font-semibold px-4 py-2 rounded-full bg-gray-800/50 border border-gray-700 hover:border-brand-accent hover:bg-brand-accent/20 hover:shadow-lg hover:shadow-brand-accent/20 transform hover:-translate-y-0.5"
                               aria-expanded={showHowItWorks}
                               onMouseMove={handleGlowMouseMove}
                               onMouseEnter={handleGlowMouseEnter}
                               onMouseLeave={handleGlowMouseLeave}
                               style={{ borderRadius: '9999px' }}
                           >
                               <QuestionMarkCircleIcon className="w-5 h-5" />
                               {t('howItWorks.title')}
                           </button>
                       </div>
                    </header>

                    {showHowItWorks && (
                        <AnimatedSection className="my-12">
                            <HowItWorks onAskAI={handleAskAI} />
                        </AnimatedSection>
                    )}

                    <AnimatedSection className="mb-12">
                        <BloodInputForm
                            family={family}
                            setFamily={setFamily}
                            onAnalyze={handleAnalysis}
                            isLoading={isLoading}
                            analysisCompletionStatus={analysisCompletionStatus}
                        />
                    </AnimatedSection>
                    
                    <AnimatedSection>
                        <ResultsDisplay
                            key={resultKey}
                            isLoading={isLoading}
                            analysisResult={analysisResult}
                            memberAnalyses={memberAnalyses}
                            family={family}
                            onAskAI={handleAskAI}
                            isAiExplaining={isAiExplaining}
                        />
                    </AnimatedSection>
                    
                    <div ref={aiSectionRef}>
                        <AnimatedSection className="mt-12">
                            <AIAssistant ref={aiAssistantRef} />
                        </AnimatedSection>
                    </div>
                </main>
                 <footer className="text-center mt-16 text-gray-500 text-sm space-y-2">
                    <p>&copy; 2024 {t('appTitle')}. {t('footerRights')}</p>
                    <p className="text-base text-gray-400">
                        {t('footer.developedBy')}{' '}
                        <strong className="font-semibold text-gray-300">
                           {t('footer.developerName')}
                        </strong>
                    </p>
                    <div className="flex justify-center items-center gap-6 pt-2 footer-social-links">
                        <a href="https://github.com/parsa83KH" target="_blank" rel="noopener noreferrer" className="github-link flex items-center gap-2 hover:text-gray-300 transition-colors">
                            <span className="icon-wrapper">
                               <i className="fa-brands fa-github"></i>
                            </span>
                            <span>{t('footer.github')}</span>
                        </a>
                         <a href="https://mail.google.com/mail/?view=cm&to=parsakhosravani83@gmail.com" target="_blank" rel="noopener noreferrer" className="email-link flex items-center gap-2 hover:text-gray-300 transition-colors">
                            <span className="icon-wrapper">
                              <i className="fa-solid fa-envelope"></i>
                            </span>
                            <span>{t('footer.email')}</span>
                        </a>
                        <a href="https://t.me/ParsaKH_83" target="_blank" rel="noopener noreferrer" className="telegram-link flex items-center gap-2 hover:text-gray-300 transition-colors">
                            <span className="icon-wrapper">
                              <i className="fa-brands fa-telegram"></i>
                            </span>
                            <span>{t('footer.telegram')}</span>
                        </a>
                    </div>
                </footer>
            </div>
        </>
    );
};

export default App;