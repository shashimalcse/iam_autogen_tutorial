import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"

export function OffersSection() {
  return (
    <section className="py-12">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">Offers</h2>
        <p className="text-gray-600">Promotions, deals and special offers for you</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="flex">
              <div className="flex-1 p-6">
                <h3 className="text-xl font-bold mb-2">Quick escape, quality time</h3>
                <p className="text-gray-600 mb-4">Save up to 20% with a Getaway Deal</p>
                <Button className="bg-blue-600 hover:bg-blue-700">Save on stays</Button>
              </div>
              <div className="w-32 relative">
                <Image
                  src="/placeholder.svg?height=120&width=120"
                  alt="Couple relaxing"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="relative h-48">
              <Image src="/placeholder.svg?height=200&width=400" alt="Holiday home" fill className="object-cover" />
              <div className="absolute inset-0 bg-black/40" />
              <div className="absolute inset-0 p-6 text-white flex flex-col justify-end">
                <span className="text-sm mb-2 opacity-90">Holiday rentals</span>
                <h3 className="text-xl font-bold mb-2">Live the dream in a holiday home</h3>
                <p className="text-sm mb-4 opacity-90">Choose from houses, villas, chalets and more</p>
                <Button
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-black w-fit bg-transparent"
                >
                  Book yours
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
