import { Person, FamilyAnalysisResult, MemberAnalysisResult, ABOAnalysisResult, RHAnalysisResult, ProbabilityMap, GenotypeCombination, RHGenotypeCombination, TransfusionCompatibility, TransfusionSummary } from '../types';

class BloodCompatibility {
    private abo_can_donate_to: Record<string, string[]> = {
        'A': ['A', 'AB'],
        'B': ['B', 'AB'],
        'AB': ['AB'],
        'O': ['A', 'B', 'AB', 'O']
    };

    private abo_can_receive_from: Record<string, string[]> = {
        'A': ['A', 'O'],
        'B': ['B', 'O'],
        'AB': ['A', 'B', 'AB', 'O'],
        'O': ['O']
    };

    private rh_can_donate_to: Record<string, string[]> = {
        '+': ['+'],
        '-': ['+', '-']
    };

    private rh_can_receive_from: Record<string, string[]> = {
        '+': ['+', '-'],
        '-': ['-']
    };

    public analyze_compatibility(blood_type: string): { can_donate_to: string[], can_receive_from: string[] } {
        const { abo, rh } = this.parse_blood_type(blood_type);
        if (!abo || !rh) {
            return { can_donate_to: [], can_receive_from: [] };
        }

        const abo_donors = this.abo_can_receive_from[abo] || [];
        const rh_donors = this.rh_can_receive_from[rh] || [];
        const compatible_donors = abo_donors.flatMap(donor_abo => 
            rh_donors.map(donor_rh => `${donor_abo}${donor_rh}`)
        );

        const abo_recipients = this.abo_can_donate_to[abo] || [];
        const rh_recipients = this.rh_can_donate_to[rh] || [];
        const compatible_recipients = abo_recipients.flatMap(rec_abo => 
            rh_recipients.map(rec_rh => `${rec_abo}${rec_rh}`)
        );

        return {
            can_donate_to: [...new Set(compatible_recipients)],
            can_receive_from: [...new Set(compatible_donors)]
        };
    }
    
    private parse_blood_type(blood_type: string): { abo: string | null; rh: string | null } {
        if (!blood_type) return { abo: null, rh: null };

        if (blood_type.endsWith('+')) {
            return { abo: blood_type.slice(0, -1), rh: '+' };
        }
        if (blood_type.endsWith('-')) {
            return { abo: blood_type.slice(0, -1), rh: '-' };
        }
        return { abo: blood_type, rh: null }; // Support for single system types
    }
}


class ABOCalculator {
    private valid_genotypes = ['AA', 'AO', 'BB', 'BO', 'AB', 'OO'];
    public genotype_to_phenotype: Record<string, string> = { 'AA': 'A', 'AO': 'A', 'BB': 'B', 'BO': 'B', 'AB': 'AB', 'OO': 'O' };
    private phenotype_to_genotypes: Record<string, string[]> = { 'A': ['AA', 'AO'], 'B': ['BB', 'BO'], 'AB': ['AB'], 'O': ['OO'] };
    private valid_inputs = ['A', 'B', 'AB', 'O', 'AA', 'AO', 'BB', 'BO', 'OO', 'Unknown'];
    private all_genotypes = ['AA', 'AO', 'BB', 'BO', 'AB', 'OO'];
    private inheritance_table: Record<string, Record<string, string[]>>;

    constructor() {
        this.inheritance_table = this._create_inheritance_table();
    }

    private _create_inheritance_table(): Record<string, Record<string, string[]>> {
        const inheritance: Record<string, Record<string, string[]>> = {};
        for (const p1 of this.all_genotypes) {
            inheritance[p1] = {};
            for (const p2 of this.all_genotypes) {
                const children = new Set<string>();
                for (const a1 of p1) {
                    for (const a2 of p2) {
                        const genotype = [a1, a2].sort().join('');
                        children.add(genotype === 'BA' ? 'AB' : genotype);
                    }
                }
                inheritance[p1][p2] = Array.from(children).sort();
            }
        }
        return inheritance;
    }

