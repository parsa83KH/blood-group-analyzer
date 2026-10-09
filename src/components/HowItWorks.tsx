import React from 'react';
import Card from './ui/Card';
import { useLanguage } from '../i18n/LanguageContext';
import { PencilSquareIcon, ArrowRightIcon, BloodBagIcon, CalculatorIcon } from './icons';
import FormulaDisplay from './FormulaDisplay';

interface HowItWorksProps {
  onShowLess: () => void;
}

const HowItWorks: React.FC<HowItWorksProps> = ({ onShowLess }) => {
  const { t } = useLanguage();

  const Allele: React.FC<{ allele: string; delay: number }> = ({ allele, delay }) => (
    <div
      className="flex items-center justify-center w-12 h-12 text-xl font-bold rounded-full bg-brand-primary text-white"
      style={{ animation: `fadeIn 0.5s ease-in-out ${delay}s forwards`, opacity: 0 }}
    >
      {allele}
    </div>
  );

  const PunnettSquare: React.FC = () => {
    const parent1Alleles = ['A', 'O'];
    const parent2Alleles = ['B', 'O'];
    const childrenGenotypes = ['AB', 'AO', 'BO', 'OO'];

    return (
      <div className="inline-grid grid-cols-[auto_repeat(2,minmax(0,1fr))] grid-rows-[auto_repeat(2,minmax(0,1fr))] gap-x-4 gap-y-3 items-center justify-items-center font-mono text-center">
        {/* Top-left empty cell */}
        <div></div>

        {/* Parent 2 alleles (top row) */}
        <Allele allele={parent2Alleles[0]} delay={0.2} />
        <Allele allele={parent2Alleles[1]} delay={0.4} />

        {/* Parent 1 allele 1 (side) + result row 1 */}
        <Allele allele={parent1Alleles[0]} delay={0.6} />
        <div className="flex items-center justify-center w-16 h-16 rounded-lg bg-gray-700/50 border border-gray-600 animate-fade-in" style={{ animationDelay: '1.2s' }}>{childrenGenotypes[0]}</div>
        <div className="flex items-center justify-center w-16 h-16 rounded-lg bg-gray-700/50 border border-gray-600 animate-fade-in" style={{ animationDelay: '1.4s' }}>{childrenGenotypes[1]}</div>

        {/* Parent 1 allele 2 (side) + result row 2 */}
        <Allele allele={parent1Alleles[1]} delay={0.8} />
        <div className="flex items-center justify-center w-16 h-16 rounded-lg bg-gray-700/50 border border-gray-600 animate-fade-in" style={{ animationDelay: '1.6s' }}>{childrenGenotypes[2]}</div>
        <div className="flex items-center justify-center w-16 h-16 rounded-lg bg-gray-700/50 border border-gray-600 animate-fade-in" style={{ animationDelay: '1.8s' }}>{childrenGenotypes[3]}</div>
      </div>
    );
  };

  const TransfusionRule: React.FC<{ donor: string; recipients: { type: string; compatible: boolean }[] }> = ({ donor, recipients }) => (
    <div className="flex items-center justify-center gap-2 sm:gap-4 my-3">
        <div className="flex flex-col items-center flex-shrink-0">
            <div className="flex items-center justify-center w-12 h-12 text-lg font-bold rounded-full bg-blue-600/80 text-white shadow-md">{donor}</div>
            <span className="text-xs mt-1 text-gray-400">{t('howItWorks.transfusionDiagram.donor')}</span>
        </div>
        <ArrowRightIcon className="w-5 h-5 sm:w-8 sm:h-8 text-gray-500 rtl:rotate-180 flex-shrink-0" />
        <div className="flex flex-wrap justify-center gap-2">
            {recipients.map(({ type, compatible }) => (
                <div key={type} className="flex flex-col items-center">
                    <div className={`flex items-center justify-center w-12 h-12 text-lg font-bold rounded-full shadow-md ${compatible ? 'bg-green-600/80 text-white' : 'bg-red-600/80 text-white'}`}>
                        {type}
                    </div>
                     <span className="text-xs mt-1 text-gray-400">{t('howItWorks.transfusionDiagram.recipient')}</span>
                </div>
            ))}
        </div>
    </div>
);

  const steps = [
    { icon: PencilSquareIcon, title: t('howItWorks.step1.title'), description: t('howItWorks.step1.desc') },
    { icon: CalculatorIcon, title: t('howItWorks.step2.title'), description: t('howItWorks.step2.desc'), note: t('howItWorks.step2.note') },
    { icon: BloodBagIcon, title: t('howItWorks.step3.title'), description: t('howItWorks.step3.desc') },
  ];

  return (
    <Card>
      <h2 className="text-3xl font-bold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-rose-500">{t('howItWorks.title')}</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start max-w-5xl mx-auto">
        {steps.map((step, i) => (
          <div key={i} className="flex flex-col items-center text-center">
            <div className="flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-brand-primary/20 text-brand-primary border-2 border-brand-primary/50">
              <step.icon className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-200">{step.title}</h3>
            <p className="text-gray-400 text-sm leading-relaxed">{step.description}</p>
            { 'note' in step && step.note && (
              <div className="mt-3 p-3 text-xs text-amber-300/90 bg-amber-900/20 border border-amber-400/20 rounded-lg italic">
                {step.note}
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="mt-10 pt-8 border-t border-gray-700/50 flex flex-col lg:flex-row items-center justify-center gap-8 text-center">
        <div className="max-w-md">
            <h3 className="text-xl font-semibold mb-2 text-gray-200">{t('howItWorks.punnett.title')}</h3>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">{t('howItWorks.punnett.desc')}</p>
        </div>
        <div className="flex justify-center pt-8">
          <PunnettSquare />
        </div>
      </div>
       <div className="mt-10 pt-8 border-t border-gray-700/50 text-center">
          <div className="max-w-2xl mx-auto">
              <h3 className="text-xl font-semibold mb-2 text-gray-200">{t('howItWorks.transfusionDiagram.title')}</h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">{t('howItWorks.transfusionDiagram.desc')}</p>
          </div>
          <div className="pt-8 space-y-4">
              <TransfusionRule donor="A+" recipients={[
                  { type: 'A+', compatible: true }, { type: 'AB+', compatible: true },
                  { type: 'B+', compatible: false }, { type: 'O-', compatible: false }
              ]} />
              <TransfusionRule donor="O-" recipients={[
                  { type: 'A+', compatible: true }, { type: 'B-', compatible: true },
                  { type: 'AB+', compatible: true }, { type: 'O+', compatible: true }
              ]} />
              <p className="text-xs text-gray-500 pt-2">{t('howItWorks.transfusionDiagram.rhNote')}</p>
          </div>
      </div>
      <FormulaDisplay />
      <div className="mt-8 flex justify-center">
        <button
          type="button"
          onClick={onShowLess}
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-base font-medium text-purple-300 no-underline transition-colors hover:text-purple-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-950"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
            <path fillRule="evenodd" d="M9.47 6.47a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 1 1-1.06 1.06L10 8.06l-3.72 3.72a.75.75 0 0 1-1.06-1.06l4.25-4.25Z" clipRule="evenodd" />
          </svg>
          {t('howItWorks.showLess')}
        </button>
      </div>
    </Card>
  );
};

export default HowItWorks;