import { api } from './api'; 
import { adminApi } from './adminApi';
export const complaintService = {
  async getMyComplaints() {
    try {
      const res = await api.get('/complaints/my'); 
      return res.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch complaints');
    }
  },

  async getById(id: string) {
    try {
      const res = await api.get(`/complaints/${id}`);
      return res.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch complaint');
    }
  },

  async create(data: { title: string; description: string }) {
    try {
      const res = await api.post('/complaints', data);
      return res.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create complaint');
    }
  },



  async getAllComplaints() {
    const res = await adminApi.get('/complaints');
    return res.data;
  },

  async updateComplaintStatus(id: string, status: string) {
    const res = await adminApi.patch(`/complaints/${id}`, { status });
    return res.data;
  },

  async getComplaintById(id: string) {
    const res = await adminApi.get(`/complaints/${id}`);
    return res.data;
  },

};