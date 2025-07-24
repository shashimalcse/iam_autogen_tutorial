"use client"

import { useEffect, useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ChatWidget } from "@/components/chat-widget"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, MapPin, Wifi, Car, Coffee, Dumbbell } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import type { Hotel, SearchParams } from "@/lib/api"

interface SearchResult extends Hotel {
  available_rooms: Array<{
    id: number
    name: string
    type: string
    capacity: number
    price_per_night: number
    available: boolean
  }>
  search_id: string
}

export default function SearchResultsPage() {
  const [results, setResults] = useState<SearchResult[]>([])
  const [searchParams, setSearchParams] = useState<SearchParams | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedResults = sessionStorage.getItem("searchResults")
    const storedParams = sessionStorage.getItem("searchParams")

    if (storedResults && storedParams) {
      setResults(JSON.parse(storedResults).hotels || [])
      setSearchParams(JSON.parse(storedParams))
    }

    setLoading(false)
  }, [])

  const getAmenityIcon = (amenity: string) => {
    switch (amenity.toLowerCase()) {
      case "wifi":
      case "free wifi":
        return <Wifi className="w-4 h-4" />
      case "parking":
      case "free parking":
        return <Car className="w-4 h-4" />
      case "restaurant":
      case "breakfast":
        return <Coffee className="w-4 h-4" />
      case "gym":
      case "fitness center":
        return <Dumbbell className="w-4 h-4" />
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading search results...</div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <>
      <div className="min-h-screen bg-white">
        <Header />

        <div className="container mx-auto px-4 py-8">
          {/* Search Summary */}
          {searchParams && (
            <div className="mb-8 p-4 bg-blue-50 rounded-lg">
              <h1 className="text-2xl font-bold mb-2">Search Results</h1>
              <p className="text-gray-600">
                {results.length} properties found in {searchParams.location} •{" "}
                {new Date(searchParams.check_in).toLocaleDateString()} -{" "}
                {new Date(searchParams.check_out).toLocaleDateString()} • {searchParams.guests} guest
                {searchParams.guests > 1 ? "s" : ""} • {searchParams.rooms} room{searchParams.rooms > 1 ? "s" : ""}
              </p>
            </div>
          )}

          {/* Results */}
          <div className="space-y-6">
            {results.map((hotel) => (
              <Card key={hotel.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row">
                    {/* Hotel Image */}
                    <div className="md:w-1/3 relative h-64 md:h-auto">
                      <Image
                        src={hotel.images?.[0] || "/placeholder.svg?height=250&width=350"}
                        alt={hotel.name}
                        fill
                        className="object-cover"
                      />
                    </div>

                    {/* Hotel Details */}
                    <div className="md:w-2/3 p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-bold mb-1">{hotel.name}</h3>
                          <div className="flex items-center text-gray-600 mb-2">
                            <MapPin className="w-4 h-4 mr-1" />
                            <span className="text-sm">{hotel.location}</span>
                          </div>

                          {/* Rating */}
                          <div className="flex items-center gap-2 mb-3">
                            <div className="bg-blue-600 text-white px-2 py-1 rounded text-sm font-bold">
                              {hotel.rating}
                            </div>
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < Math.floor(hotel.rating) ? "text-yellow-400 fill-current" : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-gray-600">({hotel.total_reviews} reviews)</span>
                          </div>

                          {/* Amenities */}
                          <div className="flex flex-wrap gap-2 mb-4">
                            {hotel.amenities?.slice(0, 4).map((amenity) => (
                              <Badge key={amenity} variant="secondary" className="flex items-center gap-1">
                                {getAmenityIcon(amenity)}
                                <span className="text-xs">{amenity}</span>
                              </Badge>
                            ))}
                            {hotel.amenities?.length > 4 && (
                              <Badge variant="outline" className="text-xs">
                                +{hotel.amenities.length - 4} more
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Pricing */}
                        <div className="text-right">
                          {hotel.lowest_rate && (
                            <div className="mb-2">
                              <span className="text-2xl font-bold">LKR {hotel.lowest_rate.toLocaleString()}</span>
                              <span className="text-sm text-gray-600 block">per night</span>
                            </div>
                          )}

                          <Link href={`/hotel/${hotel.id}`}>
                            <Button className="bg-blue-600 hover:bg-blue-700">View Details</Button>
                          </Link>
                        </div>
                      </div>

                      {/* Available Rooms Preview */}
                      {hotel.available_rooms && hotel.available_rooms.length > 0 && (
                        <div className="border-t pt-4">
                          <h4 className="font-semibold mb-2">Available Rooms:</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {hotel.available_rooms.slice(0, 2).map((room) => (
                              <div key={room.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                <div>
                                  <span className="font-medium text-sm">{room.name}</span>
                                  <span className="text-xs text-gray-600 block">Up to {room.capacity} guests</span>
                                </div>
                                <span className="font-bold text-sm">LKR {room.price_per_night.toLocaleString()}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {results.length === 0 && (
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold mb-4">No hotels found</h2>
              <p className="text-gray-600 mb-6">Try adjusting your search criteria or dates.</p>
              <Link href="/">
                <Button className="bg-blue-600 hover:bg-blue-700">Search Again</Button>
              </Link>
            </div>
          )}
        </div>

        <Footer />
      </div>
      <ChatWidget />
    </>
  )
}
