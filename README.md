Volleyball Scoreboard

Volleyball Scoreboard to aplikacja webowa służąca do śledzenia wyników meczów siatkówki w czasie rzeczywistym. Projekt wykorzystuje technologię Socket.io do komunikacji w czasie rzeczywistym pomiędzy serwerem a klientami, co umożliwia aktualizację wyników meczu i czasu gry na wszystkich podłączonych urządzeniach.

Instalacja

    Sklonuj repozytorium:

    git clone https://github.com/KruczekSV/VolleyballScoreboard.git
    cd VolleyballScoreboard

Zainstaluj zależności:

    npm install

Skonfiguruj plik .env:

    DATABASE_URL="mysql://username:password@host:port/database"
    NEXTAUTH_URL=http://localhost:3000
    NEXTAUTH_SECRET=your-secret-key

Migracje bazy danych:

    npx prisma migrate dev --name init

Uruchomienie serwera deweloperskiego:

bash

    npm run dev

Struktura projektu

    volleyball-scoreboard/
    ├── prisma/                 # Schematy i migracje bazy danych Prisma
    │   ├── schema.prisma
    ├── public/                 # Pliki publiczne
    │   ├── favicon.ico
    │    src/
    │    ├── app/
    │    │   ├── api/           # Endpointy
    │    │   │   ├── auth/
    │    │   │   │   ├── [...nextauth]/
    │    │   │   │   │   ├── auth.config.ts
    │    │   │   │   │   └── route.ts
    │    │   │   ├── matches/
    │    │   │   │   ├── [id]/
    │    │   │   │   │   └── route.ts
    │    │   │   │   └── route.ts
    │    │   │   ├── register/
    │    │   │   │   └── route.ts
    │    │   │   └── teams/
    │    │   │       └── route.ts
    │    ├── components/
    │    │   ├── ClientSessionProvider.tsx
    │    │   └── HeaderWithSession.tsx
    │    ├── create/
    │    │   ├── match/
    │    │   │   └── page.tsx
    │    │   ├── rules/
    │    │   │   └── page.tsx
    │    │   └── team/
    │    │       └── page.tsx
    │    ├── login/
    │    │   ├── layout.tsx
    │    │   ├── login.module.css
    │    │   └── page.tsx
    │    ├── match/
    │    │   └── [id]/
    │    │       ├── MatchPage.module.css
    │    │       └── page.tsx
    │    ├── register/
    │    │   └── page.tsx
    │    ├── favicon.ico
    │    ├── globals.css
    │    ├── layout.tsx
    │    └── page.tsx
