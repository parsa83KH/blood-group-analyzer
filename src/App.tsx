import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Person, FamilyAnalysisResult, MemberAnalysisResult } from '@/types';
import BloodInputForm from '@/components/BloodInputForm';
import ResultsDisplay from '@/components/ResultsDisplay';
import HowItWorks from '@/components/HowItWorks';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { QuestionMarkCircleIcon } from '@/components/icons';
import { BloodTypeCalculator } from '@/services/bloodCalculator';
import { useLanguage } from '@/i18n/LanguageContext';
import AnimatedSection from '@/components/ui/AnimatedSection';

type AnalysisCompletionStatus = 'idle' | 'success' | 'error';

const scrollElementIntoView = (element: HTMLElement | null) => {
  if (!element) return;
  element.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

const App: React.FC = () => {
  const { language, t } = useLanguage();
  const [family, setFamily] = useState<Person[]>([
    { name: 'father', ABO: 'Unknown', RH: 'Unknown' },
    { name: 'mother', ABO: 'Unknown', RH: 'Unknown' },
  ]);
  const [analysisResult, setAnalysisResult] =
    useState<FamilyAnalysisResult | null>(null);
  const [memberAnalyses, setMemberAnalyses] = useState<MemberAnalysisResult[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(false);
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [isHowItWorksLoading, setIsHowItWorksLoading] = useState(false);
  const howItWorksToggleRef = useRef<HTMLButtonElement>(null);
  const howItWorksSectionRef = useRef<HTMLDivElement>(null);
  const resultsSectionRef = useRef<HTMLDivElement>(null);
  const shouldScrollToResultsRef = useRef(false);
  const [analysisCompletionStatus, setAnalysisCompletionStatus] =
    useState<AnalysisCompletionStatus>('idle');
  const [resultKey, setResultKey] = useState(0);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'fa' ? 'rtl' : 'ltr';
    document.body.classList.toggle('font-persian', language === 'fa');
    document.body.classList.toggle('font-sans', language !== 'fa');
  }, [language]);

  useEffect(() => {
    if (
      analysisCompletionStatus === 'success' ||
      analysisCompletionStatus === 'error'
    ) {
      const timer = setTimeout(() => {
        setAnalysisCompletionStatus('idle');
      }, 2500); // Revert button state after 2.5 seconds
      return () => clearTimeout(timer);
    }
  }, [analysisCompletionStatus]);

  useEffect(() => {
    if (!shouldScrollToResultsRef.current) return;

    if (isLoading) {
      const frameId = requestAnimationFrame(() => {
        scrollElementIntoView(resultsSectionRef.current);
      });
      return () => cancelAnimationFrame(frameId);
    }

    if (!analysisResult) return;

    // Wait a beat so the results/error card can paint, especially on phones.
    const timeoutId = window.setTimeout(() => {
      scrollElementIntoView(resultsSectionRef.current);
      shouldScrollToResultsRef.current = false;
    }, 100);

    return () => window.clearTimeout(timeoutId);
  }, [isLoading, analysisResult, resultKey]);

  const handleHowItWorksReady = useCallback(() => {
    setIsHowItWorksLoading(false);
    requestAnimationFrame(() => {
      scrollElementIntoView(howItWorksSectionRef.current);
    });
  }, []);

  const handleHowItWorksToggle = useCallback(() => {
    if (showHowItWorks || isHowItWorksLoading) {
      setShowHowItWorks(false);
      setIsHowItWorksLoading(false);
      return;
    }

    setIsHowItWorksLoading(true);
    setShowHowItWorks(true);
    requestAnimationFrame(() => {
      scrollElementIntoView(howItWorksSectionRef.current);
    });
  }, [showHowItWorks, isHowItWorksLoading]);

  const handleAnalysis = useCallback(async () => {
    shouldScrollToResultsRef.current = true;
    setIsLoading(true);
    setAnalysisCompletionStatus('idle');
    setResultKey(k => k + 1); // Force re-mount of results display
    setAnalysisResult(null);
    setMemberAnalyses([]);

    // Let React paint the analyzing state and scroll to it before computing.
    await new Promise<void>(resolve => {
      requestAnimationFrame(() => resolve());
    });

    try {
      const calculator = new BloodTypeCalculator();
      const father = family[0];
      const mother = family[1];
      const children = family.slice(2);

      const familyResult = calculator.analyze_family(father, mother, children);
      setAnalysisResult(familyResult);

      const hasErrors = familyResult.errors && familyResult.errors.length > 0;

      if (familyResult.valid && !hasErrors) {
        setAnalysisCompletionStatus('success');
        const membersToAnalyze = [
          'father',
          'mother',
          ...children.map((_, i) => `child${i + 1}`),
        ];
        const results = membersToAnalyze.map(memberIdentifier => {
          return calculator.analyze_member_probabilities(
            memberIdentifier,
            familyResult
          );
        });
        setMemberAnalyses(results);
      } else {
        setAnalysisCompletionStatus('error');
      }
    } catch (error: unknown) {
      console.error('Analysis failed:', error);
      setAnalysisCompletionStatus('error');
      setAnalysisResult({
        valid: false,
        errors: ['error.unexpected'],
        abo_result: {
          valid: false,
          errors: [],
          combinations: [],
          father_genotypes: new Set(),
          mother_genotypes: new Set(),
          children_genotypes: [],
        },
        rh_result: {
          valid: false,
          errors: [],
          combinations: [],
          father_genotypes: new Set(),
          mother_genotypes: new Set(),
          children_genotypes: [],
        },
        abo_valid: false,
        rh_valid: false,
      });
    } finally {
      setIsLoading(false);
    }
  }, [family]);

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
            <div className="flex flex-wrap justify-center items-center gap-3 sm:gap-4 mt-6">
              <LanguageSwitcher />
              <button
                ref={howItWorksToggleRef}
                onClick={handleHowItWorksToggle}
                className="interactive-glow-border inline-flex items-center gap-2 text-gray-300 hover:text-white transition-all duration-300 font-semibold px-4 py-2 rounded-full bg-gray-800/50 border border-gray-700 hover:border-brand-accent hover:bg-brand-accent/20 hover:shadow-lg hover:shadow-brand-accent/20 transform hover:-translate-y-0.5"
                aria-expanded={showHowItWorks || isHowItWorksLoading}
                aria-busy={isHowItWorksLoading}
                onMouseMove={handleGlowMouseMove}
                onMouseEnter={handleGlowMouseEnter}
                onMouseLeave={handleGlowMouseLeave}
                style={{ borderRadius: '9999px' }}
              >
                {isHowItWorksLoading ? (
                  <svg
                    className="w-5 h-5 animate-spin"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                ) : (
                  <QuestionMarkCircleIcon className="w-5 h-5" />
                )}
                {t('howItWorks.title')}
              </button>
            </div>
          </header>

          {(showHowItWorks || isHowItWorksLoading) && (
            <div ref={howItWorksSectionRef} className="my-12 scroll-mt-4">
              {isHowItWorksLoading && (
                <div className="text-center py-16">
                  <div className="animate-spin rounded-full h-14 w-14 border-b-2 border-brand-accent mx-auto"></div>
                  <p className="mt-4 text-lg text-gray-400">{t('loading')}</p>
                </div>
              )}
              {showHowItWorks && (
                <div
                  className={
                    isHowItWorksLoading
                      ? 'pointer-events-none fixed inset-x-0 top-0 -z-50 mx-auto w-full max-w-7xl px-4 opacity-0 sm:px-6 lg:px-8'
                      : 'animate-fade-in'
                  }
                  aria-hidden={isHowItWorksLoading}
                >
                  <HowItWorks
                    onReady={handleHowItWorksReady}
                    onShowLess={() => {
                      setShowHowItWorks(false);
                      setIsHowItWorksLoading(false);
                      requestAnimationFrame(() => {
                        howItWorksToggleRef.current?.scrollIntoView({
                          behavior: 'smooth',
                          block: 'center',
                        });
                      });
                    }}
                  />
                </div>
              )}
            </div>
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
              ref={resultsSectionRef}
              isLoading={isLoading}
              analysisResult={analysisResult}
              memberAnalyses={memberAnalyses}
              family={family}
            />
          </AnimatedSection>
        </main>
        <footer className="text-center mt-16 text-gray-500 text-sm space-y-2">
          <p>
            &copy; 2024 {t('appTitle')}. {t('footerRights')}
          </p>
          <p className="text-base text-gray-400">
            {t('footer.developedBy')}{' '}
            <strong className="font-semibold text-gray-300">
              {t('footer.developerName')}
            </strong>
          </p>
          <div className="flex justify-center items-center gap-6 pt-2 footer-social-links">
            <a
              href="https://github.com/parsa83KH"
              target="_blank"
              rel="noopener noreferrer"
              className="github-link flex items-center gap-2 hover:text-gray-300 transition-colors"
            >
              <span className="icon-wrapper">
                <i className="fa-brands fa-github"></i>
              </span>
              <span>{t('footer.github')}</span>
            </a>
            <a
              href="https://mail.google.com/mail/?view=cm&to=parsakhosravani83@gmail.com"
              target="_blank"
              rel="noopener noreferrer"
              className="email-link flex items-center gap-2 hover:text-gray-300 transition-colors"
            >
              <span className="icon-wrapper">
                <i className="fa-solid fa-envelope"></i>
              </span>
              <span>{t('footer.email')}</span>
            </a>
            <a
              href="https://t.me/ParsaKH_83"
              target="_blank"
              rel="noopener noreferrer"
              className="telegram-link flex items-center gap-2 hover:text-gray-300 transition-colors"
            >
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
