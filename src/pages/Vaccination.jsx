import { useState, useEffect } from 'react';
import { vaccinationService } from '../services/vaccinationService';
import VaccinationCalendar from '../components/vaccination/VaccinationCalendar';
import VaccinationAlerts from '../components/vaccination/VaccinationAlerts';
import { Card } from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Plus, Check, Syringe } from 'lucide-react';
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
    const [protocols, setProtocols] = useState({});
    const [treatmentForm, setTreatmentForm] = useState({ name: '', date: '', protocol: 'standard', notes: '' });
    const [editingTreatmentId, setEditingTreatmentId] = useState(null);
    const [isTreatmentModalOpen, setIsTreatmentModalOpen] = useState(false);

    const loadData = async () => {
        setLoading(true);
        const result = await vaccinationService.getVaccinations();
        setData(result);
        // load treatments and protocols too
        const t = await vaccinationService.getTreatments();
        setTreatments(t);
        const p = await vaccinationService.getProtocols();
        setProtocols(p || {});
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

                    <div className="bg-white p-4 rounded-xl border border-gray-100">
                        <h3 className="font-semibold mb-3">Légende</h3>
                        <div className="flex gap-4 text-xs">
                            <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-green-100 border border-green-200 mr-2"></span> Fait</div>
                            <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-blue-100 border border-blue-200 mr-2"></span> Planifié</div>
                            <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-red-100 border border-red-200 mr-2"></span> En retard</div>
                        </div>
                    </div>

                    {/* Masqués / Fait table placed under calendar */}
                    <div className="mt-6">
                        <Card>
                            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-medium">Masqués / Fait</h3>
                                    <p className="text-sm text-gray-500">Vaccins masqués ou marqués comme faits</p>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-gray-700 uppercase bg-gray-50/50">
                                        <tr>
                                            <th className="px-6 py-3">Date</th>
                                            <th className="px-6 py-3">Vaccin</th>
                                            <th className="px-6 py-3">Ferme</th>
                                            <th className="px-6 py-3">Statut</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {data.filter(d => d.hidden || d.status === 'completed').length === 0 ? (
                                            <tr><td colSpan="4" className="p-6 text-center text-gray-500">Aucun vaccin masqué ou fait</td></tr>
                                        ) : (
                                            data.filter(d => d.hidden || d.status === 'completed').map(v => (
                                                <tr key={v.id} className="hover:bg-gray-50/50 transition-colors">
                                                    <td className="px-6 py-4">{new Date(v.date).toLocaleDateString()}</td>
                                                    <td className="px-6 py-4">{v.vaccine}</td>
                                                    <td className="px-6 py-4">{v.lot}</td>
                                                    <td className="px-6 py-4">
                                                        {v.hidden ? <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-700">Masqué</span> : null}
                                                        {v.status === 'completed' ? <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-green-50 text-green-700 ml-2">Fait</span> : null}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    </div>

                    <div className="mt-6">
                        <Card>
                            <div className="p-4 border-b border-gray-100">
                                <h3 className="font-semibold">Gestion des traitements</h3>
                                <p className="text-sm text-gray-500">Ajouter, modifier ou supprimer des traitements utilisés pour calculer les rappels.</p>
                            </div>
                            <div className="p-4 space-y-3">
                                <div className="space-y-2">
                                    {treatments.length === 0 ? <div className="text-sm text-gray-500">Aucun traitement défini.</div> : (
                                        <ul className="space-y-2 text-sm">
                                            {treatments.map(t => (
                                                <li key={t.id} className="flex items-center justify-between">
                                                    <div>
                                                        <div className="font-medium">{t.name} <span className="text-xs text-gray-500">({t.protocol})</span></div>
                                                        <div className="text-gray-600 text-xs">{new Date(t.date).toLocaleDateString()} — {t.notes || '-'}</div>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button onClick={() => editTreatment(t)} className="text-sm text-primary-600">Modifier</button>
                                                        <button onClick={() => removeTreatment(t.id)} className="text-sm text-red-600">Supprimer</button>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>

                                <div className="pt-2 border-t pt-3">
                                    <h4 className="font-medium">Ajouter / Modifier</h4>
                                    <div className="space-y-2 mt-2">
                                        <input className="w-full rounded-md border px-3 py-2 text-sm" placeholder="Nom du traitement" value={treatmentForm.name} onChange={(e) => setTreatmentForm(f => ({ ...f, name: e.target.value }))} />
                                        <input type="date" className="w-full rounded-md border px-3 py-2 text-sm" value={treatmentForm.date} onChange={(e) => setTreatmentForm(f => ({ ...f, date: e.target.value }))} />
                                        <select className="w-full rounded-md border px-3 py-2 text-sm" value={treatmentForm.protocol} onChange={(e) => setTreatmentForm(f => ({ ...f, protocol: e.target.value }))}>
                                            {Object.keys(protocols).map(k => <option key={k} value={k}>{k}</option>)}
                                        </select>
                                        <input className="w-full rounded-md border px-3 py-2 text-sm" placeholder="Notes" value={treatmentForm.notes} onChange={(e) => setTreatmentForm(f => ({ ...f, notes: e.target.value }))} />
                                        <div className="flex gap-2">
                                            <Button type="button" onClick={saveTreatment}>{editingTreatmentId ? 'Enregistrer' : 'Ajouter'}</Button>
                                            <Button variant="secondary" type="button" onClick={() => { setTreatmentForm({ name: '', date: '', protocol: Object.keys(protocols)[0] || 'standard', notes: '' }); setEditingTreatmentId(null); }}>Annuler</Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>
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
                onClose={() => { setIsTreatmentModalOpen(false); setEditingTreatmentId(null); setTreatmentForm({ name: '', date: '', protocol: Object.keys(protocols)[0] || 'standard', notes: '' }); }}
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">Protocole</label>
                        <select className="w-full rounded-md border px-3 py-2 text-sm" value={treatmentForm.protocol} onChange={(e) => setTreatmentForm(f => ({ ...f, protocol: e.target.value }))}>
                            {Object.keys(protocols).map(k => <option key={k} value={k}>{k}</option>)}
                        </select>
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
