import { useState, useEffect } from 'react';
import { vaccinationService } from '../services/vaccinationService';
import VaccinationCalendar from '../components/vaccination/VaccinationCalendar';
import VaccinationAlerts from '../components/vaccination/VaccinationAlerts';
import { Card } from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Plus, Check, Syringe } from 'lucide-react';
import { useForm } from 'react-hook-form';

const Vaccination = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);

    const { register, handleSubmit, reset, setValue } = useForm();

    const loadData = async () => {
        setLoading(true);
        const result = await vaccinationService.getVaccinations();
        setData(result);
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleMarkAsComplete = async (id) => {
        await vaccinationService.markAsCompleted(id);
        loadData();
    };

    const handleAddVaccine = async (formData) => {
        await vaccinationService.addVaccination(formData);
        setIsModalOpen(false);
        reset();
        loadData();
    };

    const onDateClick = (date) => {
        // Set default date in form
        const formattedDate = date.toISOString().split('T')[0];
        setValue('date', formattedDate);
        setSelectedDate(date);
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Vaccination</h1>
                    <p className="text-sm text-gray-500">Suivi sanitaire et plan de vaccination</p>
                </div>
                <Button onClick={() => { setSelectedDate(new Date()); setIsModalOpen(true); }}>
                    <Plus size={20} className="mr-2" />
                    Planifier un vaccin
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <VaccinationCalendar events={data} onDateClick={onDateClick} />

                    <div className="bg-white p-4 rounded-xl border border-gray-100">
                        <h3 className="font-semibold mb-3">Légende</h3>
                        <div className="flex gap-4 text-xs">
                            <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-green-100 border border-green-200 mr-2"></span> Fait</div>
                            <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-blue-100 border border-blue-200 mr-2"></span> Planifié</div>
                            <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-red-100 border border-red-200 mr-2"></span> En retard</div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-1">
                    <VaccinationAlerts vaccinations={data} onMarkComplete={handleMarkAsComplete} />
                </div>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Planifier une vaccination"
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
                        placeholder="Ex: Newcastle, Gumboro..."
                        {...register('vaccine', { required: true })}
                    />
                    <Input
                        label="Lot concerné"
                        placeholder="Ex: LOT-001"
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

                    <div className="pt-4 flex justify-end gap-3">
                        <Button variant="secondary" type="button" onClick={() => setIsModalOpen(false)}>Annuler</Button>
                        <Button type="submit">Enregistrer</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Vaccination;