    private _is_genotype(bt: string): boolean { return this.all_genotypes.includes(bt); }
    private _validate_input(bt: string): boolean { return this.valid_inputs.includes(bt) || this.valid_genotypes.includes(bt); }
    private _get_genotypes(bt: string): string[] {
        if (bt === 'Unknown') return this.all_genotypes;
        if (this._is_genotype(bt)) return [bt];
        return this.phenotype_to_genotypes[bt] || [];
    }

    private _validate_all_inputs(father: string, mother: string, children: string[]): string {
        if (![father, mother, ...children].every(bt => this._validate_input(bt))) {
            return "error.abo.invalidInputDetailed";
        }
        if (![father, mother, ...children].some(x => x !== "Unknown")) {
            return "error.abo.noInput";
        }
        return "";
    }

    public get_possible_child_genotypes(father_geno: string, mother_geno: string): string[] {
        return this.inheritance_table[father_geno]?.[mother_geno] || [];
    }

    private is_valid_combination(father_geno: string, mother_geno: string, children_types: string[]): boolean {
        const possible_child_genotypes = this.get_possible_child_genotypes(father_geno, mother_geno);
        return children_types.every(child_type => {
            if (child_type === 'Unknown') return true;
            const child_genotypes = this._get_genotypes(child_type);
            return child_genotypes.some(cg => possible_child_genotypes.includes(cg));
        });
    }

    private determine_child_genotype(father_geno: string, mother_geno: string, child_type: string): string[] {
        const possible_children = this.get_possible_child_genotypes(father_geno, mother_geno);
        if (child_type === 'Unknown') return possible_children;
        const child_genotypes = this._get_genotypes(child_type);
        return possible_children.filter(child => child_genotypes.includes(child));
    }

    public analyze_family(father: string, mother: string, children: string[]): ABOAnalysisResult {
        const error = this._validate_all_inputs(father, mother, children);
        if (error) return { valid: false, errors: [error], combinations: [], father_genotypes: new Set(), mother_genotypes: new Set(), children_genotypes: [] };
        
        const father_genotypes = this._get_genotypes(father);
        const mother_genotypes = this._get_genotypes(mother);
        const combinations: GenotypeCombination[] = [];

        for (const father_geno of father_genotypes) {
            for (const mother_geno of mother_genotypes) {
                if (this.is_valid_combination(father_geno, mother_geno, children)) {
                    const children_genotypes_for_combo = children.map(child_type => this.determine_child_genotype(father_geno, mother_geno, child_type));
                    if (children_genotypes_for_combo.every(cg => cg.length > 0)) {
                        combinations.push({ father: father_geno, mother: mother_geno, children: children_genotypes_for_combo });
                    }
                }
            }
        }
        
        if (combinations.length === 0) {
            const errorPayload = {
                type: 'ai_explanation_required',
                system: 'ABO',
                context: { father, mother, children }
            };
            return { valid: false, errors: [JSON.stringify(errorPayload)], combinations: [], father_genotypes: new Set(), mother_genotypes: new Set(), children_genotypes: [] };
        }
        
        const possible_father_genotypes = new Set(combinations.map(c => c.father));
        const possible_mother_genotypes = new Set(combinations.map(c => c.mother));
        const possible_children_genotypes = children.map((_, i) => new Set(combinations.flatMap(c => c.children[i])));

        return { valid: true, errors: [], combinations, father_genotypes: possible_father_genotypes, mother_genotypes: possible_mother_genotypes, children_genotypes: possible_children_genotypes };
    }
}


class RHCalculator {
    public genotype_to_phenotype: Record<string, string> = { 'DD': '+', 'Dd': '+', 'dd': '-' };
    private phenotype_to_genotypes: Record<string, string[]> = { '+': ['DD', 'Dd'], '-': ['dd'] };
    private valid_inputs = ['+', '-', 'DD', 'Dd', 'dd', 'Unknown'];
    private all_genotypes = ['DD', 'Dd', 'dd'];

