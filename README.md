# E-commerce Training API

Backend for the React frontend training course.

- **Lecture 1** covers **Authentication + Role-Based Access Control**.
- **Lecture 2** covers **Products** (public search/filter/pagination + admin CRUD).

Later lectures will add cart, orders, and reviews on top of this same project.

## Tech Stack

- Node.js + Express
- MongoDB + Mongoose
- JWT (`jsonwebtoken`) for authentication
- `bcryptjs` for password hashing
- `express-validator` for input validation

## Project Structure

```
Backend/
  server.js                  # entry point
  src/
    app.js                   # express app setup (middleware, routes)
    config/
      db.js                  # MongoDB connection
    models/
      User.js
      Product.js
    controllers/
      authController.js
      productController.js
    routes/
      index.js               # mounts /api/* route groups
      authRoutes.js
      productRoutes.js
    middleware/
      auth.js                # protect, isAdmin
      validate.js            # express-validator error formatter
      errorHandler.js        # central error handler
      notFound.js            # 404 handler
    validators/
      authValidators.js
      productValidators.js
    utils/
      AppError.js
      asyncHandler.js
      generateToken.js
    seed/
      seed.js
      products.js             # product seed data, imported by seed.js
  postman/
    Lecture1-Authentication.postman_collection.json
    Lecture1-Environment.postman_environment.json
    Lecture2-Products.postman_collection.json
```

Future lectures should add their own `models/`, `controllers/`, `routes/`, and
`validators/` files following the same pattern, then mount the new route file
in `src/routes/index.js`.

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy the example environment file and fill in your own values:

   ```bash
   cp .env.example .env
   ```

   | Variable      | Description                                        |
   | ------------- | --------------------------------------------------- |
   | `PORT`        | Port the API listens on (default `5000`)             |
   | `NODE_ENV`    | `development` or `production`                        |
   | `MONGO_URI`   | MongoDB connection string                             |
   | `JWT_SECRET`  | Long random string used to sign JWTs                  |
   | `JWT_EXPIRE`  | Token lifetime, e.g. `7d`, `1h`                        |

   You'll need a running MongoDB instance (local install or a free
   [MongoDB Atlas](https://www.mongodb.com/atlas) cluster) and put its
   connection string in `MONGO_URI`.

3. Seed the database with test users and sample products:

   ```bash
   npm run seed
   ```

   This creates:

   | Role  | Email             | Password  |
   | ----- | ----------------- | --------- |
   | admin | admin@test.com    | Admin123  |
   | user  | user1@test.com    | User1123  |
   | user  | user2@test.com    | User2123  |

   ...plus 14 sample products spread across 4 categories (Electronics,
   Clothing, Home & Kitchen, Sports & Outdoors), 4 of them marked as featured.

4. Run the server:

   ```bash
   npm run dev    # with nodemon, auto-restarts on file changes
   # or
   npm start      # plain node
   ```

   The API will be available at `http://localhost:5000/api`.

## Endpoints (Lecture 1)

| Method | Route              | Access         | Description                          |
| ------ | ------------------- | -------------- | ------------------------------------- |
| POST   | `/api/auth/register` | Public         | Create a new account (always role `user`) |
| POST   | `/api/auth/login`    | Public         | Log in and receive a JWT              |
| GET    | `/api/auth/me`        | Private (JWT)  | Get the current logged-in user        |
| POST   | `/api/auth/logout`    | Private (JWT)  | Stateless logout (see code comments)  |

## Endpoints (Lecture 2)

| Method | Route                          | Access             | Description                                                    |
| ------ | ------------------------------ | ------------------ | ---------------------------------------------------------------- |
| GET    | `/api/products`                | Public             | Paginated product list — `search`, `category`, `minPrice`, `maxPrice`, `sort`, `page`, `limit`, `featured` query params |
| GET    | `/api/products/categories/list`| Public             | Distinct list of category names                                |
| GET    | `/api/products/:id`            | Public             | Single product by id                                            |
| POST   | `/api/products`                | Private/Admin      | Create a product                                                |
| PUT    | `/api/products/:id`            | Private/Admin      | Update a product                                                |
| DELETE | `/api/products/:id`            | Private/Admin      | Delete a product                                                |

Admin routes are protected with `protect` + `isAdmin`: no token → `401`,
valid token but role `"user"` → `403`.

All responses (both lectures) follow one of these two shapes:

```jsonc
// success
{ "success": true, "data": { ... } }

// error
{ "success": false, "message": "Human readable message", "errors": [] }
```

## Postman

Import the collection(s) you need from the `postman/` folder into Postman:

- `Lecture1-Authentication.postman_collection.json` + `Lecture1-Environment.postman_environment.json` (`baseUrl` + `token` variables) — Register/Login/Me/Logout.
  Run **Login** (or **Register**) first - its test script automatically saves the returned JWT into the `token` variable, which the protected requests (`Me`, `Logout`) use automatically via Bearer auth.
- `Lecture2-Products.postman_collection.json` — all Products endpoints, including separate example requests showing `search`, `category`, price range, `sort`, pagination, and `featured` in action. This collection carries its own `baseUrl` + `token` collection variables and a **Setup → Admin Login** request, so it works standalone even without importing Lecture 1. Run that Admin Login request once before trying **Create/Update/Delete Product**.
