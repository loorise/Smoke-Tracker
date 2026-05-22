import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../auth/hooks/useAuth.js'
import { getTelegramDisplayInfo } from '../../infra/telegram/telegramAuthService.js'
import { hapticLight, hapticSuccess, hapticWarning } from '../../infra/telegram/telegramHaptic.js'
import {
  validateCigsPerPack,
  validateDailyTarget,
  validatePackPrice,
} from '../onboarding/utils/validation.js'
import { useSmokingEvents } from '../smoking/hooks/useSmokingEvents.js'
import { saveSettings } from './services/settingsService.js'
import { ConfirmDialog } from '../../shared/ui/ConfirmDialog.jsx'
import { Spinner } from '../../shared/ui/Spinner.jsx'
import './SettingsPage.css'

function buildFormFromUser(user) {
  return {
    daily_target: user?.daily_target != null ? String(user.daily_target) : '',
    pack_price: user?.pack_price != null ? String(user.pack_price) : '',
    cigs_per_pack: user?.cigs_per_pack != null ? String(user.cigs_per_pack) : '',
  }
}

function ProfileAvatar({ photoUrl, firstName }) {
  const initial = (firstName?.[0] ?? '?').toUpperCase()

  if (photoUrl) {
    return <img className="settings__avatar" src={photoUrl} alt="" />
  }

  return <div className="settings__avatar settings__avatar--placeholder">{initial}</div>
}

export function SettingsPage() {
  const { user, refreshUser } = useAuth()
  const { isLoading, isClearingHistory, deleteAllEvents } = useSmokingEvents()
  const telegram = useMemo(() => getTelegramDisplayInfo(), [])

  const [form, setForm] = useState(() => buildFormFromUser(user))
  const [fieldError, setFieldError] = useState(null)
  const [saveError, setSaveError] = useState(null)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [clearError, setClearError] = useState(null)

  useEffect(() => {
    setForm(buildFormFromUser(user))
  }, [user])

  function handleChange(field) {
    return (event) => {
      setForm((prev) => ({ ...prev, [field]: event.target.value }))
      setFieldError(null)
      setSaveError(null)
      setSaveSuccess(false)
    }
  }

  async function handleSave(event) {
    event.preventDefault()
    hapticLight()

    const daily = validateDailyTarget(form.daily_target)
    const price = validatePackPrice(form.pack_price)
    const cigs = validateCigsPerPack(form.cigs_per_pack)

    if (!daily.valid) {
      setFieldError(daily.error)
      return
    }

    if (!price.valid) {
      setFieldError(price.error)
      return
    }

    if (!cigs.valid) {
      setFieldError(cigs.error)
      return
    }

    setIsSaving(true)
    setFieldError(null)
    setSaveError(null)
    setSaveSuccess(false)

    try {
      await saveSettings(user.id, {
        dailyTarget: daily.value,
        packPrice: price.value,
        cigsPerPack: cigs.value,
      })
      await refreshUser()
      hapticSuccess()
      setSaveSuccess(true)
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Не удалось сохранить')
    } finally {
      setIsSaving(false)
    }
  }

  async function handleConfirmClear() {
    if (isClearingHistory) return

    hapticWarning()
    setClearError(null)

    try {
      await deleteAllEvents()
      hapticSuccess()
      setShowClearConfirm(false)
    } catch (err) {
      setClearError(err instanceof Error ? err.message : 'Не удалось удалить историю')
    }
  }

  if (isLoading) {
    return (
      <section className="settings settings--centered">
        <Spinner label="Загрузка…" />
      </section>
    )
  }

  const displayName =
    telegram?.firstName ||
    [user?.first_name, user?.last_name].filter(Boolean).join(' ') ||
    'Пользователь'

  return (
    <section className="settings">
      <h1 className="page__title">Настройки</h1>

      <div className="settings__profile">
        <ProfileAvatar photoUrl={telegram?.photoUrl} firstName={displayName} />
        <div className="settings__profile-text">
          <p className="settings__name">{displayName}</p>
          {telegram?.username ? (
            <p className="settings__username">{telegram.username}</p>
          ) : (
            <p className="settings__username settings__username--empty">Без username</p>
          )}
        </div>
      </div>

      <form className="settings__section" onSubmit={handleSave}>
        <p className="settings__section-title">Параметры</p>

        <label className="settings__field">
          <span className="settings__field-label">Сигарет в день</span>
          <input
            className="settings__input"
            type="text"
            inputMode="numeric"
            value={form.daily_target}
            onChange={handleChange('daily_target')}
            disabled={isSaving}
          />
        </label>

        <label className="settings__field">
          <span className="settings__field-label">Цена пачки, ₽</span>
          <input
            className="settings__input"
            type="text"
            inputMode="decimal"
            value={form.pack_price}
            onChange={handleChange('pack_price')}
            disabled={isSaving}
          />
        </label>

        <label className="settings__field">
          <span className="settings__field-label">Сигарет в пачке</span>
          <input
            className="settings__input"
            type="text"
            inputMode="numeric"
            value={form.cigs_per_pack}
            onChange={handleChange('cigs_per_pack')}
            disabled={isSaving}
          />
        </label>

        {fieldError ? <p className="settings__message settings__message--error">{fieldError}</p> : null}
        {saveError ? <p className="settings__message settings__message--error">{saveError}</p> : null}
        {saveSuccess ? (
          <p className="settings__message settings__message--success">Сохранено</p>
        ) : null}

        <button type="submit" className="btn settings__save-btn" disabled={isSaving}>
          {isSaving ? 'Сохранение…' : 'Сохранить'}
        </button>
      </form>

      <div className="settings__section settings__section--danger">
        <p className="settings__section-title settings__section-title--danger">Опасная зона</p>
        <p className="settings__danger-text">
          Удалит всю историю курения. Таймер и статистика сбросятся.
        </p>
        {clearError ? (
          <p className="settings__message settings__message--error">{clearError}</p>
        ) : null}
        <button
          type="button"
          className="settings__danger-btn"
          onClick={() => {
            hapticLight()
            setShowClearConfirm(true)
            setClearError(null)
          }}
          disabled={isClearingHistory}
        >
          Удалить всю историю
        </button>
      </div>

      <ConfirmDialog
        open={showClearConfirm}
        title="Удалить всю историю?"
        message="Все записи будут удалены без возможности восстановления."
        confirmLabel="Удалить всё"
        isLoading={isClearingHistory}
        onConfirm={handleConfirmClear}
        onCancel={() => {
          if (isClearingHistory) return
          hapticLight()
          setShowClearConfirm(false)
        }}
      />
    </section>
  )
}
