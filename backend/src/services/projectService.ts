import Project, { IProject } from '../models/Project';

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

export class ProjectService {
  private model: typeof Project;

  constructor() {
    this.model = Project;
  }

  // Create a new project
  async createProject(data: CreateProjectData): Promise<IProject> {
    try {
      const project = new this.model(data);
      return await project.save();
    } catch (error) {
      throw new Error(`Failed to create project: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get all projects for a user
  async getProjectsByUser(userId: string): Promise<IProject[]> {
    try {
      return await this.model.find({ userId }).sort({ createdAt: -1 });
    } catch (error) {
      throw new Error(`Failed to get projects: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get projects by status for a user
  async getProjectsByStatus(userId: string, status: IProject['status']): Promise<IProject[]> {
    try {
      return await this.model.find({ userId, status }).sort({ createdAt: -1 });
    } catch (error) {
      throw new Error(`Failed to get projects by status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get a single project by ID
  async getProjectById(projectId: string, userId: string): Promise<IProject | null> {
    try {
      return await this.model.findOne({ _id: projectId, userId });
    } catch (error) {
      throw new Error(`Failed to get project: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Update a project
  async updateProject(projectId: string, userId: string, data: UpdateProjectData): Promise<IProject | null> {
    try {
      const project = await this.model.findOneAndUpdate(
        { _id: projectId, userId },
        data,
        { new: true, runValidators: true }
      );
      return project;
    } catch (error) {
      throw new Error(`Failed to update project: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Update project progress
  async updateProjectProgress(projectId: string, userId: string, progress: number): Promise<IProject | null> {
    try {
      const validatedProgress = Math.max(0, Math.min(100, progress));
      const project = await this.model.findOneAndUpdate(
        { _id: projectId, userId },
        { progress: validatedProgress },
        { new: true, runValidators: true }
      );
      return project;
    } catch (error) {
      throw new Error(`Failed to update project progress: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Delete a project
  async deleteProject(projectId: string, userId: string): Promise<boolean> {
    try {
      const result = await this.model.findOneAndDelete({ _id: projectId, userId });
      return !!result;
    } catch (error) {
      throw new Error(`Failed to delete project: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get project statistics for a user
  async getProjectStats(userId: string): Promise<ProjectStats> {
    try {
      const projects = await this.model.find({ userId });
      
      return {
        total: projects.length,
        planning: projects.filter(p => p.status === 'planning').length,
        inProgress: projects.filter(p => p.status === 'in-progress').length,
        completed: projects.filter(p => p.status === 'completed').length,
        onHold: projects.filter(p => p.status === 'on-hold').length,
        cancelled: projects.filter(p => p.status === 'cancelled').length,
      };
    } catch (error) {
      throw new Error(`Failed to get project stats: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Search projects by title or description
  async searchProjects(userId: string, searchTerm: string): Promise<IProject[]> {
    try {
      const regex = new RegExp(searchTerm, 'i');
      return await this.model.find({
        userId,
        $or: [
          { title: regex },
          { description: regex },
          { tags: regex }
        ]
      }).sort({ createdAt: -1 });
    } catch (error) {
      throw new Error(`Failed to search projects: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Export singleton instance
export const projectService = new ProjectService(); 