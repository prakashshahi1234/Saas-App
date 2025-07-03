import { Router } from 'express';
import { projectController } from '../controllers/projectController';

const router = Router();

// GET /api/projects - Get all projects for user
router.get('/', (req, res) => projectController.getProjects(req, res));

// GET /api/projects/stats - Get project statistics
router.get('/stats', (req, res) => projectController.getProjectStats(req, res));

// GET /api/projects/search - Search projects
router.get('/search', (req, res) => projectController.searchProjects(req, res));

// GET /api/projects/status/:status - Get projects by status
router.get('/status/:status', (req, res) => projectController.getProjectsByStatus(req, res));

// GET /api/projects/:id - Get single project
router.get('/:id', (req, res) => projectController.getProject(req, res));

// POST /api/projects - Create new project
router.post('/', (req, res) => projectController.createProject(req, res));

// PUT /api/projects/:id - Update project
router.put('/:id', (req, res) => projectController.updateProject(req, res));

// PATCH /api/projects/:id/progress - Update project progress
router.patch('/:id/progress', (req, res) => projectController.updateProjectProgress(req, res));

// DELETE /api/projects/:id - Delete project
router.delete('/:id', (req, res) => projectController.deleteProject(req, res));

export default router; 