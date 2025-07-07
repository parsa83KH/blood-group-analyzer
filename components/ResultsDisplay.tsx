import React, { useState, useEffect } from 'react';
import { FamilyAnalysisResult, MemberAnalysisResult, ProbabilityMap } from '../types';
import Card from './ui/Card';
import AnimatedPieChart from './AnimatedPieChart';
import ResultsTable from './ResultsTable';
import TransfusionVisualizer from './TransfusionVisualizer';
import { WarningIcon } from './icons';
import { useLanguage } from '../i18n/LanguageContext';

interface ResultsDisplayProps {
    isLoading: boolean;
    analysisResult: FamilyAnalysisResult | null;
    memberAnalyses: MemberAnalysisResult[];
}

const ProbabilityDisplayBlock: React.FC<{ title: string; data: ProbabilityMap }> = ({ title, data }) => {
    const { t } = useLanguage();
    if (Object.keys(data).length === 0) return null;

    return (
        <div className="bg-gray-800/30 p-4 rounded-lg border border-gray-700/50">
            <h5 className="text-lg font-medium mb-4 text-center text-gray-300">{title}</h5>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 items-center">
                <div className="order-2 xl:order-1">
                    <ResultsTable data={data} />
                </div>
                <div className="h-48 w-full order-1 xl:order-2">
                    <AnimatedPieChart data={data} />
                </div>
            </div>
        </div>
    );
};


const MemberResultCard: React.FC<{ analysis: MemberAnalysisResult }> = ({ analysis }) => {
    const { t } = useLanguage();
    const getTranslatedName = (name: string): string => {
        if (name === 'father') return t('father');
        if (name === 'mother') return t('mother');
        const match = name.match(/child(\d+)/);
        if (match) {
            return `${t('child')} ${parseInt(match[1], 10)}`;
        }
        return name;
    };

    return (
        <div className="animate-fade-in-up">
            <Card className="bg-gray-900/50 border-gray-800">
                <h3 className="text-2xl font-bold text-center mb-6 bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-rose-500">{t('memberAnalysisTitle', { member: getTranslatedName(analysis.member) })}</h3>
                
                <div className="space-y-6 mb-8">
                    <ProbabilityDisplayBlock title={t('charts.aboPheno')} data={analysis.abo_phenotype_probabilities} />
                    <ProbabilityDisplayBlock title={t('charts.aboGeno')} data={analysis.abo_genotype_probabilities} />
                    <ProbabilityDisplayBlock title={t('charts.rhPheno')} data={analysis.rh_phenotype_probabilities} />
                    <ProbabilityDisplayBlock title={t('charts.rhGeno')} data={analysis.rh_genotype_probabilities} />
                    <ProbabilityDisplayBlock title={t('charts.hybridGeno')} data={analysis.hybrid_genotype_probabilities} />
                    <ProbabilityDisplayBlock title={t('charts.hybridPheno')} data={analysis.hybrid_phenotype_probabilities} />
                </div>
                
                <h4 className="text-xl font-semibold text-center mb-4 text-gray-300">{t('transfusion.title')}</h4>
                <TransfusionVisualizer compatibility={analysis.transfusion_compatibility} />
            </Card>
        </div>
    );
};

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ isLoading, analysisResult, memberAnalyses }) => {
    const { t } = useLanguage();
    const [selectedMember, setSelectedMember] = useState<string | null>(null);

    const getTranslatedName = (name: string): string => {
        if (name === 'father') return t('father');
        if (name === 'mother') return t('mother');
        const match = name.match(/child(\d+)/);
        if (match) {
            return `${t('child')} ${parseInt(match[1], 10)}`;
        }
        return name;
    };

    useEffect(() => {
        if (memberAnalyses.length > 0) {
            setSelectedMember(memberAnalyses[0].member);
        } else {
            setSelectedMember(null);
        }
    }, [memberAnalyses]);

    if (isLoading) {
        return (
             <div className="text-center p-8">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-brand-primary mx-auto"></div>
                <p className="mt-4 text-lg">{t('loading')}</p>
            </div>
        )
    }

    if (!analysisResult) return null;

    // Prioritize displaying errors if they exist, regardless of the 'valid' flag.
    // This correctly handles cases where one system is valid but the other has a genetic error.
    if (analysisResult.errors && analysisResult.errors.length > 0) {
        return (
            <Card className="text-center border-red-500/50 bg-gradient-to-br from-red-900/30 to-gray-900/20 animate-fade-in mt-8">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <WarningIcon className="h-12 w-12 text-red-400 flex-shrink-0" />
                    <div>
                        <h3 className="text-2xl font-bold text-red-400 mb-2">{t('error.title')}</h3>
                        <div className="space-y-1">
                          {analysisResult.errors.map((error, i) => {
                              let message = t(error); // Default for simple keys
                              try {
                                  const errObj = JSON.parse(error);
                                  if (errObj.key && errObj.options) {
                                      const finalOptions = { ...errObj.options };

                                      // Check if child_indices is present and needs translation
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
                              } catch (e) {
                                  // Not a JSON error string, use the default translated message
                              }
                              return <p key={i} className="text-red-300 ltr:text-left rtl:text-right text-sm sm:text-base">{message}</p>;
                          })}
                        </div>
                    </div>
                </div>
            </Card>
        );
    }
    
    // If there are no errors, but the analysis is still not valid (e.g. no inputs), show nothing.
    if (!analysisResult.valid) {
        return null;
    }
    
    return (
        <div className="space-y-8 mt-12">
            <div className="flex flex-wrap justify-center gap-2 mb-8 animate-fade-in">
                {memberAnalyses.map((analysis) => (
                    <button
                        key={analysis.member}
                        onClick={() => setSelectedMember(analysis.member)}
                        className={`px-4 py-2 text-sm font-semibold rounded-md transition-all duration-300 transform hover:-translate-y-0.5
                            ${selectedMember === analysis.member
                                ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/30'
                                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                            }`}
                    >
                        {getTranslatedName(analysis.member)}
                    </button>
                ))}
            </div>

            {memberAnalyses
                .filter(analysis => analysis.valid && analysis.member === selectedMember)
                .map((analysis) => (
                    <MemberResultCard key={analysis.member} analysis={analysis} />
            ))}
        </div>
    );
};

export default ResultsDisplay;