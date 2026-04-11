from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

from fastapi import FastAPI, APIRouter, HTTPException, Request, Depends
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import uuid
import random
import bcrypt
import jwt
from datetime import datetime, timezone, timedelta
from pydantic import BaseModel
from typing import List, Optional, Dict, Any

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

JWT_SECRET = os.environ.get('JWT_SECRET', 'fallback_secret')
JWT_ALGORITHM = "HS256"

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

CATEGORY_IMAGES = {
    "Solar Panel": "https://images.unsplash.com/photo-1770810416523-bf40d844a248?w=400&q=80",
    "Inverter": "https://images.unsplash.com/photo-1544350224-c6190ca2a967?w=400&q=80",
    "Hybrid Inverter": "https://images.unsplash.com/photo-1544350224-c6190ca2a967?w=400&q=80",
    "Off Grid Inverter": "https://images.unsplash.com/photo-1544350224-c6190ca2a967?w=400&q=80",
    "Micro Inverter": "https://images.unsplash.com/photo-1544350224-c6190ca2a967?w=400&q=80",
    "Battery": "https://images.unsplash.com/photo-1581244249923-172ef5029576?w=400&q=80",
    "Wire & Cable": "https://images.unsplash.com/photo-1758965364875-e090e5423d2d?w=400&q=80",
    "Connector": "https://images.unsplash.com/photo-1758965364875-e090e5423d2d?w=400&q=80",
    "Distribution Box": "https://images.unsplash.com/photo-1544350224-c6190ca2a967?w=400&q=80",
    "Earthing": "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=400&q=80",
    "Lightning": "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=400&q=80",
    "Structure": "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=400&q=80",
    "PPE": "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=400&q=80",
    "Meter": "https://images.unsplash.com/photo-1544350224-c6190ca2a967?w=400&q=80",
}

# ─── MODELS ───
class LoginRequest(BaseModel):
    email: str
    password: str

class ProductCreate(BaseModel):
    name: str
    item_code: str = ""
    category: str
    description: str = ""
    price: float = 0
    uom: str = "Nos"
    moq: int = 1
    stock: int = 0
    in_stock: bool = True
    image_url: str = ""
    features: List[str] = []
    specs: Dict[str, str] = {}
    applications: List[str] = []
    hsn_code: str = ""
    gst_rate: float = 18

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    uom: Optional[str] = None
    moq: Optional[int] = None
    stock: Optional[int] = None
    in_stock: Optional[bool] = None
    image_url: Optional[str] = None
    features: Optional[List[str]] = None
    specs: Optional[Dict[str, str]] = None
    applications: Optional[List[str]] = None

class RFQCreate(BaseModel):
    items: List[Dict[str, Any]]
    transit_mode: str
    customer_name: str = ""
    customer_phone: str = ""
    customer_email: str = ""
    notes: str = ""

# ─── AUTH ───
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode('utf-8'), hashed.encode('utf-8'))

