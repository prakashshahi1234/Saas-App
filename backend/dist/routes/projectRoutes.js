"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const projectController_1 = require("../controllers/projectController");
const router = (0, express_1.Router)();
router.get('/', (req, res) => projectController_1.projectController.getProjects(req, res));
router.get('/stats', (req, res) => projectController_1.projectController.getProjectStats(req, res));
router.get('/search', (req, res) => projectController_1.projectController.searchProjects(req, res));
router.get('/status/:status', (req, res) => projectController_1.projectController.getProjectsByStatus(req, res));
router.get('/:id', (req, res) => projectController_1.projectController.getProject(req, res));
router.post('/', (req, res) => projectController_1.projectController.createProject(req, res));
router.put('/:id', (req, res) => projectController_1.projectController.updateProject(req, res));
router.patch('/:id/progress', (req, res) => projectController_1.projectController.updateProjectProgress(req, res));
router.delete('/:id', (req, res) => projectController_1.projectController.deleteProject(req, res));
exports.default = router;
//# sourceMappingURL=projectRoutes.js.map