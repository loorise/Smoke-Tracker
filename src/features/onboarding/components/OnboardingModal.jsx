import { useState } from 'react'
import { hapticLight, hapticSuccess } from '../../../infra/telegram/telegramHaptic.js'
import { completeOnboarding } from '../services/onboardingService.js'
import {
  validateCigsPerPack,
  validateDailyTarget,
  validatePackPrice,
} from '../utils/validation.js'
import './OnboardingModal.css'

const STEPS = [
  {
    key: 'daily_target',
    title: 'Сигарет в день',
    subtitle: 'Ваша обычная норма — для расчёта экономии',
    label: 'Сигарет в день',
    inputMode: 'numeric',
    placeholder: '20',
  },
  {
    key: 'pack_price',
    title: 'Цена пачки',
    subtitle: 'Стоимость одной пачки в рублях',
    label: 'Цена пачки, ₽',
    inputMode: 'decimal',
    placeholder: '250',
  },
  {
    key: 'cigs_per_pack',
    title: 'Сигарет в пачке',
    subtitle: 'Обычно 20',
    label: 'Сигарет в пачке',
    inputMode: 'numeric',
    placeholder: '20',
  },
]

function validateStep(key, value) {
  if (key === 'daily_target') return validateDailyTarget(value)
  if (key === 'pack_price') return validatePackPrice(value)
  return validateCigsPerPack(value)
}

export function OnboardingModal({ user, onComplete }) {
  const [stepIndex, setStepIndex] = useState(0)
  const [values, setValues] = useState({
    daily_target: '',
    pack_price: '',
    cigs_per_pack: '',
  })
  const [fieldError, setFieldError] = useState(null)
  const [saveError, setSaveError] = useState(null)
  const [isSaving, setIsSaving] = useState(false)

  const step = STEPS[stepIndex]
  const isLastStep = stepIndex === STEPS.length - 1
  const currentValue = values[step.key]

  function handleValueChange(event) {
    setValues((prev) => ({ ...prev, [step.key]: event.target.value }))
    setFieldError(null)
    setSaveError(null)
  }

  function handleBack() {
    if (stepIndex === 0 || isSaving) return
    hapticLight()
    setStepIndex((index) => index - 1)
    setFieldError(null)
    setSaveError(null)
  }

  async function handleNext() {
    hapticLight()

    const result = validateStep(step.key, currentValue)

    if (!result.valid) {
      setFieldError(result.error)
      return
    }

    setFieldError(null)
    setSaveError(null)

    const nextValues = { ...values, [step.key]: String(result.value) }

    if (!isLastStep) {
      setValues(nextValues)
      setStepIndex((index) => index + 1)
      return
    }

    setIsSaving(true)

    try {
      const daily = validateDailyTarget(nextValues.daily_target)
      const price = validatePackPrice(nextValues.pack_price)
      const cigs = validateCigsPerPack(nextValues.cigs_per_pack)

      if (!daily.valid || !price.valid || !cigs.valid) {
        setSaveError('Проверьте введённые значения')
        return
      }

      await completeOnboarding(user.id, {
        dailyTarget: daily.value,
        packPrice: price.value,
        cigsPerPack: cigs.value,
      })

      await onComplete()
      hapticSuccess()
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Не удалось сохранить')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="onboarding" role="dialog" aria-modal="true" aria-labelledby="onboarding-title">
      <div className="onboarding__backdrop" aria-hidden="true" />
      <div className="onboarding__panel card">
        <p className="onboarding__step-label">
          Шаг {stepIndex + 1} из {STEPS.length}
        </p>
        <h2 id="onboarding-title" className="onboarding__title">
          {step.title}
        </h2>
        <p className="onboarding__subtitle">{step.subtitle}</p>

        <label className="onboarding__field">
          <span className="onboarding__field-label">{step.label}</span>
          <input
            className="onboarding__input"
            type="text"
            inputMode={step.inputMode}
            value={currentValue}
            onChange={handleValueChange}
            placeholder={step.placeholder}
            disabled={isSaving}
            autoFocus
          />
        </label>

        {fieldError ? <p className="onboarding__error">{fieldError}</p> : null}
        {saveError ? <p className="onboarding__error">{saveError}</p> : null}

        <div className="onboarding__actions">
          {stepIndex > 0 ? (
            <button
              type="button"
              className="btn btn--ghost onboarding__btn"
              onClick={handleBack}
              disabled={isSaving}
            >
              Назад
            </button>
          ) : (
            <span className="onboarding__btn-spacer" />
          )}
          <button
            type="button"
            className="btn onboarding__btn"
            onClick={handleNext}
            disabled={isSaving}
          >
            {isSaving ? 'Сохранение…' : isLastStep ? 'Готово' : 'Далее'}
          </button>
        </div>
      </div>
    </div>
  )
}
