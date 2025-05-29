# 🚉 RailSync
Project for Distributed System course

## 🐳 Commands
`./restart.sh`

### Start the application
`./start.sh`
or
`docker compose build`
`docker compose up -d`

### Stop the application
`./stop.sh`
or
`docker compose stop` (just stop containers)
`docker compose down` (stop containers and remove them and the networks)
`docker compose down --rmi all` (stop containers and remove containers and images)

## 🧪 Test
`docker exec -it railsync-backend-1 npm test`

## 🚀 Git Flow

This project uses **Git Flow** with the default settings.

### Main branches:
- `main`: contains production-ready code.
- `develop`: contains development code for the next release.

### Supporting branch types:
- `feature/*`: new features (e.g. `feature/login-page`)
- `release/*`: preparing a new release (e.g. `release/1.2.0`)
- `hotfix/*`: urgent fixes in production (e.g. `hotfix/fix-crash`)
- `support/*`: maintenance of legacy versions
- `bugfix/*`: minor bug fixes

Grazie, ho ora tutte le informazioni necessarie. Di seguito ti propongo la **documentazione in Markdown** delle API del tuo sistema di acquisto treni, suddivisa per prefisso di endpoint (`/api/users`, `/api/reservations`, ecc.), con:

* Metodo e path
* Descrizione
* Middleware richiesto (chi può accedere)
* Status code e messaggi associati

## 📘 API Documentation - Train Ticketing Backend

### `/api/users`

#### `POST /auth`

**Autenticazione dell'utente.**\
**Accesso:** Pubblico\
**Request:** JSON con `username`, `password`\
**Response:**

* `200 OK` – Restituisce JWT token e ID utente
* `400 Bad Request` – Username o password mancanti
* `401 Unauthorized` – Credenziali non valide
* `500 Internal Server Error` – Errore generico

---

#### `POST /`

**Creazione di un nuovo utente.**\
**Accesso:** Pubblico\
**Request:** JSON con dati utente\
**Response:**

* `201 Created` – Utente creato (senza password)
* `409 Conflict` – Username o email già esistenti
* `500 Internal Server Error` – Errore generico

---

#### `GET /`

**Ricerca utenti con filtri.**\
**Accesso:** `requireAuth`, `requireAdmin`\
**Query params:** `username`, `email`, `first_name`, `last_name`, `is_admin`\
**Response:**

* `200 OK` – Lista di utenti
* `500 Internal Server Error` – Errore generico

---

#### `GET /:userId`

**Ottieni informazioni su un utente specifico.**\
**Accesso:** `requireAuth`, `requireAdminOrSelf`\
**Response:**

* `200 OK` – Utente trovato
* `404 Not Found` – Utente non trovato
* `500 Internal Server Error` – Errore generico

---

#### `PATCH /:userId`

**Aggiorna dati utente.**\
**Accesso:** `requireAuth`, `requireAdminOrSelf`\
**Request:** JSON con campi modificabili\
**Response:**

* `200 OK` – Modifica effettuata / Nessuna modifica
* `400 Bad Request` – Nessun campo modificabile inviato
* `404 Not Found` – Utente non trovato
* `409 Conflict` – Email o username già presenti
* `500 Internal Server Error` – Errore generico

---

#### `DELETE /:userId`

**Elimina un utente.**\
**Accesso:** `requireAuth`, `requireAdminOrSelf`\
**Response:**

* `200 OK` – Utente eliminato
* `404 Not Found` – Utente non trovato
* `500 Internal Server Error` – Errore generico

---

#### `GET /:userId/reservations`

**Ottieni tutte le prenotazioni dell'utente.**\
**Accesso:** `requireAuth`, `requireAdminOrSelf`\
**Response:**

* `200 OK` – Lista prenotazioni
* `404 Not Found` – Utente non trovato
* `500 Internal Server Error` – Errore generico

---

#### `POST /:userId/reservations`

**Crea una nuova prenotazione per l'utente.**\
**Accesso:** `requireAuth`, `requireAdminOrSelf`\
**Request:** JSON con dati prenotazione\
**Response:**

* `201 Created` – Prenotazione creata
* `404 Not Found` – Utente non trovato
* `500 Internal Server Error` – Errore generico

---

### `/api/reservations`

#### `GET /`

**Ricerca prenotazioni con filtri.**\
**Accesso:** `requireAuth`, `requireAdmin`\
**Query params:** `origin`, `destination`, `status`\
**Response:**

* `200 OK` – Lista prenotazioni
* `500 Internal Server Error` – Errore generico

---

#### `GET /:reservationId`

**Ottieni dettagli di una prenotazione.**\
**Accesso:** `requireAuth`, `requireAdminOrReservationOwner`\
**Response:**

* `200 OK` – Prenotazione trovata
* `404 Not Found` – Prenotazione non trovata
* `500 Internal Server Error` – Errore generico

---

#### `DELETE /:reservationId`

**Elimina una prenotazione.**\
**Accesso:** `requireAuth`, `requireAdminOrReservationOwner`\
**Response:**

* `200 OK` – Prenotazione eliminata
* `404 Not Found` – Prenotazione non trovata
* `500 Internal Server Error` – Errore generico

---

### `/api/stations`

#### `GET /search`

**Cerca stazioni per nome.**\
**Accesso:** Pubblico\
**Query param:** `name`\
**Response:**

* `200 OK` – Lista stazioni
* `500 Internal Server Error` – Errore generico

---

### `/api/solutions`

#### `GET /`

**Trova soluzioni di viaggio tra due stazioni.**\
**Accesso:** Pubblico\
**Query params:** `fromStationId`, `toStationId`, `datetime`\
**Response:**

* `200 OK` – Lista soluzioni viaggio
* `400 Bad Request` – Parametri mancanti
* `500 Internal Server Error` – Errore generico

---

### Middleware di Accesso

| Middleware                       | Descrizione                                                          |
| -------------------------------- | -------------------------------------------------------------------- |
| `requireAuth`                    | L'utente deve essere autenticato tramite token JWT                   |
| `requireAdmin`                   | Solo gli amministratori possono accedere                             |
| `requireAdminOrSelf`             | Amministratori o l’utente stesso possono accedere                    |
| `requireAdminOrReservationOwner` | Amministratori o il proprietario della prenotazione possono accedere |
