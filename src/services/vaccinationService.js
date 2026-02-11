import api from './api';

export const vaccinationService = {
    getVaccinations: async (parcId = null) => {
        const params = parcId ? { parc_id: parcId } : {};
        const response = await api.get('/vaccination/', { params });
        // Map backend fields to frontend expectations
        return response.data.map(v => ({
            ...v,
            vaccine: v.vaccin_nom,
            // If the backend doesn't return lot directly, we might need to fetch it or use a placeholder
            lot: v.execute_par || 'Parc ' + v.parc_id,
            status: v.status === 'Terminé' ? 'completed' : 'planned'
        }));
    },

    createVaccination: async (vaccination) => {
        const response = await api.post('/vaccination/', vaccination);
        return response.data;
    },

    addVaccination: async (formData) => {
        // Map frontend form to backend schema
        const payload = {
            date: formData.date,
            vaccin_nom: formData.vaccine,
            parc_id: parseInt(formData.parc_id) || 1, // Fallback to 1 if not selected
            methode: formData.type || '', // Store type in methode as a workaround
            execute_par: formData.lot || '', // Store lot string in execute_par
            status: 'Planifié'
        };
        return await vaccinationService.createVaccination(payload);
    },

    updateVaccination: async (id, formData) => {
        const payload = {
            date: formData.date,
            vaccin_nom: formData.vaccine,
            parc_id: formData.parc_id || 1,
            methode: formData.type || '',
            execute_par: formData.lot || '',
            status: formData.status || 'Planifié'
        };
        const response = await api.put(`/vaccination/${id}`, payload);
        return response.data;
    },

    deleteVaccination: async (id) => {
        const response = await api.delete(`/vaccination/${id}`);
        return response.data;
    },

    // Workaround for treatments if they don't have their own endpoint anymore
    getTreatments: async () => {
        // For now, return empty or filter vaccinations if a discriminator is used
        const all = await vaccinationService.getVaccinations();
        return all.filter(v => v.methode === 'Traitement');
    },

    addTreatment: async (formData) => {
        const payload = {
            date: formData.date,
            vaccin_nom: formData.name,
            parc_id: formData.parc_id || 1,
            methode: 'Traitement',
            execute_par: formData.notes || '',
            status: 'Planifié'
        };
        return await vaccinationService.createVaccination(payload);
    },

    updateTreatment: async (id, formData) => {
        const payload = {
            date: formData.date,
            vaccin_nom: formData.name,
            parc_id: formData.parc_id || 1,
            methode: 'Traitement',
            execute_par: formData.notes || '',
            status: 'Planifié'
        };
        return await vaccinationService.updateVaccination(id, payload);
    },

    deleteTreatment: async (id) => {
        return await vaccinationService.deleteVaccination(id);
    },

    markAsCompleted: async (id) => {
        // This is tricky without a dedicated endpoint, we'd need to GET the current data first
        const response = await api.get('/vaccination/');
        const item = response.data.find(v => v.id === id);
        if (item) {
            const updated = { ...item, status: 'Terminé' };
            return await api.put(`/vaccination/${id}`, updated);
        }
    },

    purgeVaccination: async (id) => {
        return await vaccinationService.deleteVaccination(id);
    },

    restoreVaccination: async (id) => {
        // Not implemented in backend revert
        return { message: "Not supported" };
    }
};
