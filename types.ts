
export interface UserProfile {
  id: string;
  username: string;
  email: string;
  role_level: number;
  full_name?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  deadline: string;
  assignee_id: string;
  created_by?: string;
  status: 'new' | 'pending' | 'completed';
  created_at: string;
  profiles?: {
    full_name: string;
    username: string;
  };
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'reminder' | 'task_new' | 'task_approved';
  is_read: boolean;
  created_at: string;
}

export type AuthState = {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
};
