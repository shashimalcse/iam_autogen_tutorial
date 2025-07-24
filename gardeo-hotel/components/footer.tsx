import { Facebook, Twitter, Instagram, Youtube } from "lucide-react"
import Link from "next/link"

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-4">Gardeo.com</h3>
            <p className="text-gray-400 mb-4">Your trusted partner for unforgettable stays in Sri Lanka and beyond.</p>
            <div className="flex gap-4">
              <Link href="#" className="text-gray-400 hover:text-white">
                <Facebook className="w-5 h-5" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white">
                <Twitter className="w-5 h-5" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white">
                <Instagram className="w-5 h-5" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white">
                <Youtube className="w-5 h-5" />
              </Link>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link href="#" className="hover:text-white">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white">
                  Safety Information
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white">
                  Cancellation Options
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Discover</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link href="#" className="hover:text-white">
                  Seasonal Deals
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white">
                  Travel Articles
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white">
                  Unique Stays
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white">
                  Reviews
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Terms and Settings</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link href="#" className="hover:text-white">
                  Privacy & Cookies
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white">
                  Partner Dispute
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white">
                  Modern Slavery Act
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 Gardeo.com. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
