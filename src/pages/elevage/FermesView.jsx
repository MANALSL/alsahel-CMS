import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Building2, ChevronRight, Plus, Home, Building, Grid3x3, Edit2, X } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const FermesView = () => {
    const navigate = useNavigate();
    const [showCreateMenu, setShowCreateMenu] = useState(false);
    const [editingFerme, setEditingFerme] = useState(null);
    const [editForm, setEditForm] = useState({ name: '', lot: '' });

    // Generate 10 fermes for demonstration
    const [fermes, setFermes] = useState(
        Array.from({ length: 10 }, (_, i) => ({
            id: i + 1,
            name: `Ferme ${i + 1}`,
            batiments: 5, // Number of buildings in this farm
            lot: `LOT-${String(i + 1).padStart(3, '0')}`
        }))
    );

    const handleFermeClick = (fermeId) => {
        navigate(`/elevage/ferme/${fermeId}`);
    };

    const handleEditClick = (e, ferme) => {
        e.stopPropagation();
        setEditingFerme(ferme);
        setEditForm({ name: ferme.name, lot: ferme.lot });
    };

    const handleSaveEdit = (e) => {
        e.preventDefault();
        setFermes(prev => prev.map(f =>
            f.id === editingFerme.id
                ? { ...f, name: editForm.name, lot: editForm.lot }
                : f
        ));
        setEditingFerme(null);
    };

    const handleCreateFerme = () => {
        alert('Créer une nouvelle Ferme');
        setShowCreateMenu(false);
    };

    const handleCreateBatiment = () => {
        alert('Créer un nouveau Bâtiment');
        setShowCreateMenu(false);
    };

    const handleCreateParc = () => {
        alert('Créer un nouveau Parc');
        setShowCreateMenu(false);
    };

    return (
        <div className="space-y-6 relative">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Gestion Élevage</h1>
                    <p className="text-sm text-gray-500">Sélectionnez une ferme pour continuer</p>
                </div>

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
                                        onClick={handleCreateFerme}
                                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                                    >
                                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                            <Home size={18} className="text-blue-600" />
                                        </div>
                                        <div className="text-left">
                                            <div className="font-medium">Nouvelle Ferme</div>
                                            <div className="text-xs text-gray-500">Créer une ferme</div>
                                        </div>
                                    </button>

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

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {fermes.map((ferme) => (
                    <Card
                        key={ferme.id}
                        className="group cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-2 border-transparent hover:border-blue-500"
                        onClick={() => handleFermeClick(ferme.id)}
                    >
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                                    <Building2 size={28} className="text-white" />
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={(e) => handleEditClick(e, ferme)}
                                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                        title="Modifier"
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                    <ChevronRight
                                        size={24}
                                        className="text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all"
                                    />
                                </div>
                            </div>

                            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                                {ferme.name}
                            </h3>

                            <p className="text-sm text-gray-600 mb-3">
                                <span className="font-medium">Lot:</span> {ferme.lot}
                            </p>

                            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                <span className="text-xs text-gray-500">Bâtiments</span>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    {ferme.batiments}
                                </span>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Edit Modal */}
            {editingFerme && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
                    <Card className="w-full max-w-md shadow-2xl relative">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-gray-900">Modifier la Ferme</h3>
                                <button
                                    onClick={() => setEditingFerme(null)}
                                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleSaveEdit} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Nom de la Ferme</label>
                                    <input
                                        type="text"
                                        value={editForm.name}
                                        onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                        placeholder="Ex: Ferme 1"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Lot</label>
                                    <input
                                        type="text"
                                        value={editForm.lot}
                                        onChange={(e) => setEditForm(prev => ({ ...prev, lot: e.target.value }))}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                        placeholder="Ex: LOT-001"
                                        required
                                    />
                                </div>

                                <div className="flex justify-end gap-3 pt-4">
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={() => setEditingFerme(null)}
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
        </div>
    );
};

export default FermesView;
