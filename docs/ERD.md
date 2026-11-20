# RowZero - ERD

Poniższy diagram przedstawia aktualny model danych aplikacji RowZero.

```mermaid
erDiagram
    USERS {
        BIGINT id PK
        VARCHAR email UK
        VARCHAR password_hash
        VARCHAR role
        BOOLEAN enabled
        TIMESTAMPTZ created_at
    }

    MOVIES {
        BIGINT id PK
        BIGINT tmdb_id UK
        VARCHAR title
        VARCHAR original_title
        TEXT overview
        INTEGER runtime
        DATE release_date
        VARCHAR poster_path
        VARCHAR backdrop_path
        BOOLEAN visible
        TIMESTAMPTZ last_synced_at
    }

    HALLS {
        BIGINT id PK
        VARCHAR name
    }

    SEATS {
        BIGINT id PK
        BIGINT hall_id FK
        VARCHAR row_label
        INTEGER number
        BOOLEAN active
    }

    SCREENINGS {
        BIGINT id PK
        BIGINT movie_id FK
        BIGINT hall_id FK
        TIMESTAMPTZ start_at
        TIMESTAMPTZ end_at
        VARCHAR status
    }

    SCREENING_SEATS {
        BIGINT id PK
        BIGINT screening_id FK
        BIGINT seat_id FK
    }

    RESERVATIONS {
        BIGINT id PK
        BIGINT user_id FK
        BIGINT screening_id FK
        BIGINT screening_seat_id FK
        VARCHAR status
        TIMESTAMPTZ created_at
        TIMESTAMPTZ expires_at
        TIMESTAMPTZ confirmed_at
        TIMESTAMPTZ cancelled_at
    }

    NOTIFICATIONS {
        BIGINT id PK
        BIGINT user_id FK
        VARCHAR type
        TEXT message
        TIMESTAMPTZ created_at
        TIMESTAMPTZ read_at
    }

    USERS ||--o{ RESERVATIONS : creates
    USERS ||--o{ NOTIFICATIONS : receives

    MOVIES ||--o{ SCREENINGS : scheduled_for
    HALLS ||--o{ SEATS : contains
    HALLS ||--o{ SCREENINGS : hosts

    SCREENINGS ||--o{ SCREENING_SEATS : snapshots
    SEATS ||--o{ SCREENING_SEATS : copied_to

    SCREENINGS ||--o{ RESERVATIONS : has
    SCREENING_SEATS ||--o{ RESERVATIONS : selected_by
```

## Relacje

- Jeden użytkownik może posiadać wiele rezerwacji.
- Jeden użytkownik może posiadać wiele powiadomień.
- Jeden film może być przypisany do wielu seansów.
- Jedna sala posiada wiele miejsc.
- Jeden seans odbywa się w jednej sali.
- Każdy seans posiada własny snapshot miejsc w tabeli `screening_seats`.
- Jedna rezerwacja dotyczy jednego użytkownika, jednego seansu i jednego `screening_seat`.
- Fizyczne miejsce z tabeli `seats` może występować w wielu rekordach `screening_seats` dla różnych seansów.

## Znaczenie `ScreeningSeat`

`Seat` opisuje fizyczne miejsce w sali, np. `A1`.

`ScreeningSeat` jest kopią przypisania miejsca do konkretnego seansu. Dzięki temu rezerwacja odnosi się do miejsca w kontekście konkretnego seansu, a nie wyłącznie do fizycznego miejsca w sali.

## Statusy

### Reservation

- `HELD`
- `CONFIRMED`
- `CANCELLED`
- `EXPIRED`

### Screening

- `SCHEDULED`
- `CANCELLED`

## Najważniejsze ograniczenia logiczne

- aktywna rezerwacja oznacza status `HELD` lub `CONFIRMED`,
- jedno `ScreeningSeat` nie może posiadać dwóch aktywnych rezerwacji,
- jeden użytkownik nie może posiadać dwóch aktywnych rezerwacji na ten sam seans,
- użytkownik nie może posiadać aktywnych rezerwacji na nakładające się czasowo seanse,
- miejsce musi należeć do sali przypisanej do seansu,
- seanse w tej samej sali nie mogą nakładać się czasowo,
- dezaktywacja użytkownika anuluje jego przyszłe aktywne rezerwacje.
