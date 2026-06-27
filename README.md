# Progressi

Application web de productivité gamifiée, inspirée de TickTick, avec une identité RPG minimaliste : tâches, habitudes, système d'XP et de niveaux, streaks, Pomodoro et modération.

Projet de fin d'année — Bachelor 2 Fullstack, CODA Orléans.

## Accès à l'application déployée

**URL** : [app-progressi.vercel.app](https://app-progressi.vercel.app)

### Comptes de test

| Rôle           | Email         | Mot de passe |
| -------------- | ------------- | ------------ |
| Utilisateur    | test@user.fr  | **12345678** |
| Administrateur | test@admin.fr | **12345678** |

Le compte administrateur a accès au dashboard d'administration (gestion des utilisateurs, modération, statistiques globales), accessible via le menu Profil → Administration.

## Stack technique

Next.js 15 (App Router), Prisma + PostgreSQL (Supabase), NextAuth, React Query, Tailwind CSS v4, Zod, Recharts.

## Fonctionnalités principales

- Gestion de tâches avec priorités, types, tags, dates d'échéance
- Système d'habitudes avec suivi de streaks
- Minuteur Pomodoro avec historique de séances
- Système de gamification (XP, niveaux, quotas journaliers anti-triche)
- Tableau de bord personnel (statistiques, graphique d'évolution XP)
- Administration (gestion des comptes, modération, statistiques globales)

## Documentation

- Documentation technique : [lien ou nom du fichier si tu en as un séparé]
- Documentation utilisateur : [idem]

## Développement local

\`\`\`bash
npm install
npx prisma generate
npm run dev
\`\`\`

Variables d'environnement requises : voir `.env.example` (à créer si tu ne l'as pas).
