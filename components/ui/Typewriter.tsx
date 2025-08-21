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
        let typingTimeout: ReturnType<typeof setTimeout>;

        if (active) {
            // Typing forward
            if (displayedText.length < text.length) {
                setIsProcessing(true);
                typingTimeout = setTimeout(() => {
                    setDisplayedText(text.substring(0, displayedText.length + 1));
                }, speed);
            } else {
                setIsProcessing(false);
            }
        } else {
            // "Typing" backward (deleting)
            if (displayedText.length > 0) {
                 setIsProcessing(true);
                 typingTimeout = setTimeout(() => {
                     setDisplayedText(displayedText.substring(0, displayedText.length - 1));
                 }, speed / 2); // Delete faster
            } else {
                 setIsProcessing(false);
            }
        }

        return () => clearTimeout(typingTimeout);
    }, [displayedText, text, active, speed]);
    
    // Don't render anything if there's no text and we're not in the middle of an animation
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