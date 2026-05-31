# Ecolumea Webshop MVP

Dieses Projekt wurde im Modul DLBITPEWP01-01 im Rahemen des Studiengangs Softwareentwicklung an der IU umgestzt. Ziel war die Umsetzung eines nachhaltigkeitsorientierten Webshops als MVP. Es umfasst einen Angular-Frontend-Client, ein Spring-Boot-Backend und eine SQLite-Datenbank. 

## Stack
- Angular (Frontend)
- Spring Boot (Backend)
- SQLite (Datenbank)
- Tailwind CSS (UI)

## Funktionen 
- Produktkatalog, Produktdetailansicht, Kategorien
- Warenkorb und Checkout
- Admin-Bereich: Produkte, Kategorien, Angebote, Bestellungen, Nutzer Medienverwaltung für Produktbilder

## Starten

### Docker
```bash
docker-compose up --build
```

### Lokal starten (Alternative)
Voraussetzungen: Java 21+, Maven, Node.js 20+

Backend:
```powershell
cd backend
mvn spring-boot:run
```

Frontend:
```powershell
cd frontend
npm install
npm start
```
#### Logindaten Admin
Username: admin@ecolumea.de  
Passwort: Admin1234