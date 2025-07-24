"use client"

import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"
import Link from "next/link"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export function Header() {
  return (
    <header className="bg-blue-800 text-white">
      <div className="container mx-auto px-4">
        {/* Top bar */}
        <div className="flex items-center justify-between py-4">
          <Link href="/" className="text-2xl font-bold">
            Gardeo.com
          </Link>

          <div className="hidden md:flex items-center gap-4">
            <Button size="sm" className="bg-white text-blue-800 hover:bg-gray-100">
              Sign in
            </Button>
          </div>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden text-white">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-blue-800 text-white border-blue-700">
              <div className="flex flex-col gap-4 mt-8">
                <Button className="bg-white text-blue-800 hover:bg-gray-100">Sign in</Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
