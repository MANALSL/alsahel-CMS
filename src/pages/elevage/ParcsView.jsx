import { useNavigate, useParams } from 'react-router-dom';
import { useState } from 'react';
import { Grid3x3, ChevronRight, Plus } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import Breadcrumb from '../../components/ui/Breadcrumb';
import Button from '../../components/ui/Button';

const ParcsView = () => {
    const navigate = useNavigate();
    const { fermeId, batimentId } = useParams();
    const [showCreateMenu, setShowCreateMenu] = useState(false);
    const [showSummary, setShowSummary] = useState(false);

    // Generate exactly 5 parcs as requested
    const parcs = Array.from({ length: 5 }, (_, i) => ({
        id: i + 1,
        name: `Parc ${i + 1}`,
        animals: Math.floor(Math.random() * 500) + 200,
        age: `${Math.floor(Math.random() * 20) + 5} semaines`,
        health: i % 2 === 0 ? 'Excellent' : 'Bon',
        lot: `LOT-${String(fermeId).padStart(3, '0')}-B${String(batimentId).padStart(2, '0')}-P${i + 1}`
    }));

    const handleParcClick = (parcId) => {
        navigate(`/elevage/ferme/${fermeId}/batiment/${batimentId}/parc/${parcId}`);
    };

    const handleCreateParc = () => {
        alert('Créer un nouveau Parc');
        setShowCreateMenu(false);
    };

    // Generate summary data for all parcs in this batiment
    const summaryData = parcs.map(parc => ({
        batiment: batimentId,
        parc: parc.id,
        effectif: parc.animals,
        poids_precedent: Math.floor(Math.random() * 100) + 50,
        poids_actuel: Math.floor(Math.random() * 100) + 60,
        poids_gain: Math.floor(Math.random() * 20) + 5,
        guide: Math.floor(Math.random() * 100) + 50,
        homog_pct: (Math.random() * 10 + 85).toFixed(1),
        ration_actuel: Math.floor(Math.random() * 50) + 30,
        ration_diff: Math.floor(Math.random() * 10) - 5,
        ration_proch: Math.floor(Math.random() * 50) + 35,
        tps_consmt: Math.floor(Math.random() * 60) + 30,
        mort_pct: (Math.random() * 5).toFixed(1),
        obsevt: parc.id % 3 === 0 ? 'RAS' : ''
    }));

    const getHealthColor = (health) => {
        switch (health) {
            case 'Excellent':
                return 'bg-green-100 text-green-800';
            case 'Bon':
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="space-y-6">
            <Breadcrumb
                items={[
                    { label: `Ferme ${fermeId}`, link: `/elevage` },
                    { label: `Bâtiment ${batimentId}`, link: `/elevage/ferme/${fermeId}` }
                ]}
            />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                        Ferme {fermeId} - Bâtiment {batimentId}
                    </h1>
                    <p className="text-sm text-gray-500">Vue d'ensemble des parcs de ce bâtiment</p>
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        variant="secondary"
                        onClick={() => setShowSummary(!showSummary)}
                        className="flex items-center gap-2"
                    >
                        <Grid3x3 size={18} />
                        {showSummary ? 'Masquer le résumé' : 'Voir le résumé'}
                    </Button>

                    {/* Create Parc Button */}
                    <Button
                        onClick={handleCreateParc}
                        className="flex items-center gap-2"
                    >
                        <Plus size={20} />
                        Créer un Parc
                    </Button>
                </div>
            </div>

            {/* Parcs Grid */}
            <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Cartes des Parcs</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                    {parcs.map((parc) => (
                        <Card
                            key={parc.id}
                            className="group cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-2 border-transparent hover:border-purple-500"
                            onClick={() => handleParcClick(parc.id)}
                        >
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                                        <Grid3x3 size={28} className="text-white" />
                                    </div>
                                    <ChevronRight
                                        size={24}
                                        className="text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all"
                                    />
                                </div>

                                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-purple-600 transition-colors">
                                    {parc.name}
                                </h3>

                                <div className="space-y-2 mb-3">
                                    <p className="text-xs text-gray-600 mb-2">
                                        <span className="font-medium">Lot:</span> {parc.lot}
                                    </p>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-gray-500">Animaux</span>
                                        <span className="text-sm font-semibold text-gray-900">{parc.animals}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-gray-500">Âge</span>
                                        <span className="text-sm font-medium text-gray-700">{parc.age}</span>
                                    </div>
                                </div>

                                <div className="pt-3 border-t border-gray-100">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getHealthColor(parc.health)}`}>
                                        {parc.health}
                                    </span>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Global Summary Table */}
            {showSummary && (
                <Card className="animate-fadeIn">
                    <div className="p-4 border-b border-gray-100">
                        <h2 className="text-lg font-semibold text-gray-900">Tableau de bord - Parcs du Bâtiment {batimentId}</h2>
                        <p className="text-sm text-gray-500">Données consolidées pour tous les parcs</p>
                    </div>
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-sm border-collapse">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                <tr>
                                    <th rowSpan="2" className="px-3 py-3 border border-gray-300 font-medium text-center bg-blue-50">BAT</th>
                                    <th rowSpan="2" className="px-3 py-3 border border-gray-300 font-medium text-center bg-blue-50">PARKS</th>
                                    <th rowSpan="2" className="px-3 py-3 border border-gray-300 font-medium text-center">EFFECTIF</th>
                                    <th colSpan="4" className="px-3 py-3 border border-gray-300 font-medium text-center bg-yellow-50">POIDS(g)</th>
                                    <th rowSpan="2" className="px-3 py-3 border border-gray-300 font-medium text-center">Guide</th>
                                    <th rowSpan="2" className="px-3 py-3 border border-gray-300 font-medium text-center">HOMOG %</th>
                                    <th colSpan="3" className="px-3 py-3 border border-gray-300 font-medium text-center bg-green-50">RATION(g)</th>
                                    <th rowSpan="2" className="px-3 py-3 border border-gray-300 font-medium text-center">TPS CONSMT</th>
                                    <th rowSpan="2" className="px-3 py-3 border border-gray-300 font-medium text-center bg-red-50">MORT %</th>
                                    <th rowSpan="2" className="px-3 py-3 border border-gray-300 font-medium text-center">OBSEVT</th>
                                </tr>
                                <tr>
                                    <th className="px-2 py-2 border border-gray-300 font-medium text-center bg-yellow-50 text-[10px]">PRECEDENT</th>
                                    <th className="px-2 py-2 border border-gray-300 font-medium text-center bg-yellow-50 text-[10px]">ACTUEL</th>
                                    <th className="px-2 py-2 border border-gray-300 font-medium text-center bg-yellow-50 text-[10px]">GAIN</th>
                                    <th className="px-2 py-2 border border-gray-300 font-medium text-center bg-yellow-50 text-[10px]">ECRT/GUID</th>
                                    <th className="px-2 py-2 border border-gray-300 font-medium text-center bg-green-50 text-[10px]">ACTUEL</th>
                                    <th className="px-2 py-2 border border-gray-300 font-medium text-center bg-green-50 text-[10px]">DIFF</th>
                                    <th className="px-2 py-2 border border-gray-300 font-medium text-center bg-green-50 text-[10px]">PROCH</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {summaryData.map((row, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-3 py-2 border border-gray-200 text-center font-semibold bg-blue-50">{row.batiment}</td>
                                        <td className="px-3 py-2 border border-gray-200 text-center font-semibold bg-blue-50">{row.parc}</td>
                                        <td className="px-3 py-2 border border-gray-200 text-center font-mono">{row.effectif}</td>
                                        <td className="px-2 py-2 border border-gray-200 text-center font-mono text-xs">{row.poids_precedent}</td>
                                        <td className="px-2 py-2 border border-gray-200 text-center font-mono text-xs">{row.poids_actuel}</td>
                                        <td className="px-2 py-2 border border-gray-200 text-center font-mono text-xs text-green-600">+{row.poids_gain}</td>
                                        <td className="px-2 py-2 border border-gray-200 text-center font-mono text-xs">{row.guide}</td>
                                        <td className="px-3 py-2 border border-gray-200 text-center font-mono">{row.homog_pct}%</td>
                                        <td className="px-2 py-2 border border-gray-200 text-center font-mono text-xs">{row.ration_actuel}</td>
                                        <td className="px-2 py-2 border border-gray-200 text-center font-mono text-xs">{row.ration_diff > 0 ? `+${row.ration_diff}` : row.ration_diff}</td>
                                        <td className="px-2 py-2 border border-gray-200 text-center font-mono text-xs">{row.ration_proch}</td>
                                        <td className="px-3 py-2 border border-gray-200 text-center font-mono">{row.tps_consmt} min</td>
                                        <td className="px-3 py-2 border border-gray-200 text-center font-mono text-red-600">{row.mort_pct}%</td>
                                        <td className="px-3 py-2 border border-gray-200 text-center text-xs">{row.obsevt}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}
        </div>
    );
};

export default ParcsView;
