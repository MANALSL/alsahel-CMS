import { useState, useEffect, useMemo } from 'react';
import { elevageService } from '../services/elevageService';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import { Card, CardContent } from '../components/ui/Card';
import ElevageForm from '../components/forms/ElevageForm';
import { Plus, Search, Edit2, Trash2, ChevronLeft, ChevronRight, ArrowUpDown } from 'lucide-react';
import { clsx } from 'clsx';

const Elevage = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    // Modal States
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    const fetchData = async () => {
        setLoading(true);
        const result = await elevageService.getElevages();
        setData(result);
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Filter & Sort
    const processedData = useMemo(() => {
        let filtered = data.filter(item =>
            item.lot.toLowerCase().includes(search.toLowerCase()) ||
            item.date.includes(search)
        );

        if (sortConfig.key) {
            filtered.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
                if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return filtered;
    }, [data, search, sortConfig]);

    // Pagination
    const totalPages = Math.ceil(processedData.length / itemsPerPage);
    const paginatedData = processedData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handleSort = (key) => {
        setSortConfig(current => ({
            key,
            direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const handleSave = async (formData) => {
        if (editingItem) {
            await elevageService.updateElevage(editingItem.id, formData);
        } else {
            await elevageService.createElevage(formData);
        }
        await fetchData();
        setIsFormOpen(false);
        setEditingItem(null);
    };

    const handleDelete = async () => {
        if (itemToDelete) {
            await elevageService.deleteElevage(itemToDelete.id);
            await fetchData();
            setIsDeleteOpen(false);
            setItemToDelete(null);
        }
    };

    const openEdit = (item) => {
        setEditingItem(item);
        setIsFormOpen(true);
    };

    const openDelete = (item) => {
        setItemToDelete(item);
        setIsDeleteOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Gestion Élevage</h1>
                    <p className="text-sm text-gray-500">Gérez les rations et consommations</p>
                </div>
                <Button onClick={() => { setEditingItem(null); setIsFormOpen(true); }}>
                    <Plus size={20} className="mr-2" />
                    Nouvelle Fiche
                </Button>
            </div>

            <Card>
                <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between items-center">
                    <div className="relative w-full sm:w-72">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <Input
                            placeholder="Rechercher par lot ou date..."
                            className="pl-10"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                        <div className="flex items-center gap-3">
                            <div className="text-sm text-gray-500">{processedData.length} enregistrement(s)</div>
                            <div className="flex items-center gap-2">
                                <Button variant="secondary" size="sm" onClick={async () => { await elevageService.exportElevages(); }}>
                                    Exporter Excel
                                </Button>
                                <input
                                    type="file"
                                    id="elevageImportInput"
                                    accept=".xlsx,.xls,.csv"
                                    className="hidden"
                                    onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (!file) return;
                                        const res = await elevageService.importElevages(file);
                                        if (res?.success) {
                                            await fetchData();
                                            window.alert(`${res.imported} ligne(s) importées`);
                                        } else {
                                            window.alert(res?.message || 'Échec de l\'import');
                                        }
                                        e.target.value = '';
                                    }}
                                />
                                <Button variant="ghost" size="sm" onClick={() => document.getElementById('elevageImportInput').click()}>
                                    Importer Excel
                                </Button>
                            </div>
                        </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50/50">
                            <tr>
                                {['date', 'lot', 'aliment', 'quantite'].map((key) => (
                                    <th key={key} className="px-6 py-4 font-medium cursor-pointer hover:bg-gray-100" onClick={() => handleSort(key)}>
                                        <div className="flex items-center gap-1">
                                            {key.charAt(0).toUpperCase() + key.slice(1)}
                                            <ArrowUpDown size={14} className="text-gray-400" />
                                        </div>
                                    </th>
                                ))}
                                <th className="px-6 py-4 font-medium">Observation</th>
                                <th className="px-6 py-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr><td colSpan="6" className="p-8 text-center text-gray-500">Chargement...</td></tr>
                            ) : paginatedData.length === 0 ? (
                                <tr><td colSpan="6" className="p-8 text-center text-gray-500">Aucune donnée trouvée</td></tr>
                            ) : (
                                paginatedData.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900">{item.date}</td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                {item.lot}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">{item.aliment}</td>
                                        <td className="px-6 py-4 font-mono font-medium">{item.quantite} kg</td>
                                        <td className="px-6 py-4 text-gray-500 truncate max-w-xs">{item.observation || '-'}</td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            <button onClick={() => openEdit(item)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                                <Edit2 size={18} />
                                            </button>
                                            <button onClick={() => openDelete(item)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="p-4 border-t border-gray-100 flex items-center justify-between">
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                        >
                            <ChevronLeft size={16} className="mr-1" /> Précédent
                        </Button>
                        <span className="text-sm text-gray-600">
                            Page {currentPage} sur {totalPages}
                        </span>
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                        >
                            Suivant <ChevronRight size={16} className="ml-1" />
                        </Button>
                    </div>
                )}
            </Card>

            {/* Forms Modal */}
            <Modal
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                title={editingItem ? "Modifier l'enregistrement" : "Nouvel enregistrement"}
            >
                <ElevageForm
                    initialData={editingItem}
                    onSubmit={handleSave}
                    onCancel={() => setIsFormOpen(false)}
                />
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={isDeleteOpen}
                onClose={() => setIsDeleteOpen(false)}
                title="Confirmer la suppression"
            >
                <div className="space-y-4">
                    <p className="text-gray-600">
                        Êtes-vous sûr de vouloir supprimer cet enregistrement du lot <strong>{itemToDelete?.lot}</strong> ?
                        Cette action est irréversible.
                    </p>
                    <div className="flex justify-end gap-3">
                        <Button variant="secondary" onClick={() => setIsDeleteOpen(false)}>Annuler</Button>
                        <Button variant="danger" onClick={handleDelete}>Supprimer</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Elevage;
