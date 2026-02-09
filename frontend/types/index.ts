// API Types

export type Platform = "gmail" | "slack" | "calendar";
export type ItemType = "email" | "slack_message" | "slack_dm" | "calendar_event" | "calendar_invite";
export type ActionType = "reply_needed" | "review_needed" | "meeting_request" | "fyi_only" | "task_assigned" | "none";
export type Category = "work" | "personal" | "school" | "promotional" | "social" | "finance" | "other";
export type DeadlineStatus = "pending" | "completed" | "overdue" | "cancelled";
export type TaskStatus = "todo" | "in_progress" | "done" | "cancelled";
export type TaskPriority = "low" | "medium" | "high" | "urgent";
export type ConnectionStatus = "active" | "expired" | "revoked" | "error";

export interface User {
  id: string;
  email: string;
  name: string;
  timezone: string;
  created_at: string;
}

export interface Item {
  id: string;
  platform: Platform;
  item_type: ItemType;
  external_id: string;
  thread_id?: string;
  subject?: string;
  body?: string;
  snippet?: string;
  sender_name?: string;
  sender_email?: string;
  sender_id?: string;
  channel_id?: string;
  channel_name?: string;
  event_start?: string;
  event_end?: string;
  event_location?: string;
  ai_summary?: string;
  action_required: boolean;
  action_type: ActionType;
  priority_score: number;
  category: Category;
  sentiment?: string;
  is_read: boolean;
  is_archived: boolean;
  is_starred: boolean;
  received_at: string;
  created_at: string;
}

export interface InboxStats {
  total: number;
  unread: number;
  action_required: number;
  by_platform: Record<Platform, number>;
  by_category: Record<Category, number>;
}

export interface Deadline {
  id: string;
  item_id?: string;
  title: string;
  description?: string;
  due_at: string;
  source_text?: string;
  confidence: number;
  status: DeadlineStatus;
  completed_at?: string;
  created_at: string;
}

export interface Task {
  id: string;
  item_id?: string;
  deadline_id?: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  due_at?: string;
  completed_at?: string;
  position: number;
  ai_generated: boolean;
  created_at: string;
}

export interface TaskStats {
  total: number;
  by_status: Record<TaskStatus, number>;
  by_priority: Record<TaskPriority, number>;
  due_today: number;
  overdue: number;
}

export interface Briefing {
  id: string;
  briefing_date: string;
  content: string;
  generated_at: string;
}

export interface Connection {
  id: string;
  platform: Platform;
  external_email?: string;
  status: ConnectionStatus;
  created_at: string;
}

// Request/Response types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  priority?: TaskPriority;
  due_at?: string;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  due_at?: string;
  position?: number;
}

export interface CreateDeadlineRequest {
  title: string;
  description?: string;
  due_at: string;
  item_id?: string;
}

export interface UpdateDeadlineRequest {
  title?: string;
  description?: string;
  due_at?: string;
  status?: DeadlineStatus;
}

export interface UpdateItemRequest {
  is_read?: boolean;
  is_archived?: boolean;
  is_starred?: boolean;
}

// Pagination
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
}
