"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { getHotels, type Hotel } from "@/lib/api"

export function WeekendDeals() {
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        const response = await getHotels({ limit: 8 })
        setHotels(response.hotels || [])
      } catch (error) {
        console.error("Failed to fetch hotels:", error)
        // Fallback data for demo
        setHotels([
          {
            id: 1,
            name: "Gardeo Resort & Spa",
            location: "Kandy, Sri Lanka",
            city: "Kandy",
            rating: 8.2,
            total_reviews: 407,
            amenities: ["WiFi", "Pool", "Spa"],
            images: ["/placeholder.svg?height=200&width=300"],
            description: "Luxury resort in Kandy",
            lowest_rate: 16931,
          },
          {
            id: 2,
            name: "Heart of Ella Resort",
            location: "Ella, Sri Lanka",
            city: "Ella",
            rating: 7.9,
            total_reviews: 1165,
            amenities: ["WiFi", "Restaurant", "Garden"],
            images: ["/placeholder.svg?height=200&width=300"],
            description: "Mountain resort in Ella",
            lowest_rate: 37471,
          },
          {
            id: 3,
            name: "Granbell Hotel Colombo",
            location: "Colombo, Sri Lanka",
            city: "Colombo",
            rating: 8.6,
            total_reviews: 6171,
            amenities: ["WiFi", "Gym", "Restaurant"],
            images: ["/placeholder.svg?height=200&width=300"],
            description: "Modern hotel in Colombo",
            lowest_rate: 51183,
          },
          {
            id: 4,
            name: "Hotel Travellers Nest Kandy",
            location: "Kandy, Sri Lanka",
            city: "Kandy",
            rating: 7.7,
            total_reviews: 479,
            amenities: ["WiFi", "Parking", "Restaurant"],
            images: ["/placeholder.svg?height=200&width=300"],
            description: "Comfortable stay in Kandy",
            lowest_rate: 23937,
          },
          {
            id: 5,
            name: "Cinnamon Grand Colombo",
            location: "Colombo, Sri Lanka",
            city: "Colombo",
            rating: 8.4,
            total_reviews: 892,
            amenities: ["WiFi", "Pool", "Spa", "Gym"],
            images: ["/placeholder.svg?height=200&width=300"],
            description: "Luxury hotel in heart of Colombo",
            lowest_rate: 45200,
          },
          {
            id: 6,
            name: "Jetwing Vil Uyana",
            location: "Sigiriya, Sri Lanka",
            city: "Sigiriya",
            rating: 9.1,
            total_reviews: 324,
            amenities: ["WiFi", "Pool", "Spa", "Restaurant"],
            images: ["/placeholder.svg?height=200&width=300"],
            description: "Eco-luxury resort near Sigiriya",
            lowest_rate: 78500,
          },
          {
            id: 7,
            name: "Amangalla",
            location: "Galle, Sri Lanka",
            city: "Galle",
            rating: 9.3,
            total_reviews: 156,
            amenities: ["WiFi", "Pool", "Spa", "Restaurant", "Beach"],
            images: ["/placeholder.svg?height=200&width=300"],
            description: "Historic luxury hotel in Galle Fort",
            lowest_rate: 125000,
          },
          {
            id: 8,
            name: "Tea Trails",
            location: "Nuwara Eliya, Sri Lanka",
            city: "Nuwara Eliya",
            rating: 8.9,
            total_reviews: 203,
            amenities: ["WiFi", "Restaurant", "Garden", "Fireplace"],
            images: ["/placeholder.svg?height=200&width=300"],
            description: "Colonial tea estate bungalows",
            lowest_rate: 89400,
          },
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchHotels()
  }, [])

  const getRatingText = (rating: number) => {
    if (rating >= 9) return "Exceptional"
    if (rating >= 8.5) return "Fabulous"
    if (rating >= 8) return "Very good"
    if (rating >= 7.5) return "Good"
    return "Pleasant"
  }

  if (loading) {
    return (
      <section className="py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Deals for the weekend</h2>
          <p className="text-gray-600">Save on stays for 25 July – 27 July</p>
        </div>
        <div className="text-center">Loading hotels...</div>
      </section>
    )
  }

  return (
    <section className="py-12">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">Deals for the weekend</h2>
        <p className="text-gray-600">Save on stays for 25 July – 27 July</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {hotels.map((hotel) => (
          <Link key={hotel.id} href={`/hotel/${hotel.id}`}>
            <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-0">
                <div className="relative">
                  <Image
                    src={hotel.images?.[0] || "/placeholder.svg?height=200&width=300"}
                    alt={hotel.name}
                    width={300}
                    height={200}
                    className="w-full h-48 object-cover"
                  />
                  <Badge className="absolute top-2 left-2 bg-blue-600 text-white">Genius</Badge>
                </div>

                <div className="p-4">
                  <h3 className="font-bold text-lg mb-1">{hotel.name}</h3>
                  <p className="text-gray-600 text-sm mb-3">{hotel.location}</p>

                  <div className="flex items-center gap-2 mb-3">
                    <div className="bg-blue-600 text-white px-2 py-1 rounded text-sm font-bold">{hotel.rating}</div>
                    <span className="text-sm font-medium">{getRatingText(hotel.rating)}</span>
                    <span className="text-gray-500 text-sm">{hotel.total_reviews} reviews</span>
                  </div>

                  <Badge variant="secondary" className="bg-green-100 text-green-800 mb-3">
                    Weekend Deal
                  </Badge>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm text-gray-500">2 nights</span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-lg">LKR {hotel.lowest_rate?.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="flex justify-center mt-8">
        <button className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium">
          Show more deals
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </section>
  )
}
