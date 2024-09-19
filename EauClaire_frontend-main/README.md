# 📘 EauClaire_frontend

## 🎥 Aperçu des fonctionnalités 


## 📝 Description

Ce projet représente le front-end de l'application, construit en React.js, interagit avec l'API Flask, monitoré avec Monit qui est relié à GLPI pour la gestion des incidents et automatisé par Cron.

## 🛠 Prérequis

### Node.js (version 14.x ou supérieure), si vous le l'avez pas : 

curl -fsSL https://deb.nodesource.com/setup_14.x | sudo -E bash -
sudo apt-get install -y nodejs

### MongoDB (local ou distant), si vous ne l'avez pas :

wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add - # Importer la clé publique pour le dépôt MongoDB

echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/multiverse amd64 MongoDB-org 6.0 main" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list  # Ajouter le dépôt MongoDB à la liste des sources

sudo apt-get update
sudo apt-get install -y mongodb-org   # Mettre à jour les paquets et installer MongoDB

### IONOS VPS pour le déploiement (payant) :

https://www.ionos.fr/


### Nginx pour servir l'application web, si vous ne l'avez pas :

sudo apt update
sudo apt install -y nginx

### Monit pour un aperçu en temps réel des services et process qui tournent sur le VPS, si vous ne l'avez pas :

sudo apt install -y monit


## 📦 Dépendances

Pour installer les dépendances du projet, exécutez :

npm install

## 🚀 Installation locale

### 1. Cloner le dépôt

Clonez ce dépôt sur votre machine locale :

git clone <URL_DU_REPO>
cd <dossier_du_projet>

### 2. Installer les dépendances

Installez les dépendances Node.js avec :

npm install

### 3. Configurer l'API

Modifiez le fichier src/config.js pour définir l'URL de l'API Flask :

const API_URL = 'http://localhost:5000';

### 4. Lancer l'application

Démarrez le serveur de développement avec :

npm start

L'application sera disponible à http://localhost:3000.


## 💻 Accès au VPS avec Visual Studio Code et SSH

### 1. Installation des extensions nécessaires

Avant de vous connecter à votre VPS depuis Visual Studio Code (VS Code), assurez-vous que les extensions suivantes sont installées :

#### a. Remote - SSH (pour vous connecter à distance)

Ouvrez VS Code.
Accédez à l'onglet Extensions (icône de boîte dans la barre latérale ou Ctrl+Shift+X).
Dans la barre de recherche, tapez "Remote - SSH" et installez l'extension.

#### b. SSH (si ce n'est pas encore installé)

Si vous n'avez pas encore SSH installé sur votre machine locale, installez-le :

Sur Ubuntu/Debian :

sudo apt-get install openssh-client

Sur Windows : Installez OpenSSH via les fonctionnalités facultatives de Windows ou utilisez le terminal intégré à VS Code.

### 2. Connexion au VPS via Remote Explorer

Une fois que les extensions sont installées, vous pouvez configurer une connexion à votre VPS.

#### a. Ouvrir le Remote Explorer

Dans la barre latérale de gauche de VS Code, cliquez sur l'icône Remote Explorer.

#### b. Ajouter une nouvelle connexion SSH

En haut de la fenêtre Remote Explorer, cliquez sur le bouton + pour ajouter une nouvelle connexion SSH.

#### c. Saisir les informations de connexion

Dans la barre de recherche en haut de l'écran, entrez la commande SSH pour vous connecter à votre VPS :

ssh root@87.106.116.246

Remarque : Remplacez root par l'utilisateur que vous utilisez si ce n'est pas "root". Remplacez également l'adresse IP par celle de votre VPS si elle est différente.

#### d. Entrer le mot de passe

Une fois la commande SSH exécutée, VS Code vous demandera votre mot de passe. Entrez-le pour établir la connexion.

### 3. Gestion des informations VPS

En cas d'oubli de certaines informations (comme l'adresse IP ou le mot de passe), vous pouvez retrouver ces informations sur votre compte client IONOS :

