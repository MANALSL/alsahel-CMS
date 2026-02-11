import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { useMemo } from 'react';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const ParkPerformanceChart = ({ data, height = 200 }) => {
    // Sort data by date
    const sortedData = useMemo(() => {
        if (!data || data.length === 0) return [];
        return [...data].sort((a, b) => new Date(a.date) - new Date(b.date));
    }, [data]);

    const labels = sortedData.map(d => d.age || d.date);

    const chartData = {
        labels,
        datasets: [
            {
                label: 'Poids (g)',
                data: sortedData.map(d => parseFloat(d.poids_poule) || 0),
                borderColor: '#0284c7', // Blue
                backgroundColor: '#0284c7',
                borderWidth: 2,
                pointRadius: 4,
                yAxisID: 'yWeights',
                tension: 0.1,
            },
            {
                label: 'Poids guide (g)',
                data: sortedData.map(d => parseFloat(d.poids_guide) || 0),
                borderColor: '#ef4444', // Red
                backgroundColor: '#ef4444',
                borderWidth: 3,
                pointRadius: 4,
                pointStyle: 'rect',
                yAxisID: 'yWeights',
                tension: 0,
            },
            {
                label: 'Ration (g)',
                data: sortedData.map(d => parseFloat(d.aliment_poule) || 0),
                borderColor: '#f59e0b', // Yellow
                backgroundColor: '#f59e0b',
                borderWidth: 2,
                pointRadius: 4,
                pointStyle: 'rect',
                yAxisID: 'yOthers',
                tension: 0.1,
            },
            {
                label: 'Guide ration (g)',
                data: sortedData.map(d => parseFloat(d.aliment_guide) || 0),
                borderColor: '#65a30d', // Green
                backgroundColor: '#65a30d',
                borderWidth: 3,
                pointRadius: 4,
                pointStyle: 'diamond',
                yAxisID: 'yOthers',
                tension: 0,
            },
            {
                label: 'Homogénéité (%)',
                data: sortedData.map(d => parseFloat(d.homog_pct) || 0),
                borderColor: '#7c3aed', // Purple
                backgroundColor: '#7c3aed',
                borderWidth: 2,
                pointRadius: 4,
                yAxisID: 'yOthers',
                tension: 0.1,
            }
        ]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    usePointStyle: true,
                    boxWidth: 6,
                    font: { size: 10, weight: 'bold' },
                    padding: 10
                }
            },
            tooltip: {
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                titleColor: '#1f2937',
                bodyColor: '#4b5563',
                borderColor: '#e5e7eb',
                borderWidth: 1,
                padding: 10,
                boxPadding: 5,
                usePointStyle: true,
                callbacks: {
                    label: function (context) {
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed.y !== null) {
                            label += context.parsed.y + (context.dataset.label.includes('%') ? '%' : 'g');
                        }
                        return label;
                    }
                }
            }
        },
        scales: {
            x: {
                grid: { display: true, color: '#e5e7eb' },
                ticks: { font: { size: 10, weight: '500' }, color: '#6b7280' }
            },
            yWeights: {
                type: 'linear',
                display: true,
                position: 'left',
                beginAtZero: true,
                suggestedMax: 3600,
                grid: { color: '#e5e7eb' },
                title: { display: true, text: 'Poids (g)', font: { size: 11, weight: 'bold' }, color: '#374151' },
                ticks: { font: { size: 10 }, color: '#6b7280' }
            },
            yOthers: {
                type: 'linear',
                display: true,
                position: 'right',
                beginAtZero: true,
                suggestedMax: 140,
                grid: { drawOnChartArea: false },
                title: { display: true, text: 'Ration (g) / Homog (%)', font: { size: 11, weight: 'bold' }, color: '#374151' },
                ticks: { font: { size: 10 }, color: '#6b7280' }
            }
        },
        interaction: {
            intersect: false,
            mode: 'index',
        },
    };

    return (
        <div style={{ height: `${height}px` }} className="w-full">
            <Line data={chartData} options={options} />
        </div>
    );
};

export default ParkPerformanceChart;
