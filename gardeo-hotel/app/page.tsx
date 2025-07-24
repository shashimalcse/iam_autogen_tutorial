import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { SearchForm } from "@/components/search-form"
import { WeekendDeals } from "@/components/weekend-deals"
import { ChatWidget } from "@/components/chat-widget"

export default function HomePage() {
  return (
    <>
      <div className="min-h-screen bg-white">
        <Header />
        <HeroSection />
        <div className="container mx-auto px-4 py-8">
          <SearchForm />
          <WeekendDeals />
        </div>
      </div>
      <ChatWidget />
    </>
  )
}
