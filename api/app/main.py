import json
import logging
import os
from fastapi import FastAPI, HTTPException, Depends, Security, APIRouter, Request
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
from datetime import date, datetime
from .schemas import *
from .dependencies import TokenData, validate_token
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

def validate_cancellation_policy(room_data: dict, check_in: date) -> bool:
    """
    Validates if a booking can be made based on cancellation policy timing.
    Returns True if booking is allowed, False otherwise.
    """
    cancellation_policy = room_data.get("cancellationPolicy", "")
    
    # Extract hours from cancellation policy
    if "24 hours" in cancellation_policy:
        required_hours = 24
    elif "48 hours" in cancellation_policy:
        required_hours = 48
    else:
        required_hours = 24  # Default to 24 hours
    
    # Check if check-in is far enough in the future
    now = datetime.now()
    check_in_datetime = datetime.combine(check_in, datetime.min.time())
    hours_until_checkin = (check_in_datetime - now).total_seconds() / 3600
    
    return hours_until_checkin >= required_hours

def log_request_details(request: Request, token_data: TokenData, extra_info: dict = None):
    """Enhanced logging function with structured information"""
    endpoint = request.url.path
    method = request.method
    sub = token_data.sub
    act = token_data.act.sub

    
    # Get client IP
    client_ip = request.client.host if request.client else 'N/A'
    
    # Get user agent
    user_agent = request.headers.get('user-agent', 'N/A')
    
    # Build log message
    log_data = {
        "method": method,
        "endpoint": endpoint,
        "client_ip": client_ip,
        "user_id": sub,
        "actor": act,
        "user_agent": user_agent[:100] + "..." if len(user_agent) > 100 else user_agent
    }
    
    # Add extra information if provided
    if extra_info:
        log_data.update(extra_info)
    
    # Create structured log message
    log_message = " | ".join([
        f"{method} {endpoint}",
        f"sub: {sub}",
        f"act: {act}",
    ])
    
    # Add extra info to message if provided
    if extra_info:
        extra_parts = []
        for key, value in extra_info.items():
            extra_parts.append(f"{key}: {value}")
        if extra_parts:
            log_message += " | " + " | ".join(extra_parts)
    
    logger.info(log_message)
    
    # Also log as JSON for structured logging tools
    logger.debug(f"Request details: {json.dumps(log_data, default=str)}")

app = FastAPI()
api_router = APIRouter(prefix="/api")

# CORS Configuration
def get_cors_origins():
    """Get CORS origins from environment variable"""
    cors_origins = os.getenv('CORS_ORIGINS', 'http://localhost:3000,https://localhost:3000')
    return [origin.strip() for origin in cors_origins.split(',')]

def get_cors_methods():
    """Get CORS methods from environment variable"""
    cors_methods = os.getenv('CORS_METHODS', '*')
    if cors_methods == '*':
        return ["*"]
    return [method.strip() for method in cors_methods.split(',')]

def get_cors_headers():
    """Get CORS headers from environment variable"""
    cors_headers = os.getenv('CORS_HEADERS', '*')
    if cors_headers == '*':
        return ["*"]
    return [header.strip() for header in cors_headers.split(',')]

app.add_middleware(
    CORSMiddleware,
    allow_origins=get_cors_origins(),
    allow_credentials=os.getenv('CORS_CREDENTIALS', 'true').lower() == 'true',
    allow_methods=get_cors_methods(),
    allow_headers=get_cors_headers(),
)

