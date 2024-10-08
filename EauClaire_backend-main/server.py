import sys
import requests
import os
from flask import Flask, jsonify, request,send_file
from flask_cors import CORS
from pymongo import MongoClient
from bson.objectid import ObjectId
from unidecode import unidecode
import logging
import re
from unidecode import unidecode
import pandas as pd


sys.path.append(os.path.join(os.path.dirname(__file__), 'utils'))
from dbUtils import DbUtils


app = Flask(__name__)
CORS(app)

logging.basicConfig(level=logging.DEBUG)
app.logger.setLevel(logging.DEBUG)

DB_PROJET = "WaterProject"
COLLECTION_NIV = "NiveauEau_FR"
COLLECTION_QUALI = "WaterData"
COLLECTION_CONSO = "Consommation_FR"
COLLECTION_BIODIV = "Biodiversite_FR"
COLLECTION_COORDS = "regions_departments"
COLLECTION_ALERTS = "AlertSubscriptions"  # New collection for alert subscriptions
COLLECTION_MAINTENANCE ="Maintenance"
COLLECTION_QUALIREGIONS ="WaterData_test_2"


dbu = DbUtils(DB_PROJET, COLLECTION_NIV)
dbu2 = DbUtils(DB_PROJET, COLLECTION_QUALI)
dbu3 = DbUtils(DB_PROJET, COLLECTION_CONSO)
dbu4 = DbUtils(DB_PROJET, COLLECTION_BIODIV)
dbu_coords = DbUtils(DB_PROJET, COLLECTION_COORDS)
dbu_alerts = DbUtils(DB_PROJET, COLLECTION_ALERTS)  # Collection for alerts
dbu_maintenance = DbUtils(DB_PROJET, COLLECTION_MAINTENANCE) 
dbu_qualiregions = DbUtils(DB_PROJET, COLLECTION_QUALIREGIONS) 


@app.route('/api/qualite-reg-test', methods=['GET'])
def get_quality_by_region():
    region = request.args.get('region')
    year = request.args.get('year')
    colle = dbu_qualiregions.db_connexion()  # Use the method to get the collection

    # Recherche du statut de maintenance
    collection = colle  # This is your collection object

    print(f"Requested region: {region}, year: {year}")

    # Create query dictionary
    query = {}
    if region:
        query["Regions"] = region
    if year:
        try:
            year = int(year)  # Ensure year is an integer
            query["DateAnalyse"] = year
        except ValueError:
            return jsonify({"error": "Invalid year format"}), 400

    if not query:
        return jsonify({"error": "Region or year not provided"}), 400

    try:
        # Ensure collection is properly referenced
        documents = list(collection.find(query))

        # Manually convert ObjectId to string
        for doc in documents:
            if '_id' in doc and isinstance(doc['_id'], ObjectId):
                doc['_id'] = str(doc['_id'])

        print(f"Documents found: {documents}")

        if not documents:
            return jsonify({"error": "No data found for the specified region and/or year"}), 404

        return jsonify(documents), 200

    except Exception as e:
        # Log any exceptions for debugging
        print(f"An error occurred: {e}")
        return jsonify({"error": "An error occurred while processing your request"}), 500


