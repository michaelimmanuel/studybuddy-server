# 🔧 Enhanced Validator Architecture

## 📁 New Structure

```
src/lib/validators/
├── index.ts                    # Main export file
├── common.validator.ts         # Shared validation schemas
├── user.validator.ts          # User-specific validations  
├── course.validator.ts        # Course-specific validations
└── validation.middleware.ts   # Enhanced validation middleware
```

## ✨ Key Improvements

### 1. **Separation of Concerns**
- **Common validators**: Reusable across entities (UUID, pagination, email, etc.)
- **Entity-specific validators**: Business logic for each domain
- **Enhanced middleware**: Better error handling and type safety

### 2. **Better Type Safety**
- Full TypeScript support with inferred types
- Export types for use in controllers
- Consistent schema structure

### 3. **Reusable Components**
- Common patterns like pagination, search, UUID validation
- Shared validation logic reduces duplication
- Consistent error messages across the API

### 4. **Enhanced Features**
- **Business rule validation**: Custom validation logic
- **Conditional validation**: Validate only when needed
- **Sanitization**: Built-in XSS protection
- **File upload validation**: Ready for future file features

## 🚀 Usage Examples

### In Routes
```typescript
import { 
    validateBody, 
    validateQuery, 
    validateParams 
} from '../lib/validators/validation.middleware';
import { 
    createCourseSchema, 
    coursesQuerySchema 
} from '../lib/validators/course.validator';

// Validate request body
router.post('/', validateBody(createCourseSchema), controller.create);

// Validate query parameters  
router.get('/', validateQuery(coursesQuerySchema), controller.getAll);

// Validate URL parameters
router.get('/:id', validateParams(courseIdParamSchema), controller.getById);
```

### In Controllers
```typescript
import { CreateCourseInput, CoursesQuery } from '../lib/validators';

export const createCourse = async (req: Request, res: Response) => {
    // req.body is now typed as CreateCourseInput
    const { title, description } = req.body;
    
    // req.query is typed as CoursesQuery
    const { page = 1, limit = 10, search } = req.query;
};
```

### Advanced Validation
```typescript
// Business rule validation
const validateCourseOwnership = validateBusinessRule(
    async (req) => {
        const courseId = req.params.id;
        const userId = req.user?.id;
        // Check if user owns the course
        return await checkOwnership(courseId, userId);
    },
    'You can only modify courses you own'
);

// Combined validation
router.put('/:id', 
    validateParams(courseIdParamSchema),
    validateBody(updateCourseSchema),
    validateCourseOwnership,
    controller.update
);
```

## 📋 Migration Guide

### From Old Validator
```typescript
// OLD WAY
import { coursesQuerySchema } from '../lib/course.validator';

// NEW WAY  
import { coursesQuerySchema } from '../lib/validators';
// or
import { coursesQuerySchema } from '../lib/validators/course.validator';
```

### Update Route Files
Replace the old validation middleware imports:

```typescript
// OLD
import { validateBody } from '../middleware/validation.middleware';

// NEW
import { validateBody } from '../lib/validators/validation.middleware';
```

## 🎯 Benefits

### ✅ **Consistency**
- Standardized validation patterns
- Consistent error message format
- Uniform type safety across the API

### ✅ **Maintainability**  
- Easy to add new validators
- Shared logic reduces duplication
- Clear separation of concerns

### ✅ **Developer Experience**
- Full TypeScript support
- Auto-completion for validation schemas
- Clear error messages with field-level details

### ✅ **Scalability**
- Easy to add new entity validators
- Reusable common patterns
- Business rule validation support

## 🔄 Next Steps

1. **Update existing routes** to use new validators
2. **Add validation to all endpoints** for consistency
3. **Create entity-specific validators** as you add new features
4. **Add business rule validations** for complex logic

## 💡 Best Practices

### Schema Design
```typescript
// ✅ Good: Descriptive error messages
export const titleSchema = z.string()
    .min(1, 'Course title is required')
    .max(200, 'Course title must be less than 200 characters')
    .trim();

// ❌ Avoid: Generic error messages
export const titleSchema = z.string().min(1).max(200);
```

### Validation Middleware Usage
```typescript
// ✅ Good: Validate at route level
router.post('/', validateBody(createSchema), controller.create);

// ❌ Avoid: Validation inside controller
export const create = (req, res) => {
    const validation = schema.safeParse(req.body);
    // ...
};
```

### Type Exports
```typescript
// ✅ Good: Export types for controllers
export type CreateCourseInput = z.infer<typeof createCourseSchema>;

// Use in controller
export const create = (req: Request<{}, {}, CreateCourseInput>, res: Response) => {
    // req.body is now properly typed
};
```

## 🎨 Customization Examples

### Custom Validator
```typescript
// Custom email domain validation
export const organizationEmailSchema = emailSchema.refine(
    (email) => email.endsWith('@yourorg.com'),
    { message: 'Must be organization email' }
);
```

### Complex Business Rule
```typescript
const validateEnrollmentCapacity = validateBusinessRule(
    async (req) => {
        const courseId = req.params.id;
        const course = await getCourse(courseId);
        const enrollmentCount = await getEnrollmentCount(courseId);
        return enrollmentCount < course.maxCapacity;
    },
    'Course is at maximum capacity'
);
```

This new validator architecture provides a solid foundation for scalable, maintainable validation across your StudyBuddy API! 🚀