# Smart Attendance System

A modern, secure, and efficient attendance management system built with Next.js, featuring biometric verification and geolocation tracking.

## 🚀 Features

- **Biometric Verification**: Facial recognition integration using `face-api.js` to ensure authentic attendance.
- **Geolocation Tracking**: Validates that students are physically present in the lecture hall using `haversine-distance`.
- **Real-time Dashboard**: Live updates of active sessions, attendance stats, and more.
- **Admin Management**: Comprehensive admin panel to manage students, courses, and sessions.
- **Secure Attendance Portal**:
  - Time-limited sessions with automatic expiry.
  - Strict access control for ended sessions.
  - Step-by-step verification flow.

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (React 19)
- **Language**: TypeScript
- **Styling**: Tailwind CSS, Lucide React (Icons)
- **State Management & UI**: Radix UI, Sonner (Toasts)
- **Biometrics**: face-api.js
- **Backend/Mock DB**: JSON Server (for development)

## 📦 Installation

1.  **Clone the repository**:

    ```bash
    git clone https://github.com/yourusername/smart-attendance.git
    cd smart-attendance
    ```

2.  **Install dependencies**:

    ```bash
    pnpm install
    # or
    npm install
    ```

3.  **Download Models**:
    Ensure you have the `face-api.js` models in the `public/models` directory.

## 🚦 Getting Started

Run the development server:

```bash
pnpm run dev
```

This command concurrently starts:

- The Next.js frontend at `http://localhost:3000`
- The JSON Server backend at `http://localhost:4000`

## 📂 Project Structure

- `app/`: Next.js App Router pages and layouts.
- `components/`: Reusable UI components (Attendance Portal, Tables, Forms).
- `lib/`: Utility functions and API helpers.
- `public/`: Static assets (images, models).
- `types/`: TypeScript definitions.
- `db/`: Database file (`db.json`) for JSON Server.

## 📝 Usage

1.  **Admin**: Log in to create sessions and manage students.
2.  **Lecturer**: Create a session and share the session code.
3.  **Student**:
    - Enter the session code.
    - Select your name.
    - Verify your identity (Matrix Number + Face).
    - Attendance is recorded automatically.

## 📄 License

This project is licensed under the MIT License.
