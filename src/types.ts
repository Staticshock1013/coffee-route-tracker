export type PricingModel = 'per-cup' | 'flat'

export interface Location {
  id: string
  name: string
  address: string
  installDate: string
  pricingModel: PricingModel
  price: number
  restockCadenceDays: number
}

export interface CupLog {
  id: string
  locationId: string
  date: string
  count: number
}

export interface Restock {
  id: string
  locationId: string
  date: string
  items: string
  cost: number
}

export interface RouteData {
  locations: Location[]
  cupLogs: CupLog[]
  restocks: Restock[]
}
