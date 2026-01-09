export interface Task {
  id: string;
  title: string;
  description: string;
  assigned_to: string; // Email nhân viên nhận việc (ví dụ: trikt@ngoi.com)
  created_by: string;  // Email người giao (ví dụ: admin@ngoi.com)
  deadline: string;    // Hạn chót
  status: 'pending' | 'completed' | 'approved'; // Trạng thái công việc
  created_at: string;
}

export interface Profile {
  email: string;
  role_level: 1 | 2 | 3; // 1: Admin, 2: Quản lý, 3: Nhân viên
}