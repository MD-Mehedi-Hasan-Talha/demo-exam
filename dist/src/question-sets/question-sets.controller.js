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
exports.QuestionSetsController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const add_practice_set_items_dto_1 = require("./dto/add-practice-set-items.dto");
const create_practice_set_dto_1 = require("./dto/create-practice-set.dto");
const generate_practice_set_dto_1 = require("./dto/generate-practice-set.dto");
const update_practice_set_workflow_dto_1 = require("./dto/update-practice-set-workflow.dto");
const question_sets_service_1 = require("./question-sets.service");
let QuestionSetsController = class QuestionSetsController {
    questionSetsService;
    constructor(questionSetsService) {
        this.questionSetsService = questionSetsService;
    }
    createSet(payload) {
        return this.questionSetsService.createSet(payload);
    }
    generateSet(payload) {
        return this.questionSetsService.generateSet(payload);
    }
    addItems(id, payload) {
        return this.questionSetsService.addItems(id, payload);
    }
    updateWorkflow(id, payload) {
        return this.questionSetsService.updateWorkflow(id, payload);
    }
    listSets(createdBy, type, visibility, workflowStatus, take) {
        return this.questionSetsService.listSets({
            createdBy,
            type,
            visibility,
            workflowStatus,
            take: take ?? 50,
        });
    }
    getDetails(id) {
        return this.questionSetsService.getSetDetails(id);
    }
};
exports.QuestionSetsController = QuestionSetsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_practice_set_dto_1.CreatePracticeSetDto]),
    __metadata("design:returntype", void 0)
], QuestionSetsController.prototype, "createSet", null);
__decorate([
    (0, common_1.Post)('generate'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [generate_practice_set_dto_1.GeneratePracticeSetDto]),
    __metadata("design:returntype", void 0)
], QuestionSetsController.prototype, "generateSet", null);
__decorate([
    (0, common_1.Post)(':id/items'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, add_practice_set_items_dto_1.AddPracticeSetItemsDto]),
    __metadata("design:returntype", void 0)
], QuestionSetsController.prototype, "addItems", null);
__decorate([
    (0, common_1.Patch)(':id/workflow'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_practice_set_workflow_dto_1.UpdatePracticeSetWorkflowDto]),
    __metadata("design:returntype", void 0)
], QuestionSetsController.prototype, "updateWorkflow", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('createdBy')),
    __param(1, (0, common_1.Query)('type')),
    __param(2, (0, common_1.Query)('visibility')),
    __param(3, (0, common_1.Query)('workflowStatus')),
    __param(4, (0, common_1.Query)('take', new common_1.ParseIntPipe({ optional: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, Number]),
    __metadata("design:returntype", void 0)
], QuestionSetsController.prototype, "listSets", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], QuestionSetsController.prototype, "getDetails", null);
exports.QuestionSetsController = QuestionSetsController = __decorate([
    (0, common_1.Controller)('question-sets'),
    __metadata("design:paramtypes", [question_sets_service_1.QuestionSetsService])
], QuestionSetsController);
//# sourceMappingURL=question-sets.controller.js.map