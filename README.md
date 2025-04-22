# Subscription Management Dashboard

A full-stack application to track subscription services with renewal reminders and cost analysis.

## Getting Started

### Backend
Start the backend using Docker:
```bash
docker-compose up -d --build
```

### Frontend
Navigate to the frontend dircetory and start the dev server:
```bash
cd frontend
npm install
npm run dev
```

## Features

- Track monthly and yearly subscriptions
- Calculate renewal dates automatically
- View total monthly/annual costs
- CSV import for bulk uploading subscriptions

## Tech Stack

### Backend
- Django / Django REST Framework
- PostgreSQL
- Docker

### Frontend
- React
- Tailwind CSS
- Recharts for data visualization
- React Router for navigation
