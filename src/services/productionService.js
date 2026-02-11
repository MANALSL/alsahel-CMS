import api from './api';

export const productionService = {
    getProductionRecords: async (parcId = null) => {
        const params = parcId ? { parc_id: parcId } : {};
        const response = await api.get('/production/', { params });
        return response.data;
    },

    createProductionRecord: async (record) => {
        const response = await api.post('/production/', record);
        return response.data;
    },

    updateProductionRecord: async (id, updatedRecord) => {
        const response = await api.put(`/production/${id}`, updatedRecord);
        return response.data;
    },

    deleteProductionRecord: async (id) => {
        const response = await api.delete(`/production/${id}`);
        return response.data;
    }
};
