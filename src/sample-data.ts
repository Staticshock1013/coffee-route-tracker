import type { RouteData } from './types'

export const sampleData: RouteData = {
  locations: [
    { id: 'atlas', name: 'Atlas Studio', address: '41 W 23rd St, New York', installDate: '2026-03-12', pricingModel: 'per-cup', price: 1.65, restockCadenceDays: 10 },
    { id: 'foundry', name: 'The Foundry Co.', address: '85 Leonard St, New York', installDate: '2026-05-28', pricingModel: 'flat', price: 480, restockCadenceDays: 14 },
    { id: 'northstar', name: 'Northstar Legal', address: '10 E 40th St, New York', installDate: '2026-07-08', pricingModel: 'per-cup', price: 1.85, restockCadenceDays: 7 },
    { id: 'civic', name: 'Civic Works', address: '212 3rd Ave, Brooklyn', installDate: '2026-08-19', pricingModel: 'per-cup', price: 1.55, restockCadenceDays: 14 },
  ],
  cupLogs: [
    { id: 'c1', locationId: 'atlas', date: '2026-10-02', count: 86 }, { id: 'c2', locationId: 'atlas', date: '2026-10-09', count: 104 }, { id: 'c3', locationId: 'atlas', date: '2026-10-16', count: 98 },
    { id: 'c4', locationId: 'northstar', date: '2026-10-03', count: 124 }, { id: 'c5', locationId: 'northstar', date: '2026-10-10', count: 137 }, { id: 'c6', locationId: 'northstar', date: '2026-10-17', count: 118 },
    { id: 'c7', locationId: 'civic', date: '2026-10-05', count: 62 }, { id: 'c8', locationId: 'civic', date: '2026-10-15', count: 72 },
  ],
  restocks: [
    { id: 'r1', locationId: 'atlas', date: '2026-10-16', items: 'Beans, milk, cups', cost: 91.5 },
    { id: 'r2', locationId: 'foundry', date: '2026-10-07', items: 'Beans, oat milk, syrup', cost: 124 },
    { id: 'r3', locationId: 'northstar', date: '2026-10-17', items: 'Beans, cups, filters', cost: 111.75 },
    { id: 'r4', locationId: 'civic', date: '2026-10-02', items: 'Beans, milk', cost: 65.25 },
  ],
}
