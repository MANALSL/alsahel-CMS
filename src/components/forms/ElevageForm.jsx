import { useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { elevageService } from '../../services/elevageService';

const ElevageForm = ({ initialData, onSubmit, onCancel }) => {
    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
        defaultValues: initialData || {
            date: new Date().toISOString().split('T')[0],
            lot: '',
            ferme: '',
            aliment: '',
            quantite: '',
            poids: '',
            mortalite: '',
            observation: ''
        }
    });

    useEffect(() => {
        if (initialData) {
            reset(initialData);
        }
    }, [initialData, reset]);

    const [fermes, setFermes] = useState([]);

    useEffect(() => {
        const loadF = async () => {
            const f = await elevageService.getFermes();
            setFermes(f || []);
        };
        loadF();
    }, []);

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                    label="Date"
                    type="date"
                    error={errors.date?.message}
                    {...register('date', { required: 'La date est requise' })}
                />
                <Input
                    label="Numéro de Lot"
                    placeholder="Ex: LOT-001"
                    error={errors.lot?.message}
                    {...register('lot', { required: 'Le lot est requis' })}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                    label="Type d'aliment"
                    placeholder="Ex: Maïs, Soja..."
                    error={errors.aliment?.message}
                    {...register('aliment', { required: "L'aliment est requis" })}
                />
                <Input
                    label="Quantité (kg)"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    error={errors.quantite?.message}
                    {...register('quantite', {
                        required: 'La quantité est requise',
                        min: { value: 0, message: 'La quantité doit être positive' }
                    })}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                    label="Poids (g)"
                    type="number"
                    step="0.01"
                    placeholder="0"
                    {...register('poids')}
                />
                <Input
                    label="Mortalité (%)"
                    type="number"
                    step="0.01"
                    placeholder="0"
                    {...register('mortalite')}
                />
            </div>

            <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-1">Ferme</label>
                {fermes.length > 0 ? (
                    <select className="w-full rounded-md border px-3 py-2 text-sm" {...register('ferme')}>
                        <option value="">-- Sélectionner une ferme --</option>
                        {fermes.map(f => <option key={f.id} value={f.name}>{f.name}</option>)}
                    </select>
                ) : (
                    <Input label="Ferme" placeholder="Nom de la ferme" {...register('ferme')} />
                )}
            </div>

            <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-1">Observation</label>
                <textarea
                    className="flex min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Remarques éventuelles..."
                    {...register('observation')}
                />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
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
