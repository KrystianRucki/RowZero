TRUNCATE TABLE
    notifications,
    reservations,
    screening_seats,
    screenings,
    seats,
    halls,
    movies,
    users
RESTART IDENTITY CASCADE;

INSERT INTO users (
    id,
    email,
    password_hash,
    role,
    enabled,
    created_at
) VALUES
      (
          1,
          'admin@rowzero.demo',
          '{bcrypt}$2y$10$4/Jsft/9v4KzxWO2njHIOOdzTvaBqH25O2x.mPv.RpfHD9P2wuWE.',
          'ADMIN',
          TRUE,
          NOW()
      ),
      (
          2,
          'user1@rowzero.demo',
          '{bcrypt}$2y$10$NOG8Vwuuj6uGOGdaIp5HcO5Hs5bIfnbcedodGz7pd2K4rpS5uRL8q',
          'USER',
          TRUE,
          NOW()
      ),
      (
          3,
          'user2@rowzero.demo',
          '{bcrypt}$2y$10$NOG8Vwuuj6uGOGdaIp5HcO5Hs5bIfnbcedodGz7pd2K4rpS5uRL8q',
          'USER',
          TRUE,
          NOW()
      );

INSERT INTO movies (
    id,
    tmdb_id,
    title,
    original_title,
    overview,
    release_date,
    runtime,
    poster_path,
    backdrop_path,
    visible,
    last_synced_at
) VALUES
      (
          1,
          1137350,
          'The Phoenician Scheme',
          'The Phoenician Scheme',
          'Wealthy businessman Zsa-zsa Korda appoints his only daughter, a nun, as sole heir to his estate. As Korda embarks on a new enterprise, they soon become the target of scheming tycoons, foreign terrorists, and determined assassins.',
          '2025-05-23',
          102,
          '/iXxIUVqpQAlyy98UjUlzjkMYuj6.jpg',
          '/bajke0ThKJ2V2iHE9DDYOJGdS7a.jpg',
          TRUE,
          '2026-11-21T00:12:52.275268Z'
      ),
      (
          2,
          1124566,
          'Sentimental Value',
          'Affeksjonsverdi',
          'Sisters Nora and Agnes reunite with their estranged father, the charismatic Gustav, a once-renowned director who offers stage actress Nora a role in what he hopes will be his comeback film. When Nora turns it down, she soon discovers he has given her part to an eager young Hollywood star.',
          '2025-08-20',
          133,
          '/AcbS8VMysrTpG9r4dgK1oyLsKYn.jpg',
          '/mDIMSMXFkOXUyQ2lnmeBu6kDUCH.jpg',
          TRUE,
          '2026-11-21T00:12:59.614104Z'
      ),
      (
          3,
          1220564,
          'The Secret Agent',
          'O Agente Secreto',
          'Brazil, 1977. Marcelo, a technology expert in his early 40s, is on the run. Hoping to reunite with his son, he travels to Recife during Carnival but soon realizes that the city is not the safe haven he was expecting.',
          '2025-07-23',
          161,
          '/iLE2YOmeboeTDC7GlOp1dzh1VFo.jpg',
          '/eeGRpU64sIrRApjWXvTpK5Lep2K.jpg',
          TRUE,
          '2026-11-21T00:13:08.954849Z'
      ),
      (
          4,
          1254808,
          'Nouvelle Vague',
          'Nouvelle Vague',
          'After writing for Cahiers du cinéma, young Godard decides making films is the best film criticism. He gets Beauregard to fund a low-budget feature, creating a treatment with Truffaut about a gangster couple.',
          '2025-10-08',
          106,
          '/AfE7DZ0DPgme6I58dlYp1Bo9xeN.jpg',
          '/c15Fg4jvclF5VjxCi1mtjUg4a6H.jpg',
          TRUE,
          '2026-11-21T00:13:14.336311Z'
      ),
      (
          5,
          891584,
          'The History of Sound',
          'The History of Sound',
          'In 1917, two young music students attending the Boston Conservatory bond over a mutual love of folk music. They reconnect a few years later, embarking on a song-collecting trip in the backwaters of Maine.',
          '2025-09-12',
          128,
          '/55of0Vy7m32hSRZKsCyyDjZn4AC.jpg',
          '/e13Io18jl6p5UiS5Cxhug9ptTPU.jpg',
          TRUE,
          '2026-11-21T00:13:20.702483Z'
      ),
      (
          6,
          950028,
          'The Invite',
          'The Invite',
          'Joe and Angela''s marriage is on thin ice. When they invite their enigmatic upstairs neighbors for a dinner party, the night spirals into unexpected places. Have they reignited the spark or lit the match that burns it all down?',
          '2026-06-25',
          107,
          '/b7Dr8Chzse8VagexAporUu2RtLx.jpg',
          '/lEwqBGNR65KZv6Ej5ufcmhZu2y2.jpg',
          TRUE,
          '2026-11-21T00:34:42.661664Z'
      ),
      (
          7,
          1765072,
          'You Can See Everything',
          'You Can See Everything',
          'Thirty-four days before she''s sent to prison, notorious Silicon Valley founder Elizabeth Holmes invites a skeptical film crew to document her every move. What begins as an intimate portrait of an enigmatic felon becomes a mind-bending three-year journey into the abyss.',
          '2026-10-16',
          175,
          '/mVh3qkw2NUFxWWyF0G1hg2Wh0K5.jpg',
          '/rrbbzCyS45yooXpUGJatfptlHYI.jpg',
          TRUE,
          '2026-11-21T00:33:26.425447Z'
      ),
      (
          8,
          961077,
          'The Little Sister',
          'La Petite Dernière',
          'When Fatima leaves her close-knit suburban family to study philosophy in Paris, she finds herself caught between her religious upbringing and the freedom of student life in the city.',
          '2025-10-22',
          112,
          '/gzTNITDGOjgrd3QPJfuqSYCjDls.jpg',
          '/vzIKxaav4Q5KBDDfYpphMzRQEOG.jpg',
          TRUE,
          '2026-11-21T00:13:49.414927Z'
      ),
      (
          9,
          1456349,
          'It Was Just an Accident',
          'Un simple accident',
          'An unassuming mechanic is reminded of his time in an Iranian prison when he encounters a man he suspects to be his sadistic jailhouse captor.',
          '2025-10-01',
          103,
          '/eNYGj2DG3n8OrVPTfYunpPW9uas.jpg',
          '/zhoMwQofjgVec5Sin05hWECJtVQ.jpg',
          TRUE,
          '2026-11-21T00:13:56.704494Z'
      ),
      (
          10,
          648878,
          'Eddington',
          'Eddington',
          'In May of 2020, a standoff between a small-town sheriff and mayor sparks a powder keg as neighbor is pitted against neighbor in Eddington, New Mexico.',
          '2025-07-16',
          148,
          '/4GIqZUgPZ146BhibsPHMHef2nXX.jpg',
          '/znr3SYHph3FtTLpcFTeuMAAJ5mP.jpg',
          TRUE,
          '2026-11-21T00:14:04.327748Z'
      ),
      (
          11,
          1033148,
          'Die My Love',
          'Die My Love',
          'After inheriting a remote Montana house, Jackson moves there from New York with his partner Grace, and the couple soon welcome a child. As Jackson becomes increasingly absent and rural isolation sets in, Grace struggles with loneliness, creative frustration, and unresolved emotional wounds. What begins as an attempt at renewal gradually turns into an intense psychological descent, placing strain on their relationship and exposing the fragile balance between love, identity, and motherhood.',
          '2025-11-04',
          119,
          '/kajpShbFhOdpl6yCrLezMrr9tB4.jpg',
          '/dEkFlZzj2cb5F7SShvqkL54E4lr.jpg',
          TRUE,
          '2026-11-21T00:14:08.950102Z'
      );

