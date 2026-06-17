from pymongo import MongoClient

import os

MONGO_URI = os.environ.get("MONGO_URI")

client = MongoClient(MONGO_URI)

client = MongoClient(uri)

db = client["techdesk_ai"]

ticket = {
    "ticket_id": "TKT-0001",
    "query": "Printer not printing",
    "status": "Open"
}

result = db.tickets.insert_one(ticket)

print("Ticket inserted successfully!")
print(result.inserted_id)