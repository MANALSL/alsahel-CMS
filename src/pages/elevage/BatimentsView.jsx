import { useNavigate, useParams } from 'react-router-dom';
import { useState } from 'react';
import { Warehouse, ChevronRight, Plus, Building, Grid3x3, Edit2, X } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import Breadcrumb from '../../components/ui/Breadcrumb';
import Button from '../../components/ui/Button';

const BatimentsView = () => {
    const navigate = useNavigate();
    const { fermeId } = useParams();
    const [showCreateMenu, setShowCreateMenu] = useState(false);
    const [showSummary, setShowSummary] = useState(false);
    const [editingBatiment, setEditingBatiment] = useState(null);
    const [editForm, setEditForm] = useState({ name: '', lot: '' });

    // Generate 8 batiments for demonstration
    const [batiments, setBatiments] = useState(
        Array.from({ length: 8 }, (_, i) => ({
            id: i + 1,
            name: `Bâtiment ${i + 1}`,
            parcs: 5, // Number of parks in this building
            capacity: `${(i + 1) * 1000} têtes`,
            status: i % 3 === 0 ? 'Actif' : i % 3 === 1 ? 'En production' : 'Maintenance',
            lot: `LOT-${String(fermeId).padStart(3, '0')}-B${String(i + 1).padStart(2, '0')}`
        }))
    );

    // Generate summary data for all parcs across all batiments
    const summaryData = batiments.flatMap(bat =>
        Array.from({ length: bat.parcs }, (_, i) => ({
            batiment: bat.id,
            parc: i + 1,
            effectif: Math.floor(Math.random() * 500) + 200,
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
            obsevt: i % 3 === 0 ? 'RAS' : ''
        }))
    );

    const handleBatimentClick = (batimentId) => {
        navigate(`/elevage/ferme/${fermeId}/batiment/${batimentId}`);
    };

    const handleEditClick = (e, batiment) => {
        e.stopPropagation();
        setEditingBatiment(batiment);
        setEditForm({ name: batiment.name, lot: batiment.lot });
    };

    const handleSaveEdit = (e) => {
        e.preventDefault();
        setBatiments(prev => prev.map(b =>
            b.id === editingBatiment.id
                ? { ...b, name: editForm.name, lot: editForm.lot }
                : b
        ));
        setEditingBatiment(null);
    };

    const handleCreateBatiment = () => {
        alert('Créer un nouveau Bâtiment');
        setShowCreateMenu(false);
    };

    const handleCreateParc = () => {
        alert('Créer un nouveau Parc');
        setShowCreateMenu(false);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Actif':
                return 'bg-green-100 text-green-800';
            case 'En production':
                return 'bg-blue-100 text-blue-800';
            case 'Maintenance':
                return 'bg-orange-100 text-orange-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="space-y-6 relative">
            <Breadcrumb
                items={[
                    { label: `Ferme ${fermeId}`, link: `/elevage` }
                ]}
            />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Ferme {fermeId}</h1>
                    <p className="text-sm text-gray-500">Sélectionnez un bâtiment pour continuer</p>
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        variant="secondary"
                        onClick={() => setShowSummary(!showSummary)}
                        className="flex items-center gap-2"
                    >
                        <Warehouse size={18} />
                        {showSummary ? 'Masquer le résumé' : 'Voir le résumé'}
                    </Button>

                    {/* Create Actions Dropdown */}
                    <div className="relative">
                        <Button
                            onClick={() => setShowCreateMenu(!showCreateMenu)}
                            className="flex items-center gap-2"
                        >
                            <Plus size={20} />
                            Créer
                        </Button>

                        {showCreateMenu && (
                            <>
                                {/* Backdrop */}
                                <div
                                    className="fixed inset-0 z-10"
                                    onClick={() => setShowCreateMenu(false)}
                                />

                                {/* Dropdown Menu */}
                                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-20 overflow-hidden">
                                    <div className="py-1">
                                        <button
                                            onClick={handleCreateBatiment}
                                            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors"
                                        >
                                            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                                <Building size={18} className="text-green-600" />
                                            </div>
                                            <div className="text-left">
                                                <div className="font-medium">Nouveau Bâtiment</div>
                                                <div className="text-xs text-gray-500">Ajouter un bâtiment</div>
                                            </div>
                                        </button>

                                        <button
                                            onClick={handleCreateParc}
                                            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors"
                                        >
                                            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                                <Grid3x3 size={18} className="text-purple-600" />
                                            </div>
                                            <div className="text-left">
                                                <div className="font-medium">Nouveau Parc</div>
                                                <div className="text-xs text-gray-500">Créer un parc</div>
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Batiment Cards */}
            <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Sélectionner un Bâtiment</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {batiments.map((batiment) => (
                        <Card
                            key={batiment.id}
                            className="group cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-2 border-transparent hover:border-emerald-500"
                            onClick={() => handleBatimentClick(batiment.id)}
                        >
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                                        <Warehouse size={28} className="text-white" />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={(e) => handleEditClick(e, batiment)}
                                            className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                                            title="Modifier"
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                        <ChevronRight
                                            size={24}
                                            className="text-gray-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all"
                                        />
                                    </div>
                                </div>

                                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-emerald-600 transition-colors">
                                    {batiment.name}
                                </h3>

                                <div className="space-y-2 mb-3">
                                    <p className="text-sm text-gray-600">
                                        <span className="font-medium">Lot:</span> {batiment.lot}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        Capacité: <span className="font-medium">{batiment.capacity}</span>
                                    </p>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(batiment.status)}`}>
                                        {batiment.status}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                    <span className="text-xs text-gray-500">Parcs</span>
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                                        {batiment.parcs}
                                    </span>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Edit Modal */}
            {editingBatiment && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
                    <Card className="w-full max-w-md shadow-2xl relative">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-gray-900">Modifier le Bâtiment</h3>
                                <button
                                    onClick={() => setEditingBatiment(null)}
                                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleSaveEdit} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Nom du Bâtiment</label>
                                    <input
                                        type="text"
                                        value={editForm.name}
                                        onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                                        placeholder="Ex: Bâtiment A"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Lot</label>
                                    <input
                                        type="text"
                                        value={editForm.lot}
                                        onChange={(e) => setEditForm(prev => ({ ...prev, lot: e.target.value }))}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                                        placeholder="Ex: LOT-001"
                                        required
                                    />
                                </div>

                                <div className="flex justify-end gap-3 pt-4">
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={() => setEditingBatiment(null)}
                                    >
                                        Annuler
                                    </Button>
                                    <Button type="submit">
                                        Enregistrer
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </Card>
                </div>
            )}

            {/* Global Summary Table */}
            {showSummary && (
                <Card className="animate-fadeIn">
                    <div className="p-4 border-b border-gray-100">
                        <h2 className="text-lg font-semibold text-gray-900">Vue d'ensemble - Tous les Parcs</h2>
                        <p className="text-sm text-gray-500">Informations globales pour tous les parcs de la ferme</p>
                    </div>
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-sm border-collapse">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                <tr>
                                    <th rowSpan="2" className="px-3 py-3 border border-gray-300 font-medium text-center bg-blue-50">BAT</th>
                                    <th rowSpan="2" className="px-3 py-3 border border-gray-300 font-medium text-center bg-blue-50">PARCS</th>
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

export default BatimentsView;
