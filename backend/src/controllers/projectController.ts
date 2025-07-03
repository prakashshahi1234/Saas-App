import { Request, Response } from 'express';
import { ProjectService, CreateProjectData, UpdateProjectData, projectService } from '../services/projectService';
import { paymentService } from '../services/paymentService';

export class ProjectController {
  private projectService: ProjectService;

  constructor(projectService: ProjectService) {
    this.projectService = projectService;
  }

  // Get all projects for the authenticated user
  async getProjects(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.headers['user-id'] as string;
      
      if (!userId) {
        res.status(401).json({ message: 'User ID is required' });
        return;
      }

      const projects = await this.projectService.getProjectsByUser(userId);
      res.status(200).json({
        success: true,
        data: projects,
        count: projects.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get projects'
      });
    }
  }

  // Get projects by status
  async getProjectsByStatus(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.headers['user-id'] as string;
      const { status } = req.params;
      
      if (!userId) {
        res.status(401).json({ message: 'User ID is required' });
        return;
      }

      if (!status) {
        res.status(400).json({ message: 'Status parameter is required' });
        return;
      }

      const projects = await this.projectService.getProjectsByStatus(userId, status as any);
      res.status(200).json({
        success: true,
        data: projects,
        count: projects.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get projects by status'
      });
    }
  }

  // Get a single project
  async getProject(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.headers['user-id'] as string;
      const { id } = req.params;
      
      if (!userId) {
        res.status(401).json({ message: 'User ID is required' });
        return;
      }

      if (!id) {
        res.status(400).json({ message: 'Project ID is required' });
        return;
      }

      const project = await this.projectService.getProjectById(id, userId);
      
      if (!project) {
        res.status(404).json({ message: 'Project not found' });
        return;
      }

      res.status(200).json({
        success: true,
        data: project
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get project'
      });
    }
  }

  // Create a new project
  async createProject(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.headers['user-id'] as string;
      const projectCreationFee = 100; // ₹100 per project
      
      if (!userId) {
        res.status(401).json({ message: 'User ID is required' });
        return;
      }

      // Check if user has sufficient balance
      const hasSufficientBalance = await paymentService.hasSufficientBalance(userId, projectCreationFee);
      
      if (!hasSufficientBalance) {
        const userBalance = await paymentService.getUserBalance(userId);
        const shortfall = projectCreationFee - userBalance.balance;
        
        res.status(402).json({
          success: false,
          message: 'Insufficient balance to create project',
          data: {
            currentBalance: userBalance.balance,
            requiredAmount: projectCreationFee,
            shortfall: shortfall
          }
        });
        return;
      }

      const projectData: CreateProjectData = {
        ...req.body,
        userId,
        startDate: new Date(req.body.startDate || new Date()),
        endDate: new Date(req.body.endDate || new Date())
      };

      const project = await this.projectService.createProject(projectData);
      
      // Deduct balance after successful project creation
      const balanceResult = await paymentService.deductBalance(userId, projectCreationFee, (project as any)._id.toString());
      
      if (!balanceResult.success) {
        // If balance deduction fails, we might want to rollback the project creation
        // For now, we'll just log the error and continue
        console.error('Failed to deduct balance after project creation:', balanceResult);
      }
      
      res.status(201).json({
        success: true,
        data: project,
        message: 'Project created successfully',
        balanceDeducted: balanceResult.success,
        newBalance: balanceResult.newBalance
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create project'
      });
    }
  }

  // Update a project
  async updateProject(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.headers['user-id'] as string;
      const { id } = req.params;
      
      if (!userId) {
        res.status(401).json({ message: 'User ID is required' });
        return;
      }

      if (!id) {
        res.status(400).json({ message: 'Project ID is required' });
        return;
      }

      const updateData: UpdateProjectData = { ...req.body };
      
      // Convert date strings to Date objects if provided
      if (req.body.startDate) {
        updateData.startDate = new Date(req.body.startDate);
      }
      if (req.body.endDate) {
        updateData.endDate = new Date(req.body.endDate);
      }

      const project = await this.projectService.updateProject(id, userId, updateData);
      
      if (!project) {
        res.status(404).json({ message: 'Project not found' });
        return;
      }

      res.status(200).json({
        success: true,
        data: project,
        message: 'Project updated successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update project'
      });
    }
  }

  // Update project progress
  async updateProjectProgress(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.headers['user-id'] as string;
      const { id } = req.params;
      const { progress } = req.body;
      
      if (!userId) {
        res.status(401).json({ message: 'User ID is required' });
        return;
      }

      if (!id) {
        res.status(400).json({ message: 'Project ID is required' });
        return;
      }

      if (typeof progress !== 'number' || progress < 0 || progress > 100) {
        res.status(400).json({ message: 'Progress must be a number between 0 and 100' });
        return;
      }

      const project = await this.projectService.updateProjectProgress(id, userId, progress);
      
      if (!project) {
        res.status(404).json({ message: 'Project not found' });
        return;
      }

      res.status(200).json({
        success: true,
        data: project,
        message: 'Project progress updated successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update project progress'
      });
    }
  }

  // Delete a project
  async deleteProject(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.headers['user-id'] as string;
      const { id } = req.params;
      
      if (!userId) {
        res.status(401).json({ message: 'User ID is required' });
        return;
      }

      if (!id) {
        res.status(400).json({ message: 'Project ID is required' });
        return;
      }

      const deleted = await this.projectService.deleteProject(id, userId);
      
      if (!deleted) {
        res.status(404).json({ message: 'Project not found' });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Project deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to delete project'
      });
    }
  }

  // Get project statistics
  async getProjectStats(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.headers['user-id'] as string;
      
      if (!userId) {
        res.status(401).json({ message: 'User ID is required' });
        return;
      }

      const stats = await this.projectService.getProjectStats(userId);
      
      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get project statistics'
      });
    }
  }

  // Search projects
  async searchProjects(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.headers['user-id'] as string;
      const { q } = req.query;
      
      if (!userId) {
        res.status(401).json({ message: 'User ID is required' });
        return;
      }

      if (!q || typeof q !== 'string') {
        res.status(400).json({ message: 'Search query is required' });
        return;
      }

      const projects = await this.projectService.searchProjects(userId, q);
      
      res.status(200).json({
        success: true,
        data: projects,
        count: projects.length,
        query: q
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to search projects'
      });
    }
  }
}

// Export singleton instance
export const projectController = new ProjectController(projectService); 