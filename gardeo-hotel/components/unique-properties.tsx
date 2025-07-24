import { Card, CardContent } from "@/components/ui/card"
import { Heart, ChevronRight } from "lucide-react"
import Image from "next/image"

const properties = [
  {
    id: 1,
    name: "Eco Lodge Retreat",
    location: "Sinharaja Forest, Sri Lanka",
    image: "/placeholder.svg?height=250&width=350",
    type: "Eco Lodge",
  },
  {
    id: 2,
    name: "Modern Tree House",
    location: "Ella, Sri Lanka",
    image: "/placeholder.svg?height=250&width=350",
    type: "Tree House",
  },
  {
    id: 3,
    name: "Traditional Villa",
    location: "Galle, Sri Lanka",
    image: "/placeholder.svg?height=250&width=350",
    type: "Heritage Villa",
  },
  {
    id: 4,
    name: "Glass House Retreat",
    location: "Nuwara Eliya, Sri Lanka",
    image: "/placeholder.svg?height=250&width=350",
    type: "Modern Retreat",
  },
]

export function UniqueProperties() {
  return (
    <section className="py-12">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">Stay at our top unique properties</h2>
        <p className="text-gray-600">From castles and villas to boats and igloos, we've got it all</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {properties.map((property) => (
          <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
            <CardContent className="p-0">
              <div className="relative">
                <Image
                  src={property.image || "/placeholder.svg"}
                  alt={property.name}
                  width={350}
                  height={250}
                  className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <button className="absolute top-3 right-3 p-2 bg-white/80 hover:bg-white rounded-full transition-colors">
                  <Heart className="w-5 h-5 text-gray-600 hover:text-red-500" />
                </button>
              </div>

              <div className="p-4">
                <span className="text-sm text-blue-600 font-medium">{property.type}</span>
                <h3 className="font-bold text-lg mb-1">{property.name}</h3>
                <p className="text-gray-600 text-sm">{property.location}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-center mt-8">
        <button className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium">
          Show more unique stays
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </section>
  )
}
