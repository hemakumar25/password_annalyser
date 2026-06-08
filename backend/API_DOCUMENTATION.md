# Backend API Documentation

## Authentication

### Register
- Endpoint: `POST /api/auth/register`
- Body:
  - `email` (string)
  - `password` (string)
- Response:
  - `email`
  - `token`

### Login
- Endpoint: `POST /api/auth/login`
- Body:
  - `email` (string)
  - `password` (string)
- Response:
  - `email`
  - `token`

## Password Analysis

### Analyze password
- Endpoint: `POST /api/analysis`
- Headers:
  - `Authorization: Bearer <token>`
- Body:
  - `password` (string)
- Response:
  - `score` (0-100)
  - `entropy`
  - `crackTime`
  - `strength`
  - `suggestions`

### Get history
- Endpoint: `GET /api/analysis`
- Headers:
  - `Authorization: Bearer <token>`
- Response: array of saved analysis records
