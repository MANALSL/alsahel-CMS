const STORAGE_KEY = 'vaccination_data';

const initialData = [
    { id: 1, date: new Date(Date.now() + 86400000 * 2).toISOString(), vaccine: 'Newcastel', lot: 'LOT-001', status: 'planned', type: 'primary' }, // In 2 days
    { id: 2, date: new Date(Date.now() - 86400000 * 1).toISOString(), vaccine: 'Bronchite', lot: 'LOT-002', status: 'overdue', type: 'booster' }, // Yesterday (Overdue)
    { id: 3, date: new Date(Date.now() + 86400000 * 5).toISOString(), vaccine: 'Gumboro', lot: 'LOT-001', status: 'planned', type: 'primary' }, // In 5 days
    { id: 4, date: new Date(Date.now() - 86400000 * 10).toISOString(), vaccine: 'Marek', lot: 'LOT-003', status: 'completed', type: 'primary' }, // Past
    { id: 5, date: new Date(Date.now() + 86400000 * 15).toISOString(), vaccine: 'Variole', lot: 'LOT-002', status: 'planned', type: 'primary' }, // Future
];

const getStoredData = () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
        return initialData;
    }
    return JSON.parse(stored);
};

const setStoredData = (data) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const vaccinationService = {
    getVaccinations: async () => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(getStoredData());
            }, 500);
        });
    },

    markAsCompleted: async (id) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const data = getStoredData();
                const newData = data.map(item => item.id === id ? { ...item, status: 'completed' } : item);
                setStoredData(newData);
                resolve(newData);
            }, 500);
        });
    },

    addVaccination: async (vaccine) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const data = getStoredData();
                const newVaccine = { ...vaccine, id: Date.now(), status: 'planned' };
                const newData = [...data, newVaccine];
                setStoredData(newData);
                resolve(newVaccine);
            }, 500);
        });
    }
};
