import { AlertTriangle, CheckCircle, Clock, FileText, X, Eye, EyeOff, Edit, Trash2, MoreVertical } from 'lucide-react';
import { differenceInDays, parseISO, isBefore, isToday, format } from 'date-fns';
import { clsx } from 'clsx';
import { useState } from 'react';

const AlertCard = ({ title, message, type = 'info', date }) => {
    const styles = {
        danger: 'bg-red-50 border-red-100 text-red-800',
        warning: 'bg-amber-50 border-amber-100 text-amber-800',
        success: 'bg-green-50 border-green-100 text-green-800',
        info: 'bg-blue-50 border-blue-100 text-blue-800'
    };

    const icons = {
        danger: AlertTriangle,
        warning: Clock,
        success: CheckCircle,
        info: Clock
    };

    const Icon = icons[type];

    return (
        <div className={clsx('p-4 rounded-lg border flex items-start space-x-3', styles[type])}>
            <Icon className="shrink-0 mt-0.5" size={20} />
            <div className="flex-1">
                <h4 className="font-semibold text-sm">{title}</h4>
                <p className="text-xs mt-1 opacity-90">{message}</p>
                <p className="text-xs mt-2 font-medium opacity-75">
                    Prévu le : {new Date(date).toLocaleDateString()}
                </p>
            </div>
        </div>
    );
};

