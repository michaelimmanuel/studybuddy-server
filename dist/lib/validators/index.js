"use strict";
// Main validators export file
// This provides a centralized way to import all validators
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.coursesQuerySchema = exports.updateCourseSchema = exports.createCourseSchema = exports.signInSchema = exports.signUpSchema = exports.updateUserProfileSchema = exports.updateUserSchema = exports.createUserSchema = exports.descriptionSchema = exports.titleSchema = exports.nameSchema = exports.passwordSchema = exports.emailSchema = exports.idParamSchema = exports.paginatedSearchSchema = exports.searchQuerySchema = exports.paginationQuerySchema = exports.uuidSchema = void 0;
// Common validators
__exportStar(require("./common.validator"), exports);
// Entity-specific validators
__exportStar(require("./user.validator"), exports);
__exportStar(require("./course.validator"), exports);
__exportStar(require("./question.validator"), exports);
// Re-export commonly used schemas for convenience
var common_validator_1 = require("./common.validator");
Object.defineProperty(exports, "uuidSchema", { enumerable: true, get: function () { return common_validator_1.uuidSchema; } });
Object.defineProperty(exports, "paginationQuerySchema", { enumerable: true, get: function () { return common_validator_1.paginationQuerySchema; } });
Object.defineProperty(exports, "searchQuerySchema", { enumerable: true, get: function () { return common_validator_1.searchQuerySchema; } });
Object.defineProperty(exports, "paginatedSearchSchema", { enumerable: true, get: function () { return common_validator_1.paginatedSearchSchema; } });
Object.defineProperty(exports, "idParamSchema", { enumerable: true, get: function () { return common_validator_1.idParamSchema; } });
Object.defineProperty(exports, "emailSchema", { enumerable: true, get: function () { return common_validator_1.emailSchema; } });
Object.defineProperty(exports, "passwordSchema", { enumerable: true, get: function () { return common_validator_1.passwordSchema; } });
Object.defineProperty(exports, "nameSchema", { enumerable: true, get: function () { return common_validator_1.nameSchema; } });
Object.defineProperty(exports, "titleSchema", { enumerable: true, get: function () { return common_validator_1.titleSchema; } });
Object.defineProperty(exports, "descriptionSchema", { enumerable: true, get: function () { return common_validator_1.descriptionSchema; } });
var user_validator_1 = require("./user.validator");
Object.defineProperty(exports, "createUserSchema", { enumerable: true, get: function () { return user_validator_1.createUserSchema; } });
Object.defineProperty(exports, "updateUserSchema", { enumerable: true, get: function () { return user_validator_1.updateUserSchema; } });
Object.defineProperty(exports, "updateUserProfileSchema", { enumerable: true, get: function () { return user_validator_1.updateUserProfileSchema; } });
Object.defineProperty(exports, "signUpSchema", { enumerable: true, get: function () { return user_validator_1.signUpSchema; } });
Object.defineProperty(exports, "signInSchema", { enumerable: true, get: function () { return user_validator_1.signInSchema; } });
var course_validator_1 = require("./course.validator");
Object.defineProperty(exports, "createCourseSchema", { enumerable: true, get: function () { return course_validator_1.createCourseSchema; } });
Object.defineProperty(exports, "updateCourseSchema", { enumerable: true, get: function () { return course_validator_1.updateCourseSchema; } });
Object.defineProperty(exports, "coursesQuerySchema", { enumerable: true, get: function () { return course_validator_1.coursesQuerySchema; } });
