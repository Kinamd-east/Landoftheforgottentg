import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import {getAuth} from 'firebase/auth'

const firebaseConfig = {
  apiKey: "AIzaSyAfRZpNgxLEZX9_4M4h2xXnxPYVSqT2WRc",
    authDomain: "landoftheforgotten-2892a.firebaseapp.com",
    projectId: "landoftheforgotten-2892a",
    storageBucket: "landoftheforgotten-2892a.appspot.com",
    messagingSenderId: "656349432615",
    appId: "1:656349432615:web:0b7857c0997c5b873f7702",
};


const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };