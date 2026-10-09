import React, { useMemo } from 'react';
import { useLanguage } from '../i18n/LanguageContext';

const FormulaDisplay: React.FC = () => {
    const { t } = useLanguage();

    const formulasData = useMemo(() => [
        {
            category: t('howItWorks.formulas.categories.genoToPheno'),
            formula: <>{t('howItWorks.formulas.terms.phenotype')} = ƒ({t('howItWorks.formulas.terms.genotype')})</>,
            formulaString: 'Phenotype = f(Genotype)',
            example: t('howItWorks.formulas.examples.genoToPheno')
        },
        {
            category: t('howItWorks.formulas.categories.rhInheritance'),
            formula: <>{t('howItWorks.formulas.terms.children')} = &#123;D<sub>f</sub>D<sub>m</sub>, D<sub>f</sub>d<sub>m</sub>, d<sub>f</sub>D<sub>m</sub>, d<sub>f</sub>d<sub>m</sub>&#125;</>,
            formulaString: 'Children = {DfDm, Dfdm, dfDm, dfdm}',
            example: t('howItWorks.formulas.examples.rhInheritance')
        },
        {
            category: t('howItWorks.formulas.categories.dAlleleDominance'),
            formula: <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
                <span>RH =</span>
                <span className="text-3xl font-thin leading-none">{'{'}</span>
                <div className="flex flex-col text-start text-sm leading-snug">
                    <span>{t('howItWorks.formulas.conditions.dPresent')}</span>
                    <span>{t('howItWorks.formulas.conditions.onlyD')}</span>
                </div>
            </div>,
            formulaString: 'RH = {+ if D present, - if only d}',
            example: t('howItWorks.formulas.examples.dAlleleDominance')
        },
        {
            category: t('howItWorks.formulas.categories.mendelianInheritance'),
            formula: <>P({t('howItWorks.formulas.terms.child')}) = <span className="text-lg leading-none">&frac14;</span> &times; &sum;<sub>i,j</sub> P({t('howItWorks.formulas.terms.allele')}<sub>i</sub>) &times; P({t('howItWorks.formulas.terms.allele')}<sub>j</sub>)</>,
            formulaString: 'P(Child) = 1/4 * sum(P(allele_i) * P(allele_j))',
            example: t('howItWorks.formulas.examples.mendelianInheritance')
        },
        {
            category: t('howItWorks.formulas.categories.genoProbability'),
            formula: <div className="flex flex-wrap items-center justify-center gap-y-1">
                <span>P({t('howItWorks.formulas.terms.genotype')}<sub>i</sub>) =&nbsp;</span>
                <div className="flex flex-col text-center">
                    <span>{t('howItWorks.formulas.terms.count')}<sub>i</sub></span>
                    <span className="border-t border-rose-300 my-1"></span>
                    <span>{t('howItWorks.formulas.terms.total')}</span>
                </div>
            </div>,
            formulaString: 'P(Genotype_i) = Count_i / Total',
            example: t('howItWorks.formulas.examples.genoProbability')
        },
        {
            category: t('howItWorks.formulas.categories.phenoProbability'),
            formula: <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
                <span>P({t('howItWorks.formulas.terms.phenotype')}<sub>j</sub>) =</span>
                 <div className="flex flex-col text-center">
                    <span>&sum;</span>
                    <span className="text-xs -mt-1">{t('howItWorks.formulas.conditions.genoToPheno')}</span>
                </div>
                <span>P({t('howItWorks.formulas.terms.genotype')}<sub>i</sub>)</span>
            </div>,
            formulaString: 'P(Phenotype_j) = sum(P(Genotype_i)) for all genotypes i that map to phenotype j',
            example: t('howItWorks.formulas.examples.phenoProbability')
        },
        {
            category: t('howItWorks.formulas.categories.normalization'),
            formula: <div className="flex flex-wrap items-center justify-center gap-y-1">
                <span>P<sub>norm</sub>({t('howItWorks.formulas.terms.genotype')}<sub>i</sub>) =&nbsp;</span>
                <div className="flex flex-col text-center">
                    <span>P({t('howItWorks.formulas.terms.genotype')}<sub>i</sub>)</span>
                    <span className="border-t border-rose-300 my-1"></span>
                    <span>&sum;<sub>j</sub>P({t('howItWorks.formulas.terms.genotype')}<sub>j</sub>)</span>
                </div>
            </div>,
            formulaString: 'P_norm(Genotype_i) = P(Genotype_i) / sum(P(Genotype_j))',
            example: t('howItWorks.formulas.examples.normalization')
        },
        {
            category: t('howItWorks.formulas.categories.hybridProbability'),
            formula: <>P(ABO<sub>i</sub> &cap; RH<sub>j</sub>) = P(ABO<sub>i</sub>) &times; P(RH<sub>j</sub>)</>,
            formulaString: 'P(ABO_i and RH_j) = P(ABO_i) * P(RH_j)',
            example: t('howItWorks.formulas.examples.hybridProbability')
        },
        {
            category: t('howItWorks.formulas.categories.comboValidity'),
            formula: <>{t('howItWorks.formulas.terms.valid')} = &forall;{t('howItWorks.formulas.terms.child')} &exist;{t('howItWorks.formulas.terms.possible')} &isin; {t('howItWorks.formulas.terms.calculated')}</>,
            formulaString: 'Valid = for all children, there exists a possible genotype in the calculated outcomes',
            example: t('howItWorks.formulas.examples.comboValidity')
        },
        {
            category: t('howItWorks.formulas.categories.transfusion'),
            formula: <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
                 <span>P({t('howItWorks.formulas.terms.compatible')}) =</span>
                 <div className="flex flex-col text-center">
                    <span>&sum;</span>
                    <span className="text-xs -mt-1">{t('howItWorks.formulas.terms.phenotype')}<sub>i</sub></span>
                </div>
                 <span>P({t('howItWorks.formulas.terms.phenotype')}<sub>i</sub>) &times; I({t('howItWorks.formulas.terms.compatible')})</span>
            </div>,
            formulaString: 'P(Compatible) = sum(P(Phenotype_i) * I(Compatible)) over all phenotypes i',
            example: t('howItWorks.formulas.examples.transfusion')
        },
        {
            category: t('howItWorks.formulas.categories.cartesian'),
            formula: <>{t('howItWorks.formulas.terms.bloodTypes')} = ABO &times; RH</>,
            formulaString: 'BloodTypes = ABO x RH',
            example: t('howItWorks.formulas.examples.cartesian')
        }
    ], [t]);

    return (
        <div className="mt-10 pt-8 border-t border-gray-700/50">
            <div className="max-w-3xl mx-auto text-center mb-6">
                 <h3 className="text-xl sm:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-rose-500">{t('howItWorks.formulas.title')}</h3>
            </div>

            <ol className="space-y-4">
                {formulasData.map(({ category, formula, example }, index) => (
                    <li
                        key={category}
                        className="rounded-xl border border-gray-700/50 bg-gray-900/40 overflow-hidden"
                        style={{ animation: `fadeInUp 0.5s ease-out ${index * 0.05}s forwards` }}
                    >
                        <div className="px-4 py-3 sm:px-5 border-b border-gray-700/50">
                            <p className="text-[11px] uppercase tracking-wider text-gray-500">{t('howItWorks.formulas.categoryHeader')}</p>
                            <h4 className="mt-1 text-base font-semibold text-gray-100">{category}</h4>
                        </div>

                        <div className="border-b border-gray-700/40 bg-black/25 px-4 py-4 sm:px-5">
                            <p className="text-[11px] uppercase tracking-wider text-gray-500">{t('howItWorks.formulas.formulaHeader')}</p>
                            <div className="mt-2 overflow-x-auto">
                                <div dir="ltr" className="mx-auto max-w-full py-1 text-center font-mono text-sm sm:text-base text-rose-200 leading-relaxed">
                                    {formula}
                                </div>
                            </div>
                        </div>

                        <div className="px-4 py-4 sm:px-5">
                            <p className="text-[11px] uppercase tracking-wider text-gray-500">{t('howItWorks.formulas.exampleHeader')}</p>
                            <p className="mt-1.5 text-sm sm:text-base text-gray-100 leading-relaxed">{example}</p>
                        </div>
                    </li>
                ))}
            </ol>
        </div>
    );
};

export default FormulaDisplay;