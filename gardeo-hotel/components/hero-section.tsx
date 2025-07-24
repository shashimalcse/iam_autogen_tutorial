import Image from "next/image"

export function HeroSection() {
  return (
    <div className="relative h-[500px] bg-gradient-to-r from-black/50 to-black/30">
      <Image
        src="/placeholder.svg?height=500&width=1200"
        alt="Luxury hotel interior"
        fill
        className="object-cover -z-10"
        priority
      />
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative container mx-auto px-4 h-full flex flex-col justify-center">
        <div className="max-w-2xl text-white">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
            A place to call home on your next adventure
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">Choose from houses, villas, chalets and more</p>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-colors">
            Find yours
          </button>
        </div>
      </div>
    </div>
  )
}
