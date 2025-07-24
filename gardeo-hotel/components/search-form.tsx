"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Calendar, MapPin, Users } from "lucide-react"
import { useState } from "react"
import { searchHotels, type SearchParams } from "@/lib/api"
import { useRouter } from "next/navigation"

export function SearchForm() {
  const [destination, setDestination] = useState("")
  const [checkIn, setCheckIn] = useState("")
  const [checkOut, setCheckOut] = useState("")
  const [guests, setGuests] = useState(2)
  const [rooms, setRooms] = useState(1)
  const [isSearching, setIsSearching] = useState(false)
  const router = useRouter()

  const handleSearch = async () => {
    if (!destination || !checkIn || !checkOut) {
      alert("Please fill in all required fields")
      return
    }

    setIsSearching(true)

    try {
      const searchParams: SearchParams = {
        location: destination,
        check_in: checkIn,
        check_out: checkOut,
        guests,
        rooms,
      }

      const results = await searchHotels(searchParams)

      // Store search results and redirect to results page
      sessionStorage.setItem("searchResults", JSON.stringify(results))
      sessionStorage.setItem("searchParams", JSON.stringify(searchParams))

      router.push("/search-results")
    } catch (error) {
      console.error("Search failed:", error)
      alert("Search failed. Please try again.")
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <div className="bg-yellow-400 p-1 rounded-lg shadow-lg -mt-8 relative z-10 max-w-6xl mx-auto">
      <div className="bg-white rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Where are you going?"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="pl-10 h-12 border-2 border-yellow-400 focus:border-blue-500"
            />
          </div>

          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="date"
              placeholder="Check-in date"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              className="pl-10 h-12 border-2 border-yellow-400 focus:border-blue-500"
              min={new Date().toISOString().split("T")[0]}
            />
          </div>

          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="date"
              placeholder="Check-out date"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              className="pl-10 h-12 border-2 border-yellow-400 focus:border-blue-500"
              min={checkIn || new Date().toISOString().split("T")[0]}
            />
          </div>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={`${guests} adults • ${rooms} room${rooms > 1 ? "s" : ""}`}
                onChange={(e) => {
                  // Simple parsing - in real app you'd want a proper dropdown
                  const match = e.target.value.match(/(\d+) adults • (\d+) room/)
                  if (match) {
                    setGuests(Number.parseInt(match[1]))
                    setRooms(Number.parseInt(match[2]))
                  }
                }}
                className="pl-10 h-12 border-2 border-yellow-400 focus:border-blue-500 rounded-md w-full bg-white"
              >
                <option value="1 adults • 1 room">1 adult • 1 room</option>
                <option value="2 adults • 1 room">2 adults • 1 room</option>
                <option value="3 adults • 1 room">3 adults • 1 room</option>
                <option value="4 adults • 1 room">4 adults • 1 room</option>
                <option value="2 adults • 2 rooms">2 adults • 2 rooms</option>
                <option value="4 adults • 2 rooms">4 adults • 2 rooms</option>
              </select>
            </div>
            <Button
              onClick={handleSearch}
              disabled={isSearching}
              className="bg-blue-600 hover:bg-blue-700 h-12 px-8 text-white font-semibold"
            >
              {isSearching ? "Searching..." : "Search"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
