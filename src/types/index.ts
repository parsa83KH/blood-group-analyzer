export interface Person {
    name: string;
    ABO: string;
    RH: string;
}

export interface GenotypeCombination {
    father: string;
    mother: string;
    children: string[][];
}

export interface RHGenotypeCombination {
    father: string;
    mother: string;
    children: string[][];
}

interface BaseAnalysisResult {
    valid: boolean;
    errors: string[]; // Error keys for i18n
}

export interface ABOAnalysisResult extends BaseAnalysisResult {
    combinations: GenotypeCombination[];
    father_genotypes: Set<string>;
    mother_genotypes: Set<string>;
    children_genotypes: Set<string>[];
}

export interface RHAnalysisResult extends BaseAnalysisResult {
    combinations: RHGenotypeCombination[];
    father_genotypes: Set<string>;
    mother_genotypes: Set<string>;
    children_genotypes: Set<string>[];
}

export interface FamilyAnalysisResult extends BaseAnalysisResult {
    abo_result: ABOAnalysisResult;
    rh_result: RHAnalysisResult;
    abo_valid: boolean;
    rh_valid: boolean;
}

export type ProbabilityMap = Record<string, number>;

export interface TransfusionSummary {
    key: 'single' | 'mostLikely' | 'insufficient' | 'invalid';
    type?: string;
    probability?: number;
    note?: string; // e.g. transfusion.summary.noteABO
}

export interface TransfusionCompatibility {
    can_donate_to: ProbabilityMap;
    can_receive_from: ProbabilityMap;
    summary: TransfusionSummary;
}

export interface MemberAnalysisResult {
    valid: boolean;
    member: string; // Identifier like 'father', 'mother', 'child1'
    abo_genotype_probabilities: ProbabilityMap;
    abo_phenotype_probabilities: ProbabilityMap;
    rh_genotype_probabilities: ProbabilityMap;
    rh_phenotype_probabilities: ProbabilityMap;
    hybrid_genotype_probabilities: ProbabilityMap;
    hybrid_phenotype_probabilities: ProbabilityMap;
    transfusion_compatibility: TransfusionCompatibility;
}

// Re-export from constants for backward compatibility
export { BLOOD_TYPES } from '@/utils/constants';
export const ABO_OPTIONS = ['Unknown', 'A', 'B', 'AB', 'O', 'AA', 'AO', 'BB', 'BO', 'AB', 'OO'];
export const RH_OPTIONS = ['Unknown', '+', '-', 'DD', 'Dd', 'dd'];

export interface ChatMessage {
    role: 'user' | 'model';
    text: string;
}

export interface AIAssistantHandle {
    sendPrompt: (prompt: string) => void;
}
