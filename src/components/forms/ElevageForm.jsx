import { useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { ChevronDown, ChevronUp, Calendar, Users, AlertTriangle, Filter, TrendingUp, Utensils, Scale } from 'lucide-react';

const ElevageForm = ({ initialData, referenceData, parcInfo, onSubmit, onCancel, location }) => {
    const isNoPctParc = location?.fermeId === '1' && location?.batimentId === '2' && location?.parcId === '2';

    const { register, handleSubmit, reset, watch, setValue, formState: { errors, isSubmitting } } = useForm({
        defaultValues: initialData || {
            date: new Date().toISOString().split('T')[0],
            age: '',
            guide: '',
            effectif_coq: '',
            effectif_poule: '',
            mort_coq_n: '',
            mort_coq_pct: '',
            mort_poule_n: '',
            mort_poule_pct: '',
            mort_semaine_coq: '',
            mort_semaine_poule: '',
            triage_dechet: '',
            triage_coq_frere: '',
            triage_poule_soeur: '',
            cumul_mort_c: '',
            cumul_mort_p: '',
            aliment_coq: '',
            aliment_poule: '',
            correction_plus: '',
            correction_moins: '',
            poids_coq: '',
            poids_poule: '',
            poids_guide: '',
            homog_pct: '',
            transfert: '',
            observation: ''
        }
    });

    useEffect(() => {
        if (initialData) {
            reset(initialData);
        } else if (referenceData) {
            // Pre-fill form with latest data for "complete" (new entry)
            // But keep current date and reset daily-specific counters
            const preFill = {
                ...referenceData,
                date: new Date().toISOString().split('T')[0],
                id: undefined, // Don't carry over ID
                // Reset daily counters to 0
                mort_coq_n: 0,
                mort_poule_n: 0,
                mort_coq_pct: 0,
                mort_poule_pct: 0,
                triage_dechet: 0,
                triage_coq_frere: 0,
                triage_poule_soeur: 0,
                correction_plus: 0,
                correction_moins: 0,
                transfert: 0,
                observation: '' // Detailed notes should be fresh
            };
            reset(preFill);
        }
    }, [initialData, referenceData, reset]);

    // Automatic calculation of mortality rates
    const watchEffCoq = watch('effectif_coq');
    const watchEffPoule = watch('effectif_poule');
    const watchMortCoqN = watch('mort_coq_n');
    const watchMortPouleN = watch('mort_poule_n');

    useEffect(() => {
        const effCoq = parseFloat(watchEffCoq) || 0;
        const mortCoqN = parseFloat(watchMortCoqN) || 0;
        if (effCoq > 0) {
            const pct = ((mortCoqN / effCoq) * 100).toFixed(2);
            setValue('mort_coq_pct', pct);
            setValue('mort_semaine_coq', pct);
        } else {
            setValue('mort_coq_pct', '');
            setValue('mort_semaine_coq', '');
        }

        const effPoule = parseFloat(watchEffPoule) || 0;
        const mortPouleN = parseFloat(watchMortPouleN) || 0;
        if (effPoule > 0) {
            const pct = ((mortPouleN / effPoule) * 100).toFixed(2);
            setValue('mort_poule_pct', pct);
            setValue('mort_semaine_poule', pct);
        } else {
            setValue('mort_poule_pct', '');
            setValue('mort_semaine_poule', '');
        }
    }, [watchEffCoq, watchEffPoule, watchMortCoqN, watchMortPouleN, setValue]);

    // Collapsible sections state
    const [expandedSections, setExpandedSections] = useState({
        basic: true,
        effectif: true,
        mortalite: true,
        aliment: true,
        poids: true,
        homog: true,
        cumul: true,
        observation: true
    });

    const toggleSection = (section) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const RefValue = ({ field, label }) => {
        const value = referenceData?.[field] || initialData?.[field];
        if (value === undefined || value === '' || value === null || (initialData?.id && !referenceData)) return null;

        // If we're editing, we show the reference only if it's different from current
        if (initialData?.id && value === initialData[field]) return null;

        return (
            <div className="text-[10px] text-blue-600 font-bold mt-1.5 flex items-center gap-1.5 bg-blue-50 px-2 py-1 rounded-md border border-blue-100 w-fit">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
                <span>{label || 'Précédent'}: <span className="text-blue-700">{value}</span></span>
            </div>
        );
    };

    const SectionHeader = ({ icon: Icon, title, section, badge }) => (
        <button
            type="button"
            onClick={() => toggleSection(section)}
            className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 rounded-lg transition-all group border border-gray-200"
        >
            <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg shadow-sm group-hover:shadow transition-shadow">
                    <Icon size={18} className="text-primary-600" />
                </div>
                <span className="font-semibold text-gray-800">{title}</span>
                {badge && (
                    <span className="px-2 py-0.5 text-xs font-medium bg-primary-100 text-primary-700 rounded-full">
                        {badge}
                    </span>
                )}
            </div>
            {expandedSections[section] ? (
                <ChevronUp size={20} className="text-gray-500" />
            ) : (
                <ChevronDown size={20} className="text-gray-500" />
            )}
        </button>
    );

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Park Information Summary Header */}
            {parcInfo && (
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-100 rounded-xl p-4 mb-2 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm border border-purple-100">
                            <Utensils size={24} className="text-purple-600" />
                        </div>
                        <div>
                            <div className="text-xs font-bold text-purple-400 uppercase tracking-widest">Fiche du Parc</div>
                            <h2 className="text-xl font-black text-gray-900 leading-tight">{parcInfo.name}</h2>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <div className="bg-white/60 backdrop-blur-sm px-3 py-2 rounded-lg border border-purple-100/50 min-w-[80px]">
                            <div className="text-[10px] font-bold text-gray-400 uppercase">Lot</div>
                            <div className="text-sm font-black text-purple-700">{parcInfo.lot}</div>
                        </div>
                        {referenceData?.age && (
                            <div className="bg-white/60 backdrop-blur-sm px-3 py-2 rounded-lg border border-purple-100/50 min-w-[80px]">
                                <div className="text-[10px] font-bold text-gray-400 uppercase">Âge (Dernier)</div>
                                <div className="text-sm font-black text-indigo-700">{referenceData.age}</div>
                            </div>
                        )}
                        {referenceData && (
                            <div className="bg-white/60 backdrop-blur-sm px-3 py-2 rounded-lg border border-purple-100/50 min-w-[100px]">
                                <div className="text-[10px] font-bold text-gray-400 uppercase">Effectif (Dernier)</div>
                                <div className="text-sm font-black text-emerald-700">
                                    {(parseFloat(referenceData.effectif_poule) || 0) + (parseFloat(referenceData.effectif_coq) || 0)}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
            {/* Basic Information */}
            <div className="space-y-3">
                <SectionHeader icon={Calendar} title="Informations de Base" section="basic" badge="Requis" />
                {expandedSections.basic && (
                    <div className="pl-2 space-y-4 animate-fadeIn">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="Date"
                                type="date"
                                error={errors.date?.message}
                                {...register('date', { required: 'La date est requise' })}
                            />

                            <div className="space-y-1">
                                <Input
                                    label="Âge"
                                    placeholder="Ex: 2 sem"
                                    {...register('age')}
                                />
                                <RefValue field="age" />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* EFFECTIF */}
            <div className="space-y-3">
                <SectionHeader icon={Users} title="Effectif" section="effectif" />
                {expandedSections.effectif && (
                    <div className="pl-2 space-y-4 animate-fadeIn">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <Input
                                    label="COQ"
                                    type="number"
                                    placeholder="0"
                                    {...register('effectif_coq')}
                                />
                                <RefValue field="effectif_coq" />
                            </div>
                            <div className="space-y-1">
                                <Input
                                    label="POULE"
                                    type="number"
                                    placeholder="0"
                                    {...register('effectif_poule')}
                                />
                                <RefValue field="effectif_poule" label="Dernier" />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* MORTALITÉ */}
            <div className="space-y-3">
                <SectionHeader icon={AlertTriangle} title="Mortalité" section="mortalite" />
                {expandedSections.mortalite && (
                    <div className="pl-2 space-y-4 animate-fadeIn">
                        <div className="bg-red-50 border border-red-100 rounded-lg p-4 space-y-4">
                            <div className="max-w-[200px]">
                                <Input
                                    label="Guide"
                                    type="number"
                                    placeholder="0"
                                    {...register('guide')}
                                />
                                <RefValue field="guide" label="Dernier" />
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <Input
                                    label="COQ - Nombre"
                                    type="number"
                                    placeholder="0"
                                    {...register('mort_coq_n')}
                                />
                                {!isNoPctParc && (
                                    <Input
                                        label="COQ - %"
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        {...register('mort_coq_pct')}
                                    />
                                )}
                                <Input
                                    label="POULE - Nombre"
                                    type="number"
                                    placeholder="0"
                                    {...register('mort_poule_n')}
                                />
                                {!isNoPctParc && (
                                    <Input
                                        label="POULE - %"
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        {...register('mort_poule_pct')}
                                    />
                                )}
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                                <RefValue field="mort_coq_n" label="Dernier" />
                                <RefValue field="mort_coq_pct" label="Dernier" />
                                <RefValue field="mort_poule_n" label="Dernier" />
                                <RefValue field="mort_poule_pct" label="Dernier" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                    label="Par semaine % - COQ"
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    {...register('mort_semaine_coq')}
                                />
                                <Input
                                    label="Par semaine % - POULE"
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    {...register('mort_semaine_poule')}
                                />
                                <div className="flex gap-4 mt-1">
                                    <RefValue field="mort_semaine_coq" label="Dernier" />
                                    <RefValue field="mort_semaine_poule" label="Dernier" />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* TRIAGE */}
            <div className="space-y-3">
                <SectionHeader icon={Filter} title="Triage" section="triage" />
                {expandedSections.triage && (
                    <div className="pl-2 space-y-4 animate-fadeIn">
                        <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4">
                            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                                <Input
                                    label="DECHET"
                                    type="number"
                                    placeholder="0"
                                    {...register('triage_dechet')}
                                />
                                <Input
                                    label="COQ FRERE"
                                    type="number"
                                    placeholder="0"
                                    {...register('triage_coq_frere')}
                                />
                                <Input
                                    label="POULE SOEUR"
                                    type="number"
                                    placeholder="0"
                                    {...register('triage_poule_soeur')}
                                />
                                <Input
                                    label="CORRECTION (+)"
                                    type="number"
                                    placeholder="0"
                                    {...register('correction_plus')}
                                />
                                <Input
                                    label="CORRECTION (-)"
                                    type="number"
                                    placeholder="0"
                                    {...register('correction_moins')}
                                />
                                <Input
                                    label="TRANSFERT"
                                    type="number"
                                    placeholder="0"
                                    {...register('transfert')}
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mt-2">
                                <RefValue field="triage_dechet" label="Dernier" />
                                <RefValue field="triage_coq_frere" label="Dernier" />
                                <RefValue field="triage_poule_soeur" label="Dernier" />
                                <RefValue field="correction_plus" label="Dernier" />
                                <RefValue field="correction_moins" label="Dernier" />
                                <RefValue field="transfert" label="Dernier" />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* CUMUL MORTALITÉS */}
            <div className="space-y-3">
                <SectionHeader icon={TrendingUp} title="Cumul Mortalités" section="cumul" />
                {expandedSections.cumul && (
                    <div className="pl-2 space-y-4 animate-fadeIn">
                        <div className="bg-purple-50 border border-purple-100 rounded-lg p-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                    label="COQ (C) %"
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    {...register('cumul_mort_c')}
                                />
                                <Input
                                    label="POULE (P) %"
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    {...register('cumul_mort_p')}
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                                <RefValue field="cumul_mort_c" label="Dernier" />
                                <RefValue field="cumul_mort_p" label="Dernier" />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* POIDS */}
            <div className="space-y-3">
                <SectionHeader icon={Scale} title="Poids Moyen (g)" section="poids" />
                {expandedSections.poids && (
                    <div className="pl-2 space-y-4 animate-fadeIn">
                        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-1">
                                    <Input
                                        label="COQ"
                                        type="number"
                                        placeholder="0"
                                        {...register('poids_coq')}
                                    />
                                    <RefValue field="poids_coq" />
                                </div>
                                <div className="space-y-1">
                                    <Input
                                        label="POULE"
                                        type="number"
                                        placeholder="0"
                                        {...register('poids_poule')}
                                    />
                                    <RefValue field="poids_poule" />
                                </div>
                                <div className="space-y-1">
                                    <Input
                                        label="GUIDE"
                                        type="number"
                                        placeholder="0"
                                        {...register('poids_guide')}
                                    />
                                    <RefValue field="poids_guide" />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* HOMOGÉNÉITÉ - Standalone Field for all Parcs */}
            <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-4 mt-2 mb-4">
                <div className="max-w-[200px]">
                    <Input
                        label="HOMOG %"
                        type="number"
                        step="0.1"
                        placeholder="0.0"
                        {...register('homog_pct')}
                    />
                    <RefValue field="homog_pct" label="Dernière" />
                </div>
            </div>

            {/* ALIMENT */}
            <div className="space-y-3">
                <SectionHeader icon={Utensils} title="Aliment (en kg)" section="aliment" />
                {expandedSections.aliment && (
                    <div className="pl-2 space-y-4 animate-fadeIn">
                        <div className="bg-green-50 border border-green-100 rounded-lg p-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <Input
                                        label="COQ"
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        {...register('aliment_coq')}
                                    />
                                    <RefValue field="aliment_coq" />
                                </div>
                                <div className="space-y-1">
                                    <Input
                                        label="POULE"
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        {...register('aliment_poule')}
                                    />
                                    <RefValue field="aliment_poule" />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Observation */}
            <div className="space-y-3">
                <SectionHeader icon={Calendar} title="Observation" section="observation" />
                {expandedSections.observation && (
                    <div className="pl-2 animate-fadeIn">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Notes et Remarques</label>
                        <textarea
                            className="flex min-h-[100px] w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                            placeholder="Ajoutez vos observations ici..."
                            {...register('observation')}
                        />
                    </div>
                )}
            </div>

            {/* Action Buttons - Fixed at bottom */}
            <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 mt-6 sticky bottom-0 bg-white">
                <Button type="button" variant="secondary" onClick={onCancel}>
                    Annuler
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Enregistrement...' : initialData ? 'Mettre à jour' : 'Ajouter'}
                </Button>
            </div>
        </form>
    );
};

export default ElevageForm;