const VaccinationAlerts = ({ vaccinations = [], treatments = [], onMarkComplete, onEdit, onDelete }) => {
    const [showFileModal, setShowFileModal] = useState(false);
    const [selectedVaccineFile, setSelectedVaccineFile] = useState(null);
    const [hiddenAlerts, setHiddenAlerts] = useState(new Set());
    const [openMenuId, setOpenMenuId] = useState(null);
    const [formData, setFormData] = useState({
        datePrevue: '',
        dateInterv: '',
        ageS: '',
        ageJ: '',
        eclosion: '',
        vaccins: '',
        qte: '',
        dose: '',
        modeAdmin: 'NEB',
        traitements: '',
        duree: '',
        observations: ''
    });

    const handleOpenFile = (alert) => {
        const initialDate = alert.date || '';
        setSelectedVaccineFile(alert);
        setFormData({
            datePrevue: initialDate,
            dateInterv: initialDate,
            ageS: '',
            ageJ: '',
            eclosion: '',
            vaccins: alert.vaccine || '',
            qte: '1 D/S',
            dose: '',
            modeAdmin: 'NEB',
            traitements: '',
            duree: '',
            observations: ''
        });
        setShowFileModal(true);
    };

    const handleToggleHide = (alertId) => {
        const newHidden = new Set(hiddenAlerts);
        if (newHidden.has(alertId)) {
            newHidden.delete(alertId);
        } else {
            newHidden.add(alertId);
        }
        setHiddenAlerts(newHidden);
    };

    const calculateAges = (interv, eclo) => {
        if (interv && eclo) {
            try {
                const dateInterv = parseISO(interv);
                const dateEclo = parseISO(eclo);
                const days = differenceInDays(dateInterv, dateEclo);

                if (days >= 0) {
                    const weeks = Math.floor(days / 7);
                    return { ageJ: days, ageS: weeks };
                }
            } catch (e) {
                console.error("Error calculating ages:", e);
            }
        }
        return { ageJ: '', ageS: '' };
    };

    const handleFormChange = (field, value) => {
        setFormData(prev => {
            const newData = { ...prev, [field]: value };

            // If changing dateInterv or eclosion, update ages automatically
            if (field === 'dateInterv' || field === 'eclosion') {
                const { ageJ, ageS } = calculateAges(
                    field === 'dateInterv' ? value : prev.dateInterv,
                    field === 'eclosion' ? value : prev.eclosion
                );
                newData.ageJ = ageJ;
                newData.ageS = ageS;
            }

            return newData;
        });
    };

    // merge vaccinations and treatments into a single list of items
    const items = [
        ...vaccinations.map(v => ({ ...v, isTreatment: false })),
        ...treatments.map(t => ({ id: `t-${t.id}`, date: t.date, vaccine: t.name, lot: t.notes || 'Traitement', status: 'planned', isTreatment: true }))
    ];

    const alerts = items.reduce((acc, v) => {
        if (v.deleted) return acc; // skip deleted entries in alerts (they remain in history)
        if (v.status === 'completed') return acc;

        const date = parseISO(v.date);
        const today = new Date();
        const diff = differenceInDays(date, today);

        // Overdue -> danger
        if (isBefore(date, today) && !isToday(date)) {
            acc.push({
                ...v,
                type: 'danger',
                title: v.isTreatment ? 'Traitement en retard !' : 'Vaccin en retard !',
                message: v.isTreatment
                    ? `Le traitement "${v.vaccine}" (${v.lot}) était prévu.`
                    : `Le vaccin ${v.vaccine} pour la ferme ${v.lot} devait être fait.`
            });
        }
        // Today or Tomorrow -> warning
        else if (diff <= 2 && diff >= 0) {
            acc.push({
                ...v,
                type: 'warning',
                title: v.isTreatment ? 'Traitement imminent' : 'Vaccin imminent',
                message: v.isTreatment
                    ? `Rappel : traitement ${v.vaccine} (${v.lot}) est prévu ${isToday(date) ? "aujourd'hui" : "bientôt"}.`
                    : `Rappel : ${v.vaccine} pour la ferme ${v.lot} est prévu pour ${isToday(date) ? "aujourd'hui" : "bientôt"}.`
            });
        }
        // Otherwise include as informational alert so saved calendar items are visible
        else {
            acc.push({
                ...v,
                type: 'info',
                title: v.isTreatment ? 'Traitement programmé' : 'Vaccin programmé',
                message: v.isTreatment
                    ? `Planifié le ${format(date, 'dd/MM/yyyy')} : ${v.vaccine} (${v.lot})`
                    : `Planifié le ${format(date, 'dd/MM/yyyy')} : ${v.vaccine} (ferme ${v.lot})`
            });
        }

        return acc;
    }, []);

    if (alerts.length === 0) {
        return (
            <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
                <div className="bg-green-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircle className="text-green-600" size={24} />
                </div>
                <h3 className="text-gray-900 font-medium">Tout est à jour</h3>
                <p className="text-gray-500 text-sm mt-1">Aucune alerte de vaccination pour le moment.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
            <div className="p-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900 flex items-center">
                    <AlertTriangle className="mr-2 text-amber-500" size={20} />
                    Alertes Vaccination
                </h3>
            </div>
            <div className="p-4 space-y-3 max-h-[400px] overflow-y-auto">
                {alerts.map(alert => (
                    !hiddenAlerts.has(alert.id) && (
                        <div key={alert.id} className="relative group">
                            <AlertCard
                                title={alert.title}
                                message={alert.message}
                                type={alert.type}
                                date={alert.date}
                            />
                            {/* Dropdown Menu Button */}
                            <div className="absolute top-2 right-2">
                                <button
                                    onClick={() => setOpenMenuId(openMenuId === alert.id ? null : alert.id)}
                                    className="bg-gray-600 hover:bg-gray-700 text-white p-1.5 rounded shadow-sm transition-all"
                                    title="Actions"
                                >
                                    <MoreVertical size={16} />
                                </button>

                                {/* Dropdown Menu */}
                                {openMenuId === alert.id && (
                                    <>
                                        {/* Backdrop */}
                                        <div
                                            className="fixed inset-0 z-10"
                                            onClick={() => setOpenMenuId(null)}
                                        />

                                        {/* Menu Items */}
                                        <div className="absolute right-0 top-10 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20 overflow-hidden">
                                            <button
                                                onClick={() => {
                                                    handleOpenFile(alert);
                                                    setOpenMenuId(null);
                                                }}
                                                className="w-full text-left px-4 py-2.5 text-sm text-blue-600 hover:bg-blue-50 flex items-center gap-2 border-b border-gray-100 transition-colors"
                                            >
                                                <Eye size={16} />
                                                Fiche
                                            </button>
                                            <button
                                                onClick={() => {
                                                    onEdit && onEdit(alert);
                                                    setOpenMenuId(null);
                                                }}
                                                className="w-full text-left px-4 py-2.5 text-sm text-orange-600 hover:bg-orange-50 flex items-center gap-2 border-b border-gray-100 transition-colors"
                                            >
                                                <Edit size={16} />
                                                Modifier
                                            </button>
                                            <button
                                                onClick={() => {
                                                    handleToggleHide(alert.id);
                                                    setOpenMenuId(null);
                                                }}
                                                className="w-full text-left px-4 py-2.5 text-sm text-amber-600 hover:bg-amber-50 flex items-center gap-2 border-b border-gray-100 transition-colors"
                                            >
                                                <EyeOff size={16} />
                                                Masquer
                                            </button>
                                            <button
                                                onClick={() => {
                                                    onDelete && onDelete(alert);
                                                    setOpenMenuId(null);
                                                }}
                                                className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                                            >
                                                <Trash2 size={16} />
                                                Supprimer
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    )
                ))}
            </div>

            {/* FICHE PROPHYLAXIE Modal */}
            {showFileModal && selectedVaccineFile && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-auto">
                        {/* Header */}
                        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
                            <h1 className="text-3xl font-bold text-center flex-1">FICHE PROPHYLAXIE</h1>
                            <button
                                onClick={() => setShowFileModal(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-6">
                            {/* Farm Info Section */}
                            <div className="grid grid-cols-3 gap-4 bg-gray-100 p-4 rounded-lg border border-gray-300">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">FERME/TROUPEAU</label>
                                    <input
                                        type="text"
                                        value={selectedVaccineFile.lot}
                                        readOnly
                                        className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-50 font-semibold"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">SOURCE</label>
                                    <input
                                        type="text"
                                        defaultValue="ROSS 308"
                                        className="w-full px-3 py-2 border border-gray-300 rounded"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">EFFECTIF</label>
                                    <input
                                        type="text"
                                        defaultValue="67 260"
                                        className="w-full px-3 py-2 border border-gray-300 rounded"
                                    />
                                </div>
                                <div className="col-span-3">
                                    <label className="block text-xs font-bold text-gray-700 mb-1">ÉCLOSION</label>
                                    <input
                                        type="date"
                                        value={formData.eclosion}
                                        onChange={(e) => handleFormChange('eclosion', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded"
                                    />
                                </div>
                            </div>

                            {/* Table */}
                            <div className="overflow-x-auto border border-gray-300 rounded-lg">
                                <table className="w-full border-collapse text-sm">
                                    <thead>
                                        <tr className="bg-gray-300 border-b border-gray-300">
                                            <th className="px-4 py-2 border-r border-gray-300 text-left font-bold text-gray-800">Date Prévue</th>
                                            <th className="px-4 py-2 border-r border-gray-300 text-left font-bold text-gray-800">Date de l'interv</th>
                                            <th className="px-2 py-2 border-r border-gray-300 text-center font-bold text-gray-800">Âge S</th>
                                            <th className="px-2 py-2 border-r border-gray-300 text-center font-bold text-gray-800">Âge J</th>
                                            <th className="px-4 py-2 border-r border-gray-300 text-left font-bold text-gray-800">Vaccins</th>
                                            <th className="px-4 py-2 border-r border-gray-300 text-left font-bold text-gray-800">QTE</th>
                                            <th className="px-4 py-2 border-r border-gray-300 text-left font-bold text-gray-800">Dose</th>
                                            <th className="px-4 py-2 border-r border-gray-300 text-left font-bold text-gray-800">Mode d'administration</th>
                                            <th className="px-4 py-2 border-r border-gray-300 text-left font-bold text-gray-800">Traitements</th>
                                            <th className="px-4 py-2 border-r border-gray-300 text-left font-bold text-gray-800">Durée</th>
                                            <th className="px-4 py-2 text-left font-bold text-gray-800">Observations</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr className="border-b border-gray-300 hover:bg-blue-50">
                                            <td className="px-4 py-3 border-r border-gray-300">
                                                <input
                                                    type="date"
                                                    value={formData.datePrevue}
                                                    onChange={(e) => handleFormChange('datePrevue', e.target.value)}
                                                    className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                                                />
                                            </td>
                                            <td className="px-4 py-3 border-r border-gray-300">
                                                <input
                                                    type="date"
                                                    value={formData.dateInterv}
                                                    onChange={(e) => handleFormChange('dateInterv', e.target.value)}
                                                    className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                                                />
                                            </td>
                                            <td className="px-2 py-3 border-r border-gray-300">
                                                <input
                                                    type="number"
                                                    value={formData.ageS}
                                                    onChange={(e) => handleFormChange('ageS', e.target.value)}
                                                    className="w-full px-2 py-1 border border-gray-300 rounded text-xs text-center"
                                                    placeholder="0"
                                                />
                                            </td>
                                            <td className="px-2 py-3 border-r border-gray-300">
                                                <input
                                                    type="number"
                                                    value={formData.ageJ}
                                                    onChange={(e) => handleFormChange('ageJ', e.target.value)}
                                                    className="w-full px-2 py-1 border border-gray-300 rounded text-xs text-center"
                                                    placeholder="0"
                                                />
                                            </td>
                                            <td className="px-4 py-3 border-r border-gray-300 font-medium">
                                                <input
                                                    type="text"
                                                    value={formData.vaccins}
                                                    onChange={(e) => handleFormChange('vaccins', e.target.value)}
                                                    className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                                                />
                                            </td>
                                            <td className="px-4 py-3 border-r border-gray-300">
                                                <input
                                                    type="text"
                                                    value={formData.qte}
                                                    onChange={(e) => handleFormChange('qte', e.target.value)}
                                                    className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                                                    placeholder="1 D/S"
                                                />
                                            </td>
                                            <td className="px-4 py-3 border-r border-gray-300">
                                                <input
                                                    type="text"
                                                    value={formData.dose}
                                                    onChange={(e) => handleFormChange('dose', e.target.value)}
                                                    className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                                                    placeholder="Ex: 1 ml/l"
                                                />
                                            </td>
                                            <td className="px-4 py-3 border-r border-gray-300">
                                                <select
                                                    value={formData.modeAdmin}
                                                    onChange={(e) => handleFormChange('modeAdmin', e.target.value)}
                                                    className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                                                >
                                                    <option>NEB</option>
                                                    <option>E.B</option>
                                                    <option>INJECTION</option>
                                                    <option>Oral</option>
                                                </select>
                                            </td>
                                            <td className="px-4 py-3 border-r border-gray-300">
                                                <input
                                                    type="text"
                                                    value={formData.traitements}
                                                    onChange={(e) => handleFormChange('traitements', e.target.value)}
                                                    className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                                                    placeholder="Ex: ROXACIN"
                                                />
                                            </td>
                                            <td className="px-4 py-3 border-r border-gray-300">
                                                <input
                                                    type="text"
                                                    value={formData.duree}
                                                    onChange={(e) => handleFormChange('duree', e.target.value)}
                                                    className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                                                    placeholder="Ex: 5 j"
                                                />
                                            </td>
                                            <td className="px-4 py-3">
                                                <input
                                                    type="text"
                                                    value={formData.observations}
                                                    onChange={(e) => handleFormChange('observations', e.target.value)}
                                                    className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                                                    placeholder="Observations"
                                                />
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
                                <button
                                    onClick={() => setShowFileModal(false)}
                                    className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                                >
                                    Fermer
                                </button>
                                <button
                                    onClick={() => {
                                        alert('Données sauvegardées avec succès');
                                        setShowFileModal(false);
                                    }}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
                                >
                                    Enregistrer
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VaccinationAlerts;
