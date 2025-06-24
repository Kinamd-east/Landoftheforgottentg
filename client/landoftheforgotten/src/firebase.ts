import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import {getAuth} from 'firebase/auth'

const firebaseConfig = {
  apiKey: "AIzaSyAJ_AV3bA_8gryy1wFUXksWHSYUVHKC6wI",
  authDomain: "landoftheforgotten-1651c.firebaseapp.com",
  projectId: "landoftheforgotten-1651c",
  storageBucket: "landoftheforgotten-1651c.firebasestorage.app",
  messagingSenderId: "332030343716",
  appId: "1:332030343716:web:b015de597836ba441f36b1",
};


const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };