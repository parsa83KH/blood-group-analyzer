import React from 'react';
import { AnimatedCheckIcon, AnimatedCrossIcon } from '../icons';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    isLoading?: boolean;
    analysisCompletionStatus?: 'idle' | 'success' | 'error';
}

const Button: React.FC<ButtonProps> = ({ children, className = '', isLoading, analysisCompletionStatus = 'idle', ...props }) => {
    
    let stateClass = '';
    if (isLoading) {
        stateClass = 'state-loading';
    } else if (analysisCompletionStatus === 'success') {
        stateClass = 'state-success';
    } else if (analysisCompletionStatus === 'error') {
        stateClass = 'state-error';
    }

    return (
        <button
            className={`blob-btn ${className} ${stateClass}`}
            disabled={isLoading || analysisCompletionStatus !== 'idle'}
            {...props}
        >
            <span className="relative z-10 content-wrapper">
                <span className="default-content flex items-center justify-center">
                    {children}
                </span>

                <span className="loading-content">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                </span>

                <span className="success-content">
                    <AnimatedCheckIcon />
                </span>

                <span className="error-content">
                    <AnimatedCrossIcon />
                </span>
            </span>

            <span className="blob-btn__inner">
                <span className="blob-btn__blobs">
                    <span className="blob-btn__blob"></span>
                    <span className="blob-btn__blob"></span>
                    <span className="blob-btn__blob"></span>
                    <span className="blob-btn__blob"></span>
                </span>
            </span>
        </button>
    );
};

export default Button;