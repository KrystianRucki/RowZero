# RowZero

System rezerwacji miejsc na seanse festiwalu filmowego.

RowZero to aplikacja internetowa dla pojedynczego organizatora festiwalu filmowego. Użytkownicy mogą przeglądać repertuar, wybierać miejsca i zarządzać własnymi rezerwacjami, a administrator zarządza filmami, salami, miejscami, seansami, użytkownikami i rezerwacjami.

Projekt został przygotowany jako aplikacja full-stack z własnym REST API, relacyjną bazą danych, uwierzytelnianiem JWT, integracją z TMDB, obsługą współbieżności oraz testami jednostkowymi i integracyjnymi.

## Najważniejsze funkcje

### Użytkownik

- rejestracja i logowanie,
- sesja użytkownika zachowywana po odświeżeniu strony w obrębie tej samej karty przeglądarki,
- przeglądanie publicznego repertuaru,
- wyszukiwanie filmów,
- filtrowanie seansów,
- podgląd szczegółów filmu,
- podgląd dostępności miejsc,
- wybór dokładnie jednego miejsca na seans,
- utworzenie tymczasowej rezerwacji `HELD`,
- 10-minutowy czas na potwierdzenie rezerwacji,
- potwierdzenie rezerwacji,
- anulowanie własnej rezerwacji przed rozpoczęciem seansu,
- historia rezerwacji,
- powiadomienia o zmianach statusu rezerwacji.

### Administrator

- dostęp do chronionego panelu administracyjnego,
- przeglądanie, wyszukiwanie i filtrowanie użytkowników,
- aktywacja i dezaktywacja kont użytkowników,
- import filmów z TMDB,
- odświeżanie danych filmów z TMDB,
- zarządzanie widocznością filmów,
- CRUD sal,
- CRUD miejsc,
- CRUD seansów,
- przeglądanie i anulowanie rezerwacji,
- statystyki zajętości seansów.

## Technologie

### Backend

- Java 25 LTS
- Spring Boot 4.1.2
- Spring Web MVC
- Spring Data JPA
- Spring Security
- OAuth2 Resource Server / JWT
- PostgreSQL
- Flyway
- Spring RestClient
- Spring Application Events
- Maven
- JUnit
- Mockito
- Testcontainers
- springdoc-openapi / Swagger UI

### Frontend

- React
- TypeScript
- Vite
- React Router
- CSS
- Nginx w obrazie produkcyjnym

### Infrastruktura

- Docker
- Docker Compose
- PostgreSQL 18

## Architektura

```text
rowzero/
├── backend/
├── frontend/
├── docs/
├── docker-compose.yml
├── .env
├── .env.example
├── .gitignore
└── README.md
```

Backend udostępnia REST API, frontend komunikuje się z nim przez ścieżki `/api`, a PostgreSQL przechowuje dane aplikacji.

Schemat bazy danych jest tworzony i aktualizowany przez migracje Flyway.

## Model danych

Główne encje:

- `User`
- `Movie`
- `Hall`
- `Seat`
- `Screening`
- `ScreeningSeat`
- `Reservation`
- `Notification`

Statusy rezerwacji:

- `HELD`
- `CONFIRMED`
- `CANCELLED`
- `EXPIRED`

## Reguły biznesowe

Najważniejsze reguły realizowane po stronie backendu:

1. Jedno miejsce na seans może posiadać tylko jedną aktywną rezerwację.
2. Jeden użytkownik może posiadać tylko jedną aktywną rezerwację na dany seans.
3. Rezerwacji nie można utworzyć ani potwierdzić po rozpoczęciu seansu.
4. Rezerwacja `HELD` wygasa po 10 minutach.
5. Dwa zaplanowane seanse nie mogą nakładać się w tej samej sali.
6. Anulowanie rezerwacji jest logiczne i nie usuwa historii.
7. Miejsce musi należeć do sali przypisanej do danego seansu.
8. Dezaktywacja użytkownika anuluje jego przyszłe aktywne rezerwacje.
9. Użytkownik nie może posiadać aktywnych rezerwacji na nakładające się czasowo seanse.
10. Dokładna granica czasowa jest dozwolona, np. seans kończący się o 18:00 nie koliduje z seansem rozpoczynającym się o 18:00.

