import { AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { differenceInDays, parseISO, isBefore, isToday, format } from 'date-fns';
import { clsx } from 'clsx';

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
    // merge vaccinations and treatments into a single list of items
    const items = [
        ...vaccinations.map(v => ({ ...v, isTreatment: false })),
        ...treatments.map(t => ({ id: `t-${t.id}`, date: t.date, vaccine: t.name, lot: t.protocol || t.notes || 'Traitement', status: 'planned', isTreatment: true }))
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
                    ? `Le traitement "${v.vaccine}" (protocole ${v.lot}) était prévu.`
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
                    ? `Planifié le ${format(date, 'dd/MM/yyyy')} : ${v.vaccine} (protocole ${v.lot})`
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
                    <div key={alert.id} className="relative group">
                        <AlertCard
                            title={alert.title}
                            message={alert.message}
                            type={alert.type}
                            date={alert.date}
                        />
                        <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={() => onEdit && onEdit(alert)}
                                className="bg-white/50 hover:bg-white text-xs px-2 py-1 rounded shadow-sm border"
                            >
                                Modifier
                            </button>
                            <button
                                onClick={() => onMarkComplete(alert.id)}
                                className="bg-white/50 hover:bg-white text-xs px-2 py-1 rounded shadow-sm border"
                            >
                                Marquer fait
                            </button>
                            <button
                                onClick={() => onDelete && onDelete(alert)}
                                className="bg-white/50 hover:bg-white text-xs px-2 py-1 rounded shadow-sm border text-red-600"
                            >
                                Supprimer
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default VaccinationAlerts;
