import React, { useState, useCallback, useEffect, useRef } from 'react';
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

const App: React.FC = () => {
    const { language, t } = useLanguage();
    const [family, setFamily] = useState<Person[]>([
        { name: 'father', ABO: 'Unknown', RH: 'Unknown' },
        { name: 'mother', ABO: 'Unknown', RH: 'Unknown' },
    ]);
    const [analysisResult, setAnalysisResult] = useState<FamilyAnalysisResult | null>(null);
    const [memberAnalyses, setMemberAnalyses] = useState<MemberAnalysisResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showHowItWorks, setShowHowItWorks] = useState(false);

    const aiAssistantRef = useRef<AIAssistantHandle>(null);
    const aiSectionRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        document.documentElement.lang = language;
        document.documentElement.dir = language === 'fa' ? 'rtl' : 'ltr';
        document.body.classList.toggle('font-persian', language === 'fa');
        document.body.classList.toggle('font-sans', language !== 'fa');
    }, [language]);


    const handleAnalysis = useCallback(async () => {
        setIsLoading(true);
        setAnalysisResult(null);
        setMemberAnalyses([]);

        setTimeout(() => {
            try {
                const calculator = new BloodTypeCalculator();
                const father = family[0];
                const mother = family[1];
                const children = family.slice(2);

                const familyResult = calculator.analyze_family(father, mother, children);
                setAnalysisResult(familyResult);

                if (familyResult.valid) {
                    const membersToAnalyze = ['father', 'mother', ...children.map((_, i) => `child${i + 1}`)];
                    const results = membersToAnalyze.map(memberIdentifier => {
                        return calculator.analyze_member_probabilities(memberIdentifier, familyResult);
                    });
                    setMemberAnalyses(results);
                }
            } catch (error: any) {
                console.error("Analysis failed:", error);
                setAnalysisResult({
                    valid: false,
                    errors: ['error.unexpected'],
                    abo_result: { valid: false, errors: [], combinations: [], father_genotypes: new Set(), mother_genotypes: new Set(), children_genotypes: [] },
                    rh_result: { valid: false, errors: [], combinations: [], father_genotypes: new Set(), mother_genotypes: new Set(), children_genotypes: [] },
                    abo_valid: false,
                    rh_valid: false
                });
            } finally {
                setIsLoading(false);
            }
        }, 100);
    }, [family]);

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
                        />
                    </AnimatedSection>
                    
                    <AnimatedSection>
                        <ResultsDisplay
                            isLoading={isLoading}
                            analysisResult={analysisResult}
                            memberAnalyses={memberAnalyses}
                            family={family}
                            onAskAI={handleAskAI}
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