## Współbieżność rezerwacji

Mechanizm rezerwowania miejsc wykorzystuje transakcje oraz blokady pesymistyczne PostgreSQL/JPA.

Podczas próby rezerwacji system blokuje wymagane rekordy i ponownie weryfikuje dostępność miejsca przed zapisaniem rezerwacji.

Dzięki temu dwie równoczesne próby zarezerwowania tego samego miejsca nie mogą zakończyć się dwoma aktywnymi rezerwacjami.

Ten scenariusz jest również sprawdzany testem integracyjnym uruchamianym na rzeczywistym PostgreSQL przez Testcontainers.

## Rezerwacje tymczasowe i scheduler

Po wybraniu miejsca powstaje rezerwacja ze statusem `HELD`.

Domyślny czas rezerwacji tymczasowej wynosi 10 minut. Po jego przekroczeniu rezerwacja otrzymuje status `EXPIRED`, a miejsce ponownie staje się dostępne.

Scheduler okresowo sprawdza wygasłe rezerwacje. Częstotliwość sprawdzania jest konfigurowana zmienną:

```env
RESERVATION_EXPIRATION_CHECK_MS=15000
```

## Powiadomienia

Zmiany dotyczące rezerwacji generują powiadomienia użytkownika.

Do obsługi zdarzeń wykorzystywany jest mechanizm Spring Application Events, dzięki czemu logika powiadomień jest oddzielona od głównego przepływu rezerwacji.

## TMDB

RowZero wykorzystuje TMDB jako zewnętrzne źródło danych o filmach.

Administrator może:

- wyszukiwać filmy w TMDB,
- importować film do lokalnej bazy,
- odświeżać dane wcześniej zaimportowanego filmu.

Token TMDB jest przechowywany wyłącznie po stronie backendu w zmiennej środowiskowej.

## Wymagania

Do uruchomienia całej aplikacji przez Docker Compose wymagane są:

- Docker Desktop / Docker Engine,
- Docker Compose.

Do uruchamiania projektu bez Dockera dodatkowo:

- Java 25,
- Node.js 24 lub nowszy,
- npm,
- PostgreSQL 18.

## Konfiguracja środowiska

Skopiuj plik `.env.example` jako `.env`.

Przykładowa konfiguracja:

```env
POSTGRES_DB=rowzero
POSTGRES_USER=rowzero
POSTGRES_PASSWORD=change-me

JWT_SECRET=replace-with-base64-encoded-secret
JWT_EXPIRATION_SECONDS=3600

FESTIVAL_TIME_ZONE=Europe/Warsaw

TMDB_READ_TOKEN=
TMDB_LANGUAGE=en-US

RESERVATION_EXPIRATION_CHECK_MS=15000
```

Następnie uzupełnij:

- `POSTGRES_PASSWORD`,
- `JWT_SECRET`,
- `TMDB_READ_TOKEN`.

Plik `.env` nie powinien być commitowany do Git.

### Generowanie JWT secret

`JWT_SECRET` musi być wartością Base64 reprezentującą odpowiednio długi sekret.

Przykład w PowerShell:

```powershell
$bytes = New-Object byte[] 32
[System.Security.Cryptography.RandomNumberGenerator]::Fill($bytes)
[Convert]::ToBase64String($bytes)
```

Wygenerowaną wartość wpisz do:

```env
JWT_SECRET=...
```

## Uruchomienie przez Docker Compose

Z katalogu głównego projektu:

```bash
docker compose up --build
```

Aplikacja frontendowa jest dostępna pod:

```text
http://localhost:5173
```

Docker Compose uruchamia:

- frontend,
- backend,
- PostgreSQL.

Aby zatrzymać kontenery:

```bash
docker compose down
```

Aby zatrzymać system i usunąć wolumen bazy danych:

```bash
docker compose down -v
```

Opcji `-v` używaj tylko wtedy, gdy chcesz usunąć wszystkie lokalne dane PostgreSQL i rozpocząć pracę na pustej bazie.

## Pierwsze uruchomienie

Po uruchomieniu aplikacji:

1. Otwórz `http://localhost:5173`.
2. Zarejestruj konto.
3. Zaloguj się.
4. Konto utworzone przez publiczną rejestrację zawsze posiada rolę `USER`.

