"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PracticeController = void 0;
const common_1 = require("@nestjs/common");
const answer_practice_item_dto_1 = require("./dto/answer-practice-item.dto");
const create_practice_session_dto_1 = require("./dto/create-practice-session.dto");
const practice_service_1 = require("./practice.service");
let PracticeController = class PracticeController {
    practiceService;
    constructor(practiceService) {
        this.practiceService = practiceService;
    }
    createSession(payload) {
        return this.practiceService.createSession(payload);
    }
    getNextQuestion(sessionId, userId) {
        return this.practiceService.getNextQuestion(sessionId, userId);
    }
    answerQuestion(sessionId, payload) {
        return this.practiceService.answerQuestion(sessionId, payload);
    }
    completeSession(sessionId, userId) {
        return this.practiceService.completeSession(sessionId, userId);
    }
};
exports.PracticeController = PracticeController;
__decorate([
    (0, common_1.Post)('sessions'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_practice_session_dto_1.CreatePracticeSessionDto]),
    __metadata("design:returntype", void 0)
], PracticeController.prototype, "createSession", null);
__decorate([
    (0, common_1.Get)('sessions/:id/next'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], PracticeController.prototype, "getNextQuestion", null);
__decorate([
    (0, common_1.Post)('sessions/:id/answer'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, answer_practice_item_dto_1.AnswerPracticeItemDto]),
    __metadata("design:returntype", void 0)
], PracticeController.prototype, "answerQuestion", null);
__decorate([
    (0, common_1.Post)('sessions/:id/complete'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], PracticeController.prototype, "completeSession", null);
exports.PracticeController = PracticeController = __decorate([
    (0, common_1.Controller)('practice'),
    __metadata("design:paramtypes", [practice_service_1.PracticeService])
], PracticeController);
//# sourceMappingURL=practice.controller.js.map