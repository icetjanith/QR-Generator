// API client for frontend to backend communication
const API_BASE = '/api';

class ApiClient {
  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(url, config);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(error.error || 'Request failed');
    }

    return response.json();
  }

  // Auth
  async login(email: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async logout() {
    return this.request('/auth/logout', {
      method: 'POST',
    });
  }

  // Products
  async getProducts(params?: { search?: string; category?: string; page?: number; limit?: number }) {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set('search', params.search);
    if (params?.category) searchParams.set('category', params.category);
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    
    return this.request(`/products?${searchParams}`);
  }

  async createProduct(productData: any) {
    return this.request('/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  }

  // Batches
  async getBatches(params?: { search?: string; status?: string; page?: number; limit?: number }) {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set('search', params.search);
    if (params?.status) searchParams.set('status', params.status);
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    
    return this.request(`/batches?${searchParams}`);
  }

  async createBatch(batchData: any) {
    return this.request('/batches', {
      method: 'POST',
      body: JSON.stringify(batchData),
    });
  }

  // Units
  async getUnits(params?: { batchId?: string; status?: string; page?: number; limit?: number }) {
    const searchParams = new URLSearchParams();
    if (params?.batchId) searchParams.set('batchId', params.batchId);
    if (params?.status) searchParams.set('status', params.status);
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    
    return this.request(`/units?${searchParams}`);
  }

  async createUnits(unitsData: any) {
    return this.request('/units', {
      method: 'POST',
      body: JSON.stringify(unitsData),
    });
  }

  async getUnitByToken(token: string) {
    return this.request(`/units/${token}`);
  }

  async updateUnit(token: string, updateData: any) {
    return this.request(`/units/${token}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  }

  // Analytics
  async getAnalytics() {
    return this.request('/analytics');
  }
}

export const apiClient = new ApiClient();