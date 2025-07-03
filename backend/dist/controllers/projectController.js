"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectController = exports.ProjectController = void 0;
const projectService_1 = require("../services/projectService");
const paymentService_1 = require("../services/paymentService");
class ProjectController {
    constructor(projectService) {
        this.projectService = projectService;
    }
    async getProjects(req, res) {
        try {
            const userId = req.headers['user-id'];
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
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Failed to get projects'
            });
        }
    }
    async getProjectsByStatus(req, res) {
        try {
            const userId = req.headers['user-id'];
            const { status } = req.params;
            if (!userId) {
                res.status(401).json({ message: 'User ID is required' });
                return;
            }
            if (!status) {
                res.status(400).json({ message: 'Status parameter is required' });
                return;
            }
            const projects = await this.projectService.getProjectsByStatus(userId, status);
            res.status(200).json({
                success: true,
                data: projects,
                count: projects.length
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Failed to get projects by status'
            });
        }
    }
    async getProject(req, res) {
        try {
            const userId = req.headers['user-id'];
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
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Failed to get project'
            });
        }
    }
    async createProject(req, res) {
        try {
            const userId = req.headers['user-id'];
            const projectCreationFee = 100;
            if (!userId) {
                res.status(401).json({ message: 'User ID is required' });
                return;
            }
            const hasSufficientBalance = await paymentService_1.paymentService.hasSufficientBalance(userId, projectCreationFee);
            if (!hasSufficientBalance) {
                const userBalance = await paymentService_1.paymentService.getUserBalance(userId);
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
            const projectData = {
                ...req.body,
                userId,
                startDate: new Date(req.body.startDate || new Date()),
                endDate: new Date(req.body.endDate || new Date())
            };
            const project = await this.projectService.createProject(projectData);
            const balanceResult = await paymentService_1.paymentService.deductBalance(userId, projectCreationFee, project._id.toString());
            if (!balanceResult.success) {
                console.error('Failed to deduct balance after project creation:', balanceResult);
            }
            res.status(201).json({
                success: true,
                data: project,
                message: 'Project created successfully',
                balanceDeducted: balanceResult.success,
                newBalance: balanceResult.newBalance
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : 'Failed to create project'
            });
        }
    }
    async updateProject(req, res) {
        try {
            const userId = req.headers['user-id'];
            const { id } = req.params;
            if (!userId) {
                res.status(401).json({ message: 'User ID is required' });
                return;
            }
            if (!id) {
                res.status(400).json({ message: 'Project ID is required' });
                return;
            }
            const updateData = { ...req.body };
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
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : 'Failed to update project'
            });
        }
    }
    async updateProjectProgress(req, res) {
        try {
            const userId = req.headers['user-id'];
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
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : 'Failed to update project progress'
            });
        }
    }
    async deleteProject(req, res) {
        try {
            const userId = req.headers['user-id'];
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
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Failed to delete project'
            });
        }
    }
    async getProjectStats(req, res) {
        try {
            const userId = req.headers['user-id'];
            if (!userId) {
                res.status(401).json({ message: 'User ID is required' });
                return;
            }
            const stats = await this.projectService.getProjectStats(userId);
            res.status(200).json({
                success: true,
                data: stats
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Failed to get project statistics'
            });
        }
    }
    async searchProjects(req, res) {
        try {
            const userId = req.headers['user-id'];
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
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Failed to search projects'
            });
        }
    }
}
exports.ProjectController = ProjectController;
exports.projectController = new ProjectController(projectService_1.projectService);
//# sourceMappingURL=projectController.js.map