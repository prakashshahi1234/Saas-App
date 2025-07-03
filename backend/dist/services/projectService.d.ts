import { IProject } from '../models/Project';
export interface CreateProjectData {
    title: string;
    description: string;
    status?: IProject['status'];
    priority?: IProject['priority'];
    userId: string;
    startDate: Date;
    endDate: Date;
    progress?: number;
    tags?: string[];
    budget?: number;
    teamMembers?: string[];
    notes?: string;
}
export interface UpdateProjectData {
    title?: string;
    description?: string;
    status?: IProject['status'];
    priority?: IProject['priority'];
    startDate?: Date;
    endDate?: Date;
    progress?: number;
    tags?: string[];
    budget?: number;
    teamMembers?: string[];
    notes?: string;
}
export interface ProjectStats {
    total: number;
    planning: number;
    inProgress: number;
    completed: number;
    onHold: number;
    cancelled: number;
}
export declare class ProjectService {
    private model;
    constructor();
    createProject(data: CreateProjectData): Promise<IProject>;
    getProjectsByUser(userId: string): Promise<IProject[]>;
    getProjectsByStatus(userId: string, status: IProject['status']): Promise<IProject[]>;
    getProjectById(projectId: string, userId: string): Promise<IProject | null>;
    updateProject(projectId: string, userId: string, data: UpdateProjectData): Promise<IProject | null>;
    updateProjectProgress(projectId: string, userId: string, progress: number): Promise<IProject | null>;
    deleteProject(projectId: string, userId: string): Promise<boolean>;
    getProjectStats(userId: string): Promise<ProjectStats>;
    searchProjects(userId: string, searchTerm: string): Promise<IProject[]>;
}
export declare const projectService: ProjectService;
//# sourceMappingURL=projectService.d.ts.map