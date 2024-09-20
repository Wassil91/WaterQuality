# 📦 EauClaire_backend

Ce projet contient la partie backend de notre application web **EauClaire**. Il est conçu pour gérer la logique de l'application, la communication avec la base de données, et le traitement des données.

## 📝 Description

Le backend d'EauClaire est construit avec **Flask**, une micro-framework Python, et est responsable des tâches suivantes :

- **Connexion et communication avec la base de données :**
  - Intégration avec **MongoDB** pour le stockage et la récupération des données.

- **Traitement et transformation des données :**
  - Manipulation des données pour les adapter aux besoins de l'application.
  - Mise en place d'API RESTful pour permettre la communication avec le frontend.

- **Modèles de Machine Learning :**
  - Implémentation de modèles de machine learning pour les prédictions et l'analyse des données.
  - Utilisation de **scikit-learn** pour le traitement des données et l'entraînement des modèles.

## 🌐 Fonctionnalités

- API RESTful pour la gestion des utilisateurs, des données, et des résultats d'analyses.
- Système de gestion des erreurs et des logs pour un suivi détaillé des actions du backend.
- Sécurisation des endpoints avec des mécanismes d'authentification et d'autorisation.

## 🛠 Prérequis

Pour exécuter ce projet, vous devez avoir installé :

- **Python** (version 3.6 ou supérieure)
- **Flask** pour le développement de l'API
- **MongoDB** pour la base de données
- **Gunicorn** pour servir l'application

## 📦 Dépendances

Voici les principales dépendances requises pour le backend :

```bash
Flask
Flask-PyMongo
pymongo
scikit-learn
gunicorn
```

## ⚙️ Configuration de MongoDB

Le backend utilise MongoDB comme base de données NoSQL pour stocker et gérer les données de l'application. Suivez les étapes ci-dessous pour installer et configurer MongoDB.

### 1. Installer MongoDB

Pour installer MongoDB sur votre machine locale ou serveur Ubuntu, suivez ces étapes :

#### a. Importer la clé publique GPG de MongoDB

Exécutez cette commande pour importer la clé publique de MongoDB :

```bash
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
```

#### b. Ajouter le dépôt MongoDB

Ajoutez le dépôt officiel de MongoDB à votre fichier de sources apt :

```bash
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
```

#### c. Mettre à jour les paquets

Mettez à jour la liste des paquets disponibles :

```bash
sudo apt update
```

#### d. Installer MongoDB

Installez MongoDB en utilisant la commande suivante :

```bash
sudo apt install -y mongodb-org
```

### 2. Lancer et activer MongoDB

Après avoir installé MongoDB, démarrez le service et assurez-vous qu'il se lance automatiquement au démarrage du système :

```bash
sudo systemctl start mongod
sudo systemctl enable mongod
```

Vous pouvez vérifier que MongoDB fonctionne correctement en utilisant la commande suivante :

```bash
sudo systemctl status mongod
```

### 3. Configurer MongoDB

Par défaut, MongoDB écoute sur le port 27017. Vous pouvez configurer MongoDB selon vos besoins en modifiant le fichier de configuration situé à /etc/mongod.conf. Par exemple, si vous souhaitez permettre les connexions à distance, vous pouvez modifier l'adresse d'écoute (bindIp).

#### a. Ouvrir le fichier de configuration

```bash
sudo nano /etc/mongod.conf
```

#### b. Permettre les connexions à distance (facultatif)

Dans le fichier de configuration, trouvez la ligne suivante :

```bash
# network interfaces
net:
  port: 27017
  bindIp: 127.0.0.1
```
Modifiez bindIp pour permettre les connexions externes si nécessaire :

```bash
  bindIp: 0.0.0.0
```
Redémarrez MongoDB après avoir apporté des modifications au fichier de configuration :

```bash
sudo systemctl restart mongod
```
### 4. Créer une base de données pour le projet

Une fois MongoDB installé et démarré, vous pouvez créer une base de données pour votre projet EauClaire :

#### a. Accéder à MongoDB shell
Connectez-vous au shell MongoDB avec :

```bash
mongo
```

#### b. Créer une nouvelle base de données
Créez une base de données appelée eauclaire_db (ou un autre nom selon vos préférences) :

```bash
use eauclaire_db
```

