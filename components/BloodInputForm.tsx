import React from 'react';
import { Person, ABO_OPTIONS, RH_OPTIONS } from '../types';
import { PlusIcon, TrashIcon, BeakerIcon } from './icons';
import Card from './ui/Card';
import Button from './ui/Button';
import Select from './ui/Select';
import { useLanguage } from '../i18n/LanguageContext';

interface BloodInputFormProps {
    family: Person[];
    setFamily: React.Dispatch<React.SetStateAction<Person[]>>;
    onAnalyze: () => void;
    isLoading: boolean;
}

const BloodInputForm: React.FC<BloodInputFormProps> = ({ family, setFamily, onAnalyze, isLoading }) => {
    const { t } = useLanguage();

    const updateMember = (index: number, field: 'ABO' | 'RH', value: string) => {
        const newFamily = [...family];
        newFamily[index] = { ...newFamily[index], [field]: value };
        setFamily(newFamily);
    };

    const addMember = () => {
        if (family.length < 12) { // Limit to 10 children
            setFamily([...family, { name: `child${family.length - 1}`, ABO: 'Unknown', RH: 'Unknown' }]);
        }
    };

    const removeMember = (index: number) => {
        const newFamily = family.filter((_, i) => i !== index);
        // re-index children names
        const reIndexedFamily = newFamily.map((p, i) => {
            if (i > 1) { // 0 is father, 1 is mother
                return {...p, name: `child${i - 1}`};
            }
            return p;
        });
        setFamily(reIndexedFamily);
    };

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
        <Card>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {family.map((person, index) => (
                    <div key={index} className="bg-gray-800/50 p-4 rounded-lg border border-gray-700 transition-all duration-300 hover:border-brand-primary hover:shadow-lg hover:shadow-brand-primary/10">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-red-400">{getTranslatedName(person.name)}</h3>
                            {index > 1 && (
                                <button onClick={() => removeMember(index)} className="text-gray-500 hover:text-red-500 transition-colors" aria-label={t('removeMember')}>
                                    <TrashIcon className="h-5 w-5" />
                                </button>
                            )}
                        </div>
                        <div className="flex flex-col gap-4">
                            <div>
                                <Select label={t('abo')} value={person.ABO} onChange={(e) => updateMember(index, 'ABO', e.target.value)} options={ABO_OPTIONS} />
                                <p className="mt-1 text-xs text-gray-500 px-1">{t('aboHelper')}</p>
                            </div>
                            <div>
                                <Select label={t('rh')} value={person.RH} onChange={(e) => updateMember(index, 'RH', e.target.value)} options={RH_OPTIONS} />
                                 <p className="mt-1 text-xs text-gray-500 px-1">{t('rhHelper')}</p>
                            </div>
                        </div>
                    </div>
                ))}
                <button 
                    onClick={addMember}
                    className="flex flex-col items-center justify-center bg-gray-800/50 p-4 rounded-lg border-2 border-dashed border-gray-700 text-gray-500 hover:border-brand-accent hover:text-brand-accent transition-all duration-300 min-h-[160px]"
                >
                    <PlusIcon className="h-8 w-8 mb-2" />
                    <span className="font-semibold">{t('addMember')}</span>
                </button>
            </div>
            <div className="mt-8 text-center">
                <Button onClick={onAnalyze} disabled={isLoading} className="animate-pulse-glow" isLoading={isLoading}>
                    <BeakerIcon className="h-5 w-5 rtl:ml-2 ltr:mr-2"/>
                    {isLoading ? t('analyzing') : t('analyze')}
                </Button>
            </div>
        </Card>
    );
};

export default BloodInputForm;