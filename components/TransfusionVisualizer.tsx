import React from 'react';
import { TransfusionCompatibility, ProbabilityMap, TransfusionSummary, Person, MemberAnalysisResult } from '../types';
import { ArrowDownTrayIcon, ArrowUpTrayIcon } from './icons';
import AnimatedPieChart from './AnimatedPieChart';
import ResultsTable from './ResultsTable';
import { useLanguage } from '../i18n/LanguageContext';
import AskAIButton from './AskAIButton';

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

interface TransfusionSectionProps {
    title: string;
    data: ProbabilityMap;
    icon: React.ReactNode;
    colorClass: string;
    analysis: MemberAnalysisResult;
    family: Person[];
    onAskAI: (prompt: string) => void;
}

const TransfusionSection: React.FC<TransfusionSectionProps> = ({ title, data, icon, colorClass, analysis, family, onAskAI }) => {
    const { t } = useLanguage();
    const hasData = Object.keys(data).length > 0;

    const familyInputs = formatFamilyForPrompt(family, t);
    const memberName = getMemberName(analysis.member, t);
    const memberPhenoProbs = formatProbabilitiesForPrompt(analysis.hybrid_phenotype_probabilities);
    const compatibilityData = formatProbabilitiesForPrompt(data);
    
    const aiPrompt = t('transfusion.aiPrompt', {
        familyInputs: familyInputs,
        member: memberName,
        memberPhenoProbs: memberPhenoProbs || 'N/A',
        analysisType: title,
        compatibilityData: compatibilityData,
    });
    
    return (
        <div className="relative group flex flex-col items-center">
             <AskAIButton
                prompt={aiPrompt}
                onAsk={onAskAI}
                className="top-2 right-2 rtl:left-2 rtl:right-auto z-10"
            />
            <h5 className={`flex items-center gap-2 text-lg font-semibold mb-4 ${colorClass}`}>
                {icon}
                {title}
            </h5>
            {hasData ? (
                 <div className="w-full bg-gray-800/30 p-4 rounded-lg border border-gray-700/50">
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 items-center">
                        <div className="order-2 xl:order-1">
                            <ResultsTable data={data} />
                        </div>
                        <div className="h-48 w-full order-1 xl:order-2">
                            <AnimatedPieChart data={data} />
                        </div>
                    </div>
                </div>
            ) : (
                <div className="w-full bg-gray-800/30 p-4 rounded-lg border border-gray-700/50 flex items-center justify-center h-[244px]">
                    <p className="text-gray-500 text-center">
                        {title.includes(t('transfusion.receive')) ? t('transfusion.noDonors') : t('transfusion.noRecipients')}
                    </p>
                </div>
            )}
        </div>
    );
};

interface TransfusionVisualizerProps {
    compatibility: TransfusionCompatibility;
    analysis: MemberAnalysisResult;
    family: Person[];
    onAskAI: (prompt: string) => void;
}

const TransfusionVisualizer: React.FC<TransfusionVisualizerProps> = ({ compatibility, analysis, family, onAskAI }) => {
    const { t } = useLanguage();
    const { can_receive_from, can_donate_to, summary } = compatibility;

    const hasData = Object.keys(can_receive_from).length > 0 || Object.keys(can_donate_to).length > 0;
    
    const renderSummary = (summary: TransfusionSummary): string => {
        const { key, type, probability } = summary;
        switch(key) {
            case 'single':
                return t('transfusion.summary.single', { type: type || 'N/A' });
            case 'mostLikely':
                return t('transfusion.summary.mostLikely', { type: type || 'N/A', probability: probability?.toFixed(2) || '0' });
            case 'insufficient':
                return t('transfusion.summary.insufficient');
            case 'invalid':
                return t('transfusion.summary.invalid');
            default:
                return '';
        }
    };


    return (
        <div className="bg-gray-800/40 p-6 rounded-lg border border-gray-700">
            <div className="text-center text-gray-400 mb-6 space-y-2">
              <p className="text-sm italic">{renderSummary(summary)}</p>
              {summary.note && <p className="text-xs text-brand-primary/80">{t(summary.note)}</p>}
            </div>
            
            {!hasData && summary.key !== 'invalid' && (
                <div className="text-center py-8 text-gray-500">
                    {t('transfusion.insufficientData')}
                </div>
            )}

            {hasData && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    <TransfusionSection
                        title={t('transfusion.receive')}
                        data={can_receive_from}
                        icon={<ArrowDownTrayIcon className="h-6 w-6" />}
                        colorClass="text-green-400"
                        analysis={analysis}
                        family={family}
                        onAskAI={onAskAI}
                    />
                    <TransfusionSection
                        title={t('transfusion.donate')}
                        data={can_donate_to}
                        icon={<ArrowUpTrayIcon className="h-6 w-6" />}
                        colorClass="text-blue-400"
                        analysis={analysis}
                        family={family}
                        onAskAI={onAskAI}
                    />
                </div>
            )}
        </div>
    );
};

export default TransfusionVisualizer;
