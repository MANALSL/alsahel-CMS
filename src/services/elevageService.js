const STORAGE_KEY = 'elevage_data';

const initialData = [
    { id: 1, date: '2023-10-01', lot: 'LOT-001', aliment: 'Maïs', quantite: 500, observation: 'RAS' },
    { id: 2, date: '2023-10-02', lot: 'LOT-001', aliment: 'Soja', quantite: 200, observation: 'RAS' },
    { id: 3, date: '2023-10-01', lot: 'LOT-002', aliment: 'Maïs', quantite: 450, observation: 'Pluie' },
    { id: 4, date: '2023-10-03', lot: 'LOT-003', aliment: 'Mix', quantite: 300, observation: '' },
    { id: 5, date: '2023-10-04', lot: 'LOT-001', aliment: 'Maïs', quantite: 520, observation: '' },
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

export const elevageService = {
    getElevages: async () => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(getStoredData());
            }, 500); // Simulate network delay
        });
    },

    createElevage: async (elevage) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const data = getStoredData();
                const newElevage = { ...elevage, id: Date.now() };
                const newData = [newElevage, ...data];
                setStoredData(newData);
                resolve(newElevage);
            }, 500);
        });
    },

    updateElevage: async (id, updatedElevage) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const data = getStoredData();
                const newData = data.map(item => item.id === id ? { ...item, ...updatedElevage } : item);
                setStoredData(newData);
                resolve(updatedElevage);
            }, 500);
        });
    },

    deleteElevage: async (id) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const data = getStoredData();
                const newData = data.filter(item => item.id !== id);
                setStoredData(newData);
                resolve(id);
            }, 500);
        });
    }
};
