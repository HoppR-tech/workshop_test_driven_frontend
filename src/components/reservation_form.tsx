"use client"

import { useState, type FormEvent, type ChangeEvent } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface FormData {
  fullName: string
  email: string
  date: string
  participants: string
  notes: string
}

interface FormErrors {
  fullName?: string
  email?: string
  date?: string
}

interface ReservationSummary {
  reference: string
  fullName: string
  email: string
  date: string
  participants: string
  notes: string
}

export default function ReservationForm() {
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    date: "",
    participants: "1",
    notes: "",
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [reservation, setReservation] = useState<ReservationSummary | null>(null)

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required"
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = "Full name must be at least 2 characters"
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    if (!formData.date) {
      newErrors.date = "Desired date is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear error for this field when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }

    // Clear submit error when user makes changes
    if (submitError) {
      setSubmitError(null)
    }
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      // Simulate API call
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          // Simulate random success/failure for testing
          if (Math.random() > 0.2) {
            resolve(true)
          } else {
            reject(new Error("Network error"))
          }
        }, 1500)
      })

      // Generate reference number
      const reference = `TL-${Date.now().toString().slice(-6)}`

      setReservation({
        reference,
        ...formData,
      })

      // Reset form
      setFormData({
        fullName: "",
        email: "",
        date: "",
        participants: "1",
        notes: "",
      })
    } catch (error) {
      setSubmitError("Unable to confirm your reservation. Please check your connection and try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const isFormValid =
    formData.fullName.trim().length >= 2 && formData.email.trim() && validateEmail(formData.email) && formData.date

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader className="space-y-2">
          <CardTitle className="text-3xl font-bold text-balance">Book a Testing Library Session</CardTitle>
          <CardDescription className="text-base text-pretty">
            Reserve your spot for a hands-on workshop where you'll master Testing Library queries and best practices.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {reservation ? (
            <div
              className="p-6 bg-green-50 border-2 border-green-200 rounded-lg space-y-4"
              role="status"
              aria-live="polite"
              data-testid="success-summary"
            >
              <h2 className="text-2xl font-bold text-green-800 flex items-center gap-2">
                <span className="text-green-600">✓</span> Reservation confirmed
              </h2>
              <dl className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:gap-3">
                  <dt className="text-sm font-semibold text-green-800 sm:w-40">Reference number:</dt>
                  <dd className="text-sm text-green-700 font-mono">{reservation.reference}</dd>
                </div>
                <div className="flex flex-col sm:flex-row sm:gap-4">
                  <dt className="text-sm font-semibold text-green-800 sm:w-40">Date:</dt>
                  <dd className="text-sm text-green-700">
                    {new Date(reservation.date).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </dd>
                </div>
                <div className="flex flex-col sm:flex-row sm:gap-4">
                  <dt className="text-sm font-semibold text-green-800 sm:w-40">Participants:</dt>
                  <dd className="text-sm text-green-700">{reservation.participants}</dd>
                </div>
                <div className="flex flex-col sm:flex-row sm:gap-4">
                  <dt className="text-sm font-semibold text-green-800 sm:w-40">Contact:</dt>
                  <dd className="text-sm text-green-700">{reservation.email}</dd>
                </div>
                {reservation.notes && (
                  <div className="flex flex-col sm:flex-row sm:gap-4">
                    <dt className="text-sm font-semibold text-green-800 sm:w-40">Notes:</dt>
                    <dd className="text-sm text-green-700">{reservation.notes}</dd>
                  </div>
                )}
              </dl>
              <Button
                type="button"
                onClick={() => setReservation(null)}
                variant="outline"
                className="mt-4 border-green-300 text-green-800 hover:bg-green-100"
              >
                Book another session
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-6">
              {submitError && (
                <Alert variant="destructive" data-testid="submit-error">
                  <AlertDescription>
                    <strong>Error:</strong> {submitError}
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="fullName">
                  Full name <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className={errors.fullName ? "border-destructive" : ""}
                  aria-required="true"
                  aria-invalid={!!errors.fullName}
                  aria-describedby={errors.fullName ? "fullName-error" : undefined}
                />
                {errors.fullName && (
                  <p id="fullName-error" className="text-sm text-destructive" role="alert">
                    {errors.fullName}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">
                  Email <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={errors.email ? "border-destructive" : ""}
                  aria-required="true"
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? "email-error" : undefined}
                />
                {errors.email && (
                  <p id="email-error" className="text-sm text-destructive" role="alert">
                    {errors.email}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">
                  Desired date <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  min={new Date().toISOString().split("T")[0]}
                  className={errors.date ? "border-destructive" : ""}
                  aria-required="true"
                  aria-invalid={!!errors.date}
                  aria-describedby={errors.date ? "date-error" : undefined}
                />
                {errors.date && (
                  <p id="date-error" className="text-sm text-destructive" role="alert">
                    {errors.date}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="participants">Number of participants</Label>
                <Select
                  name="participants"
                  value={formData.participants}
                  onValueChange={(value) => handleChange({ target: { name: "participants", value } } as any)}
                >
                  <SelectTrigger id="participants">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 participant</SelectItem>
                    <SelectItem value="2">2 participants</SelectItem>
                    <SelectItem value="3">3 participants</SelectItem>
                    <SelectItem value="4">4 participants</SelectItem>
                    <SelectItem value="5">5 participants</SelectItem>
                    <SelectItem value="6">6 participants</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Additional notes</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Any special requirements or questions?"
                  className="resize-y"
                />
              </div>

              <Button type="submit" disabled={!isFormValid || isSubmitting} className="w-full" aria-busy={isSubmitting}>
                {isSubmitting ? "Sending…" : "Confirm reservation"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

