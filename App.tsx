import React, { useState, useCallback, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Person, FamilyAnalysisResult, MemberAnalysisResult, AIAssistantHandle } from './types';
import BloodInputForm from './components/BloodInputForm';
import ResultsDisplay from './components/ResultsDisplay';
import HowItWorks from './components/HowItWorks';
import LanguageSwitcher from './components/LanguageSwitcher';
import { QuestionMarkCircleIcon, GitHubIcon, PaperAirplaneIcon } from './components/icons';
import { BloodTypeCalculator } from './services/bloodCalculator';
import { useLanguage } from './i18n/LanguageContext';
import AnimatedSection from './components/ui/AnimatedSection';
import AIAssistant from './components/AIAssistant';

const App: React.FC = () => {
    const { language, t } = useLanguage();
    const [family, setFamily] = useState<Person[]>([
        { name: 'father', ABO: 'Unknown', RH: 'Unknown' },
        { name: 'mother', ABO: 'Unknown', RH: 'Unknown' },
    ]);
    const [analysisResult, setAnalysisResult] = useState<FamilyAnalysisResult | null>(null);
    const [memberAnalyses, setMemberAnalyses] = useState<MemberAnalysisResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showHowItWorks, setShowHowItWorks] = useState(false);

    const mountRef = useRef<HTMLDivElement>(null);
    const animationIdRef = useRef<number | null>(null);
    const aiAssistantRef = useRef<AIAssistantHandle>(null);
    const aiSectionRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        document.documentElement.lang = language;
        document.documentElement.dir = language === 'fa' ? 'rtl' : 'ltr';
        document.body.classList.toggle('font-persian', language === 'fa');
        document.body.classList.toggle('font-sans', language !== 'fa');
    }, [language]);

    useEffect(() => {
        if (!mountRef.current) return;

        let renderer: THREE.WebGLRenderer | null = null;
        const speed = { boost: 0 };
        const baseSpeed = 0.2;

        // Scene setup
        const scene = new THREE.Scene();

        // Camera setup
        const camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        camera.position.z = 10;

        // Renderer setup
        renderer = new THREE.WebGLRenderer({ 
            antialias: true, 
            alpha: true
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        mountRef.current.appendChild(renderer.domElement);

        // Starfield
        const starGeometry = new THREE.BufferGeometry();
        const starCount = 5000;
        const posArray = new Float32Array(starCount * 3);

        for (let i = 0; i < starCount; i++) {
            const i3 = i * 3;
            posArray[i3] = (Math.random() - 0.5) * 600; // x
            posArray[i3 + 1] = (Math.random() - 0.5) * 600; // y
            posArray[i3 + 2] = (Math.random() - 0.5) * 400; // z
        }
        
        starGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

        const starMaterial = new THREE.PointsMaterial({
            size: 0.1,
            color: 0xffffff,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending,
            sizeAttenuation: true,
        });

        const stars = new THREE.Points(starGeometry, starMaterial);
        scene.add(stars);

        // Animation loop
        const animate = () => {
            animationIdRef.current = requestAnimationFrame(animate);

            // Animate stars
            const positions = starGeometry.attributes.position.array as Float32Array;
            const currentSpeed = baseSpeed + speed.boost;

            for (let i = 0; i < starCount; i++) {
                const i3 = i * 3;
                positions[i3 + 2] += currentSpeed; // Move along z-axis

                // Boundary wrapping
                if (positions[i3 + 2] > 200) {
                    positions[i3 + 2] = -200;
                    positions[i3] = (Math.random() - 0.5) * 600;
                    positions[i3 + 1] = (Math.random() - 0.5) * 600;
                }
            }
            starGeometry.attributes.position.needsUpdate = true;

            // Decay speed boost
            speed.boost *= 0.95; 

            renderer?.render(scene, camera);
        };

        animate();

        // Handle window resize
        const handleResize = () => {
            if (!renderer) return;
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };
        
        // Handle scroll
        const handleScroll = () => {
            // Set speed boost, but clamp it to a max value
            speed.boost = Math.min(speed.boost + 0.3, 3); 
        };

        window.addEventListener('resize', handleResize);
        window.addEventListener('scroll', handleScroll);

        // Cleanup function
        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('scroll', handleScroll);
            
            if (animationIdRef.current) {
                cancelAnimationFrame(animationIdRef.current);
            }
            
            scene.remove(stars);
            starGeometry.dispose();
            starMaterial.dispose();
            
            if (renderer) {
                if (mountRef.current && renderer.domElement) {
                    mountRef.current.removeChild(renderer.domElement);
                }
                renderer.dispose();
            }
        };
    }, []);

    const handleAnalysis = useCallback(async () => {
        setIsLoading(true);
        setAnalysisResult(null);
        setMemberAnalyses([]);

        setTimeout(() => {
            try {
                const calculator = new BloodTypeCalculator();
                const father = family[0];
                const mother = family[1];
                const children = family.slice(2);

                const familyResult = calculator.analyze_family(father, mother, children);
                setAnalysisResult(familyResult);

                if (familyResult.valid) {
                    const membersToAnalyze = ['father', 'mother', ...children.map((_, i) => `child${i + 1}`)];
                    const results = membersToAnalyze.map(memberIdentifier => {
                        return calculator.analyze_member_probabilities(memberIdentifier, familyResult);
                    });
                    setMemberAnalyses(results);
                }
            } catch (error: any) {
                console.error("Analysis failed:", error);
                setAnalysisResult({
                    valid: false,
                    errors: ['error.unexpected'],
                    abo_result: { valid: false, errors: [], combinations: [], father_genotypes: new Set(), mother_genotypes: new Set(), children_genotypes: [] },
                    rh_result: { valid: false, errors: [], combinations: [], father_genotypes: new Set(), mother_genotypes: new Set(), children_genotypes: [] },
                    abo_valid: false,
                    rh_valid: false
                });
            } finally {
                setIsLoading(false);
            }
        }, 100);
    }, [family]);

    const handleAskAI = (prompt: string) => {
        if (aiAssistantRef.current) {
            aiAssistantRef.current.sendPrompt(prompt);
        }
        if (aiSectionRef.current) {
            aiSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    return (
        <>
            <div 
                ref={mountRef} 
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    zIndex: -1,
                    background: 'linear-gradient(135deg, #0c0c0c 0%, #1a1a2e 50%, #16213e 100%)'
                }}
            />
            <div className="relative min-h-screen text-brand-light p-4 sm:p-6 lg:p-8">
                <main className="max-w-7xl mx-auto">
                    <header className="relative text-center mb-12 pt-4 animate-fade-in-down">
                       <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-rose-400 via-red-500 to-amber-500 bg-[length:200%_auto] animate-text-gradient mb-2">
                           {t('appTitle')}
                       </h1>
                        <p className="text-lg text-gray-400 max-w-3xl mx-auto">
                           {t('appTagline')}
                        </p>
                       <div className="flex justify-center items-center gap-4 mt-6">
                           <LanguageSwitcher />
                           <button
                               onClick={() => setShowHowItWorks(prev => !prev)}
                               className="inline-flex items-center gap-2 text-gray-300 hover:text-white transition-all duration-300 font-semibold px-4 py-2 rounded-full bg-gray-800/50 border border-gray-700 hover:border-brand-accent hover:bg-brand-accent/20 hover:shadow-lg hover:shadow-brand-accent/20 transform hover:-translate-y-0.5"
                               aria-expanded={showHowItWorks}
                           >
                               <QuestionMarkCircleIcon className="w-5 h-5" />
                               {t('howItWorks.title')}
                           </button>
                       </div>
                    </header>

                    {showHowItWorks && (
                        <AnimatedSection className="my-12">
                            <HowItWorks onAskAI={handleAskAI} />
                        </AnimatedSection>
                    )}

                    <AnimatedSection className="mb-12">
                        <BloodInputForm
                            family={family}
                            setFamily={setFamily}
                            onAnalyze={handleAnalysis}
                            isLoading={isLoading}
                        />
                    </AnimatedSection>
                    
                    <AnimatedSection>
                        <ResultsDisplay
                            isLoading={isLoading}
                            analysisResult={analysisResult}
                            memberAnalyses={memberAnalyses}
                            family={family}
                            onAskAI={handleAskAI}
                        />
                    </AnimatedSection>
                    
                    <div ref={aiSectionRef}>
                        <AnimatedSection className="mt-12">
                            <AIAssistant ref={aiAssistantRef} />
                        </AnimatedSection>
                    </div>
                </main>
                 <footer className="text-center mt-16 text-gray-500 text-sm space-y-2">
                    <p>&copy; {new Date().getFullYear()} {t('appTitle')}. {t('footerRights')}</p>
                    <p>{t('footer.developedBy')}</p>
                    <div className="flex justify-center items-center gap-6 pt-2">
                        <a href="https://github.com/parsa83KH" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-gray-300 transition-colors">
                            <GitHubIcon className="w-5 h-5" />
                            {t('footer.github')}
                        </a>
                        <a href="https://t.me/ParsaKH_83" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-gray-300 transition-colors">
                            <PaperAirplaneIcon className="w-5 h-5" />
                            {t('footer.telegram')}
                        </a>
                    </div>
                </footer>
            </div>
        </>
    );
};

export default App;