    private _is_genotype(rh: string): boolean { return this.all_genotypes.includes(rh); }
    private _validate_input(rh: string): boolean { return this.valid_inputs.includes(rh); }
    private _get_genotypes(rh: string): string[] {
        if (rh === 'Unknown') return this.all_genotypes;
        if (this._is_genotype(rh)) return [rh];
        return this.phenotype_to_genotypes[rh] || [];
    }
    
    private _validate_all_inputs(father: string, mother: string, children: string[]): string {
        if (![father, mother, ...children].every(rh => this._validate_input(rh))) return "error.rh.invalidInputDetailed";
        if (![father, mother, ...children].some(x => x !== "Unknown")) return "error.rh.noInput";
        return "";
    }
    
    public get_possible_child_genotypes(father_geno: string, mother_geno: string): string[] {
        const children = new Set<string>();
        for (const a1 of father_geno) {
            for (const a2 of mother_geno) {
                const sorted = [a1, a2].sort();
                if (sorted[0] === 'd') sorted.reverse(); // Ensure 'D' comes first if present
                children.add(sorted.join(''));
            }
        }
        return Array.from(children);
    }
    
    private is_valid_combination(father_geno: string, mother_geno: string, children_rh: string[]): boolean {
        const possible_child_genotypes = this.get_possible_child_genotypes(father_geno, mother_geno);
        return children_rh.every(child_rh => {
            if (child_rh === 'Unknown') return true;
            const child_genotypes = this._get_genotypes(child_rh);
            return child_genotypes.some(cg => possible_child_genotypes.includes(cg));
        });
    }

    private determine_child_genotype(father_geno: string, mother_geno: string, child_rh: string): string[] {
        const possible_children = this.get_possible_child_genotypes(father_geno, mother_geno);
        if (child_rh === 'Unknown') return possible_children;
        const child_genotypes = this._get_genotypes(child_rh);
        return possible_children.filter(child => child_genotypes.includes(child));
    }
    
    public analyze_family(father: string, mother: string, children: string[]): RHAnalysisResult {
        const error = this._validate_all_inputs(father, mother, children);
        if (error) return { valid: false, errors: [error], combinations: [], father_genotypes: new Set(), mother_genotypes: new Set(), children_genotypes: [] };
        
        const father_genotypes = this._get_genotypes(father);
        const mother_genotypes = this._get_genotypes(mother);
        const combinations: RHGenotypeCombination[] = [];
        
        for (const father_geno of father_genotypes) {
            for (const mother_geno of mother_genotypes) {
                if (this.is_valid_combination(father_geno, mother_geno, children)) {
                    const children_genotypes_for_combo = children.map(child_rh => this.determine_child_genotype(father_geno, mother_geno, child_rh));
                    if (children_genotypes_for_combo.every(cg => cg.length > 0)) {
                        combinations.push({ father: father_geno, mother: mother_geno, children: children_genotypes_for_combo });
                    }
                }
            }
        }
        
        if (combinations.length === 0) {
            const errorPayload = {
                type: 'ai_explanation_required',
                system: 'RH',
                context: { father, mother, children }
            };
            return { valid: false, errors: [JSON.stringify(errorPayload)], combinations: [], father_genotypes: new Set(), mother_genotypes: new Set(), children_genotypes: [] };
        }

        const possible_father_genotypes = new Set(combinations.map(c => c.father));
        const possible_mother_genotypes = new Set(combinations.map(c => c.mother));
        const possible_children_genotypes = children.map((_, i) => new Set(combinations.flatMap(c => c.children[i])));

        return { valid: true, errors: [], combinations, father_genotypes: possible_father_genotypes, mother_genotypes: possible_mother_genotypes, children_genotypes: possible_children_genotypes };
    }
}


