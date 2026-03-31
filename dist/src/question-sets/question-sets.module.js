"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuestionSetsModule = void 0;
const common_1 = require("@nestjs/common");
const question_sets_controller_1 = require("./question-sets.controller");
const question_sets_service_1 = require("./question-sets.service");
let QuestionSetsModule = class QuestionSetsModule {
};
exports.QuestionSetsModule = QuestionSetsModule;
exports.QuestionSetsModule = QuestionSetsModule = __decorate([
    (0, common_1.Module)({
        controllers: [question_sets_controller_1.QuestionSetsController],
        providers: [question_sets_service_1.QuestionSetsService],
    })
], QuestionSetsModule);
//# sourceMappingURL=question-sets.module.js.map