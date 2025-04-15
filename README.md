# 🚉 RailSync
Project for Distributed System course

## 🐳 Commands

### Start the application

`docker compose build`

`docker compose up -d`


### Stop the application
`docker compose stop` (just stop containers)

`docker compose down` (stop containers and remove them and the networks)

`docker compose down --rmi all` (stop containers and remove containers and images)

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