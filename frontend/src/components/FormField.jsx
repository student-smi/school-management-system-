/**
 * FormField — reusable input with inline error display
 * Usage:
 *   <FormField label="Name" error={errors.name}>
 *     <input className={fieldClass(errors.name)} ... />
 *   </FormField>
 */

export function FormField({ label, error, required, hint, children }) {
  return (
    <div>
      {label && (
        <label className="label">
          {label} {required && <span className="text-red-400">*</span>}
        </label>
      )}
      {children}
      {error && (
        <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
          <span>⚠</span> {error}
        </p>
      )}
      {hint && !error && (
        <p className="mt-1 text-xs text-gray-400">{hint}</p>
      )}
    </div>
  )
}

/** Returns input className with red border if error */
export function fieldClass(error, extra = '') {
  return `input ${error ? 'border-red-400 focus:ring-red-400 bg-red-50' : ''} ${extra}`.trim()
}

/** Simple validators */
export const validators = {
  required: (val, name = 'This field') =>
    !val || !String(val).trim() ? `${name} is required` : null,

  email: (val) => {
    if (!val) return 'Email is required'
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) ? null : 'Enter a valid email address'
  },

  minLength: (val, min, name = 'This field') =>
    val && val.length < min ? `${name} must be at least ${min} characters` : null,

  phone: (val) => {
    if (!val) return null // optional
    return /^[0-9]{10}$/.test(val) ? null : 'Enter a valid 10-digit phone number'
  },

  studentId: (val) =>
    !val || !val.trim() ? 'Student ID is required' : null,
}

/** Run all validations, return errors object */
export function validate(rules) {
  const errors = {}
  Object.entries(rules).forEach(([field, checks]) => {
    for (const check of checks) {
      const result = check
      if (result) { errors[field] = result; break }
    }
  })
  return errors
}
