// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDooigbginaGtCiKmadDK5MCKYbSCtSkuk",
    authDomain: "prsm-allergy.firebaseapp.com",
    projectId: "prsm-allergy",
    storageBucket: "prsm-allergy.firebasestorage.app",
    messagingSenderId: "475135250168",
    appId: "1:475135250168:web:047174e5b8317ba342350d"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);