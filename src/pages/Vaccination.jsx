import { useState, useEffect } from 'react';
import { vaccinationService } from '../services/vaccinationService';
import { elevageService } from '../services/elevageService';
import VaccinationCalendar from '../components/vaccination/VaccinationCalendar';
import VaccinationAlerts from '../components/vaccination/VaccinationAlerts';
import { Card } from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Plus, Check, Syringe, Activity, Calendar, FileText, Trash2, Edit3, Pill, ClipboardList, Archive, EyeOff, Info, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';

const Vaccination = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [editingVaccination, setEditingVaccination] = useState(null);
    const [showHistory, setShowHistory] = useState(false);
    const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, action: null, data: null });
    const [ageDays, setAgeDays] = useState('');
    const [lastTreatment, setLastTreatment] = useState('');
    const [schedule, setSchedule] = useState([]);
    const [computingSchedule, setComputingSchedule] = useState(false);

    const { register, handleSubmit, reset, setValue } = useForm();
    const [treatments, setTreatments] = useState([]);
    const [selectedTreatmentId, setSelectedTreatmentId] = useState(null);

    const [treatmentForm, setTreatmentForm] = useState({ name: '', date: '', protocol: 'standard', notes: '' });
    const [editingTreatmentId, setEditingTreatmentId] = useState(null);
    const [isTreatmentModalOpen, setIsTreatmentModalOpen] = useState(false);
    const [parcs, setParcs] = useState([]);

    const loadData = async () => {
        setLoading(true);
        try {
            const result = await vaccinationService.getVaccinations();
            setData(result);

            // load treatments
            try {
                const t = await vaccinationService.getTreatments();
                setTreatments(t);
            } catch (e) {
                console.log("Treatments not available yet");
            }

            // Load parcs for selection
            const p = await elevageService.getParcs();
            setParcs(p);
        } catch (error) {
            console.error("Error loading data:", error);
        }
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, []);

    const saveTreatment = async () => {
        if (!treatmentForm.name || !treatmentForm.date) return;
        if (editingTreatmentId) {
            await vaccinationService.updateTreatment(editingTreatmentId, treatmentForm);
        } else {
            await vaccinationService.addTreatment(treatmentForm);
        }
        const t = await vaccinationService.getTreatments();
        setTreatments(t);
        setTreatmentForm({ name: '', date: '', protocol: 'standard', notes: '' });
        setEditingTreatmentId(null);
        setIsTreatmentModalOpen(false);
    };

    const editTreatment = (t) => {
        setEditingTreatmentId(t.id);
        setTreatmentForm({ name: t.name, date: t.date.split('T')[0], protocol: t.protocol || 'standard', notes: t.notes || '' });
        setIsTreatmentModalOpen(true);
    };

    const removeTreatment = async (id) => {
        await vaccinationService.deleteTreatment(id);
        const t = await vaccinationService.getTreatments();
        setTreatments(t);
        if (selectedTreatmentId === id) setSelectedTreatmentId(null);
        setIsTreatmentModalOpen(false);
    };

    const deletedCount = data.filter(d => d.deleted).length;

    const handleMarkAsComplete = async (id) => {
        await vaccinationService.markAsCompleted(id);
        loadData();
    };

    const handleDeleteVaccination = (vaccine) => {
        setConfirmDialog({
            isOpen: true,
            action: 'delete',
            data: vaccine,
            title: 'Supprimer définitivement la vaccination',
            message: `Êtes-vous sûr de vouloir supprimer définitivement la programmation du vaccin "${vaccine.vaccine}" pour la ferme ${vaccine.lot} ? Cette action est irréversible.`,
            variant: 'danger'
        });
    };

    const handleAddVaccine = async (formData) => {
        if (editingVaccination) {
            await vaccinationService.updateVaccination(editingVaccination.id, formData);
        } else {
            await vaccinationService.addVaccination(formData);
        }
        setIsModalOpen(false);
        setEditingVaccination(null);
        reset();
        loadData();
    };

    const onDateClick = (date) => {
        // Set default date in form
        const formattedDate = date.toISOString().split('T')[0];
        setValue('date', formattedDate);
        setSelectedDate(date);
        setEditingVaccination(null);
        setIsModalOpen(true);
    };

    // Merge vaccinations and treatments into calendar events
    const calendarEvents = [
        ...data,
        ...treatments.map(t => ({
            id: `t-${t.id}`,
            date: t.date,
            vaccine: t.name,
            lot: t.protocol || t.notes || 'Traitement',
            status: 'planned',
            isTreatment: true
        }))
    ];

    const handleCalendarEventClick = (event) => {
        if (event.isTreatment) {
            // open treatment edit
            const tId = String(event.id).startsWith('t-') ? parseInt(String(event.id).slice(2), 10) : null;
            const t = treatments.find(tt => tt.id === tId);
            if (t) editTreatment(t);
            return;
        }
        // otherwise open vaccination edit
        handleEdit(event);
    };

    const handleEdit = (vaccine) => {
        // open modal with prefilled values
        setEditingVaccination(vaccine);
        setValue('date', new Date(vaccine.date).toISOString().split('T')[0]);
        setValue('vaccine', vaccine.vaccine || '');
        setValue('lot', vaccine.lot || '');
        setValue('parc_id', vaccine.parc_id || '');
        setValue('type', vaccine.type || 'primary');
        setIsModalOpen(true);
    };

    const handleRestoreVaccination = (v) => {
        setConfirmDialog({
            isOpen: true,
            action: 'restore',
            data: v,
            title: 'Restaurer la vaccination',
            message: `Êtes-vous sûr de vouloir restaurer la programmation du vaccin "${v.vaccine}" pour la ferme ${v.lot} ?`,
            variant: 'info'
        });
    };

    const handlePurgeVaccination = (v) => {
        setConfirmDialog({
            isOpen: true,
            action: 'purge',
            data: v,
            title: 'Supprimer définitivement',
            message: `Êtes-vous sûr de vouloir supprimer définitivement la programmation du vaccin "${v.vaccine}" pour la ferme ${v.lot} ? Cette action est irréversible.`,
            variant: 'danger'
        });
    };

    const handleConfirmAction = async () => {
        const { action, data } = confirmDialog;

        switch (action) {
            case 'delete':
                await vaccinationService.purgeVaccination(data.id); // Permanent delete
                break;
            case 'restore':
                await vaccinationService.restoreVaccination(data.id);
                break;
            case 'purge':
                await vaccinationService.purgeVaccination(data.id);
                break;
        }

        loadData();
        setConfirmDialog({ isOpen: false, action: null, data: null });
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Vaccination</h1>
                    <p className="text-sm text-gray-500">Suivi sanitaire et plan de vaccination</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="ghost" onClick={() => setShowHistory(s => !s)}>
                        Historique ({deletedCount})
                    </Button>
                    <Button onClick={() => { setSelectedDate(new Date()); setIsModalOpen(true); }}>
                        <Plus size={20} className="mr-2" />
                        Planifier un vaccin
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <VaccinationCalendar events={calendarEvents} onDateClick={onDateClick} onEventClick={handleCalendarEventClick} />

                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <Info size={18} className="text-blue-500" />
                            <h3 className="font-bold text-gray-900">Légende du Calendrier</h3>
                        </div>
                        <div className="flex flex-wrap gap-4">
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-100 rounded-xl text-xs font-bold text-green-700">
                                <CheckCircle2 size={14} /> Vaccin Fait
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-xl text-xs font-bold text-blue-700">
                                <Clock size={14} /> Programmé
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 border border-red-100 rounded-xl text-xs font-bold text-red-700">
                                <AlertCircle size={14} /> En retard
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-xl text-xs font-bold text-emerald-700">
                                <Pill size={14} /> Traitement
                            </div>
                        </div>
                    </div>

                    {/* Masqués / Fait table placed under calendar */}
                    <div className="mt-8">
                        <div className="flex items-center justify-between mb-4 px-2">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                    <Archive className="text-gray-500" size={24} />
                                    Masqués & Confirmés
                                </h3>
                                <p className="text-sm text-gray-500">Historique des vaccins réalisés ou archivés</p>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left border-collapse">
                                    <thead className="bg-gray-50/50">
                                        <tr>
                                            <th className="px-6 py-4 font-bold text-gray-700 uppercase tracking-wider text-[10px] border-b border-gray-100">Date d'intervention</th>
                                            <th className="px-6 py-4 font-bold text-gray-700 uppercase tracking-wider text-[10px] border-b border-gray-100">Vaccin / Produit</th>
                                            <th className="px-6 py-4 font-bold text-gray-700 uppercase tracking-wider text-[10px] border-b border-gray-100">Localisation</th>
                                            <th className="px-6 py-4 font-bold text-gray-700 uppercase tracking-wider text-[10px] border-b border-gray-100 text-right">Statut Final</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {data.filter(d => d.hidden || d.status === 'completed').length === 0 ? (
                                            <tr>
                                                <td colSpan="4" className="px-6 py-12 text-center text-gray-400 italic bg-gray-50/30">
                                                    Aucune archive à afficher pour le moment
                                                </td>
                                            </tr>
                                        ) : (
                                            data.filter(d => d.hidden || d.status === 'completed').map(v => (
                                                <tr key={v.id} className="hover:bg-gray-50/80 transition-colors group">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center gap-2 text-gray-600">
                                                            <Calendar size={14} className="text-blue-400" />
                                                            <span className="font-medium text-xs text-gray-900">{new Date(v.date).toLocaleDateString('fr-FR')}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-col">
                                                            <span className="font-bold text-gray-900 group-hover:text-primary-600 transition-colors">{v.vaccine}</span>
                                                            <span className="text-[10px] text-gray-400 flex items-center gap-1 uppercase tracking-tighter">
                                                                <Syringe size={10} /> Vaccination de routine
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md text-[11px] font-bold">
                                                            # {v.lot}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex justify-end gap-2">
                                                            {v.hidden && (
                                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-gray-100 text-gray-600 border border-gray-200 uppercase tracking-tight">
                                                                    <EyeOff size={10} /> Masqué
                                                                </span>
                                                            )}
                                                            {v.status === 'completed' && (
                                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-green-50 text-green-700 border border-green-100 uppercase tracking-tight">
                                                                    <Check size={10} /> Confirmé
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                    <Activity className="text-emerald-500" size={24} />
                                    Gestion des traitements
                                </h3>
                                <p className="text-sm text-gray-500">Suivi des interventions médicales et rappels</p>
                            </div>
                            <Button
                                onClick={() => {
                                    setTreatmentForm({ name: '', date: new Date().toISOString().split('T')[0], protocol: 'standard', notes: '' });
                                    setEditingTreatmentId(null);
                                    setIsTreatmentModalOpen(true);
                                }}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                            >
                                <Plus size={18} className="mr-2" />
                                Nouveau traitement
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {treatments.length === 0 ? (
                                <div className="col-span-full py-12 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                                    <ClipboardList className="mx-auto text-gray-300 mb-3" size={48} />
                                    <p className="text-gray-500 font-medium">Aucun traitement programmé</p>
                                    <p className="text-xs text-gray-400 mt-1">Cliquez sur "Nouveau traitement" pour commencer</p>
                                </div>
                            ) : (
                                treatments.map(t => (
                                    <div key={t.id} className="group bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-emerald-100 transition-all duration-300">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 group-hover:bg-emerald-100 transition-colors">
                                                    <Pill size={20} />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">{t.name}</h4>
                                                    <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                                                        <Calendar size={12} className="text-emerald-500" />
                                                        {new Date(t.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => editTreatment(t)}
                                                    className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                                                    title="Modifier"
                                                >
                                                    <Edit3 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => removeTreatment(t.id)}
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                    title="Supprimer"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>

                                        {t.notes && (
                                            <div className="bg-gray-50 rounded-xl p-3 flex items-start gap-2 border border-gray-50 group-hover:bg-emerald-50/30 group-hover:border-emerald-50 transition-colors">
                                                <FileText className="text-gray-400 shrink-0 mt-0.5" size={14} />
                                                <p className="text-xs text-gray-600 leading-relaxed italic">
                                                    {t.notes}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-1">
                    <VaccinationAlerts
                        vaccinations={data}
                        treatments={treatments}
                        onMarkComplete={(id) => {
                            if (String(id).startsWith('t-')) {
                                // no mark-as-complete for treatments at the moment
                                return;
                            }
                            handleMarkAsComplete(id);
                        }}
                        onEdit={(item) => {
                            if (item.isTreatment || String(item.id).startsWith('t-')) {
                                const tId = item.isTreatment ? parseInt(String(item.id).slice(2), 10) : null;
                                const t = treatments.find(tt => tt.id === tId);
                                if (t) editTreatment(t);
                                return;
                            }
                            handleEdit(item);
                        }}
                        onDelete={(item) => {
                            if (item.isTreatment || String(item.id).startsWith('t-')) {
                                const tId = item.isTreatment ? parseInt(String(item.id).slice(2), 10) : null;
                                if (tId) removeTreatment(tId);
                                return;
                            }
                            handleDeleteVaccination(item);
                        }}
                    />

                    <div className="mt-6">

                    </div>
                </div>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setEditingVaccination(null); reset(); }}
                title={editingVaccination ? "Modifier la vaccination" : "Planifier une vaccination"}
            >
                <form onSubmit={handleSubmit(handleAddVaccine)} className="space-y-4">
                    <Input
                        label="Date de vaccination"
                        type="date"
                        defaultValue={selectedDate ? selectedDate.toISOString().split('T')[0] : ''}
                        {...register('date', { required: true })}
                    />
                    <Input
                        label="Nom du Vaccin"
                        placeholder="Ex: Nobilis Ma5 + Nobilis IB4/91, Gallimune Flu H9 + ND, Cevac Gumbo L..."
                        {...register('vaccine', { required: true })}
                    />
                    <Input
                        label="Ferme concernée"
                        placeholder="Ex: Ferme A, Ferme B..."
                        {...register('lot', { required: true })}
                    />
                    <div className="w-full">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Parc</label>
                        <select
                            className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                            {...register('parc_id', { required: true })}
                        >
                            <option value="">Sélectionner un parc</option>
                            {parcs.map(p => (
                                <option key={p.id} value={p.id}>{p.name} ({p.lot || 'Sans lot'})</option>
                            ))}
                        </select>
                    </div>
                    <div className="w-full">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                        <select
                            className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                            {...register('type')}
                        >
                            <option value="primary">Premier vaccin</option>
                            <option value="booster">Rappel</option>
                        </select>
                    </div>

                    <div className="pt-4 flex justify-between gap-3">
                        {editingVaccination && (
                            <Button
                                variant="danger"
                                type="button"
                                onClick={() => {
                                    setIsModalOpen(false);
                                    handleDeleteVaccination(editingVaccination);
                                }}
                            >
                                Supprimer
                            </Button>
                        )}
                        <div className="flex gap-3 ml-auto">
                            <Button variant="secondary" type="button" onClick={() => setIsModalOpen(false)}>Annuler</Button>
                            <Button type="submit">Enregistrer</Button>
                        </div>
                    </div>
                </form>
            </Modal>

            <Modal
                isOpen={isTreatmentModalOpen}
                onClose={() => { setIsTreatmentModalOpen(false); setEditingTreatmentId(null); setTreatmentForm({ name: '', date: '', protocol: 'standard', notes: '' }); }}
                title={editingTreatmentId ? "Détails du traitement" : "Nouveau traitement"}
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                        <input className="w-full rounded-md border px-3 py-2 text-sm" value={treatmentForm.name} onChange={(e) => setTreatmentForm(f => ({ ...f, name: e.target.value }))} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                        <input type="date" className="w-full rounded-md border px-3 py-2 text-sm" value={treatmentForm.date} onChange={(e) => setTreatmentForm(f => ({ ...f, date: e.target.value }))} />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                        <input className="w-full rounded-md border px-3 py-2 text-sm" value={treatmentForm.notes} onChange={(e) => setTreatmentForm(f => ({ ...f, notes: e.target.value }))} />
                    </div>

                    <div className="flex justify-between">
                        {editingTreatmentId && (
                            <Button variant="danger" type="button" onClick={() => { removeTreatment(editingTreatmentId); }}>
                                Supprimer
                            </Button>
                        )}
                        <div className="flex gap-2 ml-auto">
                            <Button variant="secondary" type="button" onClick={() => { setIsTreatmentModalOpen(false); setEditingTreatmentId(null); }}>Fermer</Button>
                            <Button type="button" onClick={saveTreatment}>{editingTreatmentId ? 'Enregistrer' : 'Ajouter'}</Button>
                        </div>
                    </div>
                </div>
            </Modal>

            {/* History (deleted) panel */}
            {showHistory && (
                <div>
                    <Card>

                        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-medium">Historique des vaccinations (supprimés)</h2>
                                <p className="text-sm text-gray-500">Éléments supprimés (historique)</p>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50/50">
                                    <tr>
                                        <th className="px-6 py-3">Date</th>
                                        <th className="px-6 py-3">Vaccin</th>
                                        <th className="px-6 py-3">Ferme</th>
                                        <th className="px-6 py-3">Type</th>
                                        <th className="px-6 py-3">Supprimé le</th>
                                        <th className="px-6 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {loading ? (
                                        <tr><td colSpan="6" className="p-8 text-center text-gray-500">Chargement...</td></tr>
                                    ) : (
                                        data.filter(d => d.deleted).map(v => (
                                            <tr key={v.id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-6 py-4">{new Date(v.date).toLocaleDateString()}</td>
                                                <td className="px-6 py-4">{v.vaccine}</td>
                                                <td className="px-6 py-4">{v.lot}</td>
                                                <td className="px-6 py-4">{v.type}</td>
                                                <td className="px-6 py-4">{v.deletedAt ? new Date(v.deletedAt).toLocaleString() : '-'}</td>
                                                <td className="px-6 py-4 text-right space-x-2">
                                                    <button onClick={() => handleRestoreVaccination(v)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors">Restaurer</button>
                                                    <button onClick={() => handlePurgeVaccination(v)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">Supprimer définitivement</button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
            )}

            <ConfirmDialog
                isOpen={confirmDialog.isOpen}
                onClose={() => setConfirmDialog({ isOpen: false, action: null, data: null })}
                onConfirm={handleConfirmAction}
                title={confirmDialog.title}
                message={confirmDialog.message}
                variant={confirmDialog.variant}
                confirmText="Confirmer"
                cancelText="Annuler"
            />
        </div>
    );
};

export default Vaccination;
