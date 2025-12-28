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
    ,
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
        a.download = `elevage_export_${new Date().toISOString().slice(0,10)}.xlsx`;
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
            aliment: row.aliment || row.Aliment || '',
            quantite: Number(row.quantite || row.Quantite || 0),
            observation: row.observation || row.Observation || ''
        }));

        const existing = getStoredData();
        const newData = [...sanitized, ...existing];
        setStoredData(newData);
        return { success: true, imported: sanitized.length };
    }
};