Aby przygotować konto administratora do lokalnego środowiska demonstracyjnego:

1. Zarejestruj konto, np. `admin@rowzero.local`.
2. Sprawdź nazwę usługi bazy:

```bash
docker compose ps --services
```

3. Jeżeli usługa PostgreSQL nazywa się `database`, wykonaj:

```bash
docker compose exec database psql -U rowzero -d rowzero -c "UPDATE users SET role = 'ADMIN' WHERE email = 'admin@rowzero.local';"
```

4. Wyloguj się z aplikacji i zaloguj ponownie, aby otrzymać nowy JWT zawierający rolę `ADMIN`.

Jeżeli usługa PostgreSQL ma inną nazwę, użyj nazwy zwróconej przez `docker compose ps --services`.

## Sesja JWT

Backend wydaje JWT po poprawnym logowaniu.

Frontend przechowuje token w `sessionStorage`.

Oznacza to, że:

- odświeżenie strony nie wylogowuje użytkownika,
- ręczne wejście na chroniony URL w tej samej karcie zachowuje sesję,
- przy starcie frontend weryfikuje token przez `/api/users/me`,
- nieważny lub wygasły token jest usuwany,
- zamknięcie karty przeglądarki kończy sesję po stronie frontendu.

Backend dodatkowo sprawdza, czy konto użytkownika nadal istnieje i jest aktywne.

## Uruchomienie backendu lokalnie

Uruchom PostgreSQL i ustaw wymagane zmienne środowiskowe.

Przykład w PowerShell:

```powershell
$env:DB_PASSWORD="your_database_password"
$env:JWT_SECRET="your_base64_secret"
$env:TMDB_READ_TOKEN="your_tmdb_token"
$env:TMDB_LANGUAGE="en-US"
```

Następnie:

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

Domyślnie backend łączy się z:

```text
jdbc:postgresql://localhost:5432/rowzero
```

Domyślny użytkownik bazy:

```text
rowzero
```

## Uruchomienie frontendu lokalnie

```bash
cd frontend
npm ci
npm run dev
```

## Build frontendu

```bash
cd frontend
npm run build
```

Build wykonuje kompilację TypeScript oraz produkcyjny build Vite.

## Testy backendu

Testy wymagają działającego Dockera, ponieważ testy integracyjne korzystają z Testcontainers i uruchamiają własny kontener PostgreSQL.

Uruchomienie całego zestawu:

```powershell
cd backend
.\mvnw.cmd clean test
```

Zakres testów obejmuje m.in.:

- logikę `ReservationService`,
- rejestrację i logowanie,
- autoryzację USER/ADMIN,
- odmowę dostępu do endpointów administratora,
- tworzenie i potwierdzanie rezerwacji,
- blokadę ponownej rezerwacji tego samego miejsca,
- blokadę drugiej rezerwacji użytkownika na ten sam seans,
- równoczesne próby rezerwacji tego samego miejsca,
- dezaktywację użytkownika,
- anulowanie aktywnych rezerwacji przy dezaktywacji,
- brak przywracania anulowanych rezerwacji po reaktywacji,
- reguły administracyjne dotyczące rezerwacji i seansów.

Testy integracyjne uruchamiają migracje Flyway i korzystają z rzeczywistego PostgreSQL.

## Swagger / OpenAPI

Po uruchomieniu backendu dokumentacja REST API jest generowana przez springdoc-openapi.

Swagger UI:

```text
http://localhost:8080/swagger-ui/index.html
```

Specyfikacja OpenAPI:

```text
http://localhost:8080/v3/api-docs
```

## Najważniejsze endpointy

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Registration |
| POST | `/api/auth/login` | Login and JWT creation |
| GET | `/api/users/me` | Current authenticated user |

### Public repertoire

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/movies` | Movie list, search and pagination |
| GET | `/api/movies/{id}` | Movie details |
| GET | `/api/screenings` | Screening list and filters |
| GET | `/api/screenings/{id}` | Screening details |
| GET | `/api/screenings/{id}/seats` | Seat availability |

### Reservations

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/reservations` | Create `HELD` reservation |
| GET | `/api/reservations/my` | Current user's reservations |
| GET | `/api/reservations/{id}` | Reservation details |
| POST | `/api/reservations/{id}/confirm` | Confirm reservation |
| PATCH | `/api/reservations/{id}` | Cancel own reservation |
| GET | `/api/notifications` | User notifications |
| PATCH | `/api/notifications/{id}/read` | Mark notification as read |

