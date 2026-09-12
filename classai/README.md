# ClassAI Student Android App

Jetpack Compose client for the ClassAI FastAPI contract. It uses Firebase Authentication to obtain an ID token and calls the hosted FastAPI service for classrooms, published lectures, absent catch-up, PDF notes, attendance, quizzes, attempts, analytics, and notifications. Roles are enforced by the server; the app does not contain a client-side role switcher or mock runtime data source.

## Run Locally

**Prerequisites:** [Android Studio](https://developer.android.com/studio), a Firebase Android app configuration, and the ClassAI backend.

1. Open Android Studio
2. Select **Open** and choose the directory containing this project
3. Put Firebase's `google-services.json` in `classai/app/`. This file must match the Android package ID in `app/build.gradle.kts`.
4. For an Android emulator, start the backend on the laptop and use the default `http://10.0.2.2:8000/` address. For a physical phone or hosted backend, build with `-PCLASSAI_API_BASE_URL=https://your-api.example/`.
5. Run the app, sign in with a Firebase Email/Password account that has already been provisioned in the `users` Firestore collection, and join classrooms using the teacher's code.

The repository includes a Gradle 9.3.1 wrapper. Run `./gradlew.bat :app:assembleDebug` on Windows or `./gradlew :app:assembleDebug` on Unix after Firebase configuration is available.
