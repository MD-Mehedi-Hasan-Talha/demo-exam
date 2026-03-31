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
exports.MockTestController = void 0;
const common_1 = require("@nestjs/common");
const create_mock_exam_dto_1 = require("./dto/create-mock-exam.dto");
const start_mock_attempt_dto_1 = require("./dto/start-mock-attempt.dto");
const submit_mock_attempt_dto_1 = require("./dto/submit-mock-attempt.dto");
const mock_test_service_1 = require("./mock-test.service");
let MockTestController = class MockTestController {
    mockTestService;
    constructor(mockTestService) {
        this.mockTestService = mockTestService;
    }
    createMock(payload) {
        return this.mockTestService.createMockExam(payload);
    }
    getExam(examId) {
        return this.mockTestService.getMockExamDetails(examId);
    }
    startAttempt(examId, payload) {
        return this.mockTestService.startAttempt(examId, payload);
    }
    submitAttempt(examId, attemptId, payload) {
        return this.mockTestService.submitAttempt(examId, attemptId, payload);
    }
    leaderboard(examId, take) {
        return this.mockTestService.getLeaderboard(examId, take ?? 50);
    }
};
exports.MockTestController = MockTestController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_mock_exam_dto_1.CreateMockExamDto]),
    __metadata("design:returntype", void 0)
], MockTestController.prototype, "createMock", null);
__decorate([
    (0, common_1.Get)(':examId'),
    __param(0, (0, common_1.Param)('examId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MockTestController.prototype, "getExam", null);
__decorate([
    (0, common_1.Post)(':examId/attempts'),
    __param(0, (0, common_1.Param)('examId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, start_mock_attempt_dto_1.StartMockAttemptDto]),
    __metadata("design:returntype", void 0)
], MockTestController.prototype, "startAttempt", null);
__decorate([
    (0, common_1.Post)(':examId/attempts/:attemptId/submit'),
    __param(0, (0, common_1.Param)('examId')),
    __param(1, (0, common_1.Param)('attemptId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, submit_mock_attempt_dto_1.SubmitMockAttemptDto]),
    __metadata("design:returntype", void 0)
], MockTestController.prototype, "submitAttempt", null);
__decorate([
    (0, common_1.Get)(':examId/leaderboard'),
    __param(0, (0, common_1.Param)('examId')),
    __param(1, (0, common_1.Query)('take', new common_1.ParseIntPipe({ optional: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", void 0)
], MockTestController.prototype, "leaderboard", null);
exports.MockTestController = MockTestController = __decorate([
    (0, common_1.Controller)('mock-tests'),
    __metadata("design:paramtypes", [mock_test_service_1.MockTestService])
], MockTestController);
//# sourceMappingURL=mock-test.controller.js.map