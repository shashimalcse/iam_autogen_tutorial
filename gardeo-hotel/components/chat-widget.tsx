"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageCircle, X, Send, Paperclip, Maximize2, Minimize2 } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import ReactMarkdown from "react-markdown"

interface Message {
  id: string
  type: "user" | "assistant"
  content: string
  timestamp: Date
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMaximized, setIsMaximized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "assistant",
      content: `# Welcome to Gardeo Hotel Assistant! 🏨

I'm here to help you with:

• **Booking assistance** and reservations
• **Room pricing** and availability  
• **Hotel amenities** and facilities
• **Location information** and attractions
• **General hotel inquiries**

How can I assist you today?`,
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: inputValue,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsTyping(true)

    // Simulate AI response
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: getAssistantResponse(inputValue),
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, assistantMessage])
      setIsTyping(false)
    }, 1500)
  }

  const getAssistantResponse = (userInput: string): string => {
    const input = userInput.toLowerCase()

    if (input.includes("book") || input.includes("reservation")) {
      return `## Booking Assistance 📅

I'd be happy to help you with booking! Here's what you can do:

• Use our **search form** to find available rooms
• Check our **weekend deals** for special offers
• Browse **unique properties** for special experiences

**Current Deals:**
- Gardeo Resort & Spa: **LKR 16,931** (was LKR 22,573)
- Heart of Ella Resort: **LKR 37,471** (was LKR 49,962)

Would you like me to guide you through the booking process?`
    } else if (input.includes("price") || input.includes("cost")) {
      return `## Pricing Information 💰

Our room rates vary by season and availability:

### Current Weekend Deals:
• **Gardeo Resort & Spa** - LKR 16,931 (2 nights)
• **Heart of Ella Resort** - LKR 37,471 (2 nights)  
• **Granbell Hotel Colombo** - LKR 51,183 (2 nights)
• **Hotel Travellers Nest Kandy** - LKR 23,937 (2 nights)

*Prices include taxes and fees*

Would you like to see pricing for specific dates?`
    } else if (input.includes("amenities") || input.includes("facilities")) {
      return `## Hotel Amenities & Facilities ✨

### **Gardeo Hotel Properties Include:**

🏊‍♂️ **Recreation**
• Swimming pools
• Spa & wellness centers
• Fitness facilities

🍽️ **Dining**
• Multiple restaurants
• Room service
• Bar & lounge areas

🛎️ **Services**
• 24/7 concierge
• Airport transfers
• Tour arrangements

Each property has unique features. Which location interests you most?`
    } else if (input.includes("location") || input.includes("where")) {
      return `## Our Locations 🗺️

### **Popular Destinations:**

🏔️ **Kandy** - Cultural capital with temple visits
🌿 **Ella** - Mountain views and tea plantations  
🏙️ **Colombo** - Urban luxury and shopping
🌊 **Galle** - Historic fort and beaches

### **Unique Properties:**
• Eco lodges in Sinharaja Forest
• Tree houses in Ella
• Heritage villas in Galle
• Modern retreats in Nuwara Eliya

Which area would you like to explore?`
    } else {
      return `## How Can I Help? 🤝

I'm your **Gardeo Hotel Assistant** and I can help with:

### **Popular Requests:**
• 🏨 **Room bookings** and availability
• 💵 **Pricing** and special offers  
• 🎯 **Amenities** and services
• 📍 **Location** information
• 🎉 **Activities** and attractions

Feel free to ask me anything specific about our properties or services!`
    }
  }

  const toggleMaximize = () => {
    setIsMaximized(!isMaximized)
  }

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg z-50"
        size="icon"
      >
        <MessageCircle className="h-6 w-6 text-white" />
      </Button>
    )
  }

  return (
    <>
      {/* Chat Panel */}
      <div
        className={`fixed bg-white text-gray-900 z-50 flex border-l border-gray-200 shadow-xl ${
          isMaximized ? "inset-0" : "right-0 top-0 bottom-0 w-1/3 min-w-[400px]"
        }`}
      >
        {/* Chat Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-blue-800">
            <div className="flex items-center gap-2">
              <div className="flex">
                <button className="px-4 py-2 text-sm font-medium bg-blue-700 text-white rounded-lg mr-2 hover:bg-blue-600 transition-colors">
                  Chat
                </button>
                <button className="px-4 py-2 text-sm font-medium text-blue-200 hover:text-white hover:bg-blue-700 rounded-lg transition-colors">
                  Design
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMaximize}
                className="h-8 w-8 text-blue-200 hover:text-white hover:bg-blue-700"
              >
                {isMaximized ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 text-blue-200 hover:text-white hover:bg-blue-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4 bg-white">
            <div className="space-y-6">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] ${message.type === "user" ? "" : "w-full"}`}>
                    {message.type === "assistant" && (
                      <div className="flex items-center gap-2 mb-2">
                        <Avatar className="h-6 w-6 bg-blue-600">
                          <AvatarFallback className="text-white text-xs font-semibold">GA</AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-gray-500">Gardeo Assistant</span>
                      </div>
                    )}
                    <div
                      className={`rounded-2xl px-4 py-3 ${
                        message.type === "user"
                          ? "bg-blue-600 text-white ml-auto max-w-xs shadow-sm"
                          : "bg-gray-50 text-gray-900 border border-gray-200"
                      }`}
                    >
                      {message.type === "assistant" ? (
                        <ReactMarkdown
                          className="prose prose-gray prose-sm max-w-none"
                          components={{
                            h1: ({ children }) => <h1 className="text-lg font-bold mb-2 text-gray-900">{children}</h1>,
                            h2: ({ children }) => (
                              <h2 className="text-base font-bold mb-2 text-gray-900">{children}</h2>
                            ),
                            h3: ({ children }) => <h3 className="text-sm font-bold mb-1 text-gray-900">{children}</h3>,
                            ul: ({ children }) => <ul className="list-disc list-inside space-y-1 mb-2">{children}</ul>,
                            li: ({ children }) => <li className="text-sm text-gray-700">{children}</li>,
                            p: ({ children }) => <p className="text-sm text-gray-700 mb-2 last:mb-0">{children}</p>,
                            strong: ({ children }) => (
                              <strong className="text-gray-900 font-semibold">{children}</strong>
                            ),
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
                      ) : (
                        <p className="text-sm">{message.content}</p>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-1 px-2">
                      {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-2 mb-2">
                    <Avatar className="h-6 w-6 bg-blue-600">
                      <AvatarFallback className="text-white text-xs font-semibold">GA</AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-gray-500">Typing...</span>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 ml-8">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div ref={messagesEndRef} />
          </ScrollArea>

          {/* Input Area */}
          <div className="p-4 border-t border-gray-200 bg-white">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              >
                <Paperclip className="h-4 w-4" />
              </Button>
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Ask a follow-up..."
                className="flex-1 bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim()}
                className="h-8 w-8 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600"
                size="icon"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Overlay - only show when not maximized */}
      {!isMaximized && (
        <div
          className="fixed top-0 bottom-0 left-0 bg-black bg-opacity-30 backdrop-blur-sm z-40 transition-all duration-300"
          style={{
            right: "33.333333%", // 1/3 from right
          }}
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}
