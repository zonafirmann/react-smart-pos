# 🛒 Enterprise Smart POS Dashboard (AI-Ready)

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Google Gemini](https://img.shields.io/badge/Google%20Gemini-8E75C2?style=for-the-badge&logo=googlegemini&logoColor=white)

An enterprise-grade, state-driven Point of Sale (POS) frontend application. Engineered with modern stateless security architectures, concurrent transaction handling, and integrated predictive analytics engines.

## 🚀 Architectural Breakthroughs (What I Built)

* **Stateless Security Gateway:** Integrated secure JWT login flow with automated token injection via HTTP Authorization headers for protected backend transactions.
* **Session Persistence:** Implemented proactive session monitoring leveraging browser storage layers to handle automatic termination on credential expiry.
* **Concurrent Checkout Processing:** Developed high-throughput cart processing utilizing asynchronous JavaScript synchronization primitives (`Promise.all`) to process checkout loads concurrently.
* **Predictive AI Analytics Blueprint:** Embedded a contextual interface using the `@google/generative-ai` SDK, mapping live PostgreSQL database state arrays into large language model context windows for business reporting.

## ⚙️ Environment Configuration

To run this application locally, ensure you create a `.env` file in the root directory:

```env
VITE_API_URL=http://localhost:8080
VITE_GEMINI_API_KEY=your_secured_google_ai_studio_key