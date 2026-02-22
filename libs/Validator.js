class Validator {
    constructor({ models, customValidators } = {}) {
        this.models = models || {};
        this.customValidators = customValidators || {};
    }

    async validate(data, schema) {
        const errors = [];

        for (const rule of schema) {
            const { path, type, length, required, oneOf, items } = rule;
            const value = data[path];

            if (required && (value === undefined || value === null || value === '')) {
                errors.push(`${path} is required`);
                continue;
            }

            if (value === undefined || value === null) {
                continue;
            }

            if (type === 'string') {
                if (typeof value !== 'string') {
                    errors.push(`${path} must be a string`);
                    continue;
                }

                if (length) {
                    if (length.min !== undefined && value.length < length.min) {
                        errors.push(`${path} must be at least ${length.min} characters`);
                    }
                    if (length.max !== undefined && value.length > length.max) {
                        errors.push(`${path} must be at most ${length.max} characters`);
                    }
                }

                if (oneOf && !oneOf.includes(value)) {
                    errors.push(`${path} must be one of: ${oneOf.join(', ')}`);
                }
            }

            if (type === 'number') {
                const numValue = typeof value === 'number' ? value : Number(value);
                if (isNaN(numValue)) {
                    errors.push(`${path} must be a number`);
                }
            }

            if (type === 'Array') {
                if (!Array.isArray(value)) {
                    errors.push(`${path} must be an array`);
                    continue;
                }

                if (items) {
                    for (let i = 0; i < value.length; i++) {
                        const itemValue = value[i];
                        
                        if (items.type === 'string') {
                            if (typeof itemValue !== 'string') {
                                errors.push(`${path}[${i}] must be a string`);
                                continue;
                            }
                            
                            if (items.length) {
                                if (items.length.min !== undefined && itemValue.length < items.length.min) {
                                    errors.push(`${path}[${i}] must be at least ${items.length.min} characters`);
                                }
                                if (items.length.max !== undefined && itemValue.length > items.length.max) {
                                    errors.push(`${path}[${i}] must be at most ${items.length.max} characters`);
                                }
                            }
                        }
                    }
                }
            }
        }

        if (errors.length > 0) {
            return errors.join(', ');
        }

        return null;
    }

    async trim(data, schema) {
        const trimmed = {};
        const allowedPaths = schema.map(rule => rule.path);

        for (const key of Object.keys(data)) {
            if (allowedPaths.includes(key)) {
                trimmed[key] = data[key];
            }
        }

        return trimmed;
    }
}

module.exports = Validator;
