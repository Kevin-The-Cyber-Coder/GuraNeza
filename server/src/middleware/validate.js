/**
 * Validates and sanitises request data with a Zod schema.
 * Replaces the validated source with the parsed value, so unknown fields are
 * stripped and no raw user input reaches the controllers.
 *
 * @param {import('zod').ZodTypeAny} schema
 * @param {'body'|'query'|'params'} source
 */
export const validate = (schema, source = 'body') => (req, res, next) => {
  const result = schema.safeParse(req[source]);

  if (!result.success) {
    return res.status(400).json({
      success: false,
      message: 'Please check the highlighted fields and try again',
      errors: result.error.issues.map((issue) => ({
        field: issue.path.join('.') || source,
        message: issue.message,
      })),
    });
  }

  req[source] = result.data;
  return next();
};

export default validate;
