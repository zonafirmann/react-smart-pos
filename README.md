# 🛒 Enterprise Smart POS (Point of Sale)

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)

A highly responsive, state-driven Point of Sale (POS) frontend application. Engineered to seamlessly process real-time transactions, manage complex cart states, and interface with containerized Go microservices.

## ✨ Key Architectural Features

* **Advanced State Management:** Implements dynamic shopping cart logic (add, increment, calculate totals) entirely in React state without mutating raw data.
* **Concurrent API Processing:** Utilizes `Promise.all` to process multiple cart items simultaneously to the backend, ensuring ACID compliance on checkout.
* **Modern UI/UX Engine:** Powered by the blazing-fast **Tailwind CSS v4** Oxide engine for an enterprise-grade, responsive aesthetic.
* **Environment Configuration:** Built-in `.env` routing to seamlessly switch between local Go binaries (`localhost`) and production server endpoints.
* **Military-Grade Security:** Implements JSON Web Tokens (JWT) for stateless authentication and bcrypt for irreversible password hashing, protecting sensitive checkout endpoints.
* **Protected Routing:** React state architecture designed to intercept unauthorized access, enforce session validity, and seamlessly manage global authentication headers.

## 🚦 Local Development Setup

Ensure your Go Cloud Inventory API (Backend) is running on `localhost:8080`.

1. **Clone the repository**
   ```bash
   git clone [https://github.com/zonafirmann/react-smart-pos.git](https://github.com/zonafirmann/react-smart-pos.git)
   cd react-smart-pos