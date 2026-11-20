# RowZero - REST API

Dokument opisuje główne endpointy RowZero.

Pełna interaktywna dokumentacja jest generowana automatycznie przez OpenAPI.

- Swagger UI: `http://localhost:8080/swagger-ui/index.html`
- OpenAPI JSON: `http://localhost:8080/v3/api-docs`

## Uwierzytelnianie

API wykorzystuje JWT przesyłany w nagłówku:

```http
Authorization: Bearer <token>
```

Role:

- `USER`
- `ADMIN`

Publiczne endpointy nie wymagają JWT.

Endpointy `/api/admin/**` wymagają roli `ADMIN`.

## Authentication

### POST `/api/auth/register`

Rejestracja użytkownika.

Przykładowe body:

```json
{
  "email": "user@example.com",
  "password": "StrongPassword123!"
}
```

Publiczna rejestracja zawsze tworzy konto z rolą `USER`.

### POST `/api/auth/login`

Logowanie i wydanie JWT.

```json
{
  "email": "user@example.com",
  "password": "StrongPassword123!"
}
```

### GET `/api/users/me`

Zwraca dane aktualnie uwierzytelnionego użytkownika.

Wymaga JWT.

---

## Publiczne filmy

### GET `/api/movies`

Lista widocznych filmów.

Obsługuje wyszukiwanie i paginację.

### GET `/api/movies/{id}`

Szczegóły widocznego filmu.

---

## Publiczne seanse

### GET `/api/screenings`

Lista zaplanowanych seansów.

Obsługuje filtrowanie m.in. po dacie, filmie i sali.

### GET `/api/screenings/{id}`

Szczegóły pojedynczego seansu.

### GET `/api/screenings/{id}/seats`

Mapa miejsc dla seansu wraz z ich dostępnością.

Id zwracane dla miejsca w tym endpointcie jest identyfikatorem `ScreeningSeat`, a nie fizycznego `Seat`.

---

## Rezerwacje użytkownika

Wszystkie endpointy wymagają JWT.

### POST `/api/reservations`

Tworzy tymczasową rezerwację `HELD`.

```json
{
  "screeningSeatId": 123
}
```

Rezerwacja jest ważna przez maksymalnie 10 minut.

Możliwe konflikty `409`:

- miejsce jest już zajęte,
- użytkownik ma już aktywną rezerwację na ten seans,
- użytkownik ma rezerwację na nakładający się czasowo seans,
- seans już się rozpoczął.

### GET `/api/reservations/my`

Lista rezerwacji aktualnego użytkownika.

### GET `/api/reservations/{id}`

Szczegóły własnej rezerwacji.

Użytkownik nie może odczytać cudzej rezerwacji.

### POST `/api/reservations/{id}/confirm`

Potwierdza aktywną rezerwację `HELD`.

Po potwierdzeniu status zmienia się na `CONFIRMED`.

### PATCH `/api/reservations/{id}`

Zmiana statusu własnej rezerwacji używana do anulowania.

```json
{
  "status": "CANCELLED"
}
```

Anulowanie jest logiczne - rekord pozostaje w bazie.

---

## Powiadomienia

### GET `/api/notifications`

Lista powiadomień aktualnego użytkownika.

### PATCH `/api/notifications/{id}/read`

Oznacza własne powiadomienie jako przeczytane.

---

# API administratora

Wszystkie endpointy poniżej wymagają roli `ADMIN`.

## Użytkownicy

### GET `/api/admin/users`

Lista użytkowników.

Obsługuje wyszukiwanie, filtrowanie i paginację.

### GET `/api/admin/users/{id}`

Szczegóły użytkownika.

### PATCH `/api/admin/users/{id}`

Aktywacja lub dezaktywacja konta.

Przykładowe body:

```json
{
  "enabled": false
}
```

Dezaktywacja zwykłego użytkownika:

- ustawia `enabled=false`,
- anuluje wszystkie jego przyszłe aktywne rezerwacje,
- nie usuwa historii,
- ponowna aktywacja nie przywraca anulowanych rezerwacji.

---

## Filmy

### GET `/api/admin/movies`

Lista lokalnych filmów, także niewidocznych publicznie.

### GET `/api/admin/movies/{id}`

Szczegóły lokalnego filmu.

### PUT `/api/admin/movies/{id}`

Aktualizacja lokalnych ustawień filmu.

### DELETE `/api/admin/movies/{id}`

Usuwa film tylko wtedy, gdy nie był używany przez żaden seans.

