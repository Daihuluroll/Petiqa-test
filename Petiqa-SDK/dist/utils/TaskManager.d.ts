interface TaskStatus {
    [key: string]: boolean;
}
export declare const loadTaskStatus: () => Promise<TaskStatus>;
export declare const saveTaskStatus: (status: TaskStatus) => Promise<void>;
export declare const completeTask: (taskName: string) => Promise<void>;
export declare const resetTasks: () => Promise<void>;
export {};