@app.route('/api/maintenance-status', methods=['GET'])
def get_maintenance_status():
    try:
        collection = dbu_maintenance.db_connexion()

        # Recherche du statut de maintenance
        maintenance_doc = collection.find_one()
        
        if maintenance_doc:
            status = maintenance_doc.get('status', 'unknown')
            if status in ['a jour', 'en maintenance']:
                return jsonify({"status": status}), 200
            else:
                return jsonify({"error": "Invalid status value"}), 400
        else:
            return jsonify({"error": "Maintenance collection is empty"}), 404

    except Exception as e:
        app.logger.error(f"Error in get_maintenance_status: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/subscribe', methods=['POST'])
def subscribe():
    try:
        data = request.json
        email = data.get('email')
        region = data.get('region')
        
        # Basic validation
        if not email or not region:
            return jsonify({"error": "Email and region are required"}), 400

        # Connect to MongoDB and select the AlertSubscriptions collection
        collection = dbu_alerts.db_connexion()

        # Insert the new subscription
        result = collection.insert_one({
            "email": email,
            "region": region
        })

        return jsonify({"message": "Subscription successful", "id": str(result.inserted_id)}), 201

    except Exception as e:
        app.logger.error(f"Error occurred: {e}")
        return jsonify({"error": "Internal server error"}), 500

@app.route('/api/trigger-alert', methods=['POST'])
def trigger_alert():
    data = request.get_json()
    region = data.get('region')

    if not region:
        return jsonify({"message": "Region is required"}), 400

    try:
        collection = dbu_alerts.db_connexion()
        # Obtenir les souscripteurs pour la région
        subscribers = collection.find({"region": region})
        email_list = [sub['email'] for sub in subscribers]

        if email_list:
            # Si des souscripteurs existent, envoyer une alerte avec les mentions
            send_discord_alert(region, email_list)
            return jsonify({"message": f"Alert triggered for {region}"}), 200
        else:
            # Sinon, envoyer un message général sans mentionner d'e-mail
            send_discord_alert(region, [])
            return jsonify({"message": f"No subscribers found for {region}. Alert triggered with general message."}), 200

    except Exception as e:
        app.logger.error(f"Error in trigger_alert: {e}")
        return jsonify({"error": str(e)}), 500




# Helper function to send a Discord alert
def send_discord_alert(region, email_list):
    webhook_url = 'https://discord.com/api/webhooks/1283398078992351273/yiERcUcVdhGuducDGityrgLAeAs_J9SPV4mWKA7EUgsQLusrysfHD91-Uy5GcwZfS0Tn'
    role_id = 'ROLE_ID'  # Remplace par l'ID du rôle à mentionner, si nécessaire

    if email_list:
        # Envoie un message pour chaque e-mail
        for email in email_list:
            message = (
                f"**Alert: Surconsommation d'Eau en  {region}.**\n"
                f"Please take necessary precautions.\n"
                f"Notification sent to {email}.\n"
            )

            payload = {
                "content": message
            }
            
            try:
                response = requests.post(webhook_url, json=payload)
                response.raise_for_status()  # Raise an HTTPError for bad responses
                print(f"Discord alert sent successfully for {email}.")
            except requests.exceptions.RequestException as e:
                logging.error(f"Failed to send Discord alert for {email}: {e}")
                raise
    else:
        # Si la liste des e-mails est vide, envoie un message général sans mentionner d'e-mail
        message = (
            f"**Alert: Surconsommation d'Eau en {region}.**\n"
            f"No subscribers found for this region. Please take necessary precautions."
        )

        payload = {
            "content": message
        }

        try:
            response = requests.post(webhook_url, json=payload)
            response.raise_for_status()  # Raise an HTTPError for bad responses
            print("Discord alert sent successfully without specific mentions.")
        except requests.exceptions.RequestException as e:
            logging.error(f"Failed to send Discord alert: {e}")
            raise



@app.route('/api/niveau', methods=['GET'])
def get_niveau():
    year = request.args.get('year')
    region = request.args.get('region')
    collection = dbu.db_connexion()
    
    query = {}
    
    if year:
        # Extraire l'année de la chaîne de caractères
        year_int = int(year)
        query["AnneeAnalyse (Saison)"] = re.compile(f"^{year_int}")
        
    if region:
        # Utiliser la région telle quelle dans la requête
        query["Region"] = region
    
    documents = collection.find(query)
    data = list(documents)
    for item in data:
        item['_id'] = str(item['_id'])
        # Ne pas normaliser la région dans les documents pour comparaison
        item_region = item.get("Region", "")
        item["Region"] = item_region
    
    return jsonify(data)

@app.route('/api/qualite-dep', methods=['GET'])
def get_qualite_dep():
    year = request.args.get('year')
    department = request.args.get('department')

    try:
        # Convertir year en entier pour la comparaison
        year_int = int(year) if year else None

        # Connexion à la collection waterdata
        collection = dbu2.db_connexion()

        # Création de la requête
        query = {}
        if year_int:
            query["DateAnalyse"] = year_int
        if department:
            query["Departements"] = department

        # Exécution de la requête
        documents = collection.find(query).sort("CodePostale", 1)
        data = list(documents)

        # Conversion de l'_id pour le format JSON
        for item in data:
            item['_id'] = str(item['_id'])

        # Retour des données sous forme JSON
        return jsonify(data)

    except Exception as e:
        return jsonify({"error": str(e)}), 500



@app.route('/api/qualite-reg', methods=['GET'])
def get_qualite_reg():
    year = request.args.get('year')
    region = request.args.get('region')

    try:
        # Convertir l'année en entier si elle est fournie
        year_int = int(year) if year else None

        # Connexion à la collection
        collection = dbu2.db_connexion()

        # Créer la requête
        query = {}
        if year_int:
            query["DateAnalyse"] = year_int
        if region:
            query["Regions"] = region

        # Exécuter la requête
        documents = collection.find(query)
        data = list(documents)

        # Convertir les ObjectId en chaîne de caractères
        for item in data:
            item['_id'] = str(item['_id'])

        # Retourner les données au format JSON
        return jsonify(data)

    except Exception as e:
        return jsonify({"error": str(e)}), 500



# GET la consommation de l'eau
@app.route('/api/consommation', methods=['GET'])
def get_conso():
    year = request.args.get('year')
    region = request.args.get('region')
    collection = dbu3.db_connexion()
    
    query = {}
    if year:
        query["Année"] = int(year)
    if region:
        query["Région"] = region
    
    documents = collection.find(query)
    data = list(documents)
    for item in data:
        item['_id'] = str(item['_id'])
    return jsonify(data)

@app.route('/api/biodiversite', methods=['GET'])
def get_biodiv():
    year = request.args.get('year')
    department = request.args.get('department')
    region = request.args.get('region')
    collection = dbu4.db_connexion()

    # Initialiser une requête vide
    query = {}

    # Ajouter les filtres si disponibles
    if year:
        try:
            query["Date (annee)"] = int(year)  # Utiliser le bon nom de champ
        except ValueError:
            return jsonify({"error": "Invalid year format"}), 400
    
    if department:
        query["Departement"] = department

    if region:
        query["Region"] = region

    # Rechercher les documents correspondant à la requête
    documents = collection.find(query)
    data = list(documents)

    # Vérifier si des résultats existent
    if not data:
        return jsonify({"message": "No data found for the given parameters"}), 404

    # Convertir l'ObjectId en chaîne de caractères
    for item in data:
        item['_id'] = str(item['_id'])

    return jsonify(data), 200

@app.route('/api/coords', methods=['GET'])
def get_coords():
    coord_type = request.args.get('type')


    collection = dbu_coords.db_connexion()

    if coord_type == 'regions':
        documents = collection.find({'Region_Lat': {'$exists': True}})
    else:  # 'departements'
        documents = collection.find({'Department_Lat': {'$exists': True}})

    data = list(documents)
    for item in data:
        item['_id'] = str(item['_id'])

    return jsonify(data)
@app.route('/api/download-data', methods=['GET'])
def download_data():
    year = request.args.get('year')
    region = request.args.get('region')
    collection_conso = dbu3.db_connexion()
    collection_niveau = dbu.db_connexion()

    # Récupérer les données de consommation
    query_conso = {}
    if year:
        query_conso["Année"] = int(year)
    
    if region:
        query_conso["Région"] = region
    
    documents_conso = collection_conso.find(query_conso)
    data_conso = []
    for item in documents_conso:
        filtered_item = {
            "Région": item.get("Région"),
            "NomFleuve": "",  # Placeholder, à remplir avec les données de niveau
            "NiveauEau": item.get("NiveauEau"),
            "RisqueSecheresse (sur 10)": item.get("RisqueSecheresse (sur 10)"),
            "RisqueInondation (sur 10)": item.get("RisqueInondation (sur 10)"),
            "Population (millions)": item.get("Population (millions)"),
            "Consommation Estimée (L/jour/habitant)": item.get("Consommation Estimée (L/jour/habitant)"),
            "Surconsommation (Oui/Non)": item.get("Surconsommation (Oui/Non)"),
            "Année": item.get("Année")
        }
        data_conso.append(filtered_item)

    # Récupérer les données de niveau
    query_niveau = {}
    if year:
        year_int = int(year)
        query_niveau["AnneeAnalyse (Saison)"] = re.compile(f"^{year_int}")
    if region:
        query_niveau["Region"] = region
    
    documents_niveau = collection_niveau.find(query_niveau)
    data_niveau = []
    for item in documents_niveau:
        filtered_item = {
            "Région": item.get("Region"),
            "NomFleuve": item.get("NomFleuve"),
            "NiveauEau": item.get("NiveauEau"),
            "RisqueSecheresse (sur 10)": item.get("RisqueSecheresse (sur 10)"),
            "RisqueInondation (sur 10)": item.get("RisqueInondation (sur 10)"),
            "Population (millions)": "",  # Placeholder, car les données viennent de la consommation
            "Consommation Estimée (L/jour/habitant)": "",  # Placeholder
            "Surconsommation (Oui/Non)": "",  # Placeholder
            "Année": year_int if year else None  # Ajouter l'année si elle est fournie
        }
        data_niveau.append(filtered_item)

    # Fusionner les données tout en éliminant les doublons
    combined_data = []
    seen_keys = set()  # Ensemble pour garder trace des clés uniques
    
    for conso_item in data_conso:
        for niveau_item in data_niveau:
            if conso_item["Région"] == niveau_item["Région"]:
                # Créer une clé unique
                key = (conso_item["Région"], niveau_item["NomFleuve"], conso_item["Année"])
                
                # Vérifie si la clé existe déjà
                if key not in seen_keys:
                    combined_data.append({
                        "Région": conso_item["Région"],
                        "NomFleuve": niveau_item["NomFleuve"],
                        "NiveauEau": niveau_item["NiveauEau"],
                        "RisqueSecheresse (sur 10)": niveau_item["RisqueSecheresse (sur 10)"],
                        "RisqueInondation (sur 10)": niveau_item["RisqueInondation (sur 10)"],
                        "Population (millions)": conso_item["Population (millions)"],
                        "Consommation Estimée (L/jour/habitant)": conso_item["Consommation Estimée (L/jour/habitant)"],
                        "Surconsommation (Oui/Non)": conso_item["Surconsommation (Oui/Non)"],
                        "Année": conso_item["Année"]
                    })
                    seen_keys.add(key)  # Ajoute la clé à l'ensemble

    df = pd.DataFrame(combined_data)

    # Spécifier l'encodage pour le CSV
    csv_file_path = 'combined_data.csv'
    df.to_csv(csv_file_path, index=False, encoding='utf-8-sig')

    return send_file(csv_file_path, as_attachment=True)

# Définir le gestionnaire d'erreurs 404
@app.errorhandler(404)
def page_not_found(e):
    return jsonify({"error": "Page not found"}), 404

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3030)
    app.debug = True
