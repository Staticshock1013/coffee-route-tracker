import type { CupLog, Location, Restock } from './types'

export const monthKey = (date: string) => date.slice(0, 7)

export const revenueForLocation = (
  location: Location,
  cups: CupLog[],
  month: string,
) => {
  if (location.pricingModel === 'flat') return location.price
  return cups
    .filter((cup) => cup.locationId === location.id && monthKey(cup.date) === month)
    .reduce((total, cup) => total + cup.count * location.price, 0)
}

export const restockCostForLocation = (
  locationId: string,
  restocks: Restock[],
  month: string,
) =>
  restocks
    .filter((restock) => restock.locationId === locationId && monthKey(restock.date) === month)
    .reduce((total, restock) => total + restock.cost, 0)

export const cupsForLocation = (locationId: string, cups: CupLog[], month: string) =>
  cups
    .filter((cup) => cup.locationId === locationId && monthKey(cup.date) === month)
    .reduce((total, cup) => total + cup.count, 0)

export const lastRestockDate = (locationId: string, restocks: Restock[]) =>
  restocks
    .filter((restock) => restock.locationId === locationId)
    .map((restock) => restock.date)
    .sort()
    .at(-1)
