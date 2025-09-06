import React, { useState, useCallback } from 'react';
import { PieChart, Pie, Tooltip, ResponsiveContainer, Sector } from 'recharts';
import { ProbabilityMap } from '../types';

interface AnimatedPieChartProps {
    data: ProbabilityMap;
}

// eslint-disable-next-line react-refresh/only-export-components
export const COLORS = ['#ef4444', '#f97316', '#84cc16', '#22c55e', '#14b8a6', '#06b6d4', '#6366f1', '#a855f7'];

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
  }>;
}

const CustomTooltip: React.FC<TooltipProps> = ({ active, payload }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-gray-900/80 backdrop-blur-sm p-3 border border-gray-700 rounded-lg shadow-2xl shadow-black/50">
                <p className="label text-white font-bold">{`${payload[0].name}`}</p>
                <p className="intro text-gray-300">{`Probability: ${payload[0].value.toFixed(2)}%`}</p>
            </div>
        );
    }
    return null;
};

// This custom component renders the active sector with a "pop-out" effect.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ActiveShape = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, stroke, strokeWidth } = props;
    
    return (
        <g>
            <Sector
                cx={cx}
                cy={cy}
                innerRadius={innerRadius}
                outerRadius={outerRadius + 6}
                startAngle={startAngle}
                endAngle={endAngle}
                fill={fill}
                stroke={stroke || '#1f2937'}
                strokeWidth={strokeWidth || 2}
                style={{
                    filter: `drop-shadow(0px 2px 6px ${fill}80)`,
                    transition: 'all 0.3s ease-in-out',
                }}
            />
        </g>
    );
};

const AnimatedPieChart: React.FC<AnimatedPieChartProps> = ({ data }) => {
    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    const chartData = Object.entries(data)
        .sort(([, a], [, b]) => (b as number) - (a as number))
        .map(([name, value], index) => ({
            name,
            value,
            fill: COLORS[index % COLORS.length],
    }));

    const onPieEnter = useCallback((_: unknown, index: number) => {
        setActiveIndex(index);
    }, [setActiveIndex]);
    
    const onPieLeave = useCallback(() => {
        setActiveIndex(null);
    }, [setActiveIndex]);

    if(chartData.length === 0) {
        return <div className="flex items-center justify-center h-full text-gray-500">No data available</div>;
    }

    return (
        <ResponsiveContainer width="100%" height="100%">
            <PieChart>
                 <Pie
                    // @ts-expect-error - activeIndex prop exists but not in types
                    activeIndex={activeIndex ?? -1}
                    activeShape={ActiveShape}
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    outerRadius="80%"
                    dataKey="value"
                    nameKey="name"
                    onMouseEnter={onPieEnter}
                    onMouseLeave={onPieLeave}
                    paddingAngle={3}
                    stroke="#1f2937"
                    strokeWidth={2}
                >
                </Pie>
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
            </PieChart>
        </ResponsiveContainer>
    );
};

export default AnimatedPieChart;