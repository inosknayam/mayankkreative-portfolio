# Mayankkreative Portfolio

A modern, responsive portfolio website built with Next.js, Tailwind CSS, and Firebase.

## Features

- **Dark/Light Mode**: Toggle between themes.
- **Responsive Design**: Optimized for all devices.
- **Interactive Elements**: Scroll animations, hover effects, and dynamic components.
- **Firebase Integration**: Contact form submissions are stored in Firestore.
- **SEO Optimized**: Meta tags and Open Graph data configured.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS v4
- **Backend**: Firebase Firestore
- **Icons**: React Icons
- **Notifications**: React Hot Toast
- **Theme Management**: Next Themes

## Getting Started

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/yourusername/mayankkreative-portfolio.git
    cd mayankkreative-portfolio
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Run the development server**:
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Deployment

### Vercel (Recommended)

1.  Push your code to a GitHub repository.
2.  Go to [Vercel](https://vercel.com) and import your project.
3.  Vercel will automatically detect the Next.js settings.
4.  **Environment Variables**: If you have any sensitive config (currently Firebase config is public/client-side, which is standard for this setup, but ensure security rules are set in Firebase Console), add them here.
5.  Click **Deploy**.

### Firebase Security Rules

Ensure your Firestore security rules allow writes to the `contacts` collection:

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /contacts/{document=**} {
      allow create: if true; // Allow anyone to submit the form
      allow read: if false;  // Only admin can read (via Firebase Console)
    }
  }
}
```

## Project Structure

- `src/app`: App Router pages and layout.
- `src/components`: Reusable UI components (Hero, About, Services, etc.).
- `src/lib`: Utility functions and Firebase configuration.
- `public`: Static assets (images).

## Contact

Mayank Soni - [hi@mayankkreative.com](mailto:hi@mayankkreative.com)
