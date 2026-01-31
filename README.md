# Ambrosia | Divine Essence

Ambrosia is a premium e-commerce platform dedicated to the world's finest cinnamon. This project demonstrates a full-stack serverless shopping cart application built with React, Vite, and Firebase.

![Ambrosia Hero](src/assets/images/hero_bg.png)

## 🚀 Features

### Customer Features
- **Immersive UI/UX**: A visually stunning interface with glassmorphism, smooth animations, and a rich color palette (Gold & Black).
- **Product Catalog**: Browse premium cinnamon products with detailed descriptions and imagery.
- **Shopping Cart**: Real-time cart management with persistence.
- **Secure Checkout**: Validated checkout flow with order summary.
- **User Accounts**: Sign up, login, and manage profile (powered by Firebase Auth).
- **Contact Form**: Direct line to customer support.

### Admin Dashboard (`/admin`)
- **Dashboard Overview**: Visual stats for Total Revenue, Orders, and Products.
- **Order Management**: View, update (Ship/Deliver), and manage customer orders.
- **Product Management**: Add, edit, and remove products from the inventory.
- **Security**: Role-Based Access Control (RBAC) ensures only admins can access sensitive data.

## 🛠️ Tech Stack

- **Frontend**: React.js (Vite), Tailwind CSS
- **Backend / Database**: Firebase Firestore (NoSQL)
- **Authentication**: Firebase Authentication
- **State Management**: React Context API
- **Icons**: Lucide React

## 📦 Installation & Setup

1.  **Clone the repository**
    ```bash
    git clone https://github.com/layer1-studio/Ambrosia.git
    cd Ambrosia
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Environment Setup**
    Create a `.env` file in the root directory with your Firebase config:
    ```env
    VITE_FIREBASE_API_KEY=your_api_key
    VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
    VITE_FIREBASE_PROJECT_ID=your_project_id
    VITE_FIREBASE_STORAGE_BUCKET=your_bucket.appspot.com
    VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
    VITE_FIREBASE_APP_ID=your_app_id
    ```

4.  **Run Development Server**
    ```bash
    npm run dev
    ```

## 🔒 Security Measures

- **Input Validation**: All forms validated to prevent XSS and injection attacks.
- **RBAC**: Admin routes protected by strictly enforcing `user.role === 'admin'`.
- **Environment Variables**: Sensitive keys managed via `.env`.

## 📜 License

This project is licensed under the MIT License.