#### c. Créer un utilisateur pour la base de données
Créez un utilisateur avec des permissions sur cette base de données :

```bash
db.createUser({
  user: "eauclaire_user",
  pwd: "votre_mot_de_passe",
  roles: [ { role: "readWrite", db: "eauclaire_db" } ]
})
```

### 5. Intégration de MongoDB avec le Backend

#### Définir les variables d'environnement
Dans le fichier .env du backend, définissez les variables d'environnement pour la connexion à MongoDB. Exemple :

```bash
MONGO_URI=mongodb://eauclaire_user:votre_mot_de_passe@localhost:27017/eauclaire_db
```
Assurez-vous de mettre à jour ces informations avec le bon nom d'utilisateur, mot de passe et nom de base de données.

### 6. Tester la connexion MongoDB

Une fois que tout est configuré, assurez-vous que l'application peut se connecter à la base de données MongoDB. Vous pouvez vérifier cela en démarrant le backend et en exécutant quelques requêtes de base pour interagir avec la base de données.

En suivant ces étapes, MongoDB sera installé, configuré et prêt à être utilisé pour le backend de votre application.

Cette partie couvre tout ce qui concerne l'installation, la configuration et l'intégration de MongoDB dans ton backend. Cela assure que le README offre une explication claire et complète des étapes nécessaires pour configurer la base de données.

### 7. Importation de la base de données depuis un fichier JSON

Pour faciliter l'installation, un backup de toute la base de données est fourni au format JSON. Il vous suffit de lancer un script pour importer toutes les collections et données dans MongoDB. Cela permet de restaurer rapidement l'état initial de la base de données avec toutes les données nécessaires.

#### a. Script d'importation : `import_json.py`

Un script Python appelé `import_json.py` est disponible dans le projet. Ce script importe automatiquement les données JSON dans MongoDB. Voici comment l'utiliser :

#### b. Étapes pour l'importation

**Assurez-vous que MongoDB est en cours d'exécution**  

Avant d'importer les données, assurez-vous que le service MongoDB fonctionne en vérifiant son statut :
```bash
sudo systemctl status mongod
```

Mettre à jour le nom de la base de données et l'URL MongoDB
Avant de lancer le script, assurez-vous de définir correctement le nom de la base de données et l'URL MongoDB dans le fichier de configuration ou dans le script. Vous pouvez également les passer via des variables d'environnement dans le fichier .env.

Exemple d'URL dans le fichier .env :

 ```bash
MONGO_URI=mongodb://eauclaire_user:votre_mot_de_passe@localhost:27017/eauclaire_db
 ```
Exécuter le script import_json.py
Le script import_json.py importe automatiquement toutes les collections JSON dans la base de données MongoDB. Assurez-vous d'être dans le répertoire du projet backend et exécutez la commande suivante :

```bash
python import_json.py
 ```
Cela va automatiquement restaurer toutes les collections et documents de la base de données à partir du fichier JSON fourni.

#### c. Explication du script import_json.py

Le script utilise l'URL MongoDB spécifiée et importe chaque collection du fichier JSON dans la base de données sélectionnée. Si le fichier JSON contient plusieurs collections, elles seront créées dans MongoDB avec les mêmes noms.

En suivant ces instructions, vous pourrez restaurer facilement toute la base de données initiale à partir du fichier JSON fourni. Cela est utile pour une configuration rapide ou la récupération des données après une nouvelle installation.

## 🚀 Lancement Flask

Le backend utilise Flask comme framework web. Voici comment démarrer le serveur.

### 1. Localhost

Lancer le serveur Flask en localhost dans un premier temps :

#### a. Fichier principal : server.py
Le fichier server.py contient le code nécessaire pour lancer l'application Flask. Pour démarrer le serveur localement, assurez-vous que vous êtes dans le bon endroit, puis exécutez :

```bash
python server.py
```
Le serveur sera disponible à l'adresse suivante : http://localhost:5000.

#### b. Tester l'API
Après avoir démarré le serveur Flask, vous pouvez tester les différentes routes API en utilisant curl.

### 2. Déploiement

Pour déployer le backend en production, vous pouvez utiliser un serveur comme Gunicorn associé à un serveur proxy comme Nginx. Assurez-vous d'adapter les variables d'environnement et les configurations pour la production.









