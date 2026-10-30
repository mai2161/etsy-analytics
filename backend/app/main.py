from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List
import re
from collections import Counter

app = FastAPI(title="MarketScope API", version="0.1.0",
              description="Etsy research MVP with clearly labeled illustrative demo data.")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Illustrative demo data only. Replace with authorized Etsy API data later.
KEYWORDS = [
    {"keyword": "digital planner", "listings": 24500, "avg_price": 8.75, "avg_favourites": 412, "interest_index": 78, "competition": "High"},
    {"keyword": "wedding invitations", "listings": 12300, "avg_price": 18.40, "avg_favourites": 286, "interest_index": 71, "competition": "Medium"},
    {"keyword": "cake toppers", "listings": 8200, "avg_price": 12.90, "avg_favourites": 198, "interest_index": 64, "competition": "Medium"},
    {"keyword": "printable wall art", "listings": 31200, "avg_price": 6.50, "avg_favourites": 355, "interest_index": 83, "competition": "High"},
    {"keyword": "personalized mug", "listings": 18700, "avg_price": 21.00, "avg_favourites": 521, "interest_index": 69, "competition": "High"},
    {"keyword": "sugar cake decorations", "listings": 4100, "avg_price": 15.25, "avg_favourites": 174, "interest_index": 58, "competition": "Low"},
]

LISTINGS = [
    {"id": "demo-001", "title": "Minimalist Daily Digital Planner for Goodnotes", "shop": "PaperPixelStudio", "price": 7.99, "favourites": 684, "tags": ["digital planner", "goodnotes planner", "daily planner", "ipad planner", "minimalist planner"]},
    {"id": "demo-002", "title": "Personalized Wedding Invitation Template", "shop": "IvoryAndInk", "price": 16.50, "favourites": 391, "tags": ["wedding invitation", "editable template", "minimal wedding", "printable invite"]},
    {"id": "demo-003", "title": "Custom Sugar Cake Topper Decorations", "shop": "SweetCraftCo", "price": 14.00, "favourites": 245, "tags": ["cake topper", "sugar decorations", "birthday cake", "custom cake decor"]},
    {"id": "demo-004", "title": "Botanical Printable Wall Art Set of 3", "shop": "NorthPrintHouse", "price": 5.75, "favourites": 522, "tags": ["printable wall art", "botanical print", "gallery wall", "instant download"]},
]

class ListingInput(BaseModel):
    title: str = Field(min_length=1, max_length=140)
    tags: List[str] = Field(default_factory=list, max_length=13)
    description: str = ""

@app.get("/api/health")
def health():
    return {"status": "ok", "mode": "demo", "message": "Demo dataset active; no live Etsy connection."}

@app.get("/api/dashboard")
def dashboard():
    return {
        "tracked_listings": 1284,
        "tracked_listings_change": 12.8,
        "average_price": 24.50,
        "average_price_change": 3.2,
        "keywords_tracked": 86,
        "average_favourites": 342,
        "favourites_change": 8.4,
        "trend": [
            {"month": "May", "index": 32}, {"month": "Jun", "index": 42},
            {"month": "Jul", "index": 39}, {"month": "Aug", "index": 55},
            {"month": "Sep", "index": 63}, {"month": "Oct", "index": 78},
        ],
        "top_keywords": KEYWORDS[:5],
        "data_notice": "Illustrative demo data, not Etsy search volume or verified sales."
    }

@app.get("/api/keywords")
def search_keywords(q: str = Query(default="", max_length=80)):
    term = q.strip().lower()
    results = [item for item in KEYWORDS if term in item["keyword"].lower()] if term else KEYWORDS
    return {"query": q, "results": results, "data_notice": "Illustrative demo data."}

@app.get("/api/listings")
def get_listings():
    return {"results": LISTINGS, "data_notice": "Illustrative demo listings."}

@app.post("/api/listings/analyze")
def analyze_listing(payload: ListingInput):
    title_words = re.findall(r"[a-zA-Z0-9]+", payload.title.lower())
    normalized_tags = [t.strip().lower() for t in payload.tags if t.strip()]
    duplicate_tags = sorted({t for t in normalized_tags if normalized_tags.count(t) > 1})
    title_set = set(title_words)
    tag_overlap = [tag for tag in normalized_tags if any(word in title_set for word in tag.split())]
    missing = [tag for tag in normalized_tags if tag not in tag_overlap]
    title_length = len(payload.title)
    score = 100
    if title_length < 40: score -= 15
    if title_length > 130: score -= 10
    if not normalized_tags: score -= 25
    if duplicate_tags: score -= 15
    if len(normalized_tags) < 5: score -= 10
    score = max(0, min(100, score))
    suggestions = []
    if title_length < 40: suggestions.append("Consider adding a few specific descriptive terms to your title.")
    if title_length > 130: suggestions.append("Shorten the title so the main product phrase is easier to scan.")
    if len(normalized_tags) < 13: suggestions.append("Review whether additional relevant, non-duplicate tags could describe the item.")
    if duplicate_tags: suggestions.append("Remove duplicate tags.")
    if not suggestions: suggestions.append("Your title and tag structure look reasonable. Validate keyword relevance with real customer research.")
    return {
        "score": score,
        "title_length": title_length,
        "tag_count": len(normalized_tags),
        "duplicate_tags": duplicate_tags,
        "tags_overlapping_title": tag_overlap,
        "tags_to_review": missing,
        "suggestions": suggestions,
        "notice": "This is a heuristic checklist, not an Etsy ranking prediction."
    }
