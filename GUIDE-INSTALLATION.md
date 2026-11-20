# Inventaire – Texas Coffee House · Guide d'installation

Ce projet donne :
- **une application Android** (fichier `.apk`) pour la tablette Samsung et les téléphones Android ;
- **une version web installable** pour le PC et les iPhone ;
- **une base de données Firebase** qui appartient au shop, synchronisée en direct sur tous les appareils.

Il faut le faire **une seule fois**, environ 20 minutes.

---

## Étape 1 – Créer la base de données Firebase (compte Google du shop)

1. Va sur **https://console.firebase.google.com** et connecte-toi avec le compte Google du shop.
2. **Créer un projet** → nom : `texas-inventaire` → désactive Google Analytics → **Créer**.
3. Menu de gauche **Créer → Firestore Database** → **Créer une base de données**
   - Emplacement : **europe-west1 (Belgique)**
   - Mode : **production** → **Créer**.
4. Onglet **Règles** : efface tout, colle le contenu du fichier `firestore.rules` de ce projet → **Publier**.
5. Menu **Créer → Authentication** → **Commencer** → **E-mail/Mot de passe** → active → **Enregistrer**.
6. Onglet **Users** → **Ajouter un utilisateur** : l'e-mail et le mot de passe que toute l'équipe utilisera pour se connecter (par ex. l'adresse du shop).
7. ⚙️ **Paramètres du projet** → en bas **Vos applications** → icône **</>** (Web) → nom `inventaire` → **Enregistrer l'application**.
   Firebase affiche un bloc `firebaseConfig = { apiKey: …, projectId: … }`.
   ➜ **Copie ce bloc et envoie-le à Claude** (ou colle les valeurs dans `src/firebase-config.js`). Ces valeurs ne sont pas secrètes.

## Étape 2 – GitHub (fabrique l'application automatiquement)

1. Crée un compte gratuit sur **https://github.com**.
2. **New repository** → nom `texas-inventaire` → **Public** (nécessaire pour la version web gratuite) → **Create**.
   Les données ne sont pas dans le code : sans le compte du shop, personne ne peut rien lire.
3. Relie GitHub à Claude : **claude.ai → Réglages → Connecteurs → GitHub**. Claude envoie alors le code lui-même.
   (Sinon : sur la page du dépôt, **Add file → Upload files** et glisse tout le contenu du dossier, sauf `node_modules`.)
4. Dans le dépôt : **Settings → Pages → Source : GitHub Actions**.
5. Onglet **Actions** : la fabrication démarre toute seule (≈ 5 min). Une coche verte ✓ = c'est prêt.
6. Retour dans Firebase : **Authentication → Settings → Domaines autorisés → Ajouter** : `TON-NOM.github.io`.

## Étape 3 – Installer sur la tablette et les téléphones Android

1. Sur l'appareil, ouvre `https://github.com/TON-NOM/texas-inventaire/releases/latest` dans Chrome.
2. Touche **Inventaire-TexasCoffeeHouse.apk** pour le télécharger, puis ouvre-le.
3. Android demande d'autoriser l'installation depuis Chrome : **Autoriser** → **Installer**.
4. Ouvre **Inventaire**, connecte-toi avec le compte du shop (une seule fois par appareil).
5. Accepte **les notifications** et **« Alarmes et rappels »** : c'est ce qui fait sonner les rappels Ramaut de 15 h et 15 h 30.

**Mises à jour :** à chaque changement, GitHub refait l'APK. Il suffit de le retélécharger et de l'installer par-dessus (on reste connecté).

## Étape 4 – PC et iPhone

- Adresse : `https://TON-NOM.github.io/texas-inventaire/`
- **PC (Chrome / Edge)** : icône **Installer** dans la barre d'adresse → l'application s'ouvre dans sa propre fenêtre.
- **iPhone (Safari)** : bouton **Partager → Sur l'écran d'accueil**.

---

## Bon à savoir

- **Rappels Ramaut** : sur Android, ils arrivent même application fermée, chaque jour à 15 h et 15 h 30 (heure de Belgique), et s'arrêtent pour la journée dès que la commande Ramaut est marquée envoyée. L'application n'a aucun bouton pour les couper. Android permet toujours de bloquer les notifications dans ses propres réglages : dans ce cas, l'application affiche un avertissement en haut.
- **iPhone / PC** : bandeaux + son quand l'application est ouverte ; pas de notification application fermée.
- **Premier démarrage** : les 215 articles sont chargés automatiquement dans la base, une seule fois.
- **Historique** : chaque commande envoyée est figée (la base refuse toute modification) et consultable par date.
- **Coût** : gratuit (offre Spark de Firebase, largement suffisante pour un shop).

## Pour les développeurs

```
npm install
npm run dev            # version web en local
npm run android:sync   # met à jour le projet Android (dossier android/)
```
Le projet Android se compile avec Android Studio ou `cd android && ./gradlew assembleRelease`.
La clé de signature `android/app/tch-release.jks` doit rester la même pour que les mises à jour s'installent par-dessus.

---

## Envoi automatique des commandes Ramaut (1 clic, gratuit)

Un petit script Google, hébergé gratuitement dans le compte Google du shop, envoie l'e-mail depuis la Gmail du shop.
Limite Google : 100 destinataires par jour (largement suffisant).

1. Connecte-toi à **https://script.google.com** avec le **compte Google du shop** (celui de la Gmail qui doit envoyer).
2. **Nouveau projet** → nomme-le `Envoi commandes Texas`.
3. Efface tout le contenu de `Code.gs` et colle le contenu du fichier `apps-script/Code.gs` de ce dépôt.
4. Ligne `const SECRET = 'COLLE-ICI-TON-CODE-SECRET';` : remplace le texte entre apostrophes par **ton code secret** (ne le mets jamais dans GitHub). Enregistre (💾).
5. En haut, choisis la fonction **autoriser** puis **▶ Exécuter** → **Examiner les autorisations** → choisis le compte du shop.
   Google affiche « Google n'a pas validé cette application » : c'est normal (c'est ton propre script) → **Paramètres avancés** → **Accéder à Envoi commandes Texas** → **Autoriser**.
6. **Déployer → Nouveau déploiement** → roue ⚙️ → **Application Web**
   - Exécuter en tant que : **Moi**
   - Qui a accès : **Tout le monde**
   → **Déployer** → copie l'**URL de l'application Web** (elle finit par `/exec`).
7. Dans l'application Inventaire : **Commande → Ramaut → Voir la commande → ⚙️ Configurer l'envoi automatique**
   → colle l'URL et le code secret → **Envoyer un e-mail de test** (un e-mail arrive dans la Gmail du shop) → **Enregistrer**.

Ensuite, le bouton **📧 Envoyer à Ramaut** envoie l'e-mail et enregistre la commande dans l'historique en un seul clic.
Si l'envoi échoue, l'application propose **Ouvrir dans Gmail** puis **Commande envoyée ✓**.

> Si tu modifies le script plus tard : **Déployer → Gérer les déploiements → ✏️ → Version : Nouvelle version → Déployer** (l'URL reste la même).