export class BloodTypeCalculator {
    private abo_calculator: ABOCalculator;
    private rh_calculator: RHCalculator;
    private compatibility_analyzer: BloodCompatibility;

    constructor() {
        this.abo_calculator = new ABOCalculator();
        this.rh_calculator = new RHCalculator();
        this.compatibility_analyzer = new BloodCompatibility();
    }

    private _analyze_system_with_fallback(calculator: ABOCalculator, father: string, mother: string, children: string[], noInputErrorKey: string): ABOAnalysisResult;
    private _analyze_system_with_fallback(calculator: RHCalculator, father: string, mother: string, children: string[], noInputErrorKey: string): RHAnalysisResult;
    private _analyze_system_with_fallback(calculator: ABOCalculator | RHCalculator, father: string, mother: string, children: string[], noInputErrorKey: string) {
        try {
            const result = calculator.analyze_family(father, mother, children);
    
            if (!result.valid && result.errors?.length > 0) {
                const filteredErrors = result.errors.filter(err => err !== noInputErrorKey);
                
                if (filteredErrors.length === 0) {
                    // The only error was the "noInput" one, so we can treat this system as failed but without generating a user-facing error.
                    return { valid: false, errors: [], combinations: [], father_genotypes: new Set(), mother_genotypes: new Set(), children_genotypes: children.map(() => new Set<string>()) };
                } else {
                    // There were other, more important errors. Update the result with these.
                    result.errors = filteredErrors;
                }
            }
            
            return result;
        } catch (e: any) {
             return {
                valid: false,
                errors: [JSON.stringify({ key: 'error.unexpectedDetailed', options: { error: e.toString() } })],
                combinations: [],
                father_genotypes: new Set(),
                mother_genotypes: new Set(),
                children_genotypes: children.map(() => new Set<string>())
            };
        }
    }
    

    public analyze_family(father: Person, mother: Person, children: Person[]): FamilyAnalysisResult {
        const father_abo = father.ABO ?? "Unknown";
        const mother_abo = mother.ABO ?? "Unknown";
        const children_abo = children.map(c => c.ABO ?? "Unknown");

        const father_rh = father.RH ?? "Unknown";
        const mother_rh = mother.RH ?? "Unknown";
        const children_rh = children.map(c => c.RH ?? "Unknown");

        const all_unknown = [father_abo, mother_abo, father_rh, mother_rh, ...children_abo, ...children_rh].every(x => x === 'Unknown');

        if (all_unknown) {
            return {
                valid: false,
                errors: ['error.allUnknown'],
                abo_result: { valid: false, errors: [], combinations: [], father_genotypes: new Set(), mother_genotypes: new Set(), children_genotypes: [] },
                rh_result: { valid: false, errors: [], combinations: [], father_genotypes: new Set(), mother_genotypes: new Set(), children_genotypes: [] },
                abo_valid: false,
                rh_valid: false
            };
        }
        
        const abo_result = this._analyze_system_with_fallback(this.abo_calculator, father_abo, mother_abo, children_abo, "error.abo.noInput");
        const rh_result = this._analyze_system_with_fallback(this.rh_calculator, father_rh, mother_rh, children_rh, "error.rh.noInput");

        const valid = abo_result.valid || rh_result.valid;
        
        const errors: string[] = [];
        // Collect errors, excluding "at least one" errors for individual systems, exactly as in the python script.
        if (!abo_result.valid) {
            const filteredErrors = abo_result.errors.filter(err => err !== 'error.abo.noInput');
            errors.push(...filteredErrors);
        }
        if (!rh_result.valid) {
            const filteredErrors = rh_result.errors.filter(err => err !== 'error.rh.noInput');
            errors.push(...filteredErrors);
        }
        
        return { 
            valid, 
            errors, 
            abo_result, 
            rh_result, 
            abo_valid: abo_result.valid, 
            rh_valid: rh_result.valid 
        };
    }
    
