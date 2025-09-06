import React, { useState, useEffect } from 'react';

interface TypewriterProps {
    text: string;
    active: boolean;
    speed?: number;
    className?: string;
}

const Typewriter: React.FC<TypewriterProps> = ({ text, active, speed = 50, className = '' }) => {
    const [displayedText, setDisplayedText] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {

        // Determine the target text based on active state
        const targetText = active ? text : '';

        // If we are already at the target, ensure processing state is false and stop.
        if (displayedText === targetText) {
            if (isProcessing) setIsProcessing(false);
            return;
        }

        // We need to type or delete, so ensure processing state is true.
        if (!isProcessing) setIsProcessing(true);

        // Determine if we are adding or removing characters
        const shouldAdd = targetText.length > displayedText.length;
        const nextText = shouldAdd
            ? targetText.substring(0, displayedText.length + 1) // Add next character
            : displayedText.substring(0, displayedText.length - 1); // Remove last character

        const currentSpeed = shouldAdd ? speed : speed / 2; // Delete faster

        // Set timeout for the next character change
        const currentTimeoutId = setTimeout(() => {
            setDisplayedText(nextText);
        }, currentSpeed);

        // Cleanup function to clear timeout on re-render
        return () => clearTimeout(currentTimeoutId);

    }, [displayedText, text, active, speed, isProcessing]);
    
    // Don't render anything if there's no text and we're not processing
    if (displayedText.length === 0 && !isProcessing) {
        return null;
    }

    const cursorClass = isProcessing ? 'blinking-cursor' : '';

    return (
        <span className={`${className} ${cursorClass}`}>
            {displayedText}
        </span>
    );
};

export default Typewriter;
