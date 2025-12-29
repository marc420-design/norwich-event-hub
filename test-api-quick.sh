#!/bin/bash
echo "🧪 Testing Norwich Event Hub API..."
echo ""
echo "1️⃣ Testing GET (retrieve events)..."
RESPONSE=$(curl -s "https://script.google.com/macros/s/AKfycbwf5RT8xXX03sYEsSf5w8mAe_34-cAjJuAYkoxQtNoImFOTtfMgbDxFDc-aQuiCUIbJ/exec?action=getEvents")

if echo "$RESPONSE" | grep -q "success.*true"; then
    echo "   ✅ API is working!"
    echo "   Response: $RESPONSE" | head -c 200
    echo "..."
else
    echo "   ❌ API Error!"
    echo "   $RESPONSE" | head -c 500
    exit 1
fi

echo ""
echo "2️⃣ Testing POST (submit event)..."
curl -s -X POST "https://script.google.com/macros/s/AKfycbwf5RT8xXX03sYEsSf5w8mAe_34-cAjJuAYkoxQtNoImFOTtfMgbDxFDc-aQuiCUIbJ/exec" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Event",
    "date": "2026-01-15",
    "time": "19:00",
    "location": "Test Venue Norwich",
    "category": "community",
    "description": "API Test - You can delete this from Google Sheets",
    "ticketLink": "",
    "promoterName": "API Test",
    "promoterEmail": "test@norwicheventshub.com",
    "promoterPhone": ""
  }' | head -c 300

echo ""
echo ""
echo "✅ If both tests passed, your API is fully working!"
