# API Documentation

This document describes the core APIs and interfaces used in the Blood Group Analyzer.

## Core Types

### Person Interface

```typescript
interface Person {
  name: string;
  ABO: string;
  RH: string;
}
```

Represents a family member with their blood type information.

### Analysis Results

#### FamilyAnalysisResult

```typescript
interface FamilyAnalysisResult {
  valid: boolean;
  errors: string[];
  abo_result: ABOAnalysisResult;
  rh_result: RHAnalysisResult;
  abo_valid: boolean;
  rh_valid: boolean;
}
```

Contains the complete analysis results for a family.

#### MemberAnalysisResult

```typescript
interface MemberAnalysisResult {
  valid: boolean;
  member: string;
  abo_genotype_probabilities: ProbabilityMap;
  abo_phenotype_probabilities: ProbabilityMap;
  rh_genotype_probabilities: ProbabilityMap;
  rh_phenotype_probabilities: ProbabilityMap;
  hybrid_genotype_probabilities: ProbabilityMap;
  hybrid_phenotype_probabilities: ProbabilityMap;
  transfusion_compatibility: TransfusionCompatibility;
}
```

Contains detailed probability analysis for individual family members.

## Services

### BloodTypeCalculator

The main service for genetic analysis calculations.

#### Methods

##### `analyze_family(father: Person, mother: Person, children: Person[]): FamilyAnalysisResult`

Analyzes the genetic compatibility of a family based on blood types.

**Parameters:**
- `father`: Father's blood type information
- `mother`: Mother's blood type information  
- `children`: Array of children's blood type information

**Returns:** Complete family analysis result

##### `analyze_member_probabilities(memberIdentifier: string, familyResult: FamilyAnalysisResult): MemberAnalysisResult`

Calculates detailed probability distributions for a specific family member.

**Parameters:**
- `memberIdentifier`: Member identifier ('father', 'mother', 'child1', etc.)
- `familyResult`: Result from family analysis

**Returns:** Detailed member analysis with probabilities

### BloodCompatibility

Handles blood transfusion compatibility calculations.

#### Methods

##### `analyze_compatibility(blood_type: string): { can_donate_to: string[], can_receive_from: string[] }`

Determines transfusion compatibility for a given blood type.

**Parameters:**
- `blood_type`: Blood type string (e.g., "A+", "O-")

**Returns:** Object containing donation and reception compatibility arrays

## Utility Functions

### Constants

```typescript
export const BLOOD_TYPES = {
  ABO_OPTIONS: ['Unknown', 'A', 'B', 'AB', 'O', 'AA', 'AO', 'BB', 'BO', 'AB', 'OO'],
  RH_OPTIONS: ['Unknown', '+', '-', 'DD', 'Dd', 'dd'],
} as const;
```

### Helpers

#### `formatPercentage(value: number, decimals?: number): string`

Formats a decimal value as a percentage string.

#### `debounce<T>(func: T, wait: number): T`

Creates a debounced version of a function.

#### `throttle<T>(func: T, limit: number): T`

Creates a throttled version of a function.

### Validation

#### `isValidBloodType(abo: string, rh: string): boolean`

Validates if the provided ABO and RH values are valid blood type components.

#### `isValidApiKey(apiKey: string): boolean`

Validates the format of a Google Gemini API key.

## AI Integration

### Google Gemini API

The application integrates with Google Gemini for AI-powered explanations.

#### Configuration

```typescript
const ai = new GoogleGenAI({ 
  apiKey: process.env.API_KEY as string 
});
```

#### Usage

```typescript
const response = await ai.models.generateContent({
  model: 'gemini-2.5-flash',
  contents: prompt
});
```

## Error Handling

The application uses structured error handling with specific error types:

- **Validation Errors**: Invalid input data
- **Genetic Impossibilities**: Biologically impossible combinations
- **AI Errors**: Issues with AI service integration
- **API Errors**: Network or service failures

## Internationalization

The application supports multiple languages through the i18n system:

```typescript
const { t, language } = useLanguage();
const translatedText = t('translation.key');
```

Supported languages:
- English (`en`)
- Persian/Farsi (`fa`)

## Performance Considerations

- Results are memoized to avoid recalculation
- Debounced user input to reduce API calls
- Lazy loading for non-critical components
- Optimized bundle splitting
