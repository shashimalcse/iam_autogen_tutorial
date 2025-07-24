"""
User data store with user profiles and preferences
"""

users_data = {
    "6dcec033-8117-49bb-8363-3c519bcdbb73": {
        "id": "6dcec033-8117-49bb-8363-3c519bcdbb73",
        "email": "john.doe@example.com",
        "first_name": "John",
        "last_name": "Doe",
        "phone": "+94771234567",
        "loyalty_tier": "gold",
        "preferences": {
            "room_type": "deluxe",
            "amenities": ["Mountain View", "Spa", "Free WiFi", "Gym"],
            "budget_range": {
                "min": 100.0,
                "max": 300.0
            }
        }
    },
    "8b2f1c45-9876-5432-abcd-ef1234567890": {
        "id": "8b2f1c45-9876-5432-abcd-ef1234567890",
        "email": "sarah.smith@example.com",
        "first_name": "Sarah",
        "last_name": "Smith",
        "phone": "+94779876543",
        "loyalty_tier": "diamond",
        "preferences": {
            "room_type": "studio",
            "amenities": ["Kitchen", "City View", "Business Center", "Conference Facilities"],
            "budget_range": {
                "min": 200.0,
                "max": 500.0
            }
        }
    },
    "c3d4e5f6-7890-1234-5678-9abcdef01234": {
        "id": "c3d4e5f6-7890-1234-5678-9abcdef01234",
        "email": "david.wilson@example.com",
        "first_name": "David",
        "last_name": "Wilson",
        "phone": "+94771122334",
        "loyalty_tier": "silver",
        "preferences": {
            "room_type": "super_deluxe",
            "amenities": ["Ocean View", "Private Beach", "Spa", "Luxury Amenities"],
            "budget_range": {
                "min": 250.0,
                "max": 400.0
            }
        }
    },
    "a1b2c3d4-5678-9012-3456-789abcdef012": {
        "id": "a1b2c3d4-5678-9012-3456-789abcdef012",
        "email": "emma.brown@example.com",
        "first_name": "Emma",
        "last_name": "Brown",
        "phone": "+94775544332",
        "loyalty_tier": "member",
        "preferences": {
            "room_type": "standard",
            "amenities": ["Free WiFi", "Air Conditioning", "Room Service"],
            "budget_range": {
                "min": 50.0,
                "max": 150.0
            }
        }
    }
}