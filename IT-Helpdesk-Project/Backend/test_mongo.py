from pymongo import MongoClient

uri = "mongodb+srv://admin:1357913579a@cluster0.ysn2tf6.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"

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