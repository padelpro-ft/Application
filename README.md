# PadelGo — squelette de production

Backend réel pour l'app de réservation de terrains de padel : Next.js (App
Router), PostgreSQL + Prisma, authentification par rôle avec NextAuth.
Ce projet reprend exactement le modèle de données et les règles du cahier
des charges (double réservation impossible, rôles CLIENT/OWNER vérifiés
côté serveur, paiement manuel en V1).

## 1. Installer

```bash
npm install
cp .env.example .env
# éditer .env : DATABASE_URL + NEXTAUTH_SECRET (openssl rand -base64 32)
```

Une base Postgres gratuite en 2 minutes : [Neon](https://neon.tech) ou
[Supabase](https://supabase.com) — copiez l'URL de connexion dans
`DATABASE_URL`.

## 2. Créer la base de données

```bash
npm run db:migrate    # crée les tables à partir de prisma/schema.prisma
npm run db:seed       # (optionnel) un club + un client de démo
```

Comptes de démo créés par le seed :
- Gérant : `club@padelgo.demo` / `password123`
- Client : `client@padelgo.demo` / `password123`

## 3. Lancer en local

```bash
npm run dev
```

→ http://localhost:3000

## Ce qui est déjà branché

- `prisma/schema.prisma` — User, Club, Court, Reservation, Payment (fidèle
  à la section 13 du cahier des charges)
- `middleware.js` — bloque `/owner/*` et `/client/*` selon le rôle, côté
  serveur (pas seulement dans l'interface)
- `app/api/**` — tous les endpoints listés dans le cahier des charges
  (auth, clubs, terrains, réservations, paiements), avec vérification des
  permissions dans chaque route
- `app/api/reservations/route.js` — la vérification anti-double-réservation
  tourne dans une transaction Prisma `Serializable` : deux requêtes
  simultanées sur le même terrain/créneau ne peuvent jamais réussir toutes
  les deux
- Connexion / inscription (`app/(auth)/login`, `app/(auth)/register`)
  branchées sur NextAuth
- `app/clubs/page.js` — exemple de page qui lit directement Prisma
  (pattern à reprendre pour porter les autres écrans)

## Ce qu'il reste à faire

Le prototype (`padel-booking-app.jsx`) contient déjà tout le design et
toute la logique d'interface pour chaque écran (booking flow, dashboard
gérant, planning, facturation...). Le travail restant est de la
**reconnexion**, pas de la reconception :

1. Copier chaque composant du prototype dans `app/client/...` ou
   `app/owner/...` en `'use client'`
2. Remplacer les appels `window.storage.get/set` par des appels
   `fetch('/api/...')` vers les routes déjà créées
3. Le rôle vient de `useSession()` (NextAuth) au lieu de l'état local
   `session`

Exemple pour la création d'une réservation, dans un composant client :

```js
const res = await fetch('/api/reservations', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ clubId, courtId, date, startTime, duration }),
});
const data = await res.json();
if (!res.ok) { setError(data.error); return; }
```

## Déploiement

[Vercel](https://vercel.com) + [Neon](https://neon.tech) (gratuits pour
démarrer) : connecter le repo Git à Vercel, ajouter `DATABASE_URL` et
`NEXTAUTH_SECRET` dans les variables d'environnement du projet, déployer.
`prisma migrate deploy` doit être lancé une fois contre la base de prod
(ou ajouté au script de build).

## Ce qui est volontairement absent de la V1 (comme demandé)

Paiement en ligne / Stripe, avis clients, chat, géolocalisation avancée,
app mobile native, programme de fidélité — le modèle `Payment` et le
champ `paymentMethod: ONLINE_FUTURE` sont prêts à accueillir Stripe plus
tard sans migration de schéma majeure.
