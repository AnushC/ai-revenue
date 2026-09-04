# RevenueAI

> AI-assisted revenue recovery with deterministic guardrails and human oversight.

RevenueAI is a full-stack platform for managing revenue at risk from failed subscription payments. It analyzes payment failures, recommends recovery actions, validates them against business rules, [...]

The main idea is simple: **AI can recommend an action, but it does not get unrestricted execution authority.**

---

## What it does

RevenueAI handles cases such as:

- Bank-declined payments
- Expired cards
- Insufficient funds
- Authentication failures
- Suspicious transactions
- High-value recovery cases

For each case, the system can recommend actions such as retrying the payment, sending a payment link, waiting and retrying, requesting authentication, or escalating the case for manual review.

---

## How it works

```text
Payment Failure
      │
      ▼
 Revenue Risk
      │
      ▼
Gemini Analysis
      │
      ▼
Policy Engine
      │
 ┌────┴──────────┐
 ▼               ▼
Approve       Human Review
 │               │
 └───────┬───────┘
         ▼
 Recovery Action
         │
         ▼
 Recovery Outcome
         │
    ┌────┴────┐
    ▼         ▼
Analytics   Audit Log
```

### AI + Guardrails

Gemini analyzes the case and provides:

- Diagnosis
- Recommended action
- Reasoning
- Confidence score

The recommendation then goes through a deterministic policy layer.

Cases can be **approved, blocked, or sent for human review** depending on conditions such as fraud risk, AI confidence, recovery attempts, and transaction value.

---

## Key Features

- Gemini-powered revenue risk analysis
- Automated recovery recommendations
- Deterministic policy engine
- Human-in-the-loop approval
- Single and batch recovery workflows
- Revenue recovery analytics
- Complete audit trail
- JWT authentication
- Role-based authorization
- Fallback rules when AI is unavailable

---

## Safety Rules

The recovery engine includes several guardrails:

```text
Maximum recovery attempts     → Stop repeated retries
Fraud suspected               → Human review
Unknown failure               → Human review
Amount ≥ ₹25,000              → Human review
Low AI confidence             → Human review
Recovered / Lost / Stopped    → No further execution
```

This keeps the AI recommendation layer separate from the final execution decision.

---

## Tech Stack

### Backend
`Java` `Spring Boot` `Spring Security` `Spring Data JPA` `Spring AI`

### AI
`Google Gemini`

### Database
`PostgreSQL`

### Frontend
`React` `Vite` `Tailwind CSS` `Axios` `Recharts`

### Security
`JWT` `BCrypt` `Role-Based Access Control`

---

## Project Structure

```text
ai-revenue/
│
├── src/main/java/org/example/app/
│   ├── agent/
│   ├── config/
│   ├── controller/
│   ├── dto/
│   ├── entity/
│   ├── repository/
│   ├── security/
│   └── services/
│
├── revenue-recovery-frontend/
│   └── src/
│       ├── api/
│       ├── components/
│       ├── context/
│       ├── layout/
│       └── pages/
│
├── pom.xml
└── README.md
```

---

## Running Locally

### Requirements

Make sure you have:

- Java
- Maven
- PostgreSQL
- Node.js + npm
- Gemini API key

### 1. Configure Gemini

Set your API key as an environment variable:

```bash
GOOGLE_API_KEY=your_api_key
```

Spring Boot reads it using:

```properties
spring.ai.google.genai.api-key=${GOOGLE_API_KEY}
```

> Never commit API keys, database passwords, JWT secrets, or `.env` files.

### 2. Start the backend

```bash
mvn spring-boot:run
```

### 3. Start the frontend

```bash
cd revenue-recovery-frontend
npm install
npm run dev
```

Frontend:

```text
http://localhost:5173
```

---

## Recovery Flow

A typical case moves through:

```text
OPEN
  ↓
AI Analysis
  ↓
Policy Validation
  ↓
IN_RECOVERY
  ↓
RECOVERED / FAILED
```

Sensitive cases are redirected to:

```text
HUMAN_REVIEW
     ↓
Approve / Reject
```

All important decisions and recovery outcomes are recorded in the audit log.

---
## Login Details

```text
-username:- admin2@revenueai.com
- password:- Admin@123
```

## Dashboard

The dashboard tracks:

- Revenue at risk
- Revenue recovered
- Recovery rate
- Open cases
- Successful recoveries
- Failed recoveries
- Recovery attempts

This makes it possible to measure the result of the recovery workflow instead of only generating AI recommendations.

---

### Screenshots

Below are screenshots from the app UI. 


_Figure: Recovery Overview — shows revenue at risk, recovered revenue, recovery rate and the Gemini agent panel._


<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/24a0d446-8263-4aee-99bb-7ba6190398e8" />


_Figure: Audit Log — shows AI decisions, policy actions, fallbacks, and recovery outcomes._
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/ca3ece58-6bee-437b-a6fd-ae157964bf11" />

---

## Current Scope

Recovery execution is currently **simulated**. The project demonstrates the complete decision and recovery workflow without initiating real financial transactions.

A production version could integrate payment-provider APIs, webhooks, scheduled retries, notifications, queues, monitoring, and stronger secrets management.

---

## Author

**Anush Chawla**

GitHub: `@AnushC`

---

### Note

RevenueAI is a prototype built to explore how AI recommendations, deterministic business rules, and human approval can work together in a financial recovery system.
