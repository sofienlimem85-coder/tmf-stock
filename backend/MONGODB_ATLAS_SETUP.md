# Configuration MongoDB Atlas

## Comment obtenir l'URI de connexion complète

### Méthode 1 : Depuis MongoDB Atlas Dashboard

1. **Connectez-vous à MongoDB Atlas** : https://cloud.mongodb.com
2. **Sélectionnez votre projet** (celui avec "Sofien Limem")
3. **Cliquez sur "Connect"** sur votre cluster
4. **Choisissez "Connect your application"**
5. **Sélectionnez "Node.js"** comme driver
6. **Copiez l'URI de connexion** qui ressemble à :
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
7. **Remplacez** :
   - `<username>` par : `sofienlimem85_db_user`
   - `<password>` par : `w7a7OfyRdW3g3mqU`
   - Ajoutez le nom de la base de données : `/tmf_stock` avant le `?`

### Méthode 2 : Si vous avez déjà l'URI

Si vous avez déjà l'URI complète, remplacez simplement la ligne `MONGODB_URI` dans le fichier `.env` :

```env
MONGODB_URI=mongodb+srv://sofienlimem85_db_user:w7a7OfyRdW3g3mqU@<votre-cluster>.mongodb.net/tmf_stock?retryWrites=true&w=majority
```

## Configuration actuelle

Le fichier `.env` a été créé avec :
- **Username** : `sofienlimem85_db_user`
- **Password** : `w7a7OfyRdW3g3mqU`
- **Database** : `tmf_stock`
- **Cluster** : `fxlynfst` (à vérifier)

## Vérification de la connexion

1. **Assurez-vous que votre IP est autorisée** dans MongoDB Atlas :
   - Allez dans "Network Access" dans MongoDB Atlas
   - Ajoutez votre IP actuelle ou `0.0.0.0/0` pour autoriser toutes les IPs (développement uniquement)

2. **Testez la connexion** :
   ```bash
   cd backend
   npm run start:dev
   ```

3. **Si vous voyez une erreur de connexion**, vérifiez :
   - Que l'URI est correcte
   - Que votre IP est autorisée
   - Que le nom d'utilisateur et le mot de passe sont corrects
   - Que le cluster est actif

## Format de l'URI MongoDB Atlas

```
mongodb+srv://<username>:<password>@<cluster-name>.<cluster-id>.mongodb.net/<database-name>?retryWrites=true&w=majority
```

Exemple :
```
mongodb+srv://sofienlimem85_db_user:w7a7OfyRdW3g3mqU@cluster0.abc123.mongodb.net/tmf_stock?retryWrites=true&w=majority
```

## Notes importantes

- ⚠️ **Ne partagez jamais** votre fichier `.env` ou vos identifiants
- ✅ Le fichier `.env` est déjà dans `.gitignore` pour éviter les fuites
- 🔒 En production, utilisez des variables d'environnement sécurisées
- 🔑 Changez le `JWT_SECRET` pour une valeur aléatoire forte en production

