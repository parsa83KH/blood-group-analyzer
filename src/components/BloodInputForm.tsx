import React, { useRef } from 'react';
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
    analysisCompletionStatus: 'idle' | 'success' | 'error';
}

const BloodInputForm: React.FC<BloodInputFormProps> = ({ family, setFamily, onAnalyze, isLoading, analysisCompletionStatus }) => {
    const { t } = useLanguage();
    const memberBoxRefs = useRef<(HTMLDivElement | null)[]>([]);

    const updateMember = (index: number, field: 'ABO' | 'RH', value: string) => {
        const newFamily = [...family];
        newFamily[index] = { ...newFamily[index], [field]: value };
        setFamily(newFamily);

        // Reset tilt animation on selection
        const el = memberBoxRefs.current[index];
        if (el) {
            el.classList.remove('is-hovering');
            el.style.setProperty('--rotateX', '0deg');
            el.style.setProperty('--rotateY', '0deg');
        }
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
    
    const handleTiltGlowMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const el = e.currentTarget;
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // For Glow
        el.style.setProperty('--mouse-x', `${x}px`);
        el.style.setProperty('--mouse-y', `${y}px`);

        // For Tilt
        const mouseX = x / rect.width;
        const mouseY = y / rect.height;
        const rotateX = (mouseY - 0.5) * -20;
        const rotateY = (mouseX - 0.5) * 20;
        el.style.setProperty('--rotateX', `${rotateX}deg`);
        el.style.setProperty('--rotateY', `${rotateY}deg`);
    };

    const handleGlowMouseMove = (e: React.MouseEvent<HTMLElement>) => {
        const el = e.currentTarget;
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        el.style.setProperty('--mouse-x', `${x}px`);
        el.style.setProperty('--mouse-y', `${y}px`);
    };

    const handleMouseEnter = (e: React.MouseEvent<HTMLElement>) => {
        e.currentTarget.classList.add('is-hovering');
    };

    const handleMouseLeave = (e: React.MouseEvent<HTMLElement>) => {
        e.currentTarget.classList.remove('is-hovering');
    };

    const handleTiltGlowMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
        const el = e.currentTarget;
        el.classList.remove('is-hovering');
        el.style.setProperty('--rotateX', '0deg');
        el.style.setProperty('--rotateY', '0deg');
    };


    return (
        <Card>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {family.map((person, index) => (
                    <div 
                        key={index} 
                        ref={el => { memberBoxRefs.current[index] = el; }}
                        className="interactive-tilt-box interactive-glow-border p-4 rounded-lg border border-gray-700/50"
                        onMouseMove={handleTiltGlowMouseMove}
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleTiltGlowMouseLeave}
                        style={{ borderRadius: '0.5rem' }}
                    >
                        <div className="interactive-tilt-box-content">
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
                                    <Select label={t('abo')} value={person.ABO} onChange={(value) => updateMember(index, 'ABO', value)} options={ABO_OPTIONS} />
                                    <p className="mt-1 text-xs text-gray-500 px-1">{t('aboHelper')}</p>
                                </div>
                                <div>
                                    <Select label={t('rh')} value={person.RH} onChange={(value) => updateMember(index, 'RH', value)} options={RH_OPTIONS} maxHeightClass="max-h-48" />
                                     <p className="mt-1 text-xs text-gray-500 px-1">{t('rhHelper')}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
                <button 
                    onClick={addMember}
                    className="interactive-glow-border flex flex-col items-center justify-center bg-gray-800/50 p-4 rounded-lg border-2 border-dashed border-gray-700 text-gray-500 hover:border-brand-accent hover:text-brand-accent transition-all duration-300 min-h-[160px]"
                    onMouseMove={handleGlowMouseMove}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    style={{ borderRadius: '0.5rem' }}
                >
                    <PlusIcon className="h-8 w-8 mb-2" />
                    <span className="font-semibold">{t('addMember')}</span>
                </button>
            </div>
            <div className="mt-8 text-center">
                <Button 
                    onClick={onAnalyze} 
                    disabled={isLoading || analysisCompletionStatus !== 'idle'} 
                    isLoading={isLoading} 
                    analysisCompletionStatus={analysisCompletionStatus}
                >
                    <BeakerIcon className="h-5 w-5 rtl:ml-2 ltr:mr-2"/>
                    {t('analyze')}
                </Button>
            </div>
        </Card>
    );
};

export default BloodInputForm;