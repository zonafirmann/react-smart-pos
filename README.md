# 🛒 React Smart POS (Point of Sale)

![React](https://img.shields.io/badge/react-%2320232a.svg?style=flat&logo=react&logoColor=%2361DAFB)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=flat&logo=tailwind-css&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green.svg)

A modern Point of Sale (POS) frontend application engineered to process real-time transactions. This application interfaces seamlessly with a containerized Golang backend to execute ACID-compliant checkouts.

## 🚀 Key Features
* **Real-time Inventory Sync:** Fetches active products directly from the Go API.
* **Transactional UI:** Processes checkouts and dynamically updates stock levels.
* **Modern Design:** Fully responsive and styled with Tailwind CSS.

## 🚦 Quick Start
1. Clone the repository and run `npm install`.
2. Ensure your backend API is running on `localhost:8080`.
3. Start the POS interface via `npm run dev`.