# In-memory data stores
hotels_data = {
    1: {
        "name": "Gardeo Saman Villa",
        "description": "Enjoy a luxurious stay at Gardeo Saman Villas in your suite, and indulge in a delicious breakfast and your choice of lunch or dinner from our daily set menus served at the restaurant. Access exquisite facilities, including the infinity pool, Sahana Spa, gymnasium and library, as you unwind in paradise.",
        "location": "Bentota, Sri Lanka",
        "rating": 4.5,
        "amenities": ["Infinity Pool", "Sahana Spa", "Gymnasium", "Library", "Restaurant", "Room Service"],
        "policies": [
            "Check-in: 2:00 PM",
            "Check-out: 12:00 PM", 
            "No pets allowed",
            "Non-smoking rooms"
        ],
        "roomTypes": ["deluxe", "super_deluxe"],
        "promotions": ["Early Bird 20% off", "Stay 3 nights get 1 free"]
    },
    2: {
        "name": "Gardeo Colombo Seven",
        "description": "Gardeo Colombo Seven is located in the heart of Colombo, the commercial capital of Sri Lanka and offers the discerning traveler contemporary accommodation and modern design aesthetic. Rising over the city landscape, the property boasts stunning views, a rooftop bar and pool, main restaurant, gym and spa services, as well as conference facilities.",
        "location": "Colombo 07, Sri Lanka", 
        "rating": 4.9,
        "amenities": ["Rooftop Pool", "Spa", "Gym", "Conference Facilities", "Restaurant", "Rooftop Bar"],
        "policies": [
            "Check-in: 3:00 PM",
            "Check-out: 11:00 AM",
            "No pets allowed", 
            "Non-smoking rooms"
        ],
        "roomTypes": ["studio", "super_deluxe"],
        "promotions": ["Business Package", "Weekend Special"]
    },
    3: {
        "name": "Gardeo Kandy Hills",
        "description": "Set amidst the misty hills of Kandy, Gardeo Kandy Hills offers breathtaking views of the surrounding mountains. This heritage property combines traditional Sri Lankan architecture with modern luxury, featuring an infinity pool overlooking the valley, authentic local cuisine, and a wellness center.",
        "location": "Kandy, Sri Lanka",
        "rating": 4.7,
        "amenities": ["Infinity Pool", "Wellness Center", "Heritage Restaurant", "Tea Lounge", "Mountain Biking", "Cultural Tours"],
        "policies": [
            "Check-in: 2:00 PM",
            "Check-out: 11:00 AM",
            "No pets allowed",
            "Non-smoking rooms"
        ],
        "roomTypes": ["deluxe", "studio"],
        "promotions": ["Cultural Experience Package", "Honeymoon Special"]
    },
    4: {
        "name": "Gardeo Beach Resort Galle",
        "description": "Located along the historic Galle coast, Gardeo Beach Resort offers direct beach access and stunning views of the Indian Ocean. The resort features colonial-era architecture, beachfront dining, water sports facilities, and a luxury spa.",
        "location": "Galle, Sri Lanka",
        "rating": 4.8,
        "amenities": ["Private Beach", "Water Sports", "Beachfront Dining", "Luxury Spa", "Infinity Pool", "Kids Club"],
        "policies": [
            "Check-in: 2:00 PM", 
            "Check-out: 12:00 PM",
            "No pets allowed",
            "Non-smoking rooms"
        ],
        "roomTypes": ["deluxe", "super_deluxe"],
        "promotions": ["Beach Getaway Package", "Family Fun Deal"]
    }
}

room_type_data = {
    "deluxe": {"description": "The spacious rooms are defined by king size beds commanding a modern yet minimal ambience, with amenities set in minimalist contours of elegance and efficiency with all the creature comforts a traveler needs."},
    "super_deluxe": {"description": "The super deluxe rooms are defined by king size beds commanding a modern yet minimal ambience, with a bathtub and amenities set in minimalist contours of elegance and efficiency with all the creature comforts a traveler needs."},
    "studio": {"description": "The 1 bedroom serviced apartments spacious living areas as well as a kitchen housing a cooker, fridge, washing machine and microwave. Rooms are defined by king size beds commanding a modern yet minimal ambience, with amenities set in minimalist contours of elegance and efficiency with all the creature comforts a traveller needs."},
    "standard": {"description": "The standard rooms are defined by king size beds commanding a modern yet minimal ambience, with amenities set in minimalist contours of elegance and efficiency with all the creature comforts a traveler needs."}
}

