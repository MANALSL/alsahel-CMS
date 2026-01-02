const STORAGE_KEY = 'vaccination_data';
const TREATMENTS_KEY = 'treatments_data';

const defaultTreatments = [
    { id: 1, name: 'Traitement initial', date: new Date().toISOString(), protocol: 'standard', notes: '' }
];

// Protocol definitions: arrays of days after the treatment date
const PROTOCOLS = {
    standard: [0, 14, 28, 180],
    short: [0, 28, 180],
    long: [0, 14, 28, 60, 180]
};

const initialData = [
    { id: 1, date: new Date(Date.now() + 86400000 * 2).toISOString(), vaccine: 'Nobilis Ma5 + Nobilis IB4/91', lot: 'LOT-001', status: 'planned', type: 'primary' }, // In 2 days
    { id: 2, date: new Date(Date.now() - 86400000 * 1).toISOString(), vaccine: 'Gallimune Flu H9 + ND', lot: 'LOT-002', status: 'overdue', type: 'booster' }, // Yesterday (Overdue)
    { id: 3, date: new Date(Date.now() + 86400000 * 5).toISOString(), vaccine: 'Cevac Gumbo L', lot: 'LOT-001', status: 'planned', type: 'primary' }, // In 5 days
    { id: 4, date: new Date(Date.now() - 86400000 * 10).toISOString(), vaccine: 'Avinew', lot: 'LOT-003', status: 'completed', type: 'primary' }, // Past
    { id: 5, date: new Date(Date.now() + 86400000 * 15).toISOString(), vaccine: 'Cevac New L', lot: 'LOT-002', status: 'planned', type: 'primary' }, // Future
    { id: 3, date: new Date(Date.now() + 86400000 * 5).toISOString(), vaccine: 'CEVAC IBD L', lot: 'LOT-001', status: 'planned', type: 'primary' }, // In 5 days
    { id: 4, date: new Date(Date.now() - 86400000 * 10).toISOString(), vaccine: 'MA5 CLONE 30 ', lot: 'LOT-003', status: 'completed', type: 'primary' }, // Past
    { id: 5, date: new Date(Date.now() + 86400000 * 15).toISOString(), vaccine: 'Gallimune 208 (ND+AI) ', lot: 'LOT-002', status: 'planned', type: 'primary' }, // Future
    { id: 1, date: new Date(Date.now() + 86400000 * 2).toISOString(), vaccine: 'Noblis IB4/91 + Nobilis CLONE 30', lot: 'LOT-001', status: 'planned', type: 'primary' }, // In 2 days
    { id: 2, date: new Date(Date.now() - 86400000 * 1).toISOString(), vaccine: ' Nobilis REO ', lot: 'LOT-002', status: 'overdue', type: 'booster' }, // Yesterday (Overdue)
    { id: 3, date: new Date(Date.now() + 86400000 * 5).toISOString(), vaccine: 'Vectormune FP-LT+AE', lot: 'LOT-001', status: 'planned', type: 'primary' }, // In 5 days
    { id: 4, date: new Date(Date.now() - 86400000 * 10).toISOString(), vaccine: 'TAD TYMOVAC', lot: 'LOT-003', status: 'completed', type: 'primary' }, // Past
    { id: 5, date: new Date(Date.now() + 86400000 * 15).toISOString(), vaccine: 'Nobilis CORVAC', lot: 'LOT-002', status: 'planned', type: 'primary' }, // Future
     { id: 3, date: new Date(Date.now() + 86400000 * 5).toISOString(), vaccine: 'NEMOVAC ou Nobilis Rhino CV', lot: 'LOT-001', status: 'planned', type: 'primary' }, // In 5 days
    { id: 5, date: new Date(Date.now() + 86400000 * 15).toISOString(), vaccine: 'Nobilis Rhino CV ou NEMOVAC', lot: 'LOT-002', status: 'planned', type: 'primary' }, // Future
    { id: 1, date: new Date(Date.now() + 86400000 * 2).toISOString(), vaccine: 'Nobilis RT+IB Multi+ND+EDS', lot: 'LOT-001', status: 'planned', type: 'primary' }, // In 2 days
    { id: 2, date: new Date(Date.now() - 86400000 * 1).toISOString(), vaccine: 'Nobilis CORVAC ', lot: 'LOT-002', status: 'overdue', type: 'booster' }, // Yesterday (Overdue)
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

const getStoredTreatments = () => {
    const stored = localStorage.getItem(TREATMENTS_KEY);
    if (!stored) {
        localStorage.setItem(TREATMENTS_KEY, JSON.stringify(defaultTreatments));
        return defaultTreatments;
    }
    return JSON.parse(stored);
};

const setStoredTreatments = (data) => {
    localStorage.setItem(TREATMENTS_KEY, JSON.stringify(data));
};

export const vaccinationService = {
    getVaccinations: async () => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(getStoredData());
            }, 500);
        });
    },
    getProtocols: async () => {
        return new Promise((resolve) => {
            setTimeout(() => resolve(PROTOCOLS), 100);
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
    ,
    updateVaccination: async (id, updated) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const data = getStoredData();
                const newData = data.map(item => item.id === id ? { ...item, ...updated } : item);
                setStoredData(newData);
                resolve(newData.find(i => i.id === id));
            }, 500);
        });
    }
    ,
    deleteVaccination: async (id) => {
        // Soft-delete: mark as deleted so it remains in history
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
    restoreVaccination: async (id) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const data = getStoredData();
                const newData = data.map(item => item.id === id ? { ...item, deleted: false, deletedAt: null } : item);
                setStoredData(newData);
                resolve(id);
            }, 500);
        });
    },
    purgeVaccination: async (id) => {
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
    // Treatments management
    getTreatments: async () => {
        return new Promise((resolve) => {
            setTimeout(() => resolve(getStoredTreatments()), 200);
        });
    },
    addTreatment: async (treatment) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const data = getStoredTreatments();
                const newItem = { ...treatment, id: Date.now() };
                const newData = [...data, newItem];
                setStoredTreatments(newData);
                resolve(newItem);
            }, 200);
        });
    },
    updateTreatment: async (id, updated) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const data = getStoredTreatments();
                const newData = data.map(item => item.id === id ? { ...item, ...updated } : item);
                setStoredTreatments(newData);
                resolve(newData.find(i => i.id === id));
            }, 200);
        });
    },
    deleteTreatment: async (id) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const data = getStoredTreatments();
                const newData = data.filter(item => item.id !== id);
                setStoredTreatments(newData);
                resolve(id);
            }, 200);
        });
    }
    ,
    /**
     * Compute a recommended vaccination schedule based on age and the date
     * of the last treatment (ISO string). `ageValue` may be expressed in
     * months (default), weeks ('weeks'), or days ('days'). Returns an array
     * of dose objects with `dose`, `date` (ISO) and `dueInDays` relative to today.
     */
    getVaccinationSchedule: async (ageValue, lastTreatmentDateIso, unit = 'months', protocol = 'standard') => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const start = lastTreatmentDateIso ? new Date(lastTreatmentDateIso) : new Date();
                const today = new Date();
                let intervals = [];

                let ageMonths = 0;
                if (typeof ageValue === 'number' && !Number.isNaN(ageValue)) {
                    if (unit === 'weeks') {
                        ageMonths = ageValue / 4.345; // approximate conversion weeks -> months
                    } else if (unit === 'days') {
                        ageMonths = ageValue / 30.44; // approximate conversion days -> months
                    } else {
                        ageMonths = ageValue;
                    }
                }

                // If a protocol is provided and known, use its intervals (days)
                if (protocol && PROTOCOLS[protocol]) {
                    intervals = PROTOCOLS[protocol];
                } else {
                    if (ageMonths < 3) {
                        intervals = [0, 14, 28, 180];
                    } else if (ageMonths < 6) {
                        intervals = [0, 28, 180];
                    } else {
                        intervals = [0, 180];
                    }
                }

                const schedule = intervals.map((days, idx) => {
                    const date = new Date(start.getTime() + days * 24 * 60 * 60 * 1000);
                    const dueInDays = Math.ceil((date - today) / (24 * 60 * 60 * 1000));
                    return {
                        dose: idx + 1,
                        daysAfterLast: days,
                        date: date.toISOString(),
                        dueInDays,
                        status: dueInDays < 0 ? 'passed' : (dueInDays === 0 ? 'due' : 'upcoming')
                    };
                });

                resolve(schedule);
            }, 300);
        });
    }
};
