import { Request, Response } from 'express';
import { ProjectService } from '../services/projectService';
export declare class ProjectController {
    private projectService;
    constructor(projectService: ProjectService);
    getProjects(req: Request, res: Response): Promise<void>;
    getProjectsByStatus(req: Request, res: Response): Promise<void>;
    getProject(req: Request, res: Response): Promise<void>;
    createProject(req: Request, res: Response): Promise<void>;
    updateProject(req: Request, res: Response): Promise<void>;
    updateProjectProgress(req: Request, res: Response): Promise<void>;
    deleteProject(req: Request, res: Response): Promise<void>;
    getProjectStats(req: Request, res: Response): Promise<void>;
    searchProjects(req: Request, res: Response): Promise<void>;
}
export declare const projectController: ProjectController;
//# sourceMappingURL=projectController.d.ts.map