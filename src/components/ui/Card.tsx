import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    enableTilt?: boolean;
}

const Card: React.FC<CardProps> = ({ children, className = '', enableTilt = false }) => {
    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const el = e.currentTarget;
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        el.style.setProperty('--mouse-x', `${x}px`);
        el.style.setProperty('--mouse-y', `${y}px`);

        if (enableTilt) {
            const mouseX = x / rect.width;
            const mouseY = y / rect.height;
            const rotateX = (mouseY - 0.5) * -10; // Subtle tilt effect
            const rotateY = (mouseX - 0.5) * 10;
            el.style.setProperty('--rotateX', `${rotateX}deg`);
            el.style.setProperty('--rotateY', `${rotateY}deg`);
        }
    };

    const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
        e.currentTarget.classList.add('is-hovering');
    };

    const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
        e.currentTarget.classList.remove('is-hovering');
        if (enableTilt) {
            const el = e.currentTarget;
            el.style.setProperty('--rotateX', '0deg');
            el.style.setProperty('--rotateY', '0deg');
        }
    };

    const cardClasses = [
        'interactive-glow-border',
        'bg-black/20 backdrop-blur-sm border border-gray-700/50 rounded-xl shadow-2xl shadow-black/30 p-6 sm:p-8',
        enableTilt ? 'interactive-tilt-box' : '',
        className,
    ].filter(Boolean).join(' ');

    return (
        <div
            className={cardClasses}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            style={{ borderRadius: '0.75rem' }} // Ensure border-radius is available for ::before
        >
            {enableTilt ? <div className="interactive-tilt-box-content">{children}</div> : children}
        </div>
    );
};

export default Card;