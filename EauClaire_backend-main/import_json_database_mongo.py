from pymongo import MongoClient
import json
from bson import json_util
from tqdm import tqdm  # Pour afficher la barre de progression

# Connexion à la base de données MongoDB
client = MongoClient("mongodb+srv://") # votre URL mongo
db = client.TestRestore  # Remplacer 'TestFoot' par le nom de votre base de données

# Charger les données à partir du fichier JSON
with open("Backup_database_WaterProject_DEV_15.09.json", "r") as f:
    data = json.load(f, object_hook=json_util.object_hook)

# Utilisation de tqdm pour suivre l'importation des documents
for collection_name, documents in tqdm(data.items(), desc="Importation des collections"):
    collection = db[collection_name]
    collection.insert_many(documents)

print("Importation terminée.")
