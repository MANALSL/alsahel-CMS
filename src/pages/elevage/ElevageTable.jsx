import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { elevageService } from '../../services/elevageService';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import { Card } from '../../components/ui/Card';
import ElevageForm from '../../components/forms/ElevageForm';
import Breadcrumb from '../../components/ui/Breadcrumb';
import { Plus, Search, Edit2, Trash2, ChevronLeft, ChevronRight, ArrowUpDown, FileSpreadsheet } from 'lucide-react';

const ElevageTable = () => {
    const { fermeId, batimentId, parcId } = useParams();
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
    const [showHistory, setShowHistory] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        const result = await elevageService.getElevages();
        setData(result);
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const deletedCount = data.filter(d => d.deleted).length;

    // Filter & Sort
    const processedData = useMemo(() => {
        const term = search.toLowerCase();
        let filtered = data.filter(item =>
            !item.deleted && (
                (item.lot || '').toLowerCase().includes(term) ||
                (item.date || '').includes(search) ||
                (item.ferme || '').toLowerCase().includes(term)
            )
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
        const payload = {
            ...formData,
            jrs: Number(formData.jrs || 0),
            effectif_coq: Number(formData.effectif_coq || 0),
            effectif_poule: Number(formData.effectif_poule || 0),
            ratio_cp: Number(formData.ratio_cp || 0),
            mort_coq_n: Number(formData.mort_coq_n || 0),
            mort_coq_pct: Number(formData.mort_coq_pct || 0),
            mort_poule_n: Number(formData.mort_poule_n || 0),
            mort_poule_pct: Number(formData.mort_poule_pct || 0),
            mort_semaine_coq: Number(formData.mort_semaine_coq || 0),
            mort_semaine_poule: Number(formData.mort_semaine_poule || 0),
            triage_coq_reserve: Number(formData.triage_coq_reserve || 0),
            triage_coq_dechet: Number(formData.triage_coq_dechet || 0),
            triage_poule_dechet: Number(formData.triage_poule_dechet || 0),
            triage_poule_couv: Number(formData.triage_poule_couv || 0),
            cumul_mort_c: Number(formData.cumul_mort_c || 0),
            cumul_mort_p: Number(formData.cumul_mort_p || 0),
            aliment_coq: Number(formData.aliment_coq || 0),
            aliment_poule: Number(formData.aliment_poule || 0),
        };

        if (editingItem) {
            await elevageService.updateElevage(editingItem.id, payload);
        } else {
            await elevageService.createElevage(payload);
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

    const handleRestore = async (item) => {
        if (!confirm(`Restaurer l'enregistrement du lot ${item.lot} ?`)) return;
        await elevageService.restoreElevage(item.id);
        await fetchData();
    };

    const handlePurge = async (item) => {
        if (!confirm(`Supprimer définitivement l'enregistrement du lot ${item.lot} ? Cette action est irréversible.`)) return;
        await elevageService.purgeElevage(item.id);
        await fetchData();
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
            <Breadcrumb
                items={[
                    { label: `Ferme ${fermeId}`, link: `/elevage` },
                    { label: `Bâtiment ${batimentId}`, link: `/elevage/ferme/${fermeId}` },
                    { label: `Parc ${parcId}`, link: `/elevage/ferme/${fermeId}/batiment/${batimentId}` }
                ]}
            />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                        Ferme {fermeId} - Bâtiment {batimentId} - Parc {parcId}
                    </h1>
                    <p className="text-sm text-gray-500">Gérez les rations et consommations</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="ghost" onClick={() => setShowHistory(s => !s)}>
                        Historique ({deletedCount})
                    </Button>
                    <Button onClick={() => { setEditingItem(null); setIsFormOpen(true); }}>
                        <Plus size={20} className="mr-2" />
                        Nouvelle Fiche
                    </Button>
                </div>
            </div>

            <Card>
                <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between items-center">
                    <div className="relative w-full sm:w-72">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <Input
                            placeholder="Rechercher par lot, ferme ou date..."
                            className="pl-10"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="text-sm text-gray-500">{processedData.length} enregistrement(s)</div>
                        <div className="flex items-center gap-2">
                            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={async () => { await elevageService.exportElevages(); }}>
                                <FileSpreadsheet size={16} className="mr-2" />
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
                            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => document.getElementById('elevageImportInput').click()}>
                                <FileSpreadsheet size={16} className="mr-2" />
                                Importer Excel
                            </Button>
                        </div>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left border-collapse">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50/50">
                            <tr>
                                <th rowSpan="2" className="px-4 py-3 border border-gray-300 font-medium text-center">DATE</th>
                                <th rowSpan="2" className="px-4 py-3 border border-gray-300 font-medium text-center">Jrs</th>
                                <th rowSpan="2" className="px-4 py-3 border border-gray-300 font-medium text-center">AGE</th>
                                <th colSpan="2" className="px-4 py-3 border border-gray-300 font-medium text-center bg-blue-50">EFFECTIF</th>
                                <th rowSpan="2" className="px-4 py-3 border border-gray-300 font-medium text-center">%C/P</th>
                                <th colSpan="3" className="px-4 py-3 border border-gray-300 font-medium text-center bg-red-50">MORTALITE</th>
                                <th colSpan="4" className="px-4 py-3 border border-gray-300 font-medium text-center bg-yellow-50">TRIAGE</th>
                                <th colSpan="2" className="px-4 py-3 border border-gray-300 font-medium text-center bg-purple-50">cumul mortalités</th>
                                <th colSpan="2" className="px-4 py-3 border border-gray-300 font-medium text-center bg-green-50">ALIMENT en kg</th>
                                <th rowSpan="2" className="px-4 py-3 border border-gray-300 font-medium text-center">Actions</th>
                            </tr>
                            <tr>
                                {/* EFFECTIF sub-headers */}
                                <th className="px-3 py-2 border border-gray-300 font-medium text-center bg-blue-50">COQ</th>
                                <th className="px-3 py-2 border border-gray-300 font-medium text-center bg-blue-50">POULE</th>

                                {/* MORTALITE sub-headers */}
                                <th className="px-2 py-2 border border-gray-300 font-medium text-center bg-red-50">
                                    <div className="flex flex-col">
                                        <span>COQ</span>
                                        <div className="flex gap-1 text-[10px]">
                                            <span>N</span>
                                            <span>%</span>
                                        </div>
                                    </div>
                                </th>
                                <th className="px-2 py-2 border border-gray-300 font-medium text-center bg-red-50">
                                    <div className="flex flex-col">
                                        <span>POULE</span>
                                        <div className="flex gap-1 text-[10px]">
                                            <span>N</span>
                                            <span>%</span>
                                        </div>
                                    </div>
                                </th>
                                <th className="px-2 py-2 border border-gray-300 font-medium text-center bg-red-50">
                                    <div className="flex flex-col">
                                        <span>par semaine %</span>
                                        <div className="flex gap-1 text-[10px]">
                                            <span>coq</span>
                                            <span>poule</span>
                                        </div>
                                    </div>
                                </th>

                                {/* TRIAGE sub-headers */}
                                <th className="px-2 py-2 border border-gray-300 font-medium text-center bg-yellow-50">COQ RESERVE</th>
                                <th className="px-2 py-2 border border-gray-300 font-medium text-center bg-yellow-50">COQ DECHET</th>
                                <th className="px-2 py-2 border border-gray-300 font-medium text-center bg-yellow-50">POULE DECHET</th>
                                <th className="px-2 py-2 border border-gray-300 font-medium text-center bg-yellow-50">POULE COUV</th>

                                {/* cumul mortalités sub-headers */}
                                <th className="px-3 py-2 border border-gray-300 font-medium text-center bg-purple-50">C</th>
                                <th className="px-3 py-2 border border-gray-300 font-medium text-center bg-purple-50">P</th>

                                {/* ALIMENT sub-headers */}
                                <th className="px-3 py-2 border border-gray-300 font-medium text-center bg-green-50">COQ</th>
                                <th className="px-3 py-2 border border-gray-300 font-medium text-center bg-green-50">POULE</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr><td colSpan="20" className="p-8 text-center text-gray-500">Chargement...</td></tr>
                            ) : paginatedData.length === 0 ? (
                                <tr><td colSpan="20" className="p-8 text-center text-gray-500">Aucune donnée trouvée</td></tr>
                            ) : (
                                paginatedData.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-4 py-3 border border-gray-200 font-medium text-gray-900 text-center">{item.date}</td>
                                        <td className="px-4 py-3 border border-gray-200 text-center">{item.jrs || '-'}</td>
                                        <td className="px-4 py-3 border border-gray-200 text-center">{item.age || '-'}</td>

                                        {/* EFFECTIF */}
                                        <td className="px-3 py-3 border border-gray-200 text-center font-mono">{item.effectif_coq || '-'}</td>
                                        <td className="px-3 py-3 border border-gray-200 text-center font-mono">{item.effectif_poule || '-'}</td>

                                        {/* %C/P */}
                                        <td className="px-3 py-3 border border-gray-200 text-center font-mono">{item.ratio_cp || '-'}</td>

                                        {/* MORTALITE */}
                                        <td className="px-2 py-3 border border-gray-200 text-center">
                                            <div className="flex gap-2 justify-center text-xs">
                                                <span>{item.mort_coq_n || '-'}</span>
                                                <span className="text-red-600">{item.mort_coq_pct ? `${item.mort_coq_pct}%` : '-'}</span>
                                            </div>
                                        </td>
                                        <td className="px-2 py-3 border border-gray-200 text-center">
                                            <div className="flex gap-2 justify-center text-xs">
                                                <span>{item.mort_poule_n || '-'}</span>
                                                <span className="text-red-600">{item.mort_poule_pct ? `${item.mort_poule_pct}%` : '-'}</span>
                                            </div>
                                        </td>
                                        <td className="px-2 py-3 border border-gray-200 text-center">
                                            <div className="flex gap-2 justify-center text-xs">
                                                <span className="text-blue-600">{item.mort_semaine_coq || '-'}</span>
                                                <span className="text-blue-600">{item.mort_semaine_poule || '-'}</span>
                                            </div>
                                        </td>

                                        {/* TRIAGE */}
                                        <td className="px-2 py-3 border border-gray-200 text-center">{item.triage_coq_reserve || '-'}</td>
                                        <td className="px-2 py-3 border border-gray-200 text-center">{item.triage_coq_dechet || '-'}</td>
                                        <td className="px-2 py-3 border border-gray-200 text-center">{item.triage_poule_dechet || '-'}</td>
                                        <td className="px-2 py-3 border border-gray-200 text-center">{item.triage_poule_couv || '-'}</td>

                                        {/* cumul mortalités */}
                                        <td className="px-3 py-3 border border-gray-200 text-center font-mono">{item.cumul_mort_c || '-'}</td>
                                        <td className="px-3 py-3 border border-gray-200 text-center font-mono">{item.cumul_mort_p || '-'}</td>

                                        {/* ALIMENT */}
                                        <td className="px-3 py-3 border border-gray-200 text-center font-mono">{item.aliment_coq || '-'}</td>
                                        <td className="px-3 py-3 border border-gray-200 text-center font-mono">{item.aliment_poule || '-'}</td>

                                        {/* Actions */}
                                        <td className="px-4 py-3 border border-gray-200 text-center space-x-2">
                                            <button onClick={() => openEdit(item)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                                <Edit2 size={16} />
                                            </button>
                                            <button onClick={() => openDelete(item)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                                <Trash2 size={16} />
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

            {/* Deleted / History Card (toggle visible) */}
            {showHistory && (
                <Card>
                    <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-medium">Historique (supprimés)</h2>
                            <p className="text-sm text-gray-500">Enregistrements supprimés (historique)</p>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50/50">
                                <tr>
                                    <th className="px-6 py-3">Date</th>
                                    <th className="px-6 py-3">Lot</th>
                                    <th className="px-6 py-3">Ferme</th>
                                    <th className="px-6 py-3">Aliment</th>
                                    <th className="px-6 py-3">Quantité</th>
                                    <th className="px-6 py-3">Supprimé le</th>
                                    <th className="px-6 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr><td colSpan="7" className="p-8 text-center text-gray-500">Chargement...</td></tr>
                                ) : (
                                    data.filter(d => d.deleted).map(item => (
                                        <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-gray-900">{item.date}</td>
                                            <td className="px-6 py-4">{item.lot}</td>
                                            <td className="px-6 py-4 text-gray-700">{item.ferme || '-'}</td>
                                            <td className="px-6 py-4 text-gray-600">{item.aliment}</td>
                                            <td className="px-6 py-4 font-mono">{item.quantite} kg</td>
                                            <td className="px-6 py-4 text-gray-500">{item.deletedAt ? new Date(item.deletedAt).toLocaleString() : '-'}</td>
                                            <td className="px-6 py-4 text-right space-x-2">
                                                <button onClick={() => handleRestore(item)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors">Restaurer</button>
                                                <button onClick={() => handlePurge(item)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">Supprimer définitivement</button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}

            {/* Forms Modal */}
            <Modal
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                title={editingItem ? "Modifier l'enregistrement" : "Nouvel enregistrement"}
                size="large"
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

export default ElevageTable;