Connectez-vous à votre compte client IONOS.
Accédez à la section Serveurs pour afficher tous vos serveurs disponibles.
Sélectionnez le serveur VPS en question pour accéder aux détails comme :
L'adresse IP de votre VPS.
Le nom d'utilisateur pour SSH (généralement root par défaut).
Si nécessaire, réinitialisez ou retrouvez votre mot de passe.

### 4. Sauvegarder la configuration SSH pour la prochaine fois

Pour ne pas avoir à retaper l’adresse IP à chaque fois, vous pouvez ajouter la configuration à votre fichier ~/.ssh/config (ou créer ce fichier s'il n'existe pas encore) :

Host mon-vps
    HostName 87.106.116.246
    User root

Ensuite, vous pourrez vous connecter simplement avec :

ssh mon-vps

Cette section complète le processus de connexion à votre VPS à l'aide de Visual Studio Code et SSH,
vous permettant de travailler directement sur votre serveur distant pour gérer votre application et votre infrastructure.


## 🌐 Déploiement sur VPS (IONOS)

### 1. Construire l'application

Avant de déployer sur le VPS, construisez les fichiers statiques de l'application :

npm run build

Cela créera un dossier build/ contenant les fichiers prêts à être déployés.

### 2. Configurer Nginx

Sur votre VPS, copiez les fichiers du dossier build/ dans le répertoire Nginx :