    private _calculate_genotype_probability(member: string, family_result: FamilyAnalysisResult, blood_system: 'ABO' | 'RH'): ProbabilityMap {
        const system_result = blood_system === 'ABO' ? family_result.abo_result : family_result.rh_result;
        if (!system_result?.valid) return {};

        const is_parent = member === 'father' || member === 'mother';
        
        let genotypes: Set<string> | undefined;
        if (member === 'father') {
            genotypes = system_result.father_genotypes;
        } else if (member === 'mother') {
            genotypes = system_result.mother_genotypes;
        } else {
            const childIndex = parseInt(member.replace('child', ''), 10) - 1;
            if (childIndex >= 0 && childIndex < system_result.children_genotypes.length) {
                genotypes = system_result.children_genotypes[childIndex];
            }
        }
        
        if (!genotypes || genotypes.size === 0) return {};

        // For parents, assume equal probability among possible genotypes.
        if (is_parent) {
            const equal_prob = 100.0 / genotypes.size;
            return Object.fromEntries(Array.from(genotypes).map(g => [g, equal_prob]));
        }

        // For children, calculate based on Punnett squares of valid parent combinations.
        const genotype_counts: Record<string, number> = {};
        let total_weight = 0;

        if (blood_system === 'ABO' && system_result.combinations) {
             const abo_combinations = system_result.combinations as GenotypeCombination[];
             abo_combinations.forEach(combo => {
                const { father: father_genotype, mother: mother_genotype } = combo;

                const f_alleles = father_genotype.split('');
                const m_alleles = mother_genotype.split('');
                
                const allele_combos = [
                    f_alleles[0] + m_alleles[0],
                    f_alleles[0] + m_alleles[1],
                    f_alleles[1] + m_alleles[0],
                    f_alleles[1] + m_alleles[1],
                ];

                const sorted_combos = allele_combos.map(c => {
                    const sorted = c.split('').sort().join('');
                    return sorted === 'BA' ? 'AB' : sorted;
                });

                for(const child_genotype of sorted_combos) {
                    genotype_counts[child_genotype] = (genotype_counts[child_genotype] || 0) + 1;
                    total_weight += 1;
                }
            });

        } else if (blood_system === 'RH' && system_result.combinations) {
            const rh_combinations = system_result.combinations as RHGenotypeCombination[];
            const calculator = this.rh_calculator;

            rh_combinations.forEach(combo => {
                const { father: father_genotype, mother: mother_genotype } = combo;
                const possible_children = calculator.get_possible_child_genotypes(father_genotype, mother_genotype);
                
                for(const child_genotype of possible_children) {
                    let count = 0;
                    const father_D = (father_genotype.match(/D/g) || []).length;
                    const father_d = (father_genotype.match(/d/g) || []).length;
                    const mother_D = (mother_genotype.match(/D/g) || []).length;
                    const mother_d = (mother_genotype.match(/d/g) || []).length;

                    if (child_genotype === 'DD') {
                        count = (father_D / 2) * (mother_D / 2) * 4;
                    } else if (child_genotype === 'Dd') {
                        count = ((father_D / 2) * (mother_d / 2) + (father_d / 2) * (mother_D / 2)) * 4;
                    } else if (child_genotype === 'dd') {
                        count = (father_d / 2) * (mother_d / 2) * 4;
                    }
                    
                    genotype_counts[child_genotype] = (genotype_counts[child_genotype] || 0) + count;
                    total_weight += count;
                }
            });
        }
        
        const probabilities: ProbabilityMap = {};
        if (total_weight > 0) {
            for (const genotype in genotype_counts) {
                if (genotypes.has(genotype)) {
                    probabilities[genotype] = (genotype_counts[genotype] / total_weight) * 100;
                }
            }
        }
        
        const filtered_probs = Object.fromEntries(Object.entries(probabilities).filter(([g]) => genotypes.has(g)));
        const total_prob = Object.values(filtered_probs).reduce((sum, p) => sum + p, 0);

        if (total_prob > 0) {
            return Object.fromEntries(Object.entries(filtered_probs).map(([g,p]) => [g, (p / total_prob) * 100]));
        }
        
        // Fallback for children if weighted calc fails
        if (genotypes.size > 0) {
            const equal_prob = 100.0 / genotypes.size;
            return Object.fromEntries(Array.from(genotypes).map(g => [g, equal_prob]));
        }

        return {};
    }
    
