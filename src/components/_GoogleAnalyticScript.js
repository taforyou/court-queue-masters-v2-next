import Script from 'next/script'

const GoogleAnalyticScript = () => (
  <Script strategy="afterInteractive" id="google-analytics-script">
    {`
    // Import the functions you need from the SDKs you need
    import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
    import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-analytics.js";

    // Your web app's Firebase configuration
    const firebaseConfig = {
      apiKey: "AIzaSyAHIp5XAC-XTt3B473J2wPL9bT6DfO65RU",
      authDomain: "nudlen.firebaseapp.com",
      projectId: "nudlen",
      storageBucket: "nudlen.appspot.com",
      messagingSenderId: "837474206497",
      appId: "1:837474206497:web:8410d07e1b0e62bacef460",
      measurementId: "G-NRJLDJV7D9"
    };

    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const analytics = getAnalytics(app);
    `}
  </Script>
)

export default GoogleAnalyticScript