Jeżeli film był już przypisany do seansu, należy użyć logicznego ukrycia przez `visible=false`.

---

## TMDB

### GET `/api/admin/tmdb/movies/search`

Wyszukiwanie filmów w TMDB.

Przykład:

```text
/api/admin/tmdb/movies/search?query=Alien&page=1
```

### POST `/api/admin/movies/import/{tmdbId}`

Import filmu z TMDB do lokalnej bazy danych.

### POST `/api/admin/movies/{id}/refresh`

Ponowne pobranie i aktualizacja danych filmu z TMDB.

---

## Sale

### GET `/api/admin/halls`

Lista sal.

### POST `/api/admin/halls`

Tworzy salę.

### GET `/api/admin/halls/{id}`

Szczegóły sali.

### PUT `/api/admin/halls/{id}`

Aktualizuje salę.

### DELETE `/api/admin/halls/{id}`

Usuwa salę, jeżeli reguły spójności danych na to pozwalają.

---

## Miejsca

### GET `/api/admin/halls/{hallId}/seats`

Lista miejsc w sali.

### POST `/api/admin/halls/{hallId}/seats`

Dodaje pojedyncze miejsce do sali.

Miejsce jest identyfikowane przez:

- `rowLabel`,
- `number`.

### PUT `/api/admin/seats/{id}`

Aktualizuje miejsce.

### DELETE `/api/admin/seats/{id}`

Usuwa miejsce, jeżeli nie zostało wykorzystane przez istniejący seans.

---

## Seanse

### GET `/api/admin/screenings`

Lista wszystkich seansów.

### POST `/api/admin/screenings`

Tworzy seans.

Przy tworzeniu backend:

- sprawdza poprawność przedziału czasu,
- sprawdza czas trwania filmu,
- blokuje nakładające się seanse w tej samej sali,
- wymaga co najmniej jednego aktywnego miejsca,
- tworzy snapshot miejsc jako rekordy `ScreeningSeat`.

### GET `/api/admin/screenings/{id}`

Szczegóły seansu.

### PUT `/api/admin/screenings/{id}`

Aktualizuje przyszły seans.

Nie można modyfikować:

- anulowanego seansu,
- rozpoczętego seansu,
- seansu z aktywnymi rezerwacjami.

Sala przypisana do istniejącego seansu nie jest zmieniana.

### DELETE `/api/admin/screenings/{id}`

Logicznie anuluje seans.

Anulowanie seansu powoduje również anulowanie jego aktywnych rezerwacji.

### GET `/api/admin/screenings/{id}/seats`

Zwraca snapshot miejsc przypisanych do seansu.

---

## Rezerwacje administratora

### GET `/api/admin/reservations`

Lista wszystkich rezerwacji.

Obsługuje filtrowanie m.in. po:

- statusie,
- seansie,
- e-mailu użytkownika,
- zakresie dat.

### GET `/api/admin/reservations/{id}`

Szczegóły dowolnej rezerwacji.

### DELETE `/api/admin/reservations/{id}`

Administracyjne anulowanie aktywnej rezerwacji.

Rekord pozostaje w bazie.

---

## Statystyki

### GET `/api/admin/statistics/occupancy`

Statystyki zajętości seansów.

Endpoint może być filtrowany po zakresie dat.

---

# Kody HTTP

Najczęściej wykorzystywane odpowiedzi:

| Kod | Znaczenie |
|---|---|
| `200 OK` | poprawny odczyt lub aktualizacja |
| `201 Created` | utworzenie zasobu |
| `204 No Content` | operacja bez body odpowiedzi |
| `400 Bad Request` | błędne dane wejściowe |
| `401 Unauthorized` | brak lub nieważny JWT |
| `403 Forbidden` | brak wymaganej roli/uprawnień |
| `404 Not Found` | zasób nie istnieje |
| `409 Conflict` | naruszenie reguły biznesowej |
| `502 Bad Gateway` | problem z komunikacją z TMDB |

# Format błędu

Przykład:

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

`fieldErrors` jest wykorzystywane dla błędów walidacji pól.

# Najważniejsze reguły bezpieczeństwa

- rejestracja publiczna nie pozwala nadać sobie roli `ADMIN`,
- endpointy administratora są chronione rolą `ADMIN`,
- użytkownik może odczytywać i modyfikować wyłącznie własne rezerwacje,
- backend sprawdza również, czy konto użytkownika nadal jest aktywne,
- JWT jest weryfikowany przy każdym chronionym żądaniu,
- sekret JWT i token TMDB nie są przechowywane w kodzie źródłowym.
