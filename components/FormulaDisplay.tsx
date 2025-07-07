
import React from 'react';
import { useLanguage } from '../i18n/LanguageContext';

const FormulaDisplay: React.FC = () => {
    const { t } = useLanguage();

    const formulasData = [
        {
            category: t('howItWorks.formulas.categories.genoToPheno'),
            formula: <>{t('howItWorks.formulas.terms.phenotype')} = ƒ({t('howItWorks.formulas.terms.genotype')})</>,
            example: t('howItWorks.formulas.examples.genoToPheno')
        },
        {
            category: t('howItWorks.formulas.categories.rhInheritance'),
            formula: <>{t('howItWorks.formulas.terms.children')} = &#123;D<sub>f</sub>D<sub>m</sub>, D<sub>f</sub>d<sub>m</sub>, d<sub>f</sub>D<sub>m</sub>, d<sub>f</sub>d<sub>m</sub>&#125;</>,
            example: t('howItWorks.formulas.examples.rhInheritance')
        },
        {
            category: t('howItWorks.formulas.categories.dAlleleDominance'),
            formula: <div className="flex items-center justify-center gap-x-1">
                <span>RH =</span>
                <span className="text-5xl font-thin -mt-1">{'{'}</span>
                <div className="flex flex-col text-left text-sm">
                    <span>{t('howItWorks.formulas.conditions.dPresent')}</span>
                    <span>{t('howItWorks.formulas.conditions.onlyD')}</span>
                </div>
            </div>,
            example: t('howItWorks.formulas.examples.dAlleleDominance')
        },
        {
            category: t('howItWorks.formulas.categories.mendelianInheritance'),
            formula: <>P({t('howItWorks.formulas.terms.child')}) = <span className="text-lg leading-none">&frac14;</span> &times; &sum;<sub>i,j</sub> P({t('howItWorks.formulas.terms.allele')}<sub>i</sub>) &times; P({t('howItWorks.formulas.terms.allele')}<sub>j</sub>)</>,
            example: t('howItWorks.formulas.examples.mendelianInheritance')
        },
        {
            category: t('howItWorks.formulas.categories.genoProbability'),
            formula: <div className="flex items-center justify-center">
                <span>P({t('howItWorks.formulas.terms.genotype')}<sub>i</sub>) =&nbsp;</span>
                <div className="flex flex-col text-center">
                    <span>{t('howItWorks.formulas.terms.count')}<sub>i</sub></span>
                    <span className="border-t border-rose-300 my-1"></span>
                    <span>{t('howItWorks.formulas.terms.total')}</span>
                </div>
            </div>,
            example: t('howItWorks.formulas.examples.genoProbability')
        },
        {
            category: t('howItWorks.formulas.categories.phenoProbability'),
            formula: <div className="flex items-center justify-center gap-x-2">
                <span>P({t('howItWorks.formulas.terms.phenotype')}<sub>j</sub>) =</span>
                 <div className="flex flex-col text-center">
                    <span>&sum;</span>
                    <span className="text-xs -mt-1">{t('howItWorks.formulas.conditions.genoToPheno')}</span>
                </div>
                <span>P({t('howItWorks.formulas.terms.genotype')}<sub>i</sub>)</span>
            </div>,
            example: t('howItWorks.formulas.examples.phenoProbability')
        },
        {
            category: t('howItWorks.formulas.categories.normalization'),
            formula: <div className="flex items-center justify-center">
                <span>P<sub>norm</sub>({t('howItWorks.formulas.terms.genotype')}<sub>i</sub>) =&nbsp;</span>
                <div className="flex flex-col text-center">
                    <span>P({t('howItWorks.formulas.terms.genotype')}<sub>i</sub>)</span>
                    <span className="border-t border-rose-300 my-1"></span>
                    <span>&sum;<sub>j</sub>P({t('howItWorks.formulas.terms.genotype')}<sub>j</sub>)</span>
                </div>
            </div>,
            example: t('howItWorks.formulas.examples.normalization')
        },
        {
            category: t('howItWorks.formulas.categories.hybridProbability'),
            formula: <>P(ABO<sub>i</sub> &cap; RH<sub>j</sub>) = P(ABO<sub>i</sub>) &times; P(RH<sub>j</sub>)</>,
            example: t('howItWorks.formulas.examples.hybridProbability')
        },
        {
            category: t('howItWorks.formulas.categories.comboValidity'),
            formula: <>{t('howItWorks.formulas.terms.valid')} = &forall;{t('howItWorks.formulas.terms.child')} &exist;{t('howItWorks.formulas.terms.possible')} &isin; {t('howItWorks.formulas.terms.calculated')}</>,
            example: t('howItWorks.formulas.examples.comboValidity')
        },
        {
            category: t('howItWorks.formulas.categories.transfusion'),
            formula: <div className="flex items-center justify-center gap-x-2">
                 <span>P({t('howItWorks.formulas.terms.compatible')}) =</span>
                 <div className="flex flex-col text-center">
                    <span>&sum;</span>
                    <span className="text-xs -mt-1">{t('howItWorks.formulas.terms.phenotype')}<sub>i</sub></span>
                </div>
                 <span>P({t('howItWorks.formulas.terms.phenotype')}<sub>i</sub>) &times; I({t('howItWorks.formulas.terms.compatible')})</span>
            </div>,
            example: t('howItWorks.formulas.examples.transfusion')
        },
        {
            category: t('howItWorks.formulas.categories.cartesian'),
            formula: <>{t('howItWorks.formulas.terms.bloodTypes')} = ABO &times; RH</>,
            example: t('howItWorks.formulas.examples.cartesian')
        }
    ];

    return (
        <div className="mt-10 pt-8 border-t border-gray-700/50">
            <div className="max-w-3xl mx-auto text-center">
                 <h3 className="text-2xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-rose-500">{t('howItWorks.formulas.title')}</h3>
            </div>
           
            <div className="overflow-x-auto bg-gray-900/40 p-4 rounded-lg border border-gray-700/50">
                <table className="min-w-full text-sm">
                    <thead className="border-b border-gray-600">
                        <tr className="text-left">
                            <th className="p-3 font-semibold text-gray-300 uppercase tracking-wider">{t('howItWorks.formulas.categoryHeader')}</th>
                            <th className="p-3 font-semibold text-gray-300 uppercase tracking-wider text-center">{t('howItWorks.formulas.formulaHeader')}</th>
                            <th className="p-3 font-semibold text-gray-300 uppercase tracking-wider">{t('howItWorks.formulas.exampleHeader')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700/50">
                        {formulasData.map(({ category, formula, example }, index) => (
                            <tr key={index} className="hover:bg-brand-primary/5 transition-colors duration-200" style={{ animation: `fadeInUp 0.5s ease-out ${index * 0.05}s forwards` }}>
                                <td className="p-3 align-top">
                                    <span className="font-bold text-gray-300">{category}</span>
                                </td>
                                <td className="p-3 align-top h-full">
                                    <code className="text-base text-rose-300 font-mono flex items-center justify-center h-full text-center" dir="ltr">{formula}</code>
                                </td>
                                <td className="p-3 align-top">
                                    <pre className="text-xs text-gray-400 font-mono whitespace-pre-wrap leading-relaxed">{example}</pre>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default FormulaDisplay;