def create_token(user_id: str, email: str, role: str) -> str:
    payload = {"sub": user_id, "email": email, "role": role, "exp": datetime.now(timezone.utc) + timedelta(hours=24)}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_admin(request: Request):
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(auth[7:], JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if payload.get("role") != "admin":
            raise HTTPException(status_code=403, detail="Admin access required")
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# ─── SEED DATA ───
SEED_CATEGORIES = [
    {"name": "Solar Panel", "uom": "Nos", "moq": 1, "hsn": "85414011", "gst": 12,
     "desc": "High-efficiency Mono PERC Solar Panel with advanced cell technology for maximum energy output",
     "features": ["High Efficiency Mono PERC Cells", "Anti-Reflective Coating", "IP67 Junction Box", "25-Year Performance Warranty"],
     "apps": ["Rooftop Solar", "Ground Mount", "Commercial Projects", "Industrial Installations"],
     "items": [("SP01","Solar Panel 400W",8800),("SP02","Solar Panel 450W",9900),("SP03","Solar Panel 500W",11000),("SP04","Solar Panel 540W",11900),("SP05","Solar Panel 550W",12100),("SP06","Solar Panel 600W",13200)]},
    {"name": "Inverter", "uom": "Nos", "moq": 1, "hsn": "85044090", "gst": 12,
     "desc": "Grid-Tied Solar Inverter with MPPT tracking, wide voltage range, and remote monitoring",
     "features": ["Dual MPPT Tracking", "WiFi Remote Monitoring", "Wide Voltage Range", "IP65 Protection"],
     "apps": ["Residential Solar", "Commercial Rooftop", "Solar Farms", "Net Metering"],
     "items": [("IN01","On Grid Inverter 1kW",4500),("IN02","On Grid Inverter 2kW",9000),("IN03","On Grid Inverter 3kW",13500),("IN04","On Grid Inverter 3.6kW",16200),("IN05","On Grid Inverter 4kW",18000),("IN06","On Grid Inverter 4.6kW",20700),("IN07","On Grid Inverter 5kW",22500),("IN08","On Grid Inverter 5.5kW",24750),("IN09","On Grid Inverter 6kW",27000),("IN10","On Grid Inverter 8kW",36000),("IN11","On Grid Inverter 10kW",45000),("IN12","On Grid Inverter 12kW",45600),("IN13","On Grid Inverter 15kW",57000),("IN14","On Grid Inverter 20kW",76000),("IN15","On Grid Inverter 25kW",95000),("IN16","On Grid Inverter 30kW",114000),("IN17","On Grid Inverter 40kW",152000),("IN18","On Grid Inverter 50kW",190000),("IN19","On Grid Inverter 60kW",192000),("IN20","On Grid Inverter 75kW",240000),("IN21","On Grid Inverter 100kW",320000),("IN22","On Grid Inverter 110kW",352000),("IN23","On Grid Inverter 125kW",400000)]},
    {"name": "Hybrid Inverter", "uom": "Nos", "moq": 1, "hsn": "85044090", "gst": 12,
     "desc": "Hybrid Solar Inverter with battery backup support and dual-mode operation",
     "features": ["Battery Backup Support", "Grid-Tie & Off-Grid Modes", "Smart Energy Management", "App Monitoring"],
     "apps": ["Residential Battery Systems", "Commercial Hybrid", "Energy Storage", "Backup Power"],
     "items": [("HI01","Hybrid Inverter 3kW",25000),("HI02","Hybrid Inverter 5kW",42000),("HI03","Hybrid Inverter 8kW",67000),("HI04","Hybrid Inverter 10kW",84000),("HI05","Hybrid Inverter 12kW",100000),("HI06","Hybrid Inverter 15kW",125000),("HI07","Hybrid Inverter 20kW",167000)]},
    {"name": "Off Grid Inverter", "uom": "Nos", "moq": 1, "hsn": "85044090", "gst": 12,
     "desc": "Off-Grid Solar Inverter for standalone power systems without grid connectivity",
     "features": ["Pure Sine Wave Output", "Built-in Battery Charger", "Overload Protection", "LCD Display"],
     "apps": ["Remote Locations", "Off-Grid Homes", "Telecom Towers", "Agriculture"],
     "items": [("OG01","Off Grid Inverter 1kW",8000),("OG02","Off Grid Inverter 2kW",16000),("OG03","Off Grid Inverter 3kW",24000),("OG04","Off Grid Inverter 5kW",40000),("OG05","Off Grid Inverter 7.5kW",60000),("OG06","Off Grid Inverter 10kW",80000)]},
    {"name": "Micro Inverter", "uom": "Nos", "moq": 1, "hsn": "85044090", "gst": 12,
     "desc": "Micro Inverter for module-level power conversion and panel optimization",
     "features": ["Module-Level MPPT", "Panel Monitoring", "No Single Point of Failure", "Easy Scalability"],
     "apps": ["Residential Rooftop", "Shaded Installations", "Complex Roof Layouts", "Small Commercial"],
     "items": [("MI01","Micro Inverter 0.5kW",5500),("MI02","Micro Inverter 1kW",9500),("MI03","Micro Inverter 1.5kW",13500),("MI04","Micro Inverter 2kW",17000)]},
    {"name": "Battery", "uom": "Nos", "moq": 1, "hsn": "85076000", "gst": 18,
     "desc": "LiFePO4 Lithium Battery with high cycle life and built-in BMS for solar storage",
     "features": ["LiFePO4 Chemistry", "Built-in Smart BMS", "6000+ Cycle Life", "10-Year Warranty"],
     "apps": ["Solar Energy Storage", "Backup Power", "Peak Shaving", "EV Charging"],
     "items": [("BT01","Lithium Battery 5kWh",55000),("BT02","Lithium Battery 10kWh",105000),("BT03","Lithium Battery 15kWh",150000),("BT04","Lithium Battery 20kWh",195000),("BT05","Lithium Battery 25kWh",240000),("BT06","Lithium Battery 30kWh",280000)]},
    {"name": "Wire & Cable", "uom": "Meter", "moq": 100, "hsn": "85444999", "gst": 18,
     "desc": "UV-resistant DC solar cable with double insulation for PV system wiring",
     "features": ["UV Resistant", "Double Insulation", "Tinned Copper Conductor", "1000V DC Rating"],
     "apps": ["Solar PV Wiring", "String Connections", "Inverter Connections", "Battery Wiring"],
     "items": [("WC01","DC Cable 2.5 Sqmm",15),("WC02","DC Cable 4 Sqmm",22),("WC03","DC Cable 6 Sqmm",32),("WC04","DC Cable 10 Sqmm",48),("WC05","DC Cable 16 Sqmm",65),("WC06","DC Cable 25 Sqmm",85)]},
    {"name": "Connector", "uom": "Nos", "moq": 50, "hsn": "85369090", "gst": 18,
     "desc": "High-quality solar connectors for secure and weatherproof PV connections",
     "features": ["IP67 Waterproof", "1000V DC Rating", "Quick-Lock Mechanism", "UV Resistant"],
     "apps": ["Panel Connections", "String Wiring", "Combiner Box", "Extension Cables"],
     "items": [("CN01","MC4 Pair Connector",35),("CN02","MC4 Y Connector",85),("CN03","MC4 T Connector",120),("CN04","DC Lug Connector",25),("CN05","AC Lug Connector",30)]},
    {"name": "Distribution Box", "uom": "Nos", "moq": 1, "hsn": "85371000", "gst": 18,
     "desc": "Solar distribution box with SPD protection for AC/DC power distribution",
     "features": ["SPD Protection", "IP65 Enclosure", "DIN Rail Mounting", "Flame Retardant"],
     "apps": ["ACDB Applications", "DCDB Applications", "Combiner Box", "Metering Panel"],
     "items": [("DB01","ACDB Single Phase 25A",880),("DB02","ACDB Single Phase 32A",1050),("DB03","ACDB Single Phase 40A",1250),("DB04","ACDB Three Phase 32A",2100),("DB05","ACDB Three Phase 40A",2700),("DB06","ACDB Three Phase 63A",3500),("DB07","DCDB 1-3kW",950),("DB08","DCDB 3-6kW",1400),("DB09","DCDB 6-10kW",2200),("DB10","DCDB 10-15kW",3800)]},
    {"name": "Earthing", "uom": "Nos", "moq": 1, "hsn": "73269099", "gst": 18,
     "desc": "Copper bonded earthing system for solar installation grounding and protection",
     "features": ["Copper Bonded Steel", "High Conductivity", "Corrosion Resistant", "IS Standard"],
     "apps": ["Solar Plant Earthing", "Inverter Grounding", "Structure Earthing", "Lightning Protection"],
     "items": [("EL01","Earthing Rod 1m",350),("EL02","Earthing Rod 2m",650),("EL03","Earthing Rod 3m",950),("EL04","Earthing Pit Cover",280),("EL05","Earthing Chemical Compound",450)]},
    {"name": "Lightning", "uom": "Nos", "moq": 1, "hsn": "85351000", "gst": 18,
     "desc": "Lightning protection system for solar installations against surge damage",
     "features": ["ESE Technology", "Wide Protection Radius", "IEC 62305 Compliant", "Low Impedance"],
     "apps": ["Solar Farm Protection", "Rooftop Systems", "Commercial Buildings", "Open Ground"],
     "items": [("LT01","Lightning Arrester ESE",18500),("LT02","Lightning Arrester Conventional",8500),("LT03","Lightning Strike Counter",4500),("LT04","Lightning Copper Strip 25x3mm",350),("LT05","Lightning Protection Kit",22000)]},
    {"name": "Structure", "uom": "Nos", "moq": 1, "hsn": "73089099", "gst": 18,
     "desc": "Module mounting structure for solar panel installation on various surfaces",
     "features": ["Hot-Dip Galvanized", "Wind Load Rated", "Adjustable Tilt", "Easy Assembly"],
     "apps": ["Rooftop Mounting", "Ground Mounting", "Elevated Structures", "Carport Systems"],
     "items": [("ST01","GI Channel 41x41",520),("ST02","Aluminium Rail 100mm",180),("ST03","C Channel 80x40",650),("ST04","Unistrut Channel",480),("ST05","Mid Clamp Set",35),("ST06","End Clamp Set",40)]},
    {"name": "PPE", "uom": "Nos", "moq": 1, "hsn": "65069990", "gst": 18,
     "desc": "Personal protective equipment for solar installation safety compliance",
     "features": ["ISI Certified", "Ergonomic Design", "High Visibility", "Durable Construction"],
     "apps": ["Rooftop Installation", "Ground Mount Work", "Electrical Work", "Height Work"],
     "items": [("PP01","Safety Helmet ISI",350),("PP02","Safety Gloves Electrical",280),("PP03","Safety Shoes Steel Toe",1200),("PP04","Safety Jacket Reflective",450),("PP05","Safety Harness Full Body",2500),("PP06","Safety Glasses UV",180)]},
    {"name": "Meter", "uom": "Nos", "moq": 1, "hsn": "90289090", "gst": 18,
     "desc": "Energy meter for solar power monitoring and net metering applications",
     "features": ["High Accuracy Class", "LCD Display", "RS485 Communication", "DIN Rail Mount"],
     "apps": ["Net Metering", "Energy Monitoring", "Solar Generation Tracking", "Billing"],
     "items": [("MT01","Energy Meter 1-Phase",2200),("MT02","Energy Meter 3-Phase",3800),("MT03","Net Meter Bi-Directional",4500),("MT04","Smart Meter WiFi",6500),("MT05","CT Meter 3-Phase 100A",8500)]},
]

def generate_products():
    products = []
    for cat in SEED_CATEGORIES:
        img = CATEGORY_IMAGES.get(cat["name"], "")
        for code, name, price in cat["items"]:
            products.append({
                "id": str(uuid.uuid4()), "item_code": code, "name": name,
                "category": cat["name"],
                "description": f"{name} - {cat['desc']}. Suitable for residential, commercial, and industrial solar installations.",
                "price": price, "uom": cat["uom"], "moq": cat["moq"],
                "stock": random.randint(5, 200),
                "in_stock": random.random() > 0.15,
                "image_url": img, "features": cat["features"],
                "specs": {}, "applications": cat["apps"],
                "hsn_code": cat.get("hsn", ""), "gst_rate": cat.get("gst", 18),
                "created_at": datetime.now(timezone.utc).isoformat()
            })
    return products

# ─── STARTUP ───
async def seed_admin():
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@energicasolutions.com")
    admin_password = os.environ.get("ADMIN_PASSWORD", "admin123")
    existing = await db.users.find_one({"email": admin_email})
    if not existing:
        await db.users.insert_one({
            "email": admin_email, "password_hash": hash_password(admin_password),
            "name": "Admin", "role": "admin",
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        logger.info(f"Admin seeded: {admin_email}")
    elif not verify_password(admin_password, existing["password_hash"]):
        await db.users.update_one({"email": admin_email}, {"$set": {"password_hash": hash_password(admin_password)}})

async def seed_products():
    count = await db.products.count_documents({})
    if count == 0:
        products = generate_products()
        if products:
            await db.products.insert_many(products)
            logger.info(f"Seeded {len(products)} products")

@app.on_event("startup")
async def startup():
    await db.users.create_index("email", unique=True)
    await db.products.create_index("category")
    await db.products.create_index([("name", 1)])
    await seed_admin()
    await seed_products()
    os.makedirs("/app/memory", exist_ok=True)
    ae = os.environ.get("ADMIN_EMAIL", "admin@energicasolutions.com")
    ap = os.environ.get("ADMIN_PASSWORD", "admin123")
    with open("/app/memory/test_credentials.md", "w") as f:
        f.write(f"# Test Credentials\n\n## Admin\n- Email: {ae}\n- Password: {ap}\n- Role: admin\n\n## Auth Endpoints\n- POST /api/auth/login\n- GET /api/auth/me\n\n## Product Endpoints\n- GET /api/products\n- GET /api/products/:id\n- POST /api/products (admin)\n- PUT /api/products/:id (admin)\n- DELETE /api/products/:id (admin)\n\n## RFQ Endpoints\n- POST /api/rfq\n- GET /api/rfq (admin)\n")

# ─── AUTH ENDPOINTS ───
@api_router.post("/auth/login")
async def login(req: LoginRequest):
    user = await db.users.find_one({"email": req.email.lower().strip()}, {"_id": 1, "email": 1, "name": 1, "role": 1, "password_hash": 1})
    if not user or not verify_password(req.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    uid = str(user["_id"])
    token = create_token(uid, user["email"], user["role"])
    return {"token": token, "user": {"id": uid, "email": user["email"], "name": user["name"], "role": user["role"]}}

@api_router.get("/auth/me")
async def get_me(admin=Depends(get_current_admin)):
    return {"id": admin["sub"], "email": admin["email"], "role": admin["role"]}

# ─── PRODUCT ENDPOINTS ───
@api_router.get("/products")
async def list_products(category: str = None, search: str = None, sort: str = None, page: int = 1, limit: int = 20, in_stock: str = None):
    query = {}
    if category:
        query["category"] = category
    if search:
        query["name"] = {"$regex": search, "$options": "i"}
    if in_stock == "true":
        query["in_stock"] = True
    elif in_stock == "false":
        query["in_stock"] = False

    sort_field = [("created_at", -1)]
    if sort == "price_asc": sort_field = [("price", 1)]
    elif sort == "price_desc": sort_field = [("price", -1)]
    elif sort == "name_asc": sort_field = [("name", 1)]
    elif sort == "name_desc": sort_field = [("name", -1)]

    total = await db.products.count_documents(query)
    skip = (page - 1) * limit
    products = await db.products.find(query, {"_id": 0}).sort(sort_field).skip(skip).limit(limit).to_list(limit)
    return {"products": products, "total": total, "page": page, "limit": limit, "total_pages": max(1, (total + limit - 1) // limit)}

@api_router.get("/products/{product_id}")
async def get_product(product_id: str):
    product = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    similar = await db.products.find({"category": product["category"], "id": {"$ne": product_id}}, {"_id": 0}).limit(4).to_list(4)
    product["similar_products"] = similar
    return product

@api_router.post("/products")
async def create_product(product: ProductCreate, admin=Depends(get_current_admin)):
    doc = product.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    if not doc["image_url"]:
        doc["image_url"] = CATEGORY_IMAGES.get(doc["category"], "")
    await db.products.insert_one(doc)
    created = await db.products.find_one({"id": doc["id"]}, {"_id": 0})
    return created

@api_router.put("/products/{product_id}")
async def update_product(product_id: str, update: ProductUpdate, admin=Depends(get_current_admin)):
    update_data = {k: v for k, v in update.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    result = await db.products.update_one({"id": product_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return await db.products.find_one({"id": product_id}, {"_id": 0})

@api_router.delete("/products/{product_id}")
async def delete_product(product_id: str, admin=Depends(get_current_admin)):
    result = await db.products.delete_one({"id": product_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Product deleted"}

# ─── CATEGORIES ───
@api_router.get("/categories")
async def list_categories():
    pipeline = [{"$group": {"_id": "$category", "count": {"$sum": 1}}}, {"$sort": {"_id": 1}}]
    results = await db.products.aggregate(pipeline).to_list(50)
    return [{"name": r["_id"], "count": r["count"]} for r in results]

# ─── RFQ ENDPOINTS ───
@api_router.post("/rfq")
async def create_rfq(rfq: RFQCreate):
    doc = rfq.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["status"] = "pending"
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    doc["total_amount"] = sum(item.get("price", 0) * item.get("quantity", 1) for item in doc["items"])
    await db.rfqs.insert_one(doc)
    return await db.rfqs.find_one({"id": doc["id"]}, {"_id": 0})

@api_router.get("/rfq")
async def list_rfqs(admin=Depends(get_current_admin), page: int = 1, limit: int = 50):
    total = await db.rfqs.count_documents({})
    skip = (page - 1) * limit
    rfqs = await db.rfqs.find({}, {"_id": 0}).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    return {"rfqs": rfqs, "total": total, "page": page}

@api_router.put("/rfq/{rfq_id}/status")
async def update_rfq_status(rfq_id: str, status: str, admin=Depends(get_current_admin)):
    result = await db.rfqs.update_one({"id": rfq_id}, {"$set": {"status": status}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="RFQ not found")
    return {"message": "Status updated"}

# ─── INCLUDE ROUTER & MIDDLEWARE ───
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown():
    client.close()
