// Main validators export file
// This provides a centralized way to import all validators

// Common validators
export * from './common.validator';

// Entity-specific validators
export * from './user.validator';
export * from './course.validator';
export * from './question.validator';

// Re-export commonly used schemas for convenience
export {
    uuidSchema,
    paginationQuerySchema,
    searchQuerySchema,
    paginatedSearchSchema,
    idParamSchema,
    emailSchema,
    passwordSchema,
    nameSchema,
    titleSchema,
    descriptionSchema
} from './common.validator';

export {
    createUserSchema,
    updateUserSchema,
    updateUserProfileSchema,
    signUpSchema,
    signInSchema
} from './user.validator';

export {
    createCourseSchema,
    updateCourseSchema,
    coursesQuerySchema
} from './course.validator';