from pydantic import BaseModel
from datetime import date
from typing import Dict, List, Optional


class RoomBasic(BaseModel):
    id: int
    room_number: str
    room_type: str
    price_per_night: float
    occupancy: int
    is_available: bool    

class Hotel(BaseModel):
    id: int
    name: str
    description: str
    location: str
    rating: float
    amenities: List[str]
    policies: List[str]
    roomTypes: List[str]
    promotions: List[str]
    rooms: List[RoomBasic]

class HotelBasic(BaseModel):
    id: int
    name: str
    description: str
    location: str
    rating: float
    roomTypes: List[str]

class Hotels(BaseModel):
    hotels: List[HotelBasic]    

class Rooms(BaseModel):
    rooms: List[RoomBasic]    
class BookingCreate(BaseModel):
    hotel_id: int
    room_id: int
    check_in: date
    check_out: date
    guest_count: int

class Booking(BaseModel):
    id: int
    user_id: str
    hotel_id: int
    hotel_name: str
    room_id: int
    room_type: str
    check_in: date
    check_out: date
    guest_count: int
    total_price: float


class RoomSearchResult(BaseModel):
    room_id: int
    hotel_id: int
    hotel_name: str
    hotel_rating: float
    hotel_description: str
    room_number: str
    room_type: str
    room_type_description: str
    price_per_night: float

