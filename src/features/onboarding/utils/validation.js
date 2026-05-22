export function validateDailyTarget(value) {
  const parsed = Number.parseInt(String(value).trim(), 10)

  if (!Number.isFinite(parsed)) {
    return { valid: false, error: 'Введите целое число' }
  }

  if (parsed < 1 || parsed > 100) {
    return { valid: false, error: 'От 1 до 100 сигарет в день' }
  }

  return { valid: true, value: parsed }
}

export function validatePackPrice(value) {
  const parsed = Number.parseFloat(String(value).trim().replace(',', '.'))

  if (!Number.isFinite(parsed)) {
    return { valid: false, error: 'Введите стоимость пачки' }
  }

  if (parsed <= 0 || parsed > 100_000) {
    return { valid: false, error: 'Стоимость должна быть больше 0' }
  }

  return { valid: true, value: Math.round(parsed * 100) / 100 }
}

export function validateCigsPerPack(value) {
  const parsed = Number.parseInt(String(value).trim(), 10)

  if (!Number.isFinite(parsed)) {
    return { valid: false, error: 'Введите целое число' }
  }

  if (parsed < 1 || parsed > 50) {
    return { valid: false, error: 'От 1 до 50 сигарет в пачке' }
  }

  return { valid: true, value: parsed }
}
