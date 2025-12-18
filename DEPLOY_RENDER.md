# Guide de Déploiement sur Render

Ce guide vous explique comment déployer votre application TMF Stock (backend + frontend) sur Render après avoir poussé votre code sur GitHub.

## 📋 Prérequis

1. ✅ Code poussé sur GitHub
2. ✅ Compte Render (gratuit disponible sur [render.com](https://render.com))
3. ✅ MongoDB Atlas configuré (ou autre base de données MongoDB)
4. ✅ Compte Cloudinary (pour l'upload d'images)
5. ✅ Compte Brevo (pour l'envoi d'emails)

---

## 🚀 Étape 1 : Déployer le Backend

### 1.1 Créer un nouveau service Web

1. Connectez-vous à [Render Dashboard](https://dashboard.render.com)
2. Cliquez sur **"New +"** → **"Web Service"**
3. Connectez votre repository GitHub si ce n'est pas déjà fait
4. Sélectionnez votre repository `tmf-stock`

### 1.2 Configuration du Backend

Remplissez les champs suivants :

- **Name** : `tmf-stock-backend` (ou le nom de votre choix)
- **Environment** : `Node`
- **Region** : Choisissez la région la plus proche (ex: `Frankfurt` pour l'Europe)
- **Branch** : `main` (ou votre branche principale)
- **Root Directory** : `backend`
- **Build Command** : `npm install && npm run build`
- **Start Command** : `npm start`

### 1.3 Variables d'environnement du Backend

Dans la section **"Environment Variables"**, ajoutez les variables suivantes :

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/tmf_stock?retryWrites=true&w=majority
JWT_SECRET=votre_secret_jwt_tres_securise_changez_moi
FRONTEND_ORIGIN=https://votre-frontend.onrender.com
CLOUDINARY_CLOUD_NAME=votre_cloud_name
CLOUDINARY_API_KEY=votre_api_key
CLOUDINARY_API_SECRET=votre_api_secret
BREVO_API_KEY=votre_brevo_api_key
EMAIL_FROM_ADDRESS=noreply@votredomaine.com
```

**⚠️ Important** :
- Remplacez toutes les valeurs par vos vraies clés
- Pour `FRONTEND_ORIGIN`, vous devrez mettre à jour cette valeur après avoir déployé le frontend
- `PORT` est automatiquement géré par Render (ne pas l'ajouter)

### 1.4 Plan et déploiement

- **Plan** : Choisissez **"Free"** pour commencer (ou un plan payant pour de meilleures performances)
- Cliquez sur **"Create Web Service"**

Le backend va maintenant se déployer. Notez l'URL générée (ex: `https://tmf-stock-backend.onrender.com`)

---

## 🎨 Étape 2 : Déployer le Frontend

### 2.1 Créer un nouveau service Web

1. Dans le Dashboard Render, cliquez sur **"New +"** → **"Web Service"**
2. Sélectionnez le même repository `tmf-stock`

### 2.2 Configuration du Frontend

Remplissez les champs suivants :

- **Name** : `tmf-stock-frontend` (ou le nom de votre choix)
- **Environment** : `Node`
- **Region** : Même région que le backend
- **Branch** : `main`
- **Root Directory** : `frontend`
- **Build Command** : `npm install && npm run build`
- **Start Command** : `npm start`

### 2.3 Variables d'environnement du Frontend

Dans la section **"Environment Variables"**, ajoutez :

```
NEXT_PUBLIC_API_URL=https://tmf-stock-backend.onrender.com
```

**⚠️ Important** : Remplacez `https://tmf-stock-backend.onrender.com` par l'URL réelle de votre backend déployé à l'étape 1.

### 2.4 Plan et déploiement

- **Plan** : Choisissez **"Free"** (ou un plan payant)
- Cliquez sur **"Create Web Service"**

Le frontend va maintenant se déployer. Notez l'URL générée (ex: `https://tmf-stock-frontend.onrender.com`)

---

## 🔄 Étape 3 : Mettre à jour les URLs

### 3.1 Mettre à jour FRONTEND_ORIGIN dans le Backend

1. Retournez dans les paramètres de votre service backend sur Render
2. Allez dans **"Environment"**
3. Mettez à jour la variable `FRONTEND_ORIGIN` avec l'URL de votre frontend :
   ```
   FRONTEND_ORIGIN=https://tmf-stock-frontend.onrender.com
   ```
4. Cliquez sur **"Save Changes"** - Render redéploiera automatiquement

### 3.2 Vérifier NEXT_PUBLIC_API_URL dans le Frontend

Vérifiez que `NEXT_PUBLIC_API_URL` dans le frontend pointe bien vers l'URL de votre backend.

---

## ✅ Étape 4 : Vérification

1. **Backend** : Visitez `https://votre-backend.onrender.com` - Vous devriez voir une erreur 404 (normal, c'est une API)
2. **Frontend** : Visitez `https://votre-frontend.onrender.com` - Votre application devrait s'afficher

### Test de l'API Backend

Vous pouvez tester l'API avec :
```bash
curl https://votre-backend.onrender.com/api/products
```

---

## 🔧 Configuration avancée (optionnel)

### Utiliser un fichier render.yaml

Pour automatiser le déploiement, vous pouvez utiliser le fichier `render.yaml` à la racine du projet. Render détectera automatiquement ce fichier.

### Health Checks

Render vérifie automatiquement que votre service fonctionne. Assurez-vous que :
- Le backend écoute sur le port fourni par `process.env.PORT`
- Le frontend démarre correctement avec `npm start`

---

## 🐛 Dépannage

### Le backend ne démarre pas

1. Vérifiez les logs dans Render Dashboard
2. Vérifiez que toutes les variables d'environnement sont correctement définies
3. Vérifiez que MongoDB Atlas autorise les connexions depuis n'importe quelle IP (0.0.0.0/0)

### Le frontend ne peut pas se connecter au backend

1. Vérifiez que `NEXT_PUBLIC_API_URL` est correct
2. Vérifiez que `FRONTEND_ORIGIN` dans le backend correspond à l'URL du frontend
3. Vérifiez les logs du backend pour les erreurs CORS

### Les services se mettent en veille (plan gratuit)

Sur le plan gratuit, Render met les services en veille après 15 minutes d'inactivité. Le premier démarrage peut prendre 30-60 secondes.

Pour éviter cela, vous pouvez :
- Utiliser un service de "ping" externe pour maintenir le service actif
- Passer à un plan payant

---

## 📝 Notes importantes

1. **Sécurité** : Ne commitez jamais vos fichiers `.env` ou vos clés secrètes
2. **MongoDB Atlas** : Assurez-vous que votre cluster autorise les connexions depuis n'importe quelle IP (pour le déploiement)
3. **CORS** : Le backend est configuré pour accepter les requêtes depuis `FRONTEND_ORIGIN`
4. **Build** : Les builds peuvent prendre plusieurs minutes, soyez patient

---

## 🎉 Félicitations !

Votre application est maintenant déployée sur Render ! 🚀