INSERT INTO halls (
    id,
    name
) VALUES
      (1, 'Grand Hall'),
      (2, 'Studio Hall'),
      (3, 'Screening Room');

INSERT INTO seats (
    hall_id,
    row_label,
    number,
    active
)
SELECT
    1,
    CHR(64 + row_number),
    seat_number,
    TRUE
FROM generate_series(1, 10) AS row_number
         CROSS JOIN generate_series(1, 12) AS seat_number;

INSERT INTO seats (
    hall_id,
    row_label,
    number,
    active
)
SELECT
    2,
    CHR(64 + row_number),
    seat_number,
    TRUE
FROM generate_series(1, 6) AS row_number
         CROSS JOIN generate_series(1, 8) AS seat_number;

INSERT INTO seats (
    hall_id,
    row_label,
    number,
    active
)
SELECT
    3,
    CHR(64 + row_number),
    seat_number,
    TRUE
FROM generate_series(1, 4) AS row_number
         CROSS JOIN generate_series(1, 5) AS seat_number;

INSERT INTO screenings (
    id,
    movie_id,
    hall_id,
    start_at,
    end_at,
    status
) VALUES
      (
          1,
          1,
          1,
          ((CURRENT_DATE + 7) + TIME '10:00') AT TIME ZONE 'Europe/Warsaw',
          (((CURRENT_DATE + 7) + TIME '10:00') AT TIME ZONE 'Europe/Warsaw') + INTERVAL '102 minutes',
          'SCHEDULED'
      ),
      (
          2,
          2,
          1,
          ((CURRENT_DATE + 7) + TIME '13:30') AT TIME ZONE 'Europe/Warsaw',
          (((CURRENT_DATE + 7) + TIME '13:30') AT TIME ZONE 'Europe/Warsaw') + INTERVAL '133 minutes',
          'SCHEDULED'
      ),
      (
          3,
          3,
          1,
          ((CURRENT_DATE + 7) + TIME '18:00') AT TIME ZONE 'Europe/Warsaw',
          (((CURRENT_DATE + 7) + TIME '18:00') AT TIME ZONE 'Europe/Warsaw') + INTERVAL '161 minutes',
          'SCHEDULED'
      ),
      (
          4,
          4,
          2,
          ((CURRENT_DATE + 7) + TIME '10:30') AT TIME ZONE 'Europe/Warsaw',
          (((CURRENT_DATE + 7) + TIME '10:30') AT TIME ZONE 'Europe/Warsaw') + INTERVAL '106 minutes',
          'SCHEDULED'
      ),
      (
          5,
          5,
          2,
          ((CURRENT_DATE + 7) + TIME '14:00') AT TIME ZONE 'Europe/Warsaw',
          (((CURRENT_DATE + 7) + TIME '14:00') AT TIME ZONE 'Europe/Warsaw') + INTERVAL '128 minutes',
          'SCHEDULED'
      ),
      (
          6,
          6,
          2,
          ((CURRENT_DATE + 7) + TIME '18:30') AT TIME ZONE 'Europe/Warsaw',
          (((CURRENT_DATE + 7) + TIME '18:30') AT TIME ZONE 'Europe/Warsaw') + INTERVAL '107 minutes',
          'SCHEDULED'
      ),
      (
          7,
          7,
          3,
          ((CURRENT_DATE + 7) + TIME '11:00') AT TIME ZONE 'Europe/Warsaw',
          (((CURRENT_DATE + 7) + TIME '11:00') AT TIME ZONE 'Europe/Warsaw') + INTERVAL '175 minutes',
          'SCHEDULED'
      ),
      (
          8,
          8,
          3,
          ((CURRENT_DATE + 7) + TIME '15:00') AT TIME ZONE 'Europe/Warsaw',
          (((CURRENT_DATE + 7) + TIME '15:00') AT TIME ZONE 'Europe/Warsaw') + INTERVAL '112 minutes',
          'SCHEDULED'
      ),
      (
          9,
          9,
          3,
          ((CURRENT_DATE + 7) + TIME '19:00') AT TIME ZONE 'Europe/Warsaw',
          (((CURRENT_DATE + 7) + TIME '19:00') AT TIME ZONE 'Europe/Warsaw') + INTERVAL '103 minutes',
          'SCHEDULED'
      ),
      (
          10,
          10,
          1,
          ((CURRENT_DATE + 8) + TIME '10:00') AT TIME ZONE 'Europe/Warsaw',
          (((CURRENT_DATE + 8) + TIME '10:00') AT TIME ZONE 'Europe/Warsaw') + INTERVAL '148 minutes',
          'SCHEDULED'
      ),
      (
          11,
          11,
          1,
          ((CURRENT_DATE + 8) + TIME '14:00') AT TIME ZONE 'Europe/Warsaw',
          (((CURRENT_DATE + 8) + TIME '14:00') AT TIME ZONE 'Europe/Warsaw') + INTERVAL '119 minutes',
          'SCHEDULED'
      ),
      (
          12,
          2,
          1,
          ((CURRENT_DATE + 8) + TIME '18:00') AT TIME ZONE 'Europe/Warsaw',
          (((CURRENT_DATE + 8) + TIME '18:00') AT TIME ZONE 'Europe/Warsaw') + INTERVAL '133 minutes',
          'SCHEDULED'
      ),
      (
          13,
          3,
          2,
          ((CURRENT_DATE + 8) + TIME '10:30') AT TIME ZONE 'Europe/Warsaw',
          (((CURRENT_DATE + 8) + TIME '10:30') AT TIME ZONE 'Europe/Warsaw') + INTERVAL '161 minutes',
          'SCHEDULED'
      ),
      (
          14,
          1,
          2,
          ((CURRENT_DATE + 8) + TIME '15:00') AT TIME ZONE 'Europe/Warsaw',
          (((CURRENT_DATE + 8) + TIME '15:00') AT TIME ZONE 'Europe/Warsaw') + INTERVAL '102 minutes',
          'SCHEDULED'
      ),
      (
          15,
          4,
          2,
          ((CURRENT_DATE + 8) + TIME '19:00') AT TIME ZONE 'Europe/Warsaw',
          (((CURRENT_DATE + 8) + TIME '19:00') AT TIME ZONE 'Europe/Warsaw') + INTERVAL '106 minutes',
          'SCHEDULED'
      ),
      (
          16,
          6,
          3,
          ((CURRENT_DATE + 8) + TIME '11:00') AT TIME ZONE 'Europe/Warsaw',
          (((CURRENT_DATE + 8) + TIME '11:00') AT TIME ZONE 'Europe/Warsaw') + INTERVAL '107 minutes',
          'SCHEDULED'
      ),
      (
          17,
          7,
          3,
          ((CURRENT_DATE + 8) + TIME '15:00') AT TIME ZONE 'Europe/Warsaw',
          (((CURRENT_DATE + 8) + TIME '15:00') AT TIME ZONE 'Europe/Warsaw') + INTERVAL '175 minutes',
          'SCHEDULED'
      ),
      (
          18,
          5,
          3,
          ((CURRENT_DATE + 8) + TIME '19:00') AT TIME ZONE 'Europe/Warsaw',
          (((CURRENT_DATE + 8) + TIME '19:00') AT TIME ZONE 'Europe/Warsaw') + INTERVAL '128 minutes',
          'SCHEDULED'
      ),
      (
          19,
          9,
          1,
          ((CURRENT_DATE + 9) + TIME '10:00') AT TIME ZONE 'Europe/Warsaw',
          (((CURRENT_DATE + 9) + TIME '10:00') AT TIME ZONE 'Europe/Warsaw') + INTERVAL '103 minutes',
          'SCHEDULED'
      ),
      (
          20,
          10,
          1,
          ((CURRENT_DATE + 9) + TIME '13:30') AT TIME ZONE 'Europe/Warsaw',
          (((CURRENT_DATE + 9) + TIME '13:30') AT TIME ZONE 'Europe/Warsaw') + INTERVAL '148 minutes',
          'SCHEDULED'
      ),
      (
          21,
          3,
          1,
          ((CURRENT_DATE + 9) + TIME '18:00') AT TIME ZONE 'Europe/Warsaw',
          (((CURRENT_DATE + 9) + TIME '18:00') AT TIME ZONE 'Europe/Warsaw') + INTERVAL '161 minutes',
          'SCHEDULED'
      ),
      (
          22,
          8,
          2,
          ((CURRENT_DATE + 9) + TIME '10:30') AT TIME ZONE 'Europe/Warsaw',
          (((CURRENT_DATE + 9) + TIME '10:30') AT TIME ZONE 'Europe/Warsaw') + INTERVAL '112 minutes',
          'SCHEDULED'
      ),
      (
          23,
          11,
          2,
          ((CURRENT_DATE + 9) + TIME '14:30') AT TIME ZONE 'Europe/Warsaw',
          (((CURRENT_DATE + 9) + TIME '14:30') AT TIME ZONE 'Europe/Warsaw') + INTERVAL '119 minutes',
          'SCHEDULED'
      ),
      (
          24,
          2,
          2,
          ((CURRENT_DATE + 9) + TIME '18:30') AT TIME ZONE 'Europe/Warsaw',
          (((CURRENT_DATE + 9) + TIME '18:30') AT TIME ZONE 'Europe/Warsaw') + INTERVAL '133 minutes',
          'SCHEDULED'
      ),
      (
          25,
          4,
          3,
          ((CURRENT_DATE + 9) + TIME '11:00') AT TIME ZONE 'Europe/Warsaw',
          (((CURRENT_DATE + 9) + TIME '11:00') AT TIME ZONE 'Europe/Warsaw') + INTERVAL '106 minutes',
          'SCHEDULED'
      ),
      (
          26,
          1,
          3,
          ((CURRENT_DATE + 9) + TIME '14:30') AT TIME ZONE 'Europe/Warsaw',
          (((CURRENT_DATE + 9) + TIME '14:30') AT TIME ZONE 'Europe/Warsaw') + INTERVAL '102 minutes',
          'SCHEDULED'
      ),
      (
          27,
          7,
          3,
          ((CURRENT_DATE + 9) + TIME '18:00') AT TIME ZONE 'Europe/Warsaw',
          (((CURRENT_DATE + 9) + TIME '18:00') AT TIME ZONE 'Europe/Warsaw') + INTERVAL '175 minutes',
          'SCHEDULED'
      );

INSERT INTO screening_seats (
    screening_id,
    seat_id
)
SELECT
    screening.id,
    seat.id
FROM screenings AS screening
         JOIN seats AS seat
              ON seat.hall_id = screening.hall_id
WHERE seat.active = TRUE;

SELECT setval(
               pg_get_serial_sequence('users', 'id'),
               (SELECT MAX(id) FROM users),
               TRUE
       );

SELECT setval(
               pg_get_serial_sequence('movies', 'id'),
               (SELECT MAX(id) FROM movies),
               TRUE
       );

SELECT setval(
               pg_get_serial_sequence('halls', 'id'),
               (SELECT MAX(id) FROM halls),
               TRUE
       );

SELECT setval(
               pg_get_serial_sequence('screenings', 'id'),
               (SELECT MAX(id) FROM screenings),
               TRUE
       );
