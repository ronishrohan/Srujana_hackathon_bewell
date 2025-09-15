
# BeWell - AI Healthcare

**BeWell** is a web-based AI-powered healthcare platform that enables doctors to create and assign personalized health plans to their patients. It tracks patient adherence to those plans, gamifies the experience through a points system, and offers interactive, time-based sessions powered by AI-generated slides to guide patients step by step.

---

## Features

* **AI-Generated Health Plans** – Doctors can create custom plans with the help of AI and assign them to their patients.
* **Patient Progress Tracking** – The platform monitors whether patients are following their plans.
* **Gamification & Rewards** – Patients earn points for completing tasks, encouraging better adherence.
* **AI-Generated Sessions** – Time-based, interactive sessions with AI-generated slides that patients must follow in real time.
* **Web-Based and User-Friendly** – Built with modern web technologies for smooth performance and responsive design.

---

## Tech Stack

### Frontend

* **React.js** – Component-based UI framework
* **Vite** – Fast development build tool
* **Firebase JS** – Authentication and data management
* **Radix UI** – Accessible UI primitives
* **Tailwind CSS** – Utility-first styling
* **React Router DOM** – Client-side routing

### Backend

* **Node.js & Express.js** – API server
* **Nodemon** – Auto-reloading development server
* **Google GenAI** – AI plan generation
* **Custom Gemini Model** – Fine-tuned on domain-specific datasets

---

## Installation & Setup

### Prerequisites

* Node.js and npm (or yarn) installed
* Firebase project set up (for authentication and database)
* Google GenAI API key configured

### Clone the Repository

```bash
git clone https://github.com/ronishrohan/Srujana_hackathon_bewell.git
cd Srujana_hackathon_bewell
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

or

```bash
yarn install
yarn dev
```

### Backend Setup

```bash
cd backend
npm install
nodemon server.js
```

---

## Project Structure

```
Srujana_hackathon_bewell/
├── resources/         # Resources used to train the model
├── frontend/         # React + Vite frontend code
├── backend/          # Node.js + Express API server
└── README.md         # Project documentation
```

