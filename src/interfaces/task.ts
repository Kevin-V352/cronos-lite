export interface Task {
  id: number
  title: string
  description?: string
  category: number
  date: string
  dateObj: Date | null
  status: 'pending' | 'completed'
  timeOutId: ReturnType<typeof setTimeout> | undefined
};

export interface LocalStorageTasks {
  allTasks: Task[]
  pendingTasks: Task[]
  completedTasks: Task[]
};
