import React from 'react';
import { ProbabilityMap } from '../types';
import { COLORS } from './AnimatedPieChart';

interface ResultsTableProps {
    data: ProbabilityMap;
}

const ResultsTable: React.FC<ResultsTableProps> = ({ data }) => {
    const sortedData = Object.entries(data).sort(([, a], [, b]) => b - a);

    if (sortedData.length === 0) {
        return <p className="text-gray-500 text-sm">No specific probabilities could be determined.</p>;
    }

    return (
        <div className="overflow-hidden rounded-lg">
            <table className="min-w-full">
                <thead>
                    <tr>
                        <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Type</th>
                        <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Probability</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                    {sortedData.map(([type, probability], index) => (
                        <tr
                            key={type}
                            className="transition-all duration-300 ease-in-out"
                            style={{ 
                                animation: `fadeInUp 0.5s ease-out ${index * 0.07}s forwards`,
                                transform: 'perspective(1000px)'
                            }}
                        >
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-red-300 transition-transform duration-300">{type}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                                <div className="flex items-center gap-3">
                                    <div className="w-full bg-gray-700/50 rounded-full h-3 overflow-hidden">
                                        <div 
                                            className="progress-bar-shine relative h-3 rounded-full transition-all duration-500 ease-out" 
                                            style={{ width: `${probability}%`, backgroundColor: COLORS[index % COLORS.length] }}
                                        ></div>
                                    </div>
                                    <span className="font-mono font-semibold text-base w-20 text-right">{probability.toFixed(2)}%</span>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ResultsTable;