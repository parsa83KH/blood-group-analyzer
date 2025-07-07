import React from 'react';
import { TransfusionCompatibility, ProbabilityMap, TransfusionSummary } from '../types';
import { ArrowDownTrayIcon, ArrowUpTrayIcon } from './icons';
import AnimatedPieChart from './AnimatedPieChart';
import ResultsTable from './ResultsTable';
import { useLanguage } from '../i18n/LanguageContext';

interface TransfusionVisualizerProps {
    compatibility: TransfusionCompatibility;
}

const TransfusionSection: React.FC<{ title: string; data: ProbabilityMap; icon: React.ReactNode; colorClass: string }> = ({ title, data, icon, colorClass }) => {
    const { t } = useLanguage();
    const hasData = Object.keys(data).length > 0;
    
    return (
        <div className="flex flex-col items-center">
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

const TransfusionVisualizer: React.FC<TransfusionVisualizerProps> = ({ compatibility }) => {
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
                    />
                    <TransfusionSection
                        title={t('transfusion.donate')}
                        data={can_donate_to}
                        icon={<ArrowUpTrayIcon className="h-6 w-6" />}
                        colorClass="text-blue-400"
                    />
                </div>
            )}
        </div>
    );
};

export default TransfusionVisualizer;