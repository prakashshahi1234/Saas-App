"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectService = exports.ProjectService = void 0;
const Project_1 = __importDefault(require("../models/Project"));
class ProjectService {
    constructor() {
        this.model = Project_1.default;
    }
    async createProject(data) {
        try {
            const project = new this.model(data);
            return await project.save();
        }
        catch (error) {
            throw new Error(`Failed to create project: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async getProjectsByUser(userId) {
        try {
            return await this.model.find({ userId }).sort({ createdAt: -1 });
        }
        catch (error) {
            throw new Error(`Failed to get projects: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async getProjectsByStatus(userId, status) {
        try {
            return await this.model.find({ userId, status }).sort({ createdAt: -1 });
        }
        catch (error) {
            throw new Error(`Failed to get projects by status: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async getProjectById(projectId, userId) {
        try {
            return await this.model.findOne({ _id: projectId, userId });
        }
        catch (error) {
            throw new Error(`Failed to get project: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async updateProject(projectId, userId, data) {
        try {
            const project = await this.model.findOneAndUpdate({ _id: projectId, userId }, data, { new: true, runValidators: true });
            return project;
        }
        catch (error) {
            throw new Error(`Failed to update project: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async updateProjectProgress(projectId, userId, progress) {
        try {
            const validatedProgress = Math.max(0, Math.min(100, progress));
            const project = await this.model.findOneAndUpdate({ _id: projectId, userId }, { progress: validatedProgress }, { new: true, runValidators: true });
            return project;
        }
        catch (error) {
            throw new Error(`Failed to update project progress: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async deleteProject(projectId, userId) {
        try {
            const result = await this.model.findOneAndDelete({ _id: projectId, userId });
            return !!result;
        }
        catch (error) {
            throw new Error(`Failed to delete project: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async getProjectStats(userId) {
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
        }
        catch (error) {
            throw new Error(`Failed to get project stats: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async searchProjects(userId, searchTerm) {
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
        }
        catch (error) {
            throw new Error(`Failed to search projects: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
}
exports.ProjectService = ProjectService;
exports.projectService = new ProjectService();
//# sourceMappingURL=projectService.js.map