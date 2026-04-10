# 🏠 Smart Bachelor Life

[![React](https://img.shields.io/badge/React-19.2-blue?style=flat&logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-7.2-646CFF?style=flat&logo=vite)](https://vitejs.dev)
[![Firebase](https://img.shields.io/badge/Firebase-12.9-FFCA28?style=flat&logo=firebase)](https://firebase.google.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4.1-06B6D4?style=flat&logo=tailwindcss)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

> 🎯 **Manage Your Mess. Track. Live Better.**
>
> A collaborative expense and meal management platform for bachelor groups and shared households.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Setup](#environment-setup)
- [Project Structure](#project-structure)
- [Available Scripts](#available-scripts)
- [Usage Guide](#usage-guide)
- [API Integration](#api-integration)
- [Deployment](#deployment)
- [Contributing Guidelines](#contributing-guidelines)
- [Team](#team)
- [License](#license)

---

## 🎯 Overview

**Smart Bachelor Life** is a full-stack web and mobile application designed to help bachelor groups and shared households manage their daily expenses, meal planning, and collaborative tasks seamlessly. With features like real-time group synchronization, expense tracking, meal calendar management, and payment settlement, it brings clarity and organization to chaotic shared living situations.

### Key Benefits

- 📊 **Transparent Expense Management** - Track every rupee spent in the group
- 🍽️ **Smart Meal Planning** - Reduce food waste through coordinated meal planning
- 👥 **Real-time Collaboration** - Stay aligned with roommates instantly
- 💸 **Easy Payment Settlement** - Automatically calculate who owes whom

---

## ✨ Features

### 💰 **Expense Management**

- Create and categorize individual expenses
- Split expenses among group members
- Track daily, weekly, and monthly expense trends
- Filter expenses by date range and category
- Detailed expense analytics and reports

### 🍽️ **Meal Tracking**

- Daily meal calendar with group synchronization
- Track meals by member and date
- Prevent food shortage and waste
- View meal history and patterns
- Collaborative meal planning interface

### 🛒 **Bazaar Management**

- Log grocery shopping and household purchases
- Assign items to specific members
- Track bazaar spending over time
- Group bazaar expenses automatically

### 💡 **Utility & Bill Management**

- Track monthly utility bills (electricity, water, gas, internet)
- Split utility costs fairly among members
- Historical bill payment records
- Automatic cost division calculations

### 👥 **Group Management**

- Create and manage bachelor groups/households
- Add and remove group members
- Assign manager roles for group administration
- Real-time member activity tracking
- Invite system for new members

### 💳 **Payment Settlement**

- Automatic calculation of who owes whom
- Payment history tracking
- Mark payments as complete/pending
- Settlement recommendations
- Group payment analytics

### 🎨 **UI/UX Features**

- Dark/Light theme toggle
- Fully responsive design (mobile, tablet, desktop)
- Real-time notifications with React Toastify
- Smooth animations with Framer Motion
- Intuitive navigation and user experience

---

## 🛠️ Tech Stack

### Frontend

- **React 19.2** - Modern UI library with hooks and concurrent features
- **Vite 7.2** - Lightning-fast build tool and dev server
- **React Router 7.13** - Client-side routing and navigation
- **Tailwind CSS 4.1** - Utility-first CSS framework
- **DaisyUI 5.5** - Tailwind CSS component library

### Styling & Animations

- **Framer Motion 12.29** - Production-ready animations
- **GSAP 3.14** - Advanced animation library
- **React Three Fiber 9.5** - 3D graphics integration
- **Three.js 0.182** - JavaScript 3D library
- **Lucide React 0.563** - Beautiful icon library

### State Management & Forms

- **React Hook Form 7.71** - Performant form validation
- **React Context API** - Built-in state management

### Backend & Database

- **Firebase 12.9** - Authentication, Realtime Database, and Hosting
- **Firebase Authentication** - Secure user login/signup

### Developer Tools

- **ESLint 9.39** - Code quality and style consistency
- **Vite React Plugin 5.1** - React optimizations for Vite

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **npm** (v7 or higher) - Comes with Node.js
- **Git** - [Download here](https://git-scm.com/)
- **Firebase Account** - [Create here](https://firebase.google.com/)

### Verify Installation

```bash
node --version
npm --version
git --version
```

---

## 🚀 Installation

### Step 1: Clone the Repository

```bash
git clone https://github.com/Rakibislam22/Smart-Bachelor-Life.git
cd Smart-Bachelor-Life
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Create Environment File

Create a `.env.local` file in the project root:

```bash
cp .env.example .env.local  # if example exists
# OR manually create .env.local
```

### Step 4: Configure Firebase

See [Environment Setup](#environment-setup) section below.

### Step 5: Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

---

## 🔐 Environment Setup

### Firebase Configuration

1. **Create a Firebase Project**
    - Go to [Firebase Console](https://console.firebase.google.com/)
    - Click "Add project"
    - Enter project name and continue
    - Enable Google Analytics (optional)

2. **Enable Authentication**
    - Navigate to Build → Authentication
    - Click "Get started"
    - Enable "Email/Password" authentication method

3. **Create Realtime Database**
    - Navigate to Build → Realtime Database
    - Click "Create Database"
    - Start in test mode (for development)
    - Choose your database location

4. **Get Firebase Config**
    - Project Settings → Your apps → Web app
    - Copy the Firebase configuration

5. **Create `.env.local` File**

Create a `.env.local` file in your project root with the following variables:

```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

⚠️ **Security Note:** Never commit `.env.local` to version control. It should be in `.gitignore`.

---

## 📁 Project Structure

```
smart-bachelor-life/
├── public/                          # Static assets
├── src/
│   ├── assets/                      # Images and icons
│   │   ├── icons/
│   │   └── images/
│   ├── component/                   # Reusable UI components
│   │   ├── common/                  # Common components (Button, Card, etc.)
│   │   └── landingLayout/           # Landing page sections
│   ├── firebase/
│   │   └── firebase.init.js         # Firebase configuration and initialization
│   ├── layouts/                     # Page layouts
│   │   ├── AuthLayout.jsx           # Authentication pages layout
│   │   ├── DashboardLayout.jsx      # Dashboard layout
│   │   ├── MainLayout.jsx           # Main site layout
│   │   └── MealLayout.jsx           # Meal pages layout
│   ├── pages/                       # Page components
│   │   ├── About.jsx                # About page
│   │   ├── Benefits.jsx             # Benefits page
│   │   ├── Contact.jsx              # Contact page
│   │   ├── Login.jsx                # Login page
│   │   ├── Signup.jsx               # Registration page
│   │   ├── LandingPage.jsx          # Landing page
│   │   ├── MealCalendar.jsx         # Meal calendar view
│   │   ├── GroupSelection.jsx       # Group selection page
│   │   ├── GroupMealView.jsx        # Group meal view
│   │   ├── NotFound.jsx             # 404 page
│   │   ├── UnauthorizedAccess.jsx   # 401 page
│   │   └── dashboard/               # Dashboard pages
│   │       ├── DashboardHome.jsx    # Dashboard main page
│   │       ├── BazarPage.jsx        # Bazaar/shopping tracker
│   │       ├── DailyMenuPage.jsx    # Daily menu management
│   │       ├── ManageMembersPage.jsx # Group member management
│   │       ├── MealExpensePage.jsx  # Meal-related expenses
│   │       ├── PaymentPage.jsx      # Payment settlement
│   │       └── TotalExpensePage.jsx # Total expense overview
│   ├── provider/                    # Context providers
│   │   ├── AuthContext.jsx          # Auth context
│   │   └── AuthProvider.jsx         # Auth provider wrapper
│   ├── router/                      # Routing configuration
│   │   ├── router.jsx               # Main router setup
│   │   ├── PrivateRoute.jsx         # Protected routes
│   │   └── ManagerRoute.jsx         # Manager-only routes
│   ├── utils/                       # API client functions
│   │   ├── authApi.js               # Authentication API calls
│   │   ├── bazarApi.js              # Bazaar API calls
│   │   ├── chatApi.js               # Chat API calls
│   │   ├── expenseApi.js            # Expense API calls
│   │   ├── groupApi.js              # Group management API
│   │   ├── mealApi.js               # Meal API calls
│   │   ├── menuApi.js               # Menu API calls
│   │   └── paymentApi.js            # Payment API calls
│   ├── App.jsx                      # Root component
│   ├── index.css                    # Global styles
│   └── main.jsx                     # Application entry point
├── public/                          # Public static files
├── .env.local                       # Environment variables (not versioned)
├── .env.example                     # Environment variables template
├── .gitignore                       # Git ignore rules
├── capacitor.config.json            # Capacitor configuration
├── eslint.config.js                 # ESLint configuration
├── firebase.json                    # Firebase hosting config
├── index.html                       # HTML entry point
├── package.json                     # Project dependencies
├── tailwind.config.js               # Tailwind CSS configuration
├── vite.config.js                   # Vite build configuration
└── README.md                        # This file
```

---

## 📊 Available Scripts

### Development

```bash
# Start development server (hot reload)
npm run dev
# Server runs on http://localhost:5173
```

### Production

```bash
# Build for production
npm run build
# Output directory: dist/

# Preview production build
npm run preview
```

### Code Quality

```bash
# Run ESLint to check code style
npm run lint

# Fix ESLint issues automatically
npm run lint -- --fix
```

---

## 🎮 Usage Guide

### 1. **First Time Setup**

- Visit the application homepage
- Click "Get Started" button
- Sign up with email and password
- Verify your email (optional for Firebase auth)

### 2. **Create or Join a Group**

- After login, select "Create New Group" or "Join Existing Group"
- Enter group details and confirm
- Add group members by email

### 3. **Manage Expenses**

- Navigate to Dashboard → Expense Management
- Click "Add Expense" to create new entry
- Set amount, category, and payer
- Select members who share the expense

### 4. **Track Meals**

- Go to Meal Calendar page
- Log daily meals consumed
- View group meal patterns
- Plan upcoming meals

### 5. **Record Bazaar Purchases**

- Access Bazaar section
- Log shopping purchases
- Assign items to categories (groceries, household, etc.)
- Track spending over time

### 6. **Pay Utility Bills**

- Navigate to Utility Management
- Enter monthly bill amounts
- System automatically splits costs
- Confirm payments across group

### 7. **Settle Payments**

- Go to Payment Settlement page
- View outstanding payments
- Mark payments as completed
- Download payment history

---

## 🔌 API Integration

The application communicates with a backend API for all data operations. Key API endpoints are located in `src/utils/`:

### Authentication (`authApi.js`)

- User registration and login
- Email verification
- Password reset

### Groups (`groupApi.js`)

- Create/manage groups
- Add/remove members
- Get group details and member list

### Expenses (`expenseApi.js`)

- Create, read, update, delete expenses
- Filter by date range and category
- Calculate expense statistics

### Meals (`mealApi.js`)

- Log meals and meal details
- Get meal history
- Track meal patterns

### Payments (`paymentApi.js`)

- Calculate settlements
- Record payments
- Get payment history

### Bazaar (`bazarApi.js`)

- Log shopping items
- Track bazaar expenses
- Get expense breakdown

---

## 🚀 Deployment

### Deploy to Firebase Hosting

#### Prerequisites

- Firebase CLI installed: `npm install -g firebase-tools`
- Logged in to Firebase: `firebase login`

#### Steps

1. **Build the project**

    ```bash
    npm run build
    ```

2. **Initialize Firebase (if not already done)**

    ```bash
    firebase init hosting
    ```

    Select `dist` as public directory.

3. **Deploy**

    ```bash
    firebase deploy
    ```

4. **View live app**
    ```bash
    Firebase URL will be displayed in terminal
    ```

### Environment Variables in Production

- Use Firebase Console to manage environment variables
- Never expose API keys in client code
- Use Firebase Security Rules for database access control

---

## 🤝 Contributing Guidelines

We follow a strict branching and workflow strategy for collaboration.

### Branch Strategy

**Production Branch:**

- `main` - Production-ready code (stable, tested, and deployed)

**Development Branches:**

- `rakib` - Development branch for Md Rakib Ali
- `alif` - Development branch for Md Jobaer Islam Alif
- `pranta` - Development branch for Pranta Kumer Pandit
- `ismail` - Development branch for Md Ismail Hossain Shazan
- `jisan` - Development branch for Jisan Rahman

⚠️ **Rule:** Never commit directly to `main`. All changes must go through development branches and pull requests.

### Daily Workflow

#### ✅ Setup (First Day Only)

```bash
# Clone repository
git clone https://github.com/Rakibislam22/Smart-Bachelor-Life.git
cd Smart-Bachelor-Life

# Checkout your assigned branch
git checkout your_branch_name
```

#### 🔄 Before Daily Work (MANDATORY)

```bash
# Update from main
git checkout main
git pull origin main
git checkout your_branch_name
git merge main

# Resolve conflicts if any
```

#### 🛠️ During Development

- Work only on your assigned feature/branch
- Don't modify other team members' files unnecessarily
- Make frequent, small commits

#### 💾 Commit Rules

```bash
# Check status
git status

# Stage changes
git add .

# Commit with descriptive message (present tense)
git commit -m "Add feature: [description]"

# Examples:
# git commit -m "Add expense filtering by date"
# git commit -m "Fix login form validation"
# git commit -m "Update dashboard styles"
```

#### ⬆️ Push & Create Pull Request

```bash
# Push your branch
git push origin your_branch_name

# Create PR on GitHub
# - Base branch: main
# - Compare branch: your_branch_name
# - Add description and wait for review
```

### Code Style Guidelines

- Use ESLint: `npm run lint`
- Follow React best practices and hooks patterns
- Use descriptive variable and function names
- Add comments for complex logic
- Keep components focused and reusable

### Pull Request Process

1. Create PR from your branch to `main`
2. Add clear description of changes
3. Link any related issues
4. Wait for code review approval
5. Merge after approval
6. Delete branch after merge

---

## 👥 Team

Smart Bachelor Life is developed by a dedicated team of developers and contributors.

### Project Lead

- **Md Rakib Ali**
    - 🌿 Branch: `rakib`
    - 🔗 GitHub: [@Rakibislam22](https://github.com/Rakibislam22)

### Contributors

- **Md Jobaer Islam Alif**
    - 🌿 Branch: `alif`
    - 🔗 GitHub: [@alifjobaer12](https://github.com/alifjobaer12)

- **Pranta Kumer Pandit**
    - 🌿 Branch: `pranta`
    - 🔗 GitHub: [@pranta2003](https://github.com/pranta2003)

- **Md Ismail Hossain Shazan**
    - 🌿 Branch: `ismail`
    - 🔗 GitHub: [@kenshiro-47](https://github.com/kenshiro-47)

- **Jisan Rahman**
    - 🌿 Branch: `jisan`
    - 🔗 GitHub: [@alifjobaer12](https://github.com/alifjobaer12)

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

### Summary

- ✅ You can use this code commercially and privately
- ✅ You can modify and distribute it
- ✅ You must include the license when distributing
- ❌ No liability or warranty

---

## 📞 Support & Contact

- **Issues:** [GitHub Issues](https://github.com/Rakibislam22/Smart-Bachelor-Life/issues)
- **Discussions:** [GitHub Discussions](https://github.com/Rakibislam22/Smart-Bachelor-Life/discussions)
- **Email:** [Your team email]

---

## 🙏 Acknowledgments

- **Firebase** for frontend hosting services
- **React** and **Vite** communities for tools
- **Tailwind CSS** and **DaisyUI** for styling
- All contributors and testers

---

## 📚 Additional Resources

- [React Documentation](https://react.dev)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Vite Guide](https://vitejs.dev/guide/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [React Router Guide](https://reactrouter.com/)

---

Made with ❤️ by Team Magma ♾️

Last updated: April 2026
