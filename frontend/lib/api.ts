import axios, { AxiosError, AxiosInstance } from "axios";
import {
  AuthResponse,
  Briefing,
  ChatRequest,
  ChatResponse,
  Connection,
  CreateDeadlineRequest,
  CreateTaskRequest,
  Deadline,
  InboxStats,
  Item,
  LoginRequest,
  PaginatedResponse,
  RegisterRequest,
  Task,
  TaskStats,
  UpdateDeadlineRequest,
  UpdateItemRequest,
  UpdateTaskRequest,
  User,
} from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

class ApiClient {
  private client: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use((config) => {
      if (this.token) {
        config.headers.Authorization = `Bearer ${this.token}`;
      }
      return config;
    });

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          this.token = null;
          if (typeof window !== "undefined") {
            localStorage.removeItem("token");
            window.location.href = "/login";
          }
        }
        return Promise.reject(error);
      }
    );

    // Load token from localStorage on init
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("token");
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== "undefined") {
      if (token) {
        localStorage.setItem("token", token);
      } else {
        localStorage.removeItem("token");
      }
    }
  }

  getToken() {
    return this.token;
  }

  // Auth
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>(
      "/api/v1/auth/register",
      data
    );
    this.setToken(response.data.access_token);
    return response.data;
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>(
      "/api/v1/auth/login",
      new URLSearchParams({
        username: data.email,
        password: data.password,
      }),
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );
    this.setToken(response.data.access_token);
    return response.data;
  }

  async logout() {
    this.setToken(null);
  }

  async getMe(): Promise<User> {
    const response = await this.client.get<User>("/api/v1/auth/me");
    return response.data;
  }

  // Inbox
  async getInboxItems(params?: {
    platform?: string;
    category?: string;
    action_required?: boolean;
    is_read?: boolean;
    is_archived?: boolean;
    page?: number;
    page_size?: number;
  }): Promise<{ items: Item[]; total: number }> {
    const response = await this.client.get<Item[]>(
      "/api/v1/inbox",
      { params: { ...params, limit: params?.page_size, offset: params?.page ? (params.page - 1) * (params.page_size || 50) : 0 } }
    );
    return { items: response.data, total: response.data.length };
  }

  async getInboxStats(): Promise<InboxStats> {
    const response = await this.client.get<InboxStats>("/api/v1/inbox/stats");
    return response.data;
  }

  async getItem(id: string): Promise<Item> {
    const response = await this.client.get<Item>(`/api/v1/inbox/${id}`);
    return response.data;
  }

  async updateItem(id: string, data: UpdateItemRequest): Promise<Item> {
    const response = await this.client.patch<Item>(`/api/v1/inbox/${id}`, data);
    return response.data;
  }

  async archiveItem(id: string): Promise<Item> {
    const response = await this.client.post<Item>(`/api/v1/inbox/${id}/archive`);
    return response.data;
  }

  async markItemAsRead(id: string): Promise<Item> {
    const response = await this.client.post<Item>(`/api/v1/inbox/${id}/read`);
    return response.data;
  }

  async processItemAI(id: string): Promise<Item> {
    const response = await this.client.post<Item>(`/api/v1/inbox/${id}/process`);
    return response.data;
  }

  async getNextEvent(): Promise<Item | null> {
    const response = await this.client.get<Item | null>("/api/v1/inbox/next-event");
    return response.data;
  }

  async processAllItemsAI(): Promise<{ status: string; processed: number; total: number; errors?: any[] }> {
    const response = await this.client.post<{ status: string; processed: number; total: number; errors?: any[] }>(
      "/api/v1/inbox/process-all"
    );
    return response.data;
  }

  // Deadlines
  async getDeadlines(params?: {
    status?: string;
    page?: number;
    page_size?: number;
  }): Promise<PaginatedResponse<Deadline>> {
    const response = await this.client.get<PaginatedResponse<Deadline>>(
      "/api/v1/deadlines",
      { params }
    );
    return response.data;
  }

  async getUpcomingDeadlines(days?: number): Promise<Deadline[]> {
    const response = await this.client.get<Deadline[]>(
      "/api/v1/deadlines/upcoming",
      { params: { days } }
    );
    return response.data;
  }

  async getOverdueDeadlines(): Promise<Deadline[]> {
    const response = await this.client.get<Deadline[]>(
      "/api/v1/deadlines/overdue"
    );
    return response.data;
  }

  async getDeadline(id: string): Promise<Deadline> {
    const response = await this.client.get<Deadline>(`/api/v1/deadlines/${id}`);
    return response.data;
  }

  async createDeadline(data: CreateDeadlineRequest): Promise<Deadline> {
    const response = await this.client.post<Deadline>(
      "/api/v1/deadlines",
      data
    );
    return response.data;
  }

  async updateDeadline(
    id: string,
    data: UpdateDeadlineRequest
  ): Promise<Deadline> {
    const response = await this.client.patch<Deadline>(
      `/api/v1/deadlines/${id}`,
      data
    );
    return response.data;
  }

  async completeDeadline(id: string): Promise<Deadline> {
    const response = await this.client.post<Deadline>(
      `/api/v1/deadlines/${id}/complete`
    );
    return response.data;
  }

  // Tasks
  async getTasks(params?: {
    status?: string;
    priority?: string;
    page?: number;
    page_size?: number;
  }): Promise<PaginatedResponse<Task>> {
    const response = await this.client.get<PaginatedResponse<Task>>(
      "/api/v1/tasks",
      { params }
    );
    return response.data;
  }

  async getTaskStats(): Promise<TaskStats> {
    const response = await this.client.get<TaskStats>("/api/v1/tasks/stats");
    return response.data;
  }

  async getTask(id: string): Promise<Task> {
    const response = await this.client.get<Task>(`/api/v1/tasks/${id}`);
    return response.data;
  }

  async createTask(data: CreateTaskRequest): Promise<Task> {
    const response = await this.client.post<Task>("/api/v1/tasks", data);
    return response.data;
  }

  async updateTask(id: string, data: UpdateTaskRequest): Promise<Task> {
    const response = await this.client.patch<Task>(`/api/v1/tasks/${id}`, data);
    return response.data;
  }

  async deleteTask(id: string): Promise<void> {
    await this.client.delete(`/api/v1/tasks/${id}`);
  }

  async completeTask(id: string): Promise<Task> {
    const response = await this.client.post<Task>(`/api/v1/tasks/${id}/complete`);
    return response.data;
  }

  // Briefings
  async getTodayBriefing(): Promise<Briefing | null> {
    try {
      const response = await this.client.get<Briefing>("/api/v1/briefings/today");
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  async getBriefing(date: string): Promise<Briefing> {
    const response = await this.client.get<Briefing>(
      `/api/v1/briefings/${date}`
    );
    return response.data;
  }

  async generateBriefing(): Promise<Briefing> {
    const response = await this.client.post<Briefing>(
      "/api/v1/briefings/generate"
    );
    return response.data;
  }

  // Chat
  async sendChatMessage(data: ChatRequest): Promise<ChatResponse> {
    const response = await this.client.post<ChatResponse>(
      "/api/v1/chat",
      data
    );
    return response.data;
  }

  // Transcripts
  async uploadTranscript(file: File, title?: string): Promise<Item> {
    const formData = new FormData();
    formData.append("file", file);
    if (title) {
      formData.append("title", title);
    }
    const response = await this.client.post<Item>(
      "/api/v1/transcripts/upload",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return response.data;
  }

  // Connections
  async getConnections(): Promise<Connection[]> {
    const response = await this.client.get<Connection[]>("/api/v1/connections");
    return response.data;
  }

  async getConnection(platform: string): Promise<Connection> {
    const response = await this.client.get<Connection>(
      `/api/v1/connections/${platform}`
    );
    return response.data;
  }

  async disconnectPlatform(platform: string): Promise<void> {
    await this.client.delete(`/api/v1/connections/${platform}`);
  }

  async getOAuthUrl(platform: string): Promise<{ url: string }> {
    const response = await this.client.get<{ auth_url: string }>(
      `/api/v1/connections/oauth/${platform}/authorize`
    );
    return { url: response.data.auth_url };
  }

  async syncPlatform(platform: string): Promise<{ message: string }> {
    const response = await this.client.post<{ message: string }>(
      `/api/v1/connections/${platform}/sync`
    );
    return response.data;
  }
}

export const api = new ApiClient();
export default api;