sudo cp -r build/* /var/www/html/

Modifiez le fichier de configuration de Nginx pour servir l'application front-end :

sudo nano /etc/nginx/sites-available/default

Modifiez ou ajoutez les lignes suivantes :


server {
    listen 80;
    server_name votre-domaine.com;
    root /var/www/html;
    index index.html;
    location / {
        try_files $uri /index.html;
    }
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
    }
}


Redémarrez Nginx :

sudo systemctl restart nginx

### 3. Monitoring avec Monit et GLPI

Tout comme pour le back-end, Monit surveille l'état du serveur Nginx et du front-end. Les incidents sont gérés via l'intégration Monit-GLPI.

Exemple de  exemple de configuration de Monit pour surveiller Nginx, le front-end de l'application et d'autres services pertinents :

Ouvrir le fichier de conf de monit : 

sudo nano /etc/monit/monitrc

Vérifier ou ajouter :

set daemon 60                # Vérifie toutes les 60 secondes

set httpd port 2812          # Port d'accès à l'interface web de Monit
    allow admin:monit       # Authentification


check process nginx with pidfile /run/nginx.pid   # Vérification de Nginx
    start program = "/usr/sbin/service nginx start"
    stop program = "/usr/sbin/service nginx stop"
    if failed host 127.0.0.1 port 80 protocol http
       with timeout 15 seconds then restart


check process frontend with pidfile /var/run/frontend.pid     # Vérification de l'application front-end
    start program = "/path/to/start_frontend_script.sh"
    stop program = "/path/to/stop_frontend_script.sh"
    if not running then restart


check process api_flask with pidfile /var/run/api_flask.pid      # Vérification de l'API Flask
    start program = "/path/to/start_api_flask_script.sh"
    stop program = "/path/to/stop_api_flask_script.sh"
    if failed host 127.0.0.1 port 5000 protocol http
       with timeout 15 seconds then restart


check process mongodb with pidfile /var/run/mongodb.pid       # Vérification de MongoDB
    start program = "/usr/sbin/service mongodb start"
    stop program = "/usr/sbin/service mongodb stop"
    if failed host 127.0.0.1 port 27017 then restart


check system localhost                                   # Vérification de l'utilisation des ressources
    if memory usage > 90% then alert
    if cpu usage > 90% then alert
    
Explications des sections :

set daemon : Définit la fréquence de vérification des services.
set httpd : Configure l'accès à l'interface de Monit avec authentification.
check process : Définit les processus à surveiller (Nginx, front-end, API Flask, MongoDB).
start program / stop program : Indique les commandes pour démarrer et arrêter les services.
if failed : Conditions de redémarrage en cas d'échec de la vérification.
check system : Surveille l'utilisation des ressources système.

Sauvegardez et quittez (CTRL + X ensuite Yes)

Pour tester si la configuration est bonne :

sudo monit -t

Si la configuration est correcte, tu peux redémarrer Monit avec la commande suivante :

sudo systemctl restart monit

Pour vérifier que Monit fonctionne correctement après le redémarrage, utilise :

sudo systemctl status monit

## 🕒 Gestion des tâches planifiées (Cron)

Pour automatiser l'exécution de nos deux scripts Python toutes les 5 minutes et enregistrer les sorties dans un fichier de log, voici comment procéder avec cron.

Avant d'exécuter les scripts Python, il est crucial de s'assurer que certains prérequis sont respectés,
notamment l'accès aux services locaux et la gestion des tokens API et de session dans GLPI.

### 1. Vérification des accès à Monit et GLPI

Avant d'exécuter les scripts Python, il est essentiel de vérifier que :

Monit est bien accessible sur localhost:2812.
GLPI est bien accessible sur localhost:8082 et que l'API est activée.

Commande pour vérifier l'accès à Monit :

curl http://localhost:2812

Cela doit retourner la page de statut de Monit.

Commande pour vérifier l'accès à GLPI :

curl http://localhost:8082/apirest.php/

Cela doit retourner un message confirmant que l'API est disponible.

Vérification de l'activation de l'API dans GLPI :

Dans l'interface de GLPI :

Aller dans Configuration > Général > API.
S'assurer que l'API est bien activée avec :
API Rest activé : Oui.
Activer l'authentification avec un jeton externe : Oui.

### 2. Gestion des tokens pour GLPI

#### a. Vérification et remplacement du jeton d'application (App Token)

Si vous rencontrez une erreur de token en exécutant le script creation_alerte_mail_et_incident_GLPI.py, il faut générer un nouveau jeton d'application.

Rendez-vous dans GLPI sous Configuration > API.
Générez un nouveau App Token.
Remplacez le jeton dans le script creation_alerte_mail_et_incident_GLPI.py à l'endroit indiqué :

app_token = "NOUVEAU_JETON_APP"

#### b. Génération du token de session

Si nécessaire, générez un nouveau Session Token à l'aide d'un script spécifique. Voici un exemple de script pour obtenir un Session Token :

/path/to/get_session_token.py

Cela va générer un nouveau Session Token, que vous devrez insérer dans le script creation_alerte_mail_et_incident_GLPI.py à l'endroit prévu :

session_token = "NOUVEAU_JETON_SESSION"

### 3. Éditer la configuration cron

Sur votre serveur, ouvrez le fichier crontab pour le modifier :

crontab -e

### 4. Ajouter la commande cron

Ajoutez la ligne suivante pour exécuter nos deux scripts Python toutes les 5 minutes et enregistrer la sortie et les erreurs dans un fichier de log :

*/5 * * * * /path/to/data_monit_csv.py && /path/to/creation_alerte_mail_et_incident_GLPI.py >> /path/to/logfile.log 2>&1

Explication :

*/5 * * * * : La commande sera exécutée toutes les 5 minutes.
/path/to/data_monit_csv.py : Chemin vers votre script Python qui génère les données CSV de Monit.
&& : Cela garantit que le second script ne s'exécute que si le premier réussit.
/path/to/creation_alerte_mail_et_incident_GLPI.py : Chemin vers votre script Python qui crée des alertes mail et gère les incidents dans GLPI.

/path/to/logfile.log 2>&1 : Redirige à la fois la sortie standard (stdout) et les erreurs (stderr) vers le fichier de log, ici logfile.log.

### 5. Vérification des logs

Vous pouvez surveiller le fichier de log pour vous assurer que les scripts s'exécutent correctement et qu'aucune erreur n'est générée :

tail -f /path/to/logfile.log

### 6. Redémarrer le service cron

Si vous souhaitez vous assurer que les nouvelles configurations cron sont bien appliquées, redémarrez le service cron :

sudo systemctl restart cron

Avec cette configuration, vos deux scripts Python s'exécuteront toutes les 5 minutes, et les résultats seront automatiquement enregistrés dans le fichier de log spécifié.
Cela vous permettra de surveiller facilement les exécutions et les erreurs éventuelles.
