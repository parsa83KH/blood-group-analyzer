
import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => {
    return (
        <div className={`bg-black/20 backdrop-blur-sm border border-gray-700/50 rounded-xl shadow-2xl shadow-black/30 p-6 sm:p-8 ${className}`}>
            {children}
        </div>
    );
};

export default Card;
