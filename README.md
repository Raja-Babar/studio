# Office Management App

[![Flutter](https://img.shields.io/badge/Flutter-3.10.0-blue.svg)](https://flutter.dev)
[![Dart](https://img.shields.io/badge/Dart-2.15.0-blue.svg)](https://dart.dev)
[![Backend Options](https://img.shields.io/badge/Backend-Firebase_or_Self--Hosted-orange.svg)](https://github.com/Raja-Babar/Office_Application)

A complete Flutter-based Office Management application. **Uses Firebase by default, but designed to work with any backend!**

---

## ✨ Features

*   **User Authentication:** Secure login and signup with Firebase Auth.
*   **Employee Management:** Add, view, and manage employee details in Firestore.
*   **Task Management:** Create and assign tasks to employees.
*   **Flexible Backend:** **Firebase (Default)** or **Connect your own API**.
*   **Multi-Platform:** Ready to be built for web, mobile, and desktop.

## 🏗️ Architecture: How It Works

The app is built in a way that makes it easy to switch between Firebase and your own backend:

### Option 1: Use Firebase (Easy - Default)
*   Perfect for beginners and quick setup
*   All data stored in Firebase Firestore
*   Authentication with Firebase Auth
*   **To use this, just configure Firebase (steps below)**

### Option 2: Use Your Own Backend (For Experts)
*   Replace Firebase with your own Node.js/Django/Laravel API
*   Your data, your servers, your rules
*   **To use this:**
    1.  Create your backend API with endpoints for:
        *   `/api/login` (POST)
        *   `/api/employees` (GET, POST)
        *   `/api/tasks` (GET, POST)
    2.  Update the service files in `lib/services/` to call your API instead of Firebase.

## 🚀 How to Run This Project

### Prerequisites
1.  **Flutter SDK:** [Install Flutter](https://flutter.dev/docs/get-started/install)
2.  **Firebase Account:** For the default setup [Firebase Console](https://console.firebase.google.com/)

### Step-by-Step Setup (Using Firebase - Default)

1.  **Clone the project:**
    ```bash
    git clone https://github.com/Raja-Babar/Office_Application.git
    cd Office_Application
    ```

2.  **Get packages:**
    ```bash
    flutter pub get
    ```

3.  **Setup Firebase:**
    *   Create a new project at [Firebase Console](https://console.firebase.google.com/)
    *   Enable **Authentication** (Email/Password method)
    *   Enable **Firestore Database** in test mode
    *   Register your app and get Firebase config object

4.  **Configure Firebase in the app:**
    *   Open `lib/main.dart`
    *   Replace the existing Firebase configuration with your own:
    ```dart
    // Replace with your Firebase config
    await Firebase.initializeApp(
      options: const FirebaseOptions(
        apiKey: "your-api-key",
        authDomain: "your-project.firebaseapp.com",
        projectId: "your-project-id",
        storageBucket: "your-project.appspot.com",
        messagingSenderId: "123456789",
        appId: "your-app-id",
      ),
    );
    ```

5.  **Run the app:**
    ```bash
    flutter run
    ```

## 📁 Project Structure (Key Files for Customization)

```

lib/ ├──main.dart                 # App entry point with Firebase config ├──models/ │├── employee_model.dart  # Employee data structure │└── task_model.dart      # Task data structure ├──providers/               # State management │├── employee_provider.dart │└── task_provider.dart ├──screens/                 # UI screens │├── login_screen.dart │├── home_screen.dart │├── employee_screen.dart │├── add_employee_screen.dart │├── task_screen.dart │├── add_task_screen.dart │└── profile_screen.dart ├──services/                # Backend services (EDIT THESE FOR CUSTOM BACKEND) │├── database_service.dart # Main Firebase service │├── auth_service.dart    # Authentication service │├── employee_service.dart # Employee CRUD operations │└── task_service.dart    # Task CRUD operations └──widgets/                 # Reusable UI components ├── custom_textfield.dart └── custom_button.dart

```

## 🎯 How to Add Your Own Backend

To connect your own backend instead of Firebase:

1.  **Create API endpoints** in your preferred backend framework
2.  **Modify these service files:**
    *   `lib/services/auth_service.dart` - Update login/signup methods
    *   `lib/services/employee_service.dart` - Replace Firestore calls with API calls
    *   `lib/services/task_service.dart` - Replace Firestore calls with API calls
3.  **Remove Firebase initialization** from `lib/main.dart`
4.  **Add HTTP package** for API calls in `pubspec.yaml`

## 🔥 Build for Mobile & Desktop

This Flutter codebase can build for all platforms:

```bash
# Build Android APK
flutter build apk --release

# Build iOS
flutter build ios

# Build Windows
flutter build windows

# Build macOS
flutter build macos

# Build Linux
flutter build linux
```

🤝 How to Contribute

We need help with:

1. Mobile App Development: iOS & Android versions
2. Desktop Applications: Windows, macOS, Linux builds
3. Alternative Backends: Node.js, Django, Laravel implementations
4. UI/UX Improvements: Better design and user experience
5. Testing: Bug reporting and fixing

Contribution Steps:

1. Fork the project
2. Create your feature branch (git checkout -b feature/AmazingFeature)
3. Commit your changes (git commit -m 'Add some AmazingFeature')
4. Push to the branch (git push origin feature/AmazingFeature)
5. Open a Pull Request

📜 License

This project is distributed under the MIT License.

📞 Connect

· Creator: Raja Babar
· Project Link: https://github.com/Raja-Babar/Office_Application
· Issue Tracker: Report Bugs or Request Features

---

Note: This project currently uses Firebase as default backend but is designed to be easily modified for any custom backend API. Developers are encouraged to contribute alternative backend implementations!