### Administrator

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/admin/users` | User list |
| GET | `/api/admin/users/{id}` | User details |
| PATCH | `/api/admin/users/{id}` | Activate/deactivate user |
| GET | `/api/admin/movies` | Local movie list |
| POST | `/api/admin/movies/import/{tmdbId}` | Import movie from TMDB |
| POST | `/api/admin/movies/{id}/refresh` | Refresh TMDB data |
| GET/POST | `/api/admin/halls` | Hall list / create hall |
| GET/PUT/DELETE | `/api/admin/halls/{id}` | Hall management |
| GET/POST | `/api/admin/halls/{id}/seats` | Seat list / create seat |
| PUT/DELETE | `/api/admin/seats/{id}` | Seat management |
| GET/POST | `/api/admin/screenings` | Screening list / create screening |
| GET/PUT/DELETE | `/api/admin/screenings/{id}` | Screening management |
| GET | `/api/admin/screenings/{id}/seats` | Screening seat snapshot |
| GET | `/api/admin/reservations` | Reservation list |
| GET | `/api/admin/reservations/{id}` | Reservation details |
| DELETE | `/api/admin/reservations/{id}` | Administrative cancellation |
| GET | `/api/admin/statistics/occupancy` | Occupancy statistics |

Pełną i aktualną dokumentację endpointów należy sprawdzać w Swagger UI.

## Obsługa błędów

Backend zwraca ujednolicony format błędu, np.:

```json
{
  "timestamp": "2026-11-20T12:00:00Z",
  "status": 409,
  "error": "Conflict",
  "message": "Seat is already reserved",
  "path": "/api/reservations",
  "fieldErrors": []
}
```

Najczęściej wykorzystywane statusy HTTP:

- `200 OK`
- `201 Created`
- `204 No Content`
- `400 Bad Request`
- `401 Unauthorized`
- `403 Forbidden`
- `404 Not Found`
- `409 Conflict`
- `502 Bad Gateway`

## Bezpieczeństwo

- hasła użytkowników są hashowane,
- publiczna rejestracja zawsze tworzy konto `USER`,
- endpointy `/api/admin/**` wymagają roli `ADMIN`,
- JWT jest weryfikowany przez Spring Security,
- backend weryfikuje aktywność konta przy żądaniach uwierzytelnionych,
- użytkownik może zarządzać tylko własnymi rezerwacjami,
- sekrety i token TMDB są przekazywane przez zmienne środowiskowe,
- plik `.env` nie powinien znajdować się w repozytorium.

## Responsywność

Frontend posiada widoki dostosowane do desktopu i urządzeń mobilnych.

Dotyczy to m.in.:

- nawigacji,
- kart filmów,
- szczegółów filmu,
- listy seansów,
- mapy miejsc,
- formularzy,
- panelu użytkownika,
- panelu administratora.

Dla dużych sal mapa miejsc może przewijać się poziomo, natomiast małe układy siedzeń są centrowane na ekranie.

## Status projektu

Zaimplementowany zakres obejmuje:

- backend REST API,
- frontend React,
- PostgreSQL,
- migracje Flyway,
- uwierzytelnianie i autoryzację,
- role USER i ADMIN,
- integrację TMDB,
- rezerwacje `HELD`,
- potwierdzanie i anulowanie rezerwacji,
- scheduler wygasających rezerwacji,
- powiadomienia oparte na zdarzeniach,
- blokady współbieżności,
- panel administracyjny,
- statystyki zajętości,
- testy jednostkowe,
- testy integracyjne z Testcontainers,
- Swagger/OpenAPI,
- Docker Compose,
- responsywny interfejs.

## Licencja i wykorzystanie

Projekt został przygotowany w ramach zajęć akademickich.

Dane filmowe pobierane przez aplikację pochodzą z TMDB. Korzystanie z TMDB API podlega warunkom tego serwisu.