    private _map_geno_to_pheno_probs(geno_probs: ProbabilityMap, mapper: Record<string, string>): ProbabilityMap {
        const pheno_probs: ProbabilityMap = {};
        for (const geno in geno_probs) {
            const pheno = mapper[geno];
            if (pheno) {
                pheno_probs[pheno] = (pheno_probs[pheno] || 0) + geno_probs[geno];
            }
        }
        return pheno_probs;
    }

    private _combine_probabilities(abo: ProbabilityMap, rh: ProbabilityMap): ProbabilityMap {
        const combined: ProbabilityMap = {};
        if (Object.keys(abo).length === 0 || Object.keys(rh).length === 0) return {};
        
        const total_abo = Object.values(abo).reduce((s, p) => s + p, 0);
        const total_rh = Object.values(rh).reduce((s, p) => s + p, 0);
        if (total_abo === 0 || total_rh === 0) return {};

        for (const abo_type in abo) {
            for (const rh_type in rh) {
                const combined_key = `${abo_type}${rh_type}`;
                const prob = (abo[abo_type] / total_abo) * (rh[rh_type] / total_rh) * 100;
                combined[combined_key] = prob;
            }
        }
        return combined;
    }
    
    public analyze_member_probabilities(member: string, family_result: FamilyAnalysisResult): MemberAnalysisResult {
        const emptyResult: MemberAnalysisResult = {
            valid: false,
            member,
            abo_genotype_probabilities: {},
            abo_phenotype_probabilities: {},
            rh_genotype_probabilities: {},
            rh_phenotype_probabilities: {},
            hybrid_genotype_probabilities: {},
            hybrid_phenotype_probabilities: {},
            transfusion_compatibility: {
                can_donate_to: {},
                can_receive_from: {},
                summary: { key: 'invalid' },
            },
        };
        if (!family_result.valid) return emptyResult;
        
        const abo_geno_probs = this._calculate_genotype_probability(member, family_result, 'ABO');
        const rh_geno_probs = this._calculate_genotype_probability(member, family_result, 'RH');

        const abo_pheno_probs = this._map_geno_to_pheno_probs(abo_geno_probs, this.abo_calculator.genotype_to_phenotype);
        const rh_pheno_probs = this._map_geno_to_pheno_probs(rh_geno_probs, this.rh_calculator.genotype_to_phenotype);
        
        const hybrid_geno_probs = this._combine_probabilities(abo_geno_probs, rh_geno_probs);
        const hybrid_pheno_probs = this._combine_probabilities(abo_pheno_probs, rh_pheno_probs);
        
        const transfusion_compatibility = this._calculate_transfusion_compatibility(abo_pheno_probs, rh_pheno_probs);

        return { valid: family_result.valid, member, abo_genotype_probabilities: abo_geno_probs, abo_phenotype_probabilities: abo_pheno_probs, rh_genotype_probabilities: rh_geno_probs, rh_phenotype_probabilities: rh_pheno_probs, hybrid_genotype_probabilities: hybrid_geno_probs, hybrid_phenotype_probabilities: hybrid_pheno_probs, transfusion_compatibility };
    }

