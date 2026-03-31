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
exports.ProgressController = void 0;
const common_1 = require("@nestjs/common");
const log_activity_dto_1 = require("./dto/log-activity.dto");
const mark_weak_question_dto_1 = require("./dto/mark-weak-question.dto");
const upsert_bookmark_dto_1 = require("./dto/upsert-bookmark.dto");
const progress_service_1 = require("./progress.service");
let ProgressController = class ProgressController {
    progressService;
    constructor(progressService) {
        this.progressService = progressService;
    }
    upsertBookmark(payload) {
        return this.progressService.upsertBookmark(payload);
    }
    removeBookmark(questionId, userId) {
        return this.progressService.removeBookmark(userId, questionId);
    }
    getBookmarks(userId, take) {
        return this.progressService.getBookmarks(userId, take ?? 50);
    }
    markWeak(payload) {
        return this.progressService.markWeakQuestion(payload);
    }
    getRevisionQueue(userId, take) {
        return this.progressService.getRevisionQueue(userId, take ?? 20);
    }
    getQuestionStatus(userId, questionIdsCsv) {
        const questionIds = questionIdsCsv
            .split(',')
            .map((id) => id.trim())
            .filter(Boolean);
        return this.progressService.getQuestionStatus(userId, questionIds);
    }
    logDailyActivity(payload) {
        return this.progressService.logDailyActivity(payload);
    }
    getStreak(userId) {
        return this.progressService.getStreak(userId);
    }
};
exports.ProgressController = ProgressController;
__decorate([
    (0, common_1.Post)('bookmarks'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [upsert_bookmark_dto_1.UpsertBookmarkDto]),
    __metadata("design:returntype", void 0)
], ProgressController.prototype, "upsertBookmark", null);
__decorate([
    (0, common_1.Delete)('bookmarks/:questionId'),
    __param(0, (0, common_1.Param)('questionId')),
    __param(1, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ProgressController.prototype, "removeBookmark", null);
__decorate([
    (0, common_1.Get)('bookmarks'),
    __param(0, (0, common_1.Query)('userId')),
    __param(1, (0, common_1.Query)('take', new common_1.ParseIntPipe({ optional: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", void 0)
], ProgressController.prototype, "getBookmarks", null);
__decorate([
    (0, common_1.Post)('weak'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [mark_weak_question_dto_1.MarkWeakQuestionDto]),
    __metadata("design:returntype", void 0)
], ProgressController.prototype, "markWeak", null);
__decorate([
    (0, common_1.Get)('revision-queue'),
    __param(0, (0, common_1.Query)('userId')),
    __param(1, (0, common_1.Query)('take', new common_1.ParseIntPipe({ optional: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", void 0)
], ProgressController.prototype, "getRevisionQueue", null);
__decorate([
    (0, common_1.Get)('question-status'),
    __param(0, (0, common_1.Query)('userId')),
    __param(1, (0, common_1.Query)('questionIds')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ProgressController.prototype, "getQuestionStatus", null);
__decorate([
    (0, common_1.Post)('daily-activity'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [log_activity_dto_1.LogActivityDto]),
    __metadata("design:returntype", void 0)
], ProgressController.prototype, "logDailyActivity", null);
__decorate([
    (0, common_1.Get)('streak'),
    __param(0, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProgressController.prototype, "getStreak", null);
exports.ProgressController = ProgressController = __decorate([
    (0, common_1.Controller)('progress'),
    __metadata("design:paramtypes", [progress_service_1.ProgressService])
], ProgressController);
//# sourceMappingURL=progress.controller.js.map