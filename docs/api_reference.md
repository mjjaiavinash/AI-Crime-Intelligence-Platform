# API Reference

## Auth
| Method | Endpoint            | Description          |
|--------|---------------------|----------------------|
| POST   | /api/v1/auth/login  | Login, returns JWT   |
| GET    | /api/v1/auth/me     | Get current user     |

## Crimes
| Method | Endpoint              | Description          |
|--------|-----------------------|----------------------|
| GET    | /api/v1/crimes        | List crimes          |
| POST   | /api/v1/crimes        | Create crime record  |
| GET    | /api/v1/crimes/{id}   | Get crime by ID      |
| PUT    | /api/v1/crimes/{id}   | Update crime         |
| DELETE | /api/v1/crimes/{id}   | Delete crime         |

## Analytics
| Method | Endpoint                    | Description              |
|--------|-----------------------------|--------------------------|
| GET    | /api/v1/analytics/hotspots  | Crime hotspot clusters   |
| GET    | /api/v1/analytics/trends    | Monthly crime trends     |
| GET    | /api/v1/analytics/network   | Suspect-crime graph data |

## Reports
| Method | Endpoint              | Description                  |
|--------|-----------------------|------------------------------|
| POST   | /api/v1/reports       | Generate AI report           |
| GET    | /api/v1/reports/{id}  | Download generated report    |
