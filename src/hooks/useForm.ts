'use client'

import { useState, useCallback, ChangeEvent, FormEvent } from 'react'

type FormErrors<T> = Partial<Record<keyof T, string>>
type FormTouched<T> = Partial<Record<keyof T, boolean>>
type Validator<T> = (values: T) => FormErrors<T>

interface UseFormOptions<T> {
  initialValues: T
  validate?: Validator<T>
  onSubmit: (values: T) => void | Promise<void>
}

interface UseFormReturn<T> {
  values: T
  errors: FormErrors<T>
  touched: FormTouched<T>
  isSubmitting: boolean
  isValid: boolean
  isDirty: boolean
  handleChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void
  handleBlur: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void
  handleSubmit: (e: FormEvent) => void
  setFieldValue: (field: keyof T, value: T[keyof T]) => void
  setFieldError: (field: keyof T, error: string) => void
  setFieldTouched: (field: keyof T, isTouched?: boolean) => void
  resetForm: () => void
  validateForm: () => boolean
}

/**
 * Lightweight form handling hook
 */
export function useForm<T extends Record<string, unknown>>({
  initialValues,
  validate,
  onSubmit,
}: UseFormOptions<T>): UseFormReturn<T> {
  const [values, setValues] = useState<T>(initialValues)
  const [errors, setErrors] = useState<FormErrors<T>>({})
  const [touched, setTouched] = useState<FormTouched<T>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isDirty = JSON.stringify(values) !== JSON.stringify(initialValues)
  const isValid = Object.keys(errors).length === 0

  const validateForm = useCallback((): boolean => {
    if (!validate) return true
    const validationErrors = validate(values)
    setErrors(validationErrors)
    return Object.keys(validationErrors).length === 0
  }, [validate, values])

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value, type } = e.target
      const newValue = type === 'checkbox' 
        ? (e.target as HTMLInputElement).checked 
        : value

      setValues(prev => ({ ...prev, [name]: newValue }))
      
      // Clear error on change
      if (errors[name as keyof T]) {
        setErrors(prev => {
          const newErrors = { ...prev }
          delete newErrors[name as keyof T]
          return newErrors
        })
      }
    },
    [errors]
  )

  const handleBlur = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name } = e.target
      setTouched(prev => ({ ...prev, [name]: true }))
    },
    []
  )

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault()
      
      // Mark all fields as touched
      const allTouched = Object.keys(initialValues).reduce(
        (acc, key) => ({ ...acc, [key]: true }),
        {} as FormTouched<T>
      )
      setTouched(allTouched)

      if (!validateForm()) return

      setIsSubmitting(true)
      try {
        await onSubmit(values)
      } finally {
        setIsSubmitting(false)
      }
    },
    [initialValues, onSubmit, validateForm, values]
  )

  const setFieldValue = useCallback((field: keyof T, value: T[keyof T]) => {
    setValues(prev => ({ ...prev, [field]: value }))
  }, [])

  const setFieldError = useCallback((field: keyof T, error: string) => {
    setErrors(prev => ({ ...prev, [field]: error }))
  }, [])

  const setFieldTouched = useCallback((field: keyof T, isTouched = true) => {
    setTouched(prev => ({ ...prev, [field]: isTouched }))
  }, [])

  const resetForm = useCallback(() => {
    setValues(initialValues)
    setErrors({})
    setTouched({})
    setIsSubmitting(false)
  }, [initialValues])

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    isDirty,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    setFieldError,
    setFieldTouched,
    resetForm,
    validateForm,
  }
}
