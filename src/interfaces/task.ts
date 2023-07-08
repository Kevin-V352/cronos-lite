export interface Task {
  id: number
  title: string
  description?: string
  category: number
  date: string
  status: 'pending' | 'completed'
};
