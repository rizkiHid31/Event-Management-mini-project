# API Setup

## Prerequisites
- Node.js 18+
- PostgreSQL
- Redis

## Steps

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy environment file:
   ```bash
   cp .env.example .env
   # Edit .env with your actual values
   ```

3. Generate Prisma client (IMPORTANT — harus dilakukan sebelum dev):
   ```bash
   npx prisma generate
   ```

4. Run migrations:
   ```bash
   npx prisma migrate dev
   ```

5. Start development server:
   ```bash
   npm run dev
   ```

6. (Optional) Start order expiry worker:
   ```bash
   npm run worker
   ```

## API Endpoints

### Auth
- `POST /api/auth/register` — Register (body: name, email, password, role, usedReferralCode?)
- `POST /api/auth/login` — Login (body: email, password)

### Events (Public)
- `GET /api/events` — List with search/filter/pagination
- `GET /api/events/detail/:slug` — Event detail with reviews

### Events (Organizer)
- `POST /api/events` — Create (multipart, image field: "image")
- `PUT /api/events/:id` — Update
- `DELETE /api/events/:id` — Soft delete
- `GET /api/events/organizer/my-events` — My events
- `GET /api/events/organizer/stats` — Dashboard stats

### Orders (Customer)
- `POST /api/orders` — Create order (body: eventId, quantity)
- `GET /api/orders/my` — My orders
- `PUT /api/orders/:id/pay` — Pay order
- `PUT /api/orders/:id/cancel` — Cancel order

### Reviews (Customer)
- `POST /api/reviews` — Create review (body: eventId, rating, comment)
- `GET /api/reviews/event/:eventId` — Event reviews

### Users (Authenticated)
- `GET /api/users/profile` — Get profile
- `PUT /api/users/profile` — Update profile