rooms_data = {
    1: {
        101: {
            "room_number": "101",
            "room_type": "standard",
            "price_per_night": 69.99,
            "occupancy": 2,
            "amenities": ["Air Conditioning", "Free WiFi", "Safe"],
            "cancellationPolicy": "Free cancellation up to 24 hours before check-in",
            "is_available": True
        },
        102: {
            "room_number": "102", 
            "room_type": "super_deluxe",
            "price_per_night": 149.50,
            "occupancy": 3,
            "amenities": ["Air Conditioning", "Mini Bar", "Free WiFi", "Safe", "Bathtub", "Sea View"],
            "cancellationPolicy": "Free cancellation up to 24 hours before check-in",
            "is_available": True
        },
        103: {
            "room_number": "103",
            "room_type": "deluxe",
            "price_per_night": 99.99,
            "occupancy": 2,
            "amenities": ["Air Conditioning", "Mini Bar", "Free WiFi", "Safe", "Garden View"],
            "cancellationPolicy": "Free cancellation up to 24 hours before check-in",
            "is_available": True
        }
    },
    2: {
        201: {
            "room_number": "201",
            "room_type": "studio",
            "price_per_night": 299.99,
            "occupancy": 4,
            "amenities": ["Air Conditioning", "Kitchen", "Free WiFi", "Safe", "Washing Machine", "City View"],
            "cancellationPolicy": "Free cancellation up to 48 hours before check-in",
            "is_available": True
        },
        202: {
            "room_number": "202",
            "room_type": "super_deluxe",
            "price_per_night": 199.50,
            "occupancy": 3,
            "amenities": ["Air Conditioning", "Mini Bar", "Free WiFi", "Safe", "Bathtub", "City View"],
            "cancellationPolicy": "Free cancellation up to 48 hours before check-in",
            "is_available": True
        },
        203: {
            "room_number": "203",
            "room_type": "standard",
            "price_per_night": 89.99,
            "occupancy": 4,
            "amenities": ["Air Conditioning", "Free WiFi"],
            "cancellationPolicy": "Free cancellation up to 24 hours before check-in", 
            "is_available": True
        }
    },
    3: {
        301: {
            "room_number": "301",
            "room_type": "deluxe",
            "price_per_night": 179.99,
            "occupancy": 2,
            "amenities": ["Air Conditioning", "Mini Bar", "Free WiFi", "Safe", "Mountain View"],
            "cancellationPolicy": "Free cancellation up to 24 hours before check-in",
            "is_available": True
        },
        302: {
            "room_number": "302",
            "room_type": "studio",
            "price_per_night": 259.99,
            "occupancy": 4,
            "amenities": ["Air Conditioning", "Kitchen", "Free WiFi", "Safe", "Washing Machine", "Valley View"],
            "cancellationPolicy": "Free cancellation up to 48 hours before check-in",
            "is_available": True
        },
        303: {
            "room_number": "303",
            "room_type": "deluxe",
            "price_per_night": 189.99,
            "occupancy": 2,
            "amenities": ["Air Conditioning", "Mini Bar", "Free WiFi", "Safe", "Garden View"],
            "cancellationPolicy": "Free cancellation up to 24 hours before check-in",
            "is_available": True
        }
    },
    4: {
        401: {
            "room_number": "401",
            "room_type": "deluxe",
            "price_per_night": 199.99,
            "occupancy": 2,
            "amenities": ["Air Conditioning", "Mini Bar", "Free WiFi", "Safe", "Ocean View"],
            "cancellationPolicy": "Free cancellation up to 24 hours before check-in",
            "is_available": True
        },
        402: {
            "room_number": "402",
            "room_type": "super_deluxe",
            "price_per_night": 299.50,
            "occupancy": 3,
            "amenities": ["Air Conditioning", "Mini Bar", "Free WiFi", "Safe", "Bathtub", "Ocean View", "Private Balcony"],
            "cancellationPolicy": "Free cancellation up to 48 hours before check-in",
            "is_available": True
        },
        403: {
            "room_number": "403",
            "room_type": "deluxe",
            "price_per_night": 209.99,
            "occupancy": 2,
            "amenities": ["Air Conditioning", "Mini Bar", "Free WiFi", "Safe", "Garden View"],
            "cancellationPolicy": "Free cancellation up to 24 hours before check-in",
            "is_available": True
        }
    }
}

bookings_data = {}

user_bookings_data = [
    {
        "id": 1,
        "hotel_id": 1,
        "hotel_name": "Gardeo Saman Villa",
        "user_id": "6dcec033-8117-49bb-8363-3c519bcdbb73",
        "room_id": 101,
        "room_type": "deluxe",
        "check_in": date(2024, 2, 12),
        "check_out": date(2024, 2, 15),
        "guest_count": 2,
        "total_price": 299.97
    },
    {
        "id": 2,
        "hotel_id": 2,
        "hotel_name": "Gardeo Colombo Seven",
        "user_id": "6dcec033-8117-49bb-8363-3c519bcdbb73",
        "room_id": 201,
        "room_type": "studio",
        "check_in": date(2024, 3, 1),
        "check_out": date(2024, 3, 5),
        "guest_count": 4,
        "total_price": 1199.96
    }
]
last_booking_id = 0

@api_router.get("/hotels", response_model=Hotels)
async def list_hotels(
    request: Request,
    token_data: TokenData = Security(validate_token, scopes=["read_hotels"])
):

    log_request_details(request, token_data)

    return {
        "hotels": [
            HotelBasic(id=hid, **hotel_data)
            for hid, hotel_data in hotels_data.items()
        ]
    }

@api_router.get("/hotels/{hotel_id}", response_model=Hotel)
async def get_hotel(
    request: Request,
    hotel_id: int,
    token_data: TokenData = Security(validate_token, scopes=["read_rooms"])
):
    
    log_request_details(request, token_data)

    if hotel_id not in hotels_data:
        raise HTTPException(status_code=404, detail="Hotel not found")
    
    hotel = hotels_data[hotel_id]
    rooms = [
        RoomBasic(id=rid, **room_data)
        for rid, room_data in rooms_data[hotel_id].items()
    ]
    
    return {
        "id": hotel_id,
        "name": hotel["name"],
        "description": hotel["description"],
        "location": hotel["location"],
        "rating": hotel["rating"],
        "amenities": hotel["amenities"],
        "policies": hotel["policies"],
        "roomTypes": hotel["roomTypes"],
        "promotions": hotel["promotions"],
        "rooms": rooms
    }

