import { useEffect, useState } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { elevageService } from '../services/elevageService';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Users, Package, Activity, TrendingUp } from 'lucide-react';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const Dashboard = () => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalEntries: 0,
        totalQuantity: 0,
        uniqueLots: 0,
    });
    const [chartData, setChartData] = useState({
        line: { labels: [], datasets: [] },
        bar: { labels: [], datasets: [] },
    });

    useEffect(() => {
        const fetchData = async () => {
            const data = await elevageService.getElevages();

            // Calculate Stats
            const totalEntries = data.length;
            const totalQuantity = data.reduce((acc, curr) => acc + Number(curr.quantite), 0);
            const uniqueLots = new Set(data.map(item => item.lot)).size;

            setStats({ totalEntries, totalQuantity, uniqueLots });

            // Prepare Chart Data
            // Line Chart: Quantity over Date
            const dateMap = {};
            data.forEach(item => {
                if (!dateMap[item.date]) dateMap[item.date] = 0;
                dateMap[item.date] += Number(item.quantite);
            });
            const sortedDates = Object.keys(dateMap).sort();

            const lineData = {
                labels: sortedDates,
                datasets: [
                    {
                        label: 'Quantité Consommée (kg)',
                        data: sortedDates.map(date => dateMap[date]),
                        borderColor: 'rgb(14, 165, 233)',
                        backgroundColor: 'rgba(14, 165, 233, 0.5)',
                        tension: 0.3,
                    },
                ],
            };

            // Bar Chart: Quantity per Lot
            const lotMap = {};
            data.forEach(item => {
                if (!lotMap[item.lot]) lotMap[item.lot] = 0;
                lotMap[item.lot] += Number(item.quantite);
            });
            const lots = Object.keys(lotMap);

            const barData = {
                labels: lots,
                datasets: [
                    {
                        label: 'Quantité par Lot',
                        data: lots.map(lot => lotMap[lot]),
                        backgroundColor: 'rgba(139, 92, 246, 0.8)',
                    },
                ],
            };

            setChartData({ line: lineData, bar: barData });
            setLoading(false);
        };

        fetchData();
    }, []);

    if (loading) return <div className="p-10 text-center">Chargement du dashboard...</div>;

    const kpis = [
        { label: 'Total Enregistrements', value: stats.totalEntries, icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Quantité Totale (kg)', value: stats.totalQuantity.toLocaleString(), icon: Package, color: 'text-purple-600', bg: 'bg-purple-50' },
        { label: 'Lots Actifs', value: stats.uniqueLots, icon: Users, color: 'text-green-600', bg: 'bg-green-50' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h1>
                <div className="text-sm text-gray-500">Aperçu général de l'activité</div>
            </div>

            {/* KPIs */}
            <div className="grid gap-4 md:grid-cols-3">
                {kpis.map((kpi, index) => (
                    <Card key={index} className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-6 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">{kpi.label}</p>
                                <h3 className="text-2xl font-bold mt-2">{kpi.value}</h3>
                            </div>
                            <div className={`p-3 rounded-full ${kpi.bg}`}>
                                <kpi.icon className={`h-6 w-6 ${kpi.color}`} />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Charts */}
            <div className="grid gap-6 md:grid-cols-2">
                <Card className="p-4">
                    <CardHeader>
                        <CardTitle className="text-gray-700 flex items-center gap-2">
                            <TrendingUp size={20} />
                            Consommation dans le temps
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Line options={{ responsive: true, plugins: { legend: { position: 'top' } } }} data={chartData.line} />
                    </CardContent>
                </Card>

                <Card className="p-4">
                    <CardHeader>
                        <CardTitle className="text-gray-700 flex items-center gap-2">
                            <Package size={20} />
                            Consommation par Lot
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Bar options={{ responsive: true, plugins: { legend: { position: 'top' } } }} data={chartData.bar} />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Dashboard;
