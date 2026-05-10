export enum Category {
  TRANSPORT = "TRANSPORT",
  STAY = "STAY",
  FOOD = "FOOD",
  EXCURSION = "EXCURSION",
  SHOPPING = "SHOPPING",
  OTHER = "OTHER",
}

export enum ChecklistCategory {
  CLOTHING = "CLOTHING",
  DOCUMENTS = "DOCUMENTS",
  ELECTRONICS = "ELECTRONICS",
  TOILETRIES = "TOILETRIES",
  OTHER = "OTHER",
}



export interface User {
  id: string
  name?: string | null
  email: string
  emailVerified?: Date | null
  phonenumber: string
  image?: string | null
  password?: string | null
  createdAt: Date
  updatedAt: Date
}

export interface Account {
  id: number
  userId: string
  type: string
  provider: string
  providerAccountId: string
  refresh_token?: string | null
  access_token?: string | null
  expires_at?: number | null
  token_type?: string | null
  scope?: string | null
  id_token?: string | null
  session_state?: string | null
  createdAt: Date
  updatedAt: Date
}

export interface Trip {
  id: string
  title: string
  description: string
  imageUrl?: string | null
  startDate: Date
  endDate: Date
  isPublic: boolean
  publicSlug?: string | null
  userId: string
  budget: number
  currency: string
  createdAt: Date
  updatedAt: Date
}

export interface Stop {
  id: string
  cityName: string
  country: string
  imageUrl?: string | null
  order: number
  startDate?: Date | null
  endDate?: Date | null
  tripId: string
  createdAt: Date
}

export interface Activity {
  id: string
  name: string
  category: Category
  estimatedCost: number
  duration?: string | null
  notes?: string | null
  order: number
  stopId: string
  createdAt: Date
}

export interface ChecklistItem {
  id: string
  label: string
  packed: boolean
  category: ChecklistCategory
  tripId: string
  createdAt: Date
}

export interface Note {
  id: string
  content: string
  stopId?: string | null
  tripId: string
  createdAt: Date
  updatedAt: Date
}

export interface City {
  id: string
  name: string
  country: string
  imageUrl: string
  description: string
  costPerDay: number
  region: string
}



export interface StopWithActivities extends Stop {
  activities: Activity[]
}

export interface TripWithStops extends Trip {
  stops: Stop[]
}

export interface FullTrip extends Trip {
  stops: StopWithActivities[]
  notes: Note[]
  checklist: ChecklistItem[]
}