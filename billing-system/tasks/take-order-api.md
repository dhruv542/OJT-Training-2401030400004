Task: Provide an API for receiving orders from external applications

Location: project root (routes are in `routes/orderRoutes.js`)

Overview:
- Add a POST endpoint `/api/orders` that external applications can call to submit orders.
- Endpoint validates required fields, checks that the `customerId` exists, and creates an `Order` record.
- Server is configured to accept cross-origin requests via CORS so other applications can call the API.

Endpoint:
- POST /api/orders
- Content-Type: application/json

Request body example:
{
  "customerId": 1,
  "product": "Mouse",
  "quantity": 2,
  "amount": 1000
}

Responses:
- 201 Created: returns the created order document
- 400 Bad Request: missing required fields
- 404 Not Found: referenced customer not found
- 500 Internal Server Error: server error

Notes for integrators:
- If you run the app locally without a MongoDB instance, the project will automatically start an in-memory MongoDB (mongodb-memory-server).
- Start the server with:

```bash
npm install
node server.js
```

- Example curl call:

```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{"customerId":1,"product":"Keyboard","quantity":1,"amount":2000}'
```

Next steps (optional):
- Add authentication (API key / JWT) for production use.
- Add request schema validation (Joi or express-validator) for stronger checks.
- Add automated tests for the endpoint.