@api_router.post("/bookings", response_model=Booking)
async def book_room(
    request: Request,
    booking: BookingCreate,
    token_data: TokenData = Security(validate_token, scopes=["create_bookings"])
):
    
    log_request_details(request, token_data, {"booking_request": f"hotel_{booking.hotel_id}_room_{booking.room_id}"})

    global last_booking_id
    
    # Validate dates
    today = date.today()
    if booking.check_in < today:
        raise HTTPException(status_code=400, detail="Check-in date cannot be in the past")
    
    if booking.check_out <= booking.check_in:
        raise HTTPException(status_code=400, detail="Check-out date must be after check-in date")
    
    # Validate minimum stay (at least 1 night)
    if (booking.check_out - booking.check_in).days < 1:
        raise HTTPException(status_code=400, detail="Minimum stay is 1 night")
    
    # Validate guest count
    if booking.guest_count < 1:
        raise HTTPException(status_code=400, detail="Guest count must be at least 1")
    
    # Validate hotel exists
    if booking.hotel_id not in hotels_data:
        raise HTTPException(status_code=404, detail="Hotel not found")
    
    # Validate room exists
    if booking.room_id not in rooms_data.get(booking.hotel_id, {}):
        raise HTTPException(status_code=404, detail="Room not found in this hotel")
    
    # Get hotel and room data
    hotel = hotels_data[booking.hotel_id]
    room = rooms_data[booking.hotel_id][booking.room_id]
    
    # Validate room availability status
    if not room.get("is_available", True):
        raise HTTPException(status_code=400, detail="Room is currently not available")
    
    # Validate occupancy
    if booking.guest_count > room["occupancy"]:
        raise HTTPException(
            status_code=400, 
            detail=f"Room can accommodate maximum {room['occupancy']} guests, but {booking.guest_count} guests requested"
        )
    
    # Validate cancellation policy timing
    if not validate_cancellation_policy(room, booking.check_in):
        policy = room.get("cancellationPolicy", "Free cancellation up to 24 hours before check-in")
        raise HTTPException(
            status_code=400, 
            detail=f"Booking does not meet cancellation policy requirements: {policy}"
        )
    
    # Check if room is available for the dates
    for existing_booking in bookings_data.values():
        if (existing_booking["hotel_id"] == booking.hotel_id and 
            existing_booking["room_id"] == booking.room_id and 
            not (booking.check_out <= existing_booking["check_in"] or 
                 booking.check_in >= existing_booking["check_out"])):
            raise HTTPException(
                status_code=400, 
                detail=f"Room is not available for the selected dates. Conflicting booking from {existing_booking['check_in']} to {existing_booking['check_out']}"
            )
    
    # Calculate total price
    days = (booking.check_out - booking.check_in).days
    total_price = room["price_per_night"] * days
    
    # Create booking
    last_booking_id += 1
    booking_data = {
        "id": last_booking_id,
        "hotel_id": booking.hotel_id,
        "hotel_name": hotel["name"],
        "user_id": token_data.sub,
        "room_id": booking.room_id,
        "room_type": room["room_type"],
        "check_in": booking.check_in,
        "check_out": booking.check_out,
        "guest_count": booking.guest_count,
        "total_price": total_price
    }
    
    bookings_data[last_booking_id] = booking_data
    
    # Log successful booking creation
    log_request_details(request, token_data, {
        "booking_created": last_booking_id,
        "hotel": hotel["name"],
        "room": room["room_number"],
        "guests": booking.guest_count,
        "nights": days,
        "total_price": total_price
    })
    
    return Booking(**booking_data)

@api_router.get("/bookings/{booking_id}", response_model=Booking)
async def get_booking_details(
    request: Request,
    booking_id: int,
    token_data: TokenData = Security(validate_token, scopes=["read_bookings"])
):
    
    log_request_details(request, token_data)

    if booking_id not in bookings_data:
        raise HTTPException(status_code=404, detail="Booking not found")
    return Booking(**bookings_data[booking_id])


@api_router.get("/users/{user_id}/bookings", response_model=List[Booking])
async def get_user_bookings(
    request: Request,
    user_id: str,
    token_data: TokenData = Security(validate_token, scopes=["read_bookings"])
):
    log_request_details(request, token_data, {"user_id_requested": user_id})
    
    # Combine static bookings and dynamic bookings
    all_bookings = []
    
    # Add static bookings
    for booking in user_bookings_data:
        if booking["user_id"] == user_id:
            all_bookings.append(Booking(**booking))
    
    # Add dynamic bookings
    for booking in bookings_data.values():
        if booking["user_id"] == user_id:
            all_bookings.append(Booking(**booking))
    
    return all_bookings


# Include the router in the main app
app.include_router(api_router)
