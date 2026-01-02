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
import Modal from '../components/ui/Modal';
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
    const [records, setRecords] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('records'); // 'records' | 'quantity' | 'fermes'
    const [chartData, setChartData] = useState({
        line: { labels: [], datasets: [] },
        bar: { labels: [], datasets: [] },
        mortality: { labels: [], datasets: [] },
    });

    useEffect(() => {
        const fetchData = async () => {
            const data = await elevageService.getElevages();

            setRecords(data);

            // Calculate Stats
            const totalEntries = data.length;
            const totalQuantity = data.reduce((acc, curr) => acc + Number(curr.quantite), 0);
            const uniqueLots = new Set(data.map(item => item.lot)).size;

            setStats({ totalEntries, totalQuantity, uniqueLots });

            // Prepare Chart Data
            // Group by date (assumes date strings)
            const dateMap = {};
            data.forEach(item => {
                if (!dateMap[item.date]) dateMap[item.date] = [];
                dateMap[item.date].push(item);
            });
            const sortedDates = Object.keys(dateMap).sort();

            // Weight & Homogeneity: average poids per date and homogeneity (%) per date
            const avgPoids = [];
            const homogeneity = [];
            sortedDates.forEach(date => {
                const rows = dateMap[date];
                const poidsVals = rows.map(r => Number(r.poids || 0)).filter(v => !isNaN(v));
                const mean = poidsVals.reduce((a, b) => a + b, 0) / (poidsVals.length || 1);
                const variance = poidsVals.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / (poidsVals.length || 1);
                const sd = Math.sqrt(variance);
                const homog = mean > 0 ? Math.max(0, Math.min(100, 100 - (sd / mean) * 100)) : 0;
                avgPoids.push(Math.round(mean));
                homogeneity.push(Math.round(homog * 10) / 10);
            });

            const weightData = {
                labels: sortedDates,
                datasets: [
                    {
                        label: 'Poids moyen (g)',
                        data: avgPoids,
                        borderColor: 'rgb(99, 102, 241)',
                        backgroundColor: 'rgba(99, 102, 241, 0.15)',
                        tension: 0.3,
                        yAxisID: 'y',
                    },
                    {
                        label: 'Homogénéité (%)',
                        data: homogeneity,
                        borderColor: 'rgb(16, 185, 129)',
                        backgroundColor: 'rgba(16, 185, 129, 0.15)',
                        tension: 0.3,
                        yAxisID: 'y1',
                    },
                ],
            };

            // Consumption: quantity per date + cumulative
            const quantities = sortedDates.map(date => dateMap[date].reduce((s, r) => s + Number(r.quantite || 0), 0));
            const cumulative = [];
            quantities.reduce((acc, cur, idx) => { const sum = acc + cur; cumulative[idx] = sum; return sum; }, 0);

            const consumptionData = {
                labels: sortedDates,
                datasets: [
                    {
                        label: 'Consommation (kg)',
                        data: quantities,
                        borderColor: 'rgb(14, 165, 233)',
                        backgroundColor: 'rgba(14, 165, 233, 0.15)',
                        tension: 0.3,
                    },
                    {
                        label: 'Consommation cumulée (kg)',
                        data: cumulative,
                        borderColor: 'rgb(236, 72, 153)',
                        backgroundColor: 'rgba(236, 72, 153, 0.15)',
                        tension: 0.3,
                    },
                ],
            };

            // Mortality: average mortalite per date and cumulative mortality
            const mortAvg = sortedDates.map(date => {
                const vals = dateMap[date].map(r => Number(r.mortalite || 0)).filter(v => !isNaN(v));
                const avg = vals.reduce((a, b) => a + b, 0) / (vals.length || 1);
                return Math.round(avg * 10) / 10;
            });
            const mortCumulative = [];
            mortAvg.reduce((acc, cur, idx) => { const sum = acc + cur; mortCumulative[idx] = Math.round(sum * 10) / 10; return sum; }, 0);

            const mortalityData = {
                labels: sortedDates,
                datasets: [
                    {
                        label: 'Mortalité (%)',
                        data: mortAvg,
                        borderColor: 'rgb(239, 68, 68)',
                        backgroundColor: 'rgba(239, 68, 68, 0.15)',
                        tension: 0.3,
                    },
                    {
                        label: 'Mortalité cumulée (%)',
                        data: mortCumulative,
                        borderColor: 'rgb(250, 204, 21)',
                        backgroundColor: 'rgba(250, 204, 21, 0.15)',
                        tension: 0.3,
                    },
                ],
            };

            setChartData({ weight: weightData, consumption: consumptionData, mortality: mortalityData });
            setLoading(false);
        };

        fetchData();
    }, []);

    if (loading) return <div className="p-10 text-center">Chargement du dashboard...</div>;

    const kpis = [
        { label: 'Total Enregistrements', value: stats.totalEntries, icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Quantité Totale (kg)', value: stats.totalQuantity.toLocaleString(), icon: Package, color: 'text-purple-600', bg: 'bg-purple-50' },
        { label: 'Fermes actifs', value: stats.uniqueLots, icon: Users, color: 'text-green-600', bg: 'bg-green-50' },
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
                    <Card
                        key={index}
                        className={`hover:shadow-lg transition-shadow cursor-pointer`}
                        onClick={() => {
                            if (kpi.label === 'Total Enregistrements') setModalType('records');
                            if (kpi.label === 'Quantité Totale (kg)') setModalType('quantity');
                            if (kpi.label === 'Fermes actifs') setModalType('fermes');
                            setShowModal(true);
                        }}
                        role="button"
                        aria-pressed={showModal}
                    >
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

            {/* Generic Modal for KPIs */}
            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={
                modalType === 'records' ? `Tous les enregistrements (${records.length})` :
                modalType === 'quantity' ? `Détails — Quantité totale: ${stats.totalQuantity.toLocaleString()} kg` :
                `Fermes actives (${stats.uniqueLots})`
            }>
                <div className="max-h-80 overflow-auto">
                    {modalType === 'records' && (
                        <table className="w-full text-sm table-auto border-collapse">
                            <thead>
                                <tr className="text-left text-gray-600">
                                    <th className="p-2 border-b">Date</th>
                                    <th className="p-2 border-b">Lot</th>
                                    <th className="p-2 border-b">Ferme</th>
                                    <th className="p-2 border-b">Aliment</th>
                                    <th className="p-2 border-b">Quantité</th>
                                    <th className="p-2 border-b">Poids</th>
                                    <th className="p-2 border-b">Mortalité</th>
                                    <th className="p-2 border-b">Observation</th>
                                </tr>
                            </thead>
                            <tbody>
                                {records.map((r) => (
                                    <tr key={r.id} className="odd:bg-gray-50">
                                        <td className="p-2 align-top border-b">{r.date}</td>
                                        <td className="p-2 align-top border-b">{r.lot}</td>
                                        <td className="p-2 align-top border-b">{r.ferme}</td>
                                        <td className="p-2 align-top border-b">{r.aliment}</td>
                                        <td className="p-2 align-top border-b">{r.quantite}</td>
                                        <td className="p-2 align-top border-b">{r.poids}</td>
                                        <td className="p-2 align-top border-b">{r.mortalite}</td>
                                        <td className="p-2 align-top border-b">{r.observation}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}

                    {modalType === 'quantity' && (
                        <div>
                            <div className="mb-4 text-sm text-gray-700">Total quantité: <strong>{stats.totalQuantity.toLocaleString()} kg</strong></div>
                            <table className="w-full text-sm table-auto border-collapse">
                                <thead>
                                    <tr className="text-left text-gray-600">
                                        <th className="p-2 border-b">Date</th>
                                        <th className="p-2 border-b">Lot</th>
                                        <th className="p-2 border-b">Ferme</th>
                                        <th className="p-2 border-b">Quantité</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {records.slice().sort((a,b) => Number(b.quantite) - Number(a.quantite)).map(r => (
                                        <tr key={r.id} className="odd:bg-gray-50">
                                            <td className="p-2 align-top border-b">{r.date}</td>
                                            <td className="p-2 align-top border-b">{r.lot}</td>
                                            <td className="p-2 align-top border-b">{r.ferme}</td>
                                            <td className="p-2 align-top border-b">{r.quantite}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {modalType === 'fermes' && (
                        <div>
                            <table className="w-full text-sm table-auto border-collapse">
                                <thead>
                                    <tr className="text-left text-gray-600">
                                        <th className="p-2 border-b">Ferme</th>
                                        <th className="p-2 border-b">Nombre d'enregistrements</th>
                                        <th className="p-2 border-b">Quantité totale</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(() => {
                                        const map = {};
                                        records.forEach(r => {
                                            if (!map[r.ferme]) map[r.ferme] = { count: 0, qty: 0 };
                                            map[r.ferme].count += 1;
                                            map[r.ferme].qty += Number(r.quantite || 0);
                                        });
                                        return Object.keys(map).map(f => (
                                            <tr key={f} className="odd:bg-gray-50">
                                                <td className="p-2 align-top border-b">{f}</td>
                                                <td className="p-2 align-top border-b">{map[f].count}</td>
                                                <td className="p-2 align-top border-b">{map[f].qty}</td>
                                            </tr>
                                        ));
                                    })()}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </Modal>

            {/* Charts */}
            <div className="grid gap-6 md:grid-cols-2">
                <Card className="p-4">
                    <CardHeader>
                            <CardTitle className="text-gray-700 flex items-center gap-2">
                                <TrendingUp size={20} />
                                EVOLUTION DU POIDS ET HOMOGENEITE
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="h-80">
                            <Line
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: { legend: { position: 'top' } },
                                    scales: {
                                        y: { type: 'linear', position: 'left', title: { display: true, text: 'Poids (g)' } },
                                        y1: { type: 'linear', position: 'right', grid: { drawOnChartArea: false }, title: { display: true, text: 'Homogénéité (%)' } },
                                    },
                                }}
                                data={chartData.weight}
                            />
                        </CardContent>
                </Card>

                <Card className="p-4">
                    <CardHeader>
                            <CardTitle className="text-gray-700 flex items-center gap-2">
                                <Package size={20} />
                                EVOLUTION DE LA CONSOMMATION
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="h-80">
                            <Line
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: { legend: { position: 'top' } },
                                    scales: { y: { title: { display: true, text: 'Quantité (kg)' } } },
                                }}
                                data={chartData.consumption}
                            />
                        </CardContent>
                </Card>
            </div>

            {/* Mortality chart placed at the bottom */}
            <div className="mt-6">
                <Card className="p-4">
                    <CardHeader>
                        <CardTitle className="text-gray-700 flex items-center gap-2">
                            <TrendingUp size={20} />
                            EVOLUTION DE LA MORTALITE
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="h-64">
                        <Line options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top' } } }} data={chartData.mortality} />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Dashboard;
