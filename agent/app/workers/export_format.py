from urllib.parse import quote


def format_price(data: dict) -> str:
    if data.get("is_free"):
        return "Free"
    pmin = data.get("price_min")
    pmax = data.get("price_max")
    if pmin is not None and pmax is not None and pmin != pmax:
        return f"£{pmin:.0f}-£{pmax:.0f}"
    if pmin is not None:
        return f"£{pmin:.0f}"
    return "See website"


def slugify(value: str) -> str:
    slug = "".join(ch.lower() if ch.isalnum() else "-" for ch in (value or "event"))
    slug = "-".join(part for part in slug.split("-") if part)
    return slug or "event"


def safe_first_image(images: list[str] | None) -> str:
    if not images:
        return ""
    for image in images:
        if isinstance(image, str) and image.startswith(("http://", "https://", "assets/")):
            return image
    return ""


def build_fingerprint(title: str, event_date: str, venue_name: str) -> str:
    return f"{title.strip().lower()}|{event_date}|{venue_name.strip().lower()}"


def format_event_for_website(data: dict) -> dict | None:
    title = (data.get("title") or "").strip()
    date = data["start_datetime"][:10] if data.get("start_datetime") else None
    time = data["start_datetime"][11:16] if data.get("start_datetime") and len(data["start_datetime"]) > 10 else None
    end_date = data["end_datetime"][:10] if data.get("end_datetime") else None
    end_time = data["end_datetime"][11:16] if data.get("end_datetime") and len(data["end_datetime"]) > 10 else None
    venue_name = (data.get("venue_name") or "").strip()
    category = (data.get("category") or "general").lower()
    source_url = (data.get("source_url") or "").strip()
    ticket_url = (data.get("ticket_url") or "").strip()
    official_url = ""
    primary_url = ticket_url or official_url or source_url
    image = safe_first_image(data.get("images"))

    if not title or not date:
        return None
    if not primary_url:
        return None
    if not venue_name:
        venue_name = "Venue TBA"

    price = format_price(data)
    has_flyer = bool(image)
    image_status = data.get("image_status") or ("available" if has_flyer else "fallback")
    link_status = data.get("link_status") or ("verified" if primary_url else "missing")
    ticket_status = data.get("ticket_status") or ("verified" if ticket_url else "missing")
    needs_flyer = bool(data.get("needs_flyer", not bool(image)))
    slug = f"{slugify(title)}-{quote(date)}"

    return {
        "id": data["id"],
        "slug": slug,
        "fingerprint": build_fingerprint(title, date, venue_name),
        "name": title,
        "eventname": title,
        "date": date,
        "time": time or "Time TBC",
        "endDate": end_date,
        "endTime": end_time,
        "venue": venue_name,
        "location": venue_name,
        "address": None,
        "category": category,
        "description": data.get("description") or "",
        "ticketLink": ticket_url,
        "officialUrl": official_url,
        "sourceUrl": source_url,
        "primaryUrl": primary_url,
        "price": price,
        "image": image,
        "hasFlyer": has_flyer,
        "imageStatus": image_status,
        "linkStatus": link_status,
        "ticketStatus": ticket_status,
        "needsFlyer": needs_flyer,
        "tags": data.get("tags", []),
        "featured": data.get("featured", False),
        "editorsChoice": data.get("editors_choice", False),
        "isFree": data.get("is_free", False),
        "ageRestriction": data.get("age_restriction"),
        "status": data.get("status"),
        "source": data.get("source_name"),
    }
