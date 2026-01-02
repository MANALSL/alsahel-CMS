const STORAGE_KEY = 'elevage_data';
const FERMES_KEY = 'fermes_data';

const defaultFermes = [
    {
        id: 1,
        name: 'Ferme Principale',
        // default structure: 9 buildings x 5 parks each
        structure: Array.from({ length: 9 }).map((_, bIdx) => ({
            name: `Bâtiment ${bIdx + 1}`,
            parks: Array.from({ length: 5 }).map((__, pIdx) => ({ name: `Parc ${pIdx + 1}`, count: 0 }))
        }))
    }
];

const getStoredFermes = () => {
    const stored = localStorage.getItem(FERMES_KEY);
    if (!stored) {
        localStorage.setItem(FERMES_KEY, JSON.stringify(defaultFermes));
        return defaultFermes;
    }
    return JSON.parse(stored);
};

const setStoredFermes = (data) => {
    localStorage.setItem(FERMES_KEY, JSON.stringify(data));
};

const initialData = [
    { id: 1, date: '2023-10-01', lot: 'LOT-001', ferme: 'Ferme Principale', aliment: 'Maïs', quantite: 500, poids: 1200, mortalite: 1.2, observation: 'RAS' },
    { id: 2, date: '2023-10-02', lot: 'LOT-001', ferme: 'Ferme Principale', aliment: 'Soja', quantite: 200, poids: 1150, mortalite: 0.8, observation: 'RAS' },
    { id: 3, date: '2023-10-01', lot: 'LOT-002', ferme: 'Ferme Sud', aliment: 'Maïs', quantite: 450, poids: 1100, mortalite: 2.1, observation: 'Pluie' },
    { id: 4, date: '2023-10-03', lot: 'LOT-003', ferme: 'Ferme Est', aliment: 'Mix', quantite: 300, poids: 1000, mortalite: 0.5, observation: '' },
    { id: 5, date: '2023-10-04', lot: 'LOT-001', ferme: 'Ferme Principale', aliment: 'Maïs', quantite: 520, poids: 1230, mortalite: 1.0, observation: '' },
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
        // Soft-delete: mark as deleted so record remains in history
        return new Promise((resolve) => {
            setTimeout(() => {
                const data = getStoredData();
                const newData = data.map(item => item.id === id ? { ...item, deleted: true, deletedAt: new Date().toISOString() } : item);
                setStoredData(newData);
                resolve(id);
            }, 500);
        });
    }
    ,
    restoreElevage: async (id) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const data = getStoredData();
                const newData = data.map(item => item.id === id ? { ...item, deleted: false, deletedAt: null } : item);
                setStoredData(newData);
                resolve(id);
            }, 500);
        });
    },
    purgeElevage: async (id) => {
        // Permanent delete
        return new Promise((resolve) => {
            setTimeout(() => {
                const data = getStoredData();
                const newData = data.filter(item => item.id !== id);
                setStoredData(newData);
                resolve(id);
            }, 500);
        });
    }
    ,
    // Fermes (management of farms with buildings & parks)
    getFermes: async () => {
        return new Promise((resolve) => {
            setTimeout(() => resolve(getStoredFermes()), 200);
        });
    },
    addFerme: async (ferme) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const data = getStoredFermes();
                const newItem = { ...ferme, id: Date.now() };
                const newData = [...data, newItem];
                setStoredFermes(newData);
                resolve(newItem);
            }, 200);
        });
    },
    updateFerme: async (id, updated) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const data = getStoredFermes();
                const newData = data.map(item => item.id === id ? { ...item, ...updated } : item);
                setStoredFermes(newData);
                resolve(newData.find(i => i.id === id));
            }, 200);
        });
    },
    deleteFerme: async (id) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const data = getStoredFermes();
                const newData = data.filter(item => item.id !== id);
                setStoredFermes(newData);
                resolve(id);
            }, 200);
        });
    },
    exportElevages: async () => {
        const data = getStoredData();
        // Dynamically import xlsx to keep initial bundle small
        const XLSX = await import('xlsx');
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Elevages');
        const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([wbout], { type: 'application/octet-stream' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `elevage_export_${new Date().toISOString().slice(0, 10)}.xlsx`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        return true;
    },

    importElevages: async (file) => {
        if (!file) return { success: false, message: 'No file provided' };
        const text = await file.arrayBuffer();
        const XLSX = await import('xlsx');
        const wb = XLSX.read(text, { type: 'array' });
        const sheetName = wb.SheetNames[0];
        const ws = wb.Sheets[sheetName];
        const imported = XLSX.utils.sheet_to_json(ws, { defval: '' });

        if (!Array.isArray(imported) || imported.length === 0) {
            return { success: false, message: 'No rows found in the Excel file' };
        }

        // Basic validation: ensure at least 'date' and 'lot' fields exist
        const sanitized = imported.map((row, idx) => ({
            id: Date.now() + idx,
            date: row.date || row.Date || '',
            lot: row.lot || row.Lot || '',
            ferme: row.ferme || row.Ferme || '',
            aliment: row.aliment || row.Aliment || '',
            quantite: Number(row.quantite || row.Quantite || 0),
            poids: Number(row.poids || row.Poids || 0),
            mortalite: Number(row.mortalite || row.Mortalite || 0),
            observation: row.observation || row.Observation || ''
        }));

        const existing = getStoredData();
        const newData = [...sanitized, ...existing];
        setStoredData(newData);
        return { success: true, imported: sanitized.length };
    }
};
