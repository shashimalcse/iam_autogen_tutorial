// API configuration and helper functions
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.gardeo.com"

export interface Hotel {
  id: number
  name: string
  location: string
  city: string
  brand?: string
  rating: number
  total_reviews: number
  amenities: string[]
  images: string[]
  description: string
  price_per_night?: number
  lowest_rate?: number
}

export interface Room {
  id: number
  hotel_id: number
  name: string
  type: string
  capacity: number
  amenities: string[]
  price_per_night: number
  available: boolean
}

export interface SearchParams {
  location: string
  check_in: string
  check_out: string
  guests: number
  rooms: number
  brand?: string
  amenities?: string[]
  price_range?: {
    min: number
    max: number
  }
}

export interface Booking {
  id: number
  user_id: string
  hotel_id: number
  room_id: number
  check_in: string
  check_out: string
  guests: number
  status: "confirmed" | "cancelled" | "completed"
  total_price: number
  special_requests?: string[]
  created_at: string
}

export interface Review {
  id: number
  booking_id: number
  hotel_id: number
  user_id: string
  rating: number
  title: string
  comment: string
  review_type: "hotel" | "staff"
  would_recommend: boolean
  created_at: string
}

// API functions
export async function getHotels(params?: {
  city?: string
  brand?: string
  amenities?: string[]
  limit?: number
  offset?: number
}) {
  const searchParams = new URLSearchParams()

  if (params?.city) searchParams.append("city", params.city)
  if (params?.brand) searchParams.append("brand", params.brand)
  if (params?.amenities) {
    params.amenities.forEach((amenity) => searchParams.append("amenities", amenity))
  }
  if (params?.limit) searchParams.append("limit", params.limit.toString())
  if (params?.offset) searchParams.append("offset", params.offset.toString())

  const response = await fetch(`${API_BASE_URL}/api/hotels?${searchParams}`)
  if (!response.ok) throw new Error("Failed to fetch hotels")

  return response.json()
}

export async function searchHotels(searchParams: SearchParams) {
  const response = await fetch(`${API_BASE_URL}/api/hotels/search`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(searchParams),
  })

  if (!response.ok) throw new Error("Failed to search hotels")
  return response.json()
}

export async function getHotelDetails(hotelId: number) {
  const response = await fetch(`${API_BASE_URL}/api/hotels/${hotelId}`)
  if (!response.ok) throw new Error("Failed to fetch hotel details")

  return response.json()
}

export async function getHotelReviews(
  hotelId: number,
  params?: {
    limit?: number
    rating?: number
  },
) {
  const searchParams = new URLSearchParams()
  if (params?.limit) searchParams.append("limit", params.limit.toString())
  if (params?.rating) searchParams.append("rating", params.rating.toString())

  const response = await fetch(`${API_BASE_URL}/api/hotels/${hotelId}/reviews?${searchParams}`)
  if (!response.ok) throw new Error("Failed to fetch hotel reviews")

  return response.json()
}

export async function createBooking(
  bookingData: {
    user_id?: string
    hotel_id: number
    room_id: number
    check_in: string
    check_out: string
    guests: number
    special_requests?: string[]
  },
  token?: string,
) {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE_URL}/api/bookings`, {
    method: "POST",
    headers,
    body: JSON.stringify(bookingData),
  })

  if (!response.ok) throw new Error("Failed to create booking")
  return response.json()
}

export async function getBooking(bookingId: number, token: string) {
  const response = await fetch(`${API_BASE_URL}/api/bookings/${bookingId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) throw new Error("Failed to fetch booking")
  return response.json()
}

export async function cancelBooking(bookingId: number, reason?: string, token?: string) {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE_URL}/api/bookings/${bookingId}/cancel`, {
    method: "POST",
    headers,
    body: JSON.stringify({ reason }),
  })

  if (!response.ok) throw new Error("Failed to cancel booking")
  return response.json()
}
