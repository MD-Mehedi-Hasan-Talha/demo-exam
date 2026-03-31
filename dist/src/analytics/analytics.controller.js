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
exports.AnalyticsController = void 0;
const common_1 = require("@nestjs/common");
const analytics_service_1 = require("./analytics.service");
const refresh_question_analytics_dto_1 = require("./dto/refresh-question-analytics.dto");
let AnalyticsController = class AnalyticsController {
    analyticsService;
    constructor(analyticsService) {
        this.analyticsService = analyticsService;
    }
    refreshQuestionAnalytics(payload) {
        return this.analyticsService.refreshQuestionAnalytics(payload);
    }
    mostSolved(limit) {
        return this.analyticsService.mostSolved(limit ?? 20);
    }
    mostDifficult(limit) {
        return this.analyticsService.mostDifficult(limit ?? 20);
    }
    trendingTopics(limit) {
        return this.analyticsService.trendingTopics(limit ?? 20);
    }
    weakSubjects(userId, limit) {
        return this.analyticsService.weakSubjects(userId, limit ?? 10);
    }
    performanceHeatmap(userId) {
        return this.analyticsService.userPerformanceHeatmap(userId);
    }
    chapterStrength(userId, limit) {
        return this.analyticsService.chapterStrength(userId, limit ?? 50);
    }
};
exports.AnalyticsController = AnalyticsController;
__decorate([
    (0, common_1.Post)('refresh/questions'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [refresh_question_analytics_dto_1.RefreshQuestionAnalyticsDto]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "refreshQuestionAnalytics", null);
__decorate([
    (0, common_1.Get)('questions/most-solved'),
    __param(0, (0, common_1.Query)('limit', new common_1.ParseIntPipe({ optional: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "mostSolved", null);
__decorate([
    (0, common_1.Get)('questions/most-difficult'),
    __param(0, (0, common_1.Query)('limit', new common_1.ParseIntPipe({ optional: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "mostDifficult", null);
__decorate([
    (0, common_1.Get)('topics/trending'),
    __param(0, (0, common_1.Query)('limit', new common_1.ParseIntPipe({ optional: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "trendingTopics", null);
__decorate([
    (0, common_1.Get)('users/weak-subjects'),
    __param(0, (0, common_1.Query)('userId')),
    __param(1, (0, common_1.Query)('limit', new common_1.ParseIntPipe({ optional: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "weakSubjects", null);
__decorate([
    (0, common_1.Get)('users/performance-heatmap'),
    __param(0, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "performanceHeatmap", null);
__decorate([
    (0, common_1.Get)('users/chapter-strength'),
    __param(0, (0, common_1.Query)('userId')),
    __param(1, (0, common_1.Query)('limit', new common_1.ParseIntPipe({ optional: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "chapterStrength", null);
exports.AnalyticsController = AnalyticsController = __decorate([
    (0, common_1.Controller)('analytics'),
    __metadata("design:paramtypes", [analytics_service_1.AnalyticsService])
], AnalyticsController);
//# sourceMappingURL=analytics.controller.js.map