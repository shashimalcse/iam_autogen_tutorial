"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { ChatWidget } from "@/components/chat-widget"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, MapPin, Wifi, Car, Coffee, Dumbbell, ArrowLeft, Bed } from "lucide-react"
import Image from "next/image"
import { getHotelDetails, getHotelReviews, createBooking, type Hotel, type Room, type Review } from "@/lib/api"

interface HotelDetails extends Hotel {
  rooms: Room[]
}

export default function HotelDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const hotelId = Number.parseInt(params.id as string)

  const [hotel, setHotel] = useState<HotelDetails | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [bookingLoading, setBookingLoading] = useState(false)

  useEffect(() => {
    const fetchHotelData = async () => {
      try {
        const [hotelData, reviewsData] = await Promise.all([
          getHotelDetails(hotelId),
          getHotelReviews(hotelId, { limit: 5 }),
        ])

        setHotel(hotelData)
        setReviews(reviewsData.reviews || [])
      } catch (error) {
        console.error("Failed to fetch hotel data:", error)
        // Fallback data for demo
        setHotel({
          id: hotelId,
          name: "Gardeo Resort & Spa",
          location: "Kandy, Sri Lanka",
          city: "Kandy",
          rating: 8.2,
          total_reviews: 407,
          amenities: [
            "Free WiFi",
            "Swimming Pool",
            "Spa & Wellness",
            "Restaurant",
            "Gym",
            "Free Parking",
            "Room Service",
            "24/7 Reception",
          ],
          images: [
            "/placeholder.svg?height=400&width=600",
            "/placeholder.svg?height=300&width=400",
            "/placeholder.svg?height=300&width=400",
          ],
          description:
            "Experience luxury and tranquility at Gardeo Resort & Spa, nestled in the heart of Kandy's cultural landscape. Our resort offers world-class amenities, stunning views of the surrounding hills, and exceptional service that will make your stay unforgettable.",
          rooms: [
            {
              id: 1,
              hotel_id: hotelId,
              name: "Deluxe Garden View",
              type: "Deluxe Room",
              capacity: 2,
              amenities: ["King Bed", "Garden View", "Air Conditioning", "Mini Bar", "WiFi"],
              price_per_night: 15500,
              available: true,
            },
            {
              id: 2,
              hotel_id: hotelId,
              name: "Premium Pool View",
              type: "Premium Room",
              capacity: 3,
              amenities: ["Queen Bed + Sofa Bed", "Pool View", "Balcony", "Air Conditioning", "Mini Bar", "WiFi"],
              price_per_night: 22800,
              available: true,
            },
            {
              id: 3,
              hotel_id: hotelId,
              name: "Executive Suite",
              type: "Suite",
              capacity: 4,
              amenities: [
                "King Bed",
                "Separate Living Area",
                "City View",
                "Kitchenette",
                "WiFi",
                "Complimentary Breakfast",
              ],
              price_per_night: 35600,
              available: true,
            },
            {
              id: 4,
              hotel_id: hotelId,
              name: "Family Room",
              type: "Family Room",
              capacity: 5,
              amenities: ["2 Queen Beds", "Garden View", "Air Conditioning", "Mini Fridge", "WiFi", "Extra Space"],
              price_per_night: 28900,
              available: false,
            },
          ],
        })
        setReviews([
          {
            id: 1,
            booking_id: 1,
            hotel_id: hotelId,
            user_id: "user1",
            rating: 9,
            title: "Exceptional stay!",
            comment:
              "Beautiful resort with amazing staff. The spa was incredible and the food was delicious. Highly recommend!",
            review_type: "hotel",
            would_recommend: true,
            created_at: "2024-01-15T10:30:00Z",
          },
          {
            id: 2,
            booking_id: 2,
            hotel_id: hotelId,
            user_id: "user2",
            rating: 8,
            title: "Great location and service",
            comment:
              "Perfect location in Kandy with easy access to attractions. Staff was very helpful and rooms were clean.",
            review_type: "hotel",
            would_recommend: true,
            created_at: "2024-01-10T14:20:00Z",
          },
        ])
      } finally {
        setLoading(false)
      }
    }

    if (hotelId) {
      fetchHotelData()
    }
  }, [hotelId])

  const handleBookRoom = async (room: Room) => {
    setBookingLoading(true)

    try {
      // Get search params from session storage
      const searchParams = JSON.parse(sessionStorage.getItem("searchParams") || "{}")

      const bookingData = {
        hotel_id: hotelId,
        room_id: room.id,
        check_in: searchParams.check_in || new Date().toISOString().split("T")[0],
        check_out: searchParams.check_out || new Date(Date.now() + 86400000).toISOString().split("T")[0],
        guests: searchParams.guests || 2,
      }

      const booking = await createBooking(bookingData)

      // Store booking info and redirect to confirmation
      sessionStorage.setItem("bookingConfirmation", JSON.stringify(booking))
      router.push("/booking-confirmation")
    } catch (error) {
      console.error("Booking failed:", error)
      alert("Booking failed. Please try again or contact support.")
    } finally {
      setBookingLoading(false)
    }
  }

  const getAmenityIcon = (amenity: string) => {
    const lower = amenity.toLowerCase()
    if (lower.includes("wifi")) return <Wifi className="w-4 h-4" />
    if (lower.includes("parking")) return <Car className="w-4 h-4" />
    if (lower.includes("restaurant") || lower.includes("breakfast")) return <Coffee className="w-4 h-4" />
    if (lower.includes("gym") || lower.includes("fitness")) return <Dumbbell className="w-4 h-4" />
    if (lower.includes("bed")) return <Bed className="w-4 h-4" />
    return null
  }

  if (loading) {
    return (
      <>
        <div className="min-h-screen bg-white">
          <Header />
          <div className="container mx-auto px-4 py-8">
            <div className="text-center">Loading hotel details...</div>
          </div>
        </div>
        <ChatWidget />
      </>
    )
  }

  if (!hotel) {
    return (
      <>
        <div className="min-h-screen bg-white">
          <Header />
          <div className="container mx-auto px-4 py-8">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-4">Hotel not found</h1>
              <Button onClick={() => router.push("/")} className="bg-blue-600 hover:bg-blue-700">
                Back to Home
              </Button>
            </div>
          </div>
        </div>
        <ChatWidget />
      </>
    )
  }

  return (
    <>
      <div className="min-h-screen bg-white">
        <Header />

        <div className="container mx-auto px-4 py-8">
          {/* Back Button */}
          <Button variant="ghost" onClick={() => router.back()} className="mb-6 flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>

          {/* Hotel Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">{hotel.name}</h1>
            <div className="flex items-center text-gray-600 mb-4">
              <MapPin className="w-5 h-5 mr-2" />
              <span>{hotel.location}</span>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-2">
                <div className="bg-blue-600 text-white px-3 py-1 rounded font-bold">{hotel.rating}</div>
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(hotel.rating) ? "text-yellow-400 fill-current" : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-gray-600">({hotel.total_reviews} reviews)</span>
              </div>
            </div>

            {/* Hotel Images */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="md:col-span-2">
                <Image
                  src={hotel.images?.[0] || "/placeholder.svg?height=400&width=600"}
                  alt={hotel.name}
                  width={600}
                  height={400}
                  className="w-full h-80 object-cover rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-1 gap-4">
                {hotel.images?.slice(1, 3).map((image, index) => (
                  <Image
                    key={index}
                    src={image || "/placeholder.svg?height=190&width=300"}
                    alt={`${hotel.name} ${index + 2}`}
                    width={300}
                    height={190}
                    className="w-full h-36 object-cover rounded-lg"
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Description */}
              <Card className="mb-8">
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-4">About this hotel</h2>
                  <p className="text-gray-700 leading-relaxed">{hotel.description}</p>
                </CardContent>
              </Card>

              {/* Amenities */}
              <Card className="mb-8">
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-4">Amenities</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {hotel.amenities?.map((amenity) => (
                      <div key={amenity} className="flex items-center gap-2">
                        {getAmenityIcon(amenity)}
                        <span className="text-sm">{amenity}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Reviews */}
              {reviews.length > 0 && (
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-xl font-bold mb-4">Recent Reviews</h2>
                    <div className="space-y-4">
                      {reviews.map((review) => (
                        <div key={review.id} className="border-b pb-4 last:border-b-0">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="bg-blue-600 text-white px-2 py-1 rounded text-sm font-bold">
                              {review.rating}
                            </div>
                            <h4 className="font-semibold">{review.title}</h4>
                          </div>
                          <p className="text-gray-700 text-sm mb-2">{review.comment}</p>
                          <span className="text-xs text-gray-500">
                            {new Date(review.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar - Available Rooms */}
            <div>
              <Card className="sticky top-4">
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-4">Available Rooms</h2>
                  <div className="space-y-4">
                    {hotel.rooms?.map((room) => (
                      <div key={room.id} className={`border rounded-lg p-4 ${!room.available ? "opacity-60" : ""}`}>
                        <h3 className="font-semibold mb-2">{room.name}</h3>
                        <p className="text-sm text-gray-600 mb-2">
                          {room.type} • Up to {room.capacity} guests
                        </p>

                        {/* Room Amenities */}
                        {room.amenities && room.amenities.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {room.amenities.slice(0, 3).map((amenity) => (
                              <Badge key={amenity} variant="secondary" className="text-xs flex items-center gap-1">
                                {getAmenityIcon(amenity)}
                                {amenity}
                              </Badge>
                            ))}
                            {room.amenities.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{room.amenities.length - 3} more
                              </Badge>
                            )}
                          </div>
                        )}

                        <div className="flex justify-between items-center">
                          <div>
                            <span className="text-lg font-bold">LKR {room.price_per_night.toLocaleString()}</span>
                            <span className="text-sm text-gray-600 block">per night</span>
                          </div>
                          <Button
                            onClick={() => handleBookRoom(room)}
                            disabled={!room.available || bookingLoading}
                            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                          >
                            {!room.available ? "Unavailable" : bookingLoading ? "Booking..." : "Book Now"}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      <ChatWidget />
    </>
  )
}
