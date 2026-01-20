import { useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { ChevronDown, ChevronUp, Calendar, Users, AlertTriangle, Filter, TrendingUp, Utensils } from 'lucide-react';

const ElevageForm = ({ initialData, onSubmit, onCancel }) => {
    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
        defaultValues: initialData || {
            date: new Date().toISOString().split('T')[0],
            jrs: '',
            age: '',
            effectif_coq: '',
            effectif_poule: '',
            ratio_cp: '',
            mort_coq_n: '',
            mort_coq_pct: '',
            mort_poule_n: '',
            mort_poule_pct: '',
            mort_semaine_coq: '',
            mort_semaine_poule: '',
            triage_coq_reserve: '',
            triage_coq_dechet: '',
            triage_poule_dechet: '',
            triage_poule_couv: '',
            cumul_mort_c: '',
            cumul_mort_p: '',
            aliment_coq: '',
            aliment_poule: '',
            observation: ''
        }
    });

    useEffect(() => {
        if (initialData) {
            reset(initialData);
        }
    }, [initialData, reset]);

    // Collapsible sections state
    const [expandedSections, setExpandedSections] = useState({
        basic: true,
        effectif: true,
        mortalite: false,
        triage: false,
        cumul: false,
        aliment: true,
        observation: false
    });

    const toggleSection = (section) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
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
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Basic Information */}
            <div className="space-y-3">
                <SectionHeader icon={Calendar} title="Informations de Base" section="basic" badge="Requis" />
                {expandedSections.basic && (
                    <div className="pl-2 space-y-4 animate-fadeIn">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Input
                                label="Date"
                                type="date"
                                error={errors.date?.message}
                                {...register('date', { required: 'La date est requise' })}
                            />
                            <Input
                                label="Jours (Jrs)"
                                type="number"
                                placeholder="0"
                                {...register('jrs')}
                            />
                            <Input
                                label="Âge"
                                placeholder="Ex: J10"
                                {...register('age')}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* EFFECTIF */}
            <div className="space-y-3">
                <SectionHeader icon={Users} title="Effectif" section="effectif" />
                {expandedSections.effectif && (
                    <div className="pl-2 space-y-4 animate-fadeIn">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Input
                                label="COQ"
                                type="number"
                                placeholder="0"
                                {...register('effectif_coq')}
                            />
                            <Input
                                label="POULE"
                                type="number"
                                placeholder="0"
                                {...register('effectif_poule')}
                            />
                            <Input
                                label="Ratio %C/P"
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                {...register('ratio_cp')}
                            />
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
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <Input
                                    label="COQ - Nombre"
                                    type="number"
                                    placeholder="0"
                                    {...register('mort_coq_n')}
                                />
                                <Input
                                    label="COQ - %"
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    {...register('mort_coq_pct')}
                                />
                                <Input
                                    label="POULE - Nombre"
                                    type="number"
                                    placeholder="0"
                                    {...register('mort_poule_n')}
                                />
                                <Input
                                    label="POULE - %"
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    {...register('mort_poule_pct')}
                                />
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
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <Input
                                    label="COQ RESERVE"
                                    type="number"
                                    placeholder="0"
                                    {...register('triage_coq_reserve')}
                                />
                                <Input
                                    label="COQ DECHET"
                                    type="number"
                                    placeholder="0"
                                    {...register('triage_coq_dechet')}
                                />
                                <Input
                                    label="POULE DECHET"
                                    type="number"
                                    placeholder="0"
                                    {...register('triage_poule_dechet')}
                                />
                                <Input
                                    label="POULE COUV"
                                    type="number"
                                    placeholder="0"
                                    {...register('triage_poule_couv')}
                                />
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
                                    label="COQ (C)"
                                    type="number"
                                    placeholder="0"
                                    {...register('cumul_mort_c')}
                                />
                                <Input
                                    label="POULE (P)"
                                    type="number"
                                    placeholder="0"
                                    {...register('cumul_mort_p')}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* ALIMENT */}
            <div className="space-y-3">
                <SectionHeader icon={Utensils} title="Aliment (en kg)" section="aliment" />
                {expandedSections.aliment && (
                    <div className="pl-2 space-y-4 animate-fadeIn">
                        <div className="bg-green-50 border border-green-100 rounded-lg p-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                    label="COQ"
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    {...register('aliment_coq')}
                                />
                                <Input
                                    label="POULE"
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    {...register('aliment_poule')}
                                />
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
