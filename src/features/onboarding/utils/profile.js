export function isProfileComplete(user) {
  if (!user) return false

  const dailyTarget = Number(user.daily_target)
  const packPrice = Number(user.pack_price)
  const cigsPerPack = Number(user.cigs_per_pack)

  return (
    Number.isFinite(dailyTarget) &&
    dailyTarget > 0 &&
    Number.isFinite(packPrice) &&
    packPrice > 0 &&
    Number.isFinite(cigsPerPack) &&
    cigsPerPack > 0
  )
}

export function getPricePerCigarette(packPrice, cigsPerPack) {
  return packPrice / cigsPerPack
}
