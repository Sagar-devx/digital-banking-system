# Digital Banking System - Frontend

This is a professional React + Vite frontend built specifically to interface with the existing Digital Banking microservices backend.

## 🚀 Setup & Execution

### Prerequisites
- Node.js 18+
- The Backend Microservices must be running via Docker Compose (`docker-compose up -d`)

### Running the Frontend
1. Navigate to the `frontend` directory: `cd frontend`
2. Install dependencies: `npm install`
3. Create `.env` file (if not exists) and set API URL: `VITE_API_BASE_URL=http://localhost:8080`
4. Run the development server: `npm run dev`
5. Open browser: `http://localhost:5173`

## 🏗️ Architectural Decisions

After thoroughly analyzing the backend, the following capabilities were identified and integrated:

1. **Authentication (Account Access Pattern)**
   - *Backend reality:* The backend has NO Spring Security, NO User entity, and NO JWT endpoints.
   - *Frontend solution:* Instead of faking a login/registration flow that has no backend support, the frontend uses an "Account Access" pattern. Users can enter an existing `accountNumber` to access the dashboard, simulating session persistence via `localStorage`.
2. **Saga Pattern & Distributed Transactions**
   - The transfer flow fully integrates with the backend Saga pattern.
   - We implemented a visual **Saga Processing Timeline** on the Transaction Details page to demonstrate the async workflow (Initiated -> Fraud Check -> OTP -> Completed/Refunded).
3. **Event-Driven OTP (Kafka & Redis)**
   - When a transfer triggers a fraud alert, the backend creates an OTP in Redis and publishes to Kafka. The frontend naturally blocks the UI and requires OTP verification before the transfer can complete.
4. **Polling for Real-Time Status**
   - *Backend reality:* No WebSockets/SSE exposed.
   - *Frontend solution:* Implemented intelligent interval polling during transfers to simulate real-time status updates as Kafka events propagate between services.
5. **System Health Monitor**
   - Built a `/system` page to ping all backend Actuator `/health` endpoints to prove the microservice infrastructure is running.
6. **Payment Gateway Integration**
   - Implemented real integration with Razorpay JS SDK interacting with the Payment Service's `/create-order` endpoint.

## 📁 Project Structure

```
src/
├── api/          # Axios configuration and API wrapper classes (accountApi, transactionApi, paymentApi)
├── components/   # Reusable UI components
├── context/      # React Context (AccountContext for state management)
├── layouts/      # Dashboard and Main public layouts
├── pages/        # Main route pages (Landing, Dashboard, Transfer, Transactions, SystemHealth, etc.)
└── utils/        # Utility functions (cn for Tailwind merging)
```

## 🛠️ Tech Stack
- **React 18** + **Vite**
- **Tailwind CSS v4** (Modern utility-first styling)
- **Lucide React** (Professional crisp icons)
- **React Router v6** (Client-side routing)
- **Axios** (API communication)
