const admin = require('firebase-admin');
const { doc, getDoc, setDoc, updateDoc } = require('firebase-admin/firestore');  // Correct import

const serviceAccount = require('./firebase-adminsdk.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

module.exports = { db };
