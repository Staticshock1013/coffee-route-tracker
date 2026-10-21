import { describe, expect, it } from 'vitest'
import { restockCostForLocation, revenueForLocation } from './revenue'
import type { CupLog, Location, Restock } from './types'

const perCup: Location = {
  id: 'a', name: 'Sample', address: '1 Main St', installDate: '2026-01-01',
  pricingModel: 'per-cup', price: 1.5, restockCadenceDays: 14,
}
const flat: Location = { ...perCup, id: 'b', pricingModel: 'flat', price: 420 }
const cups: CupLog[] = [
  { id: '1', locationId: 'a', date: '2026-10-03', count: 20 },
  { id: '2', locationId: 'a', date: '2026-10-14', count: 11 },
  { id: '3', locationId: 'a', date: '2026-09-14', count: 50 },
]

describe('revenue math', () => {
  it('calculates monthly per-cup revenue and excludes other months', () => {
    expect(revenueForLocation(perCup, cups, '2026-10')).toBe(46.5)
  })

  it('uses the monthly fee for flat-rate placements', () => {
    expect(revenueForLocation(flat, cups, '2026-10')).toBe(420)
  })

  it('sums only matching restock costs', () => {
    const restocks: Restock[] = [
      { id: '1', locationId: 'a', date: '2026-10-03', items: 'Beans', cost: 45 },
      { id: '2', locationId: 'a', date: '2026-09-03', items: 'Milk', cost: 30 },
      { id: '3', locationId: 'b', date: '2026-10-03', items: 'Cups', cost: 20 },
    ]
    expect(restockCostForLocation('a', restocks, '2026-10')).toBe(45)
  })
})
