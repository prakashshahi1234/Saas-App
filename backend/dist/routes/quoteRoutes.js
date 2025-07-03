"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const quoteController_1 = require("../controllers/quoteController");
const router = express_1.default.Router();
router.get('/random', quoteController_1.quoteController.getRandomQuote.bind(quoteController_1.quoteController));
exports.default = router;
//# sourceMappingURL=quoteRoutes.js.map