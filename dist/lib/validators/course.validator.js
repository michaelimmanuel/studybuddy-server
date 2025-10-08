"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateCoursesQuery = exports.validateCourseUpdate = exports.validateCourseCreate = exports.courseResponseSchema = exports.coursesQuerySchema = exports.courseIdParamSchema = exports.updateCourseSchema = exports.createCourseSchema = void 0;
const zod_1 = require("zod");
const common_validator_1 = require("./common.validator");
// Course validation schemas
exports.createCourseSchema = zod_1.z.object({
    title: common_validator_1.titleSchema,
    description: common_validator_1.descriptionSchema,
});
exports.updateCourseSchema = zod_1.z.object({
    title: common_validator_1.optionalTitleSchema,
    description: common_validator_1.descriptionSchema,
}).refine((data) => data.title !== undefined || data.description !== undefined, { message: 'At least one field (title or description) must be provided for update' });
// Parameter validation schemas
exports.courseIdParamSchema = common_validator_1.idParamSchema;
// Query validation schemas
exports.coursesQuerySchema = common_validator_1.paginatedSearchSchema;
// Course response schemas (for documentation/type checking)
exports.courseResponseSchema = zod_1.z.object({
    id: common_validator_1.uuidSchema,
    title: zod_1.z.string(),
    description: zod_1.z.string().nullable(),
    createdAt: zod_1.z.string().datetime(),
    updatedAt: zod_1.z.string().datetime(),
});
// Validation helper functions
const validateCourseCreate = (data) => {
    return exports.createCourseSchema.parse(data);
};
exports.validateCourseCreate = validateCourseCreate;
const validateCourseUpdate = (data) => {
    return exports.updateCourseSchema.parse(data);
};
exports.validateCourseUpdate = validateCourseUpdate;
const validateCoursesQuery = (query) => {
    return exports.coursesQuerySchema.parse(query);
};
exports.validateCoursesQuery = validateCoursesQuery;
