import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ProbabilityMap } from '../types';

interface AnimatedPieChartProps {
    data: ProbabilityMap;
}

const COLORS = ['#ef4444', '#f97316', '#84cc16', '#22c55e', '#14b8a6', '#06b6d4', '#6366f1', '#a855f7'];

const CustomTooltip: React.FC<any> = ({ active, payload }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-gray-800 p-2 border border-gray-700 rounded-md shadow-lg">
                <p className="label text-white">{`${payload[0].name} : ${payload[0].value.toFixed(2)}%`}</p>
            </div>
        );
    }
    return null;
};

const AnimatedPieChart: React.FC<AnimatedPieChartProps> = ({ data }) => {
    const chartData = Object.entries(data).map(([name, value]) => ({ name, value }));

    if(chartData.length === 0) {
        return <div className="flex items-center justify-center h-full text-gray-500">No data available</div>;
    }

    return (
        <ResponsiveContainer width="100%" height="100%">
            <PieChart>
                <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius="80%"
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    isAnimationActive={true}
                    animationDuration={800}
                >
                    {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} className="focus:outline-none" />
                    ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }} />
                <Legend iconSize={10} wrapperStyle={{fontSize: '12px'}} />
            </PieChart>
        </ResponsiveContainer>
    );
};

export default AnimatedPieChart;
