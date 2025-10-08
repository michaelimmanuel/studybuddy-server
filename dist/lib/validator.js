"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = validate;
// Generic validate function
function validate(schema, data) {
    const result = schema.safeParse(data);
    if (result.success) {
        return { success: true, data: result.data };
    }
    else {
        return {
            success: false,
            errors: result.error.issues.map(e => e.message),
        };
    }
}
