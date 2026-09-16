Ce fichier indique à l'agent de ne JAMAIS modifier, régénérer, supprimer ou réécrire les fichiers/dossiers suivants, quelle que soit la demande :

- api/index.ts
- server.ts
- dist/ (tout le dossier)
- prisma/ (tout le dossier, notamment schema.prisma)
- vercel.json
- package.json -> ne touche QUE la section "dependencies"/"devDependencies" si besoin d'ajouter un package frontend ; ne modifie jamais les scripts "build" et "postinstall"

Ces fichiers gèrent le backend (API serverless, base de données Prisma/Neon, config de déploiement Vercel) et sont maintenus séparément. Toute modification dessus casse la production.

Travaille uniquement sur les fichiers frontend : src/, index.html, public/, composants React. Si une fonctionnalité demandée nécessite de toucher aux fichiers listés ci-dessus, tu dois me prévenir au lieu de les modifier directement.