    private _calculate_single_system_transfusion(system: 'ABO' | 'RH', phenotypeProbs: ProbabilityMap): TransfusionCompatibility {
        const can_donate_to: ProbabilityMap = {};
        const can_receive_from: ProbabilityMap = {};
        
        const rules = system === 'ABO'
            // @ts-ignore - Accessing private members of encapsulated class for this specific logic
            ? { donate: this.compatibility_analyzer.abo_can_donate_to, receive: this.compatibility_analyzer.abo_can_receive_from }
            // @ts-ignore
            : { donate: this.compatibility_analyzer.rh_can_donate_to, receive: this.compatibility_analyzer.rh_can_receive_from };

        for (const [phenotype, probability] of Object.entries(phenotypeProbs)) {
            const weight = probability / 100.0;
            const recipients = rules.donate[phenotype] || [];
            recipients.forEach(r => {
                can_donate_to[r] = (can_donate_to[r] || 0) + weight;
            });
            const donors = rules.receive[phenotype] || [];
            donors.forEach(d => {
                can_receive_from[d] = (can_receive_from[d] || 0) + weight;
            });
        }

        for (const type in can_donate_to) can_donate_to[type] *= 100;
        for (const type in can_receive_from) can_receive_from[type] *= 100;

        let summary: TransfusionSummary;
        if (Object.keys(phenotypeProbs).length === 1) {
            summary = { key: 'single', type: Object.keys(phenotypeProbs)[0] };
        } else {
            const mostLikely = Object.entries(phenotypeProbs).sort((a, b) => b[1] - a[1])[0];
            summary = { key: 'mostLikely', type: mostLikely[0], probability: mostLikely[1] };
        }
        
        summary.note = `transfusion.summary.note${system}`;
        
        return { can_donate_to, can_receive_from, summary };
    }

    private _calculate_hybrid_transfusion_compatibility(phenotypeProbs: ProbabilityMap): TransfusionCompatibility {
        const can_donate_to: ProbabilityMap = {};
        const can_receive_from: ProbabilityMap = {};
        
        if (Object.keys(phenotypeProbs).length === 0) {
            return { can_donate_to, can_receive_from, summary: { key: 'insufficient' } };
        }

        for (const [phenotype, probability] of Object.entries(phenotypeProbs)) {
            const rules = this.compatibility_analyzer.analyze_compatibility(phenotype);
            const weight = probability / 100.0;
            rules.can_donate_to.forEach(recipient => {
                can_donate_to[recipient] = (can_donate_to[recipient] || 0) + weight;
            });
            rules.can_receive_from.forEach(donor => {
                can_receive_from[donor] = (can_receive_from[donor] || 0) + weight;
            });
        }
        
        for(const type in can_donate_to) can_donate_to[type] *= 100;
        for(const type in can_receive_from) can_receive_from[type] *= 100;
        
        let summary: TransfusionSummary;
        if (Object.keys(phenotypeProbs).length === 1) {
            summary = { key: 'single', type: Object.keys(phenotypeProbs)[0] };
        } else {
            const mostLikely = Object.entries(phenotypeProbs).sort((a, b) => b[1] - a[1])[0];
            summary = { key: 'mostLikely', type: mostLikely[0], probability: mostLikely[1] };
        }
        
        return { can_donate_to, can_receive_from, summary };
    }

    private _calculate_transfusion_compatibility(abo_pheno_probs: ProbabilityMap, rh_pheno_probs: ProbabilityMap): TransfusionCompatibility {
        const hasAbo = Object.keys(abo_pheno_probs).length > 0;
        const hasRh = Object.keys(rh_pheno_probs).length > 0;

        if (hasAbo && hasRh) {
            const hybrid_pheno_probs = this._combine_probabilities(abo_pheno_probs, rh_pheno_probs);
            return this._calculate_hybrid_transfusion_compatibility(hybrid_pheno_probs);
        } else if (hasAbo) {
            return this._calculate_single_system_transfusion('ABO', abo_pheno_probs);
        } else if (hasRh) {
            return this._calculate_single_system_transfusion('RH', rh_pheno_probs);
        } else {
            return { can_donate_to: {}, can_receive_from: {}, summary: { key: 'insufficient' } };
        }
    }
}