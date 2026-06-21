````md
# StayBook Backend

Backend API for StayBook, a small hotel room booking platform where guests can browse rooms, make reservations, and manage their bookings. Staff users can manage room inventory and review reservations.

## Stack

- NestJS
- Node.js
- PostgreSQL
- Sequelize
- JWT Authentication
- Swagger

## Database Setup

Before running the backend, create a PostgreSQL database called:

```sql
CREATE DATABASE "StayBook";
```
````

The backend expects this database to exist. If the database is not created first, the server will throw a database connection error.

## Environment Variables

Create a `.env` file in the root folder of the backend project.

I'll send the credentials in an email.

Update the database user and password depending on your local PostgreSQL configuration.

## Install Dependencies

```bash
npm install
```

## Run the Server

```bash
npm run start:dev
```

The backend will run at:

```bash
http://localhost:3000
```

## API Documentation

Once the server is running, the Swagger API documentation is available at:

```bash
http://localhost:3000/docs
```

From there, you can review and test the available endpoints.

## Run the Seeder

The project includes a seeder to create the initial data needed to use the app.

Run:

```bash
npm run seed
```

The seeder creates:

- 4 submodules
- 20 rooms
- 1 staff user
- 1 guest user

## Default Users

After running the seeder, you can use these accounts to test the API.

| Role  | Email                                   | Password    |
| ----- | --------------------------------------- | ----------- |
| STAFF | [staff@test.com](mailto:staff@test.com) | password123 |
| GUEST | [guest@test.com](mailto:guest@test.com) | password123 |

Passwords are stored hashed in the database.

## Full Local Setup Flow

Clone the repository and enter the backend folder:

```bash
git clone <repository-url>
cd <backend-folder>
```

Install dependencies:

```bash
npm install
```

Create the PostgreSQL database:

```sql
CREATE DATABASE "StayBook";
```

Create the `.env` file in the root folder and configure your database connection:

```env
PORT=3000

DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASS=your_password
DB_NAME=StayBook

JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=1d
```

Start the backend:

```bash
npm run start:dev
```

In another terminal, run the seeder:

```bash
npm run seed
```

Open the API documentation:

```bash
http://localhost:3000/docs
```

The backend should now be ready to use with the seeded staff and guest accounts.

## Available Scripts

Start the project in development mode:

```bash
npm run start:dev
```

Build the project:

```bash
npm run build
```

Run the production build:

```bash
npm run start:prod
```

Run the seeder:

```bash
npm run seed
```

Run lint:

```bash
npm run lint
```

Format the code:

```bash
npm run format
```

## Notes

- The database must be created before starting the backend.
- The seeder should be executed after the database connection is configured.
- Staff and guest users use the same login endpoint, but access is restricted by role.
- Swagger is available at `/docs`.
- Do not commit the `.env` file to the repository.

```

```
