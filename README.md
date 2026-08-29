# Mentoring Platform — Frontend

A modern mentoring platform built with **Angular** to help mentors manage their groups, assign programming problems, monitor trainee progress, and review submissions.

The platform is designed around a simple workflow:

**Mentor assigns → Trainee solves → Trainee submits → Mentor reviews**

## 🚀 Live Demo

**[Mentoring Platform](https://mentoring-client.vercel.app/)**

> The application requires an account to access the main platform features.

## 📌 Overview

Managing mentoring activities can become scattered across different tools — from assigning tasks and tracking progress to reviewing submissions.

This project brings these workflows together in a single platform where mentors and trainees can interact around programming problems.

### 👨‍🏫 Mentors can

* Create and manage mentoring groups
* Add trainees to groups
* Assign programming problems
* Monitor trainee progress
* Review problem-solving activity
* Track submissions and their status
* Filter and search trainee progress

### 👨‍💻 Trainees can

* View their groups and assigned problems
* Open a dedicated problem workspace
* Track time spent solving problems
* Update problem status
* Submit solution/code links
* View submission history
* Follow their progress across assigned problems

## ✨ Key Features

### Authentication

* User registration and login
* Email confirmation flow
* JWT-based authentication
* Access and refresh token handling
* Protected routes
* Forgot/reset password flow
* Authentication-aware navigation

### Group Management

* Create and manage mentoring groups
* Add trainees to groups
* View group members
* Assign problems to trainees
* Manage group-specific activities

### Problem Workspace

Each assigned problem has its own workspace where trainees can:

* Start and stop solving sessions
* Track total solving time
* Update the problem status
* Submit solutions
* Add submission notes
* Review previous submissions

### Mentor Monitoring

Mentors can monitor the progress of trainees through:

* Problem status
* Solving activity
* Submission history
* Search and filtering
* Progress statistics

## 🏗️ Frontend Architecture

The application follows a feature-oriented Angular architecture:

```text
src/app
│
├── core
│   ├── guards
│   ├── interceptors
│   ├── models
│   └── services
│
├── features
│   ├── auth
│   ├── dashboard
│   ├── groups
│   ├── problems
│   └── profile
│
└── shared
    └── components
```

### Core

Contains application-wide functionality such as:

* Authentication
* Route guards
* HTTP interceptors
* Shared models
* API services

### Features

Business functionality is organized by feature rather than by technical layer.

This keeps related components, pages, and functionality close together and makes the application easier to maintain as it grows.

### Shared

Contains reusable UI components used across multiple features.

## 🛠️ Tech Stack

* **Angular**
* **TypeScript**
* **SCSS**
* **Angular Signals**
* **RxJS**
* **Angular Router**
* **Reactive Forms**
* **JWT Authentication**
* **REST APIs**
* **Vercel**

## 🔐 Authentication & API Integration

The frontend communicates with a RESTful backend and uses JWT-based authentication.

HTTP interceptors are responsible for attaching authentication credentials to API requests, while route guards protect authenticated areas of the application.

The application also handles common API error responses and validation errors.

## 📱 Responsive UI

The application is designed to work across different screen sizes, providing a consistent experience for desktop and smaller-screen users.

## ⚙️ Getting Started

### Prerequisites

Make sure you have:

* Node.js
* npm
* Angular CLI

### Installation

Clone the repository:

```bash
git clone https://github.com/Ahmd-Naser/mentoring-client.git
```

Navigate to the project:

```bash
cd mentoring-client
```

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
ng serve
```

Then open:

```text
http://localhost:4200
```

## 🔗 Related Project

The frontend is part of a full-stack mentoring platform.

**Backend:**
Add the backend repository link here.

## 🧭 Future Improvements

Possible future improvements include:

* More comprehensive automated testing
* Improved accessibility
* More reusable UI patterns
* Enhanced real-time mentoring features
* More detailed analytics and reporting

## 👤 Author

**Ahmed Nasser**

Computer Science Graduate & .NET Backend Developer

Interested in building scalable backend systems and full-stack applications.

---

⭐ If you find the project interesting, feel free to explore the repository and share your feedback.
