import React, { useState, useEffect, useMemo, useRef, forwardRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  FamilyAnalysisResult,
  MemberAnalysisResult,
  ProbabilityMap,
  Person,
} from '../types';
import Card from './ui/Card';
import AnimatedPieChart from './AnimatedPieChart';
import ResultsTable from './ResultsTable';
import TransfusionVisualizer from './TransfusionVisualizer';
import { WarningIcon } from './icons';
import { useLanguage } from '../i18n/LanguageContext';
import Typewriter from './ui/Typewriter';

const translateAnalysisError = (
  error: string,
  t: (key: string, options?: Record<string, string | number>) => string
): string => {
  try {
    const parsed = JSON.parse(error) as {
      key?: string;
      options?: Record<string, string | number>;
    };
    if (parsed?.key) {
      const options = { ...(parsed.options || {}) };
      if (typeof options.childIndexes === 'string') {
        const nums = options.childIndexes.split(',').filter(Boolean);
        options.child_entity =
          nums.length > 1
            ? t('error.entities.children_list', { list: nums.join(', ') })
            : t('error.entities.child_single', { number: nums[0] || '' });
      }
      return t(parsed.key, options);
    }
  } catch {
    /* plain translation key */
  }
  return t(error);
};

// Helper to get a consistent, translated member name
const getMemberName = (
  name: string,
  t: (key: string, options?: Record<string, string | number>) => string
): string => {
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

interface ProbabilityDisplayBlockProps {
  title: string;
  data: ProbabilityMap;
}

const ProbabilityDisplayBlock: React.FC<ProbabilityDisplayBlockProps> = ({
  title,
  data,
}) => {
  if (Object.keys(data).length === 0) return null;

  return (
    <div className="relative group bg-gray-800/30 p-4 rounded-lg border border-gray-700/50">
      <h5 className="text-lg font-medium mb-4 text-center text-gray-300">
        {title}
      </h5>
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
  isStickyActive: boolean;
}

const MemberResultCard: React.FC<MemberResultCardProps> = ({
  analysis,
  family,
  isStickyActive,
}) => {
  const { t } = useLanguage();

  const formattedHybridGenoProbs = useMemo(() => {
    return Object.fromEntries(
      Object.entries(analysis.hybrid_genotype_probabilities).map(
        ([key, value]) => {
          const formattedKey =
            key.length === 4
              ? `${key.substring(0, 2)}_${key.substring(2)}`
              : key;
          return [formattedKey, value];
        }
      )
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
            {t('memberAnalysisTitle', {
              member: getMemberName(analysis.member, t),
            })}
          </span>
          <Typewriter
            text={parentSummary}
            active={isStickyActive}
            className="text-base font-normal text-gray-400"
          />
        </h3>

        <div className="space-y-6 mb-8">
          <ProbabilityDisplayBlock
            title={t('charts.aboPheno')}
            data={analysis.abo_phenotype_probabilities}
          />
          <ProbabilityDisplayBlock
            title={t('charts.aboGeno')}
            data={analysis.abo_genotype_probabilities}
          />
          <ProbabilityDisplayBlock
            title={t('charts.rhPheno')}
            data={analysis.rh_phenotype_probabilities}
          />
          <ProbabilityDisplayBlock
            title={t('charts.rhGeno')}
            data={analysis.rh_genotype_probabilities}
          />
          <ProbabilityDisplayBlock
            title={t('charts.hybridGeno')}
            data={formattedHybridGenoProbs}
          />
          <ProbabilityDisplayBlock
            title={t('charts.hybridPheno')}
            data={analysis.hybrid_phenotype_probabilities}
          />
        </div>

        <h4 className="text-xl font-semibold text-center mb-4 text-gray-300">
          {t('transfusion.title')}
        </h4>
        <TransfusionVisualizer
          compatibility={analysis.transfusion_compatibility}
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
}

const ResultsDisplay = forwardRef<HTMLDivElement, ResultsDisplayProps>(
  ({ isLoading, analysisResult, memberAnalyses, family }, ref) => {
    const { t, language } = useLanguage();
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
          setIsStickyActive(
            !entry.isIntersecting && entry.boundingClientRect.bottom < 0
          );
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
        <div ref={ref} className="scroll-mt-4 text-center p-8">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-brand-primary mx-auto"></div>
          <p className="mt-4 text-lg text-gray-400">{t('analyzing')}</p>
        </div>
      );
    }

    if (!analysisResult) return null;

    if (analysisResult.errors && analysisResult.errors.length > 0) {
      return (
        <div ref={ref} className="scroll-mt-4 mt-8">
          <Card className="border-red-500/50 bg-gray-900/50 animate-fade-in">
            <h3 className="flex items-center justify-center gap-3 text-2xl font-bold text-red-400 mb-4">
              <WarningIcon className="h-8 w-8" />
              <span>{t('error.title')}</span>
            </h3>
            <div className="space-y-3 text-white text-sm sm:text-base leading-relaxed animate-fade-in">
              {analysisResult.errors.map((error, i) => {
                const message = translateAnalysisError(error, t);
                return (
                  <div
                    key={i}
                    className={`markdown-content ${language === 'fa' ? 'font-persian' : ''}`}
                    dir={isRTL(message) ? 'rtl' : 'ltr'}
                  >
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {message}
                    </ReactMarkdown>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      );
    }

    if (!analysisResult.valid) {
      return null;
    }

    return (
      <div ref={ref} className="scroll-mt-4 space-y-8 mt-12">
        <div
          ref={memberSelectorRef}
          className="flex flex-wrap justify-center gap-3 mb-8 animate-fade-in"
        >
          {memberAnalyses.map(analysis => (
            <button
              key={analysis.member}
              onClick={() => setSelectedMember(analysis.member)}
              className={`relative px-5 py-2.5 text-sm font-bold rounded-full transition-all duration-300 ease-in-out focus:outline-none
                            ${
                              selectedMember === analysis.member
                                ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/40'
                                : 'bg-gray-800/60 text-gray-300 hover:bg-gray-700/80 hover:text-white'
                            }`}
            >
              {getMemberName(analysis.member, t)}
            </button>
          ))}
        </div>

        {memberAnalyses
          .filter(
            analysis => analysis.valid && analysis.member === selectedMember
          )
          .map(analysis => (
            <MemberResultCard
              key={analysis.member}
              analysis={analysis}
              family={family}
              isStickyActive={isStickyActive}
            />
          ))}
      </div>
    );
  }
);

ResultsDisplay.displayName = 'ResultsDisplay';

export default ResultsDisplay;
