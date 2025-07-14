import React from 'react';
import { ProbabilityMap } from '../types';

interface ResultsTableProps {
    data: ProbabilityMap;
}

const ResultsTable: React.FC<ResultsTableProps> = ({ data }) => {
    const sortedData = Object.entries(data).sort(([, a], [, b]) => b - a);

    if (sortedData.length === 0) {
        return <p className="text-gray-500 text-sm">No specific probabilities could be determined.</p>;
    }

    return (
        <div className="overflow-hidden rounded-lg border border-gray-700">
            <table className="min-w-full divide-y divide-gray-700 bg-gray-800/50">
                <thead className="bg-gray-800/70">
                    <tr>
                        <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Type</th>
                        <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Probability</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                    {sortedData.map(([type, probability], index) => (
                        <tr
                            key={type}
                            className="transition-colors hover:bg-brand-primary/10"
                            style={{ animation: `fadeInUp 0.3s ease-out ${index * 0.05}s forwards` }}
                        >
                            <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-red-300">{type}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-300">
                                <div className="flex items-center">
                                    <div className="w-full bg-gray-700 rounded-full h-2.5 mr-2">
                                        <div className="bg-gradient-to-r from-red-500 to-rose-500 h-2.5 rounded-full" style={{ width: `${probability}%` }}></div>
                                    </div>
                                    <span>{probability.toFixed(2)}%</span>
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