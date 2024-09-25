# 🌊 EauClaire 

## 📝 Description du projet

EauClaire est une application web complète qui offre une interface utilisateur intuitive pour interagir avec des données liées à l'eau, que ça soit la qualité de l'eau, la consommation d'eau, la biodiversité aquatique ou bien encore le niveau des eaux. Ce projet est divisé en deux parties : le **back-end** et le **front-end**.

- **Back-end :** Développé avec **Flask**, il gère les API, les connexions à la base de données **MongoDB**, et les opérations de traitement des données.
- **Front-end :** Créé avec **React.js**, il fournit une expérience utilisateur dynamique et interactive, se connectant au back-end via des appels API.
- **Hébergé sur un VPS Ubuntu IONOS**, l'hébergement d'un VPS avec IONOS est payant.

## 📁 Structure du projet

Ce README sert d'introduction globale au projet EauClaire. Des README détaillés sont disponibles dans les sous-dossiers correspondants :

- **EauClaire_backend-main** : Contient le code et les instructions pour le back-end.
- **EauClaire_frontend-main** : Contient le code et les instructions pour le front-end.
  
## 🚀 Fonctionnalités

- **Carte interactive :** Visualisez les données sur une carte avec des filtres sur l'année (2000 à 2050) et l'échelle (régionale ou départementale).
- **Tableau de données des consommations /habitants :** Accédez à un tableau de données filtrable par année (2000 à 2050), possibilité d'envoyer des alertes d'une region voulue sur Discord, possibilité également de trier, filtrer sur les colonnes de votre choix & télecharger l'année sélectionnée ou télecharger toutes les années sous format CSV.
- **Dashboard :** Consultez des graphiques pertinents avec des options de filtrage sur la région, les régions de France avec un filtre sur l'année (2000 à 2050).

## 🎥 Aperçu en vidéo

Voici quelques vidéos montrant les fonctionnalités du site, le monitoring & la gestion des incidents avec un exemple d'une fausse erreur :

###  Accès au VPS  : Via VSCode en SSH grâce à Remote Explorer

https://github.com/user-attachments/assets/99a9b42d-196a-4a9c-98bd-c27b9c38e525

###  Page d'accueil  :

https://github.com/user-attachments/assets/7af15ab8-e42a-4a42-9136-8a8968e33a3a

### Fonctionnalité 1 : Carte Interactive

https://github.com/user-attachments/assets/c19b9884-54c9-4427-a57b-ed6a5ae20016

### Fonctionnalité 2 : Tableau données de consommation

https://github.com/user-attachments/assets/82bef5c7-aa3b-4e8e-8170-16efb7ecd72c

### Fonctionnalité 3 : Réception alerte

https://github.com/user-attachments/assets/2b44ec88-0ca1-4305-859d-659f94402c82

### Fonctionnalité 4 : Dashboard

https://github.com/user-attachments/assets/2ee3a5ba-f983-4cd9-8591-993a04e02001

### Monitoring : avec Monit

https://github.com/user-attachments/assets/847303ac-ae81-46c7-b0dc-5a3e6db9e868

### Gestion des alertes & incidents : avec GLPI 

Exemple d'une erreur volontaire, en stoppant le service nginx manuellement :

https://github.com/user-attachments/assets/602a7a93-dff1-4b05-b190-c2fa28fd0f09

## 🛠 Prérequis

Pour déployer ce projet, vous aurez besoin des éléments suivants :

- **Node.js** (version 14.x ou supérieure)
- **MongoDB** (local ou distant)
- **IONOS VPS** pour le déploiement (payant)
- **Nginx** pour servir l'application web
- **Gunicorn** pour exécuter l'application Flask

## 📦 Installation

Pour installer les dépendances, suivez les instructions dans les README de chaque sous-dossier. 

