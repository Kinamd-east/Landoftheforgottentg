const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const cors = require('cors');
const admin = require('firebase-admin');
const serviceAccount = require('./firebase-adminsdk.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const app = express();
app.use(bodyParser.json());
app.use(cors());

const BOT_TOKEN = 'YOUR_BOT_TOKEN';
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

app.post('/webhook', async (req, res) => {
  const { message } = req.body;

  if (message && message.text === '/tap') {
    const chatId = message.chat.id;
    const userId = message.from.username || message.from.id.toString();
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();

    let points;
    if (userDoc.exists) {
      const userData = userDoc.data();
      points = (userData.points || 0) + 1;  // Default to 0 if points is undefined
      await userRef.update({ points });
    } else {
      points = 1;
      await userRef.set({ points });
    }

    await axios.post(`${TELEGRAM_API}/sendMessage`, {
      chat_id: chatId,
      text: `You have ${points} points!`,
    });
  }

  res.sendStatus(200);
});

app.post('/purchase', async (req, res) => {
  const { userId } = req.body;

  try {
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).send('User not found');
    }

    const userData = userDoc.data();
    const points = userData.points || 0;  // Default to 0 if points is undefined
    const upgradeLevel = userData.upgradeLevel || 0;  // Default to 0 if upgradeLevel is undefined
    const nextUpgradeCost = userData.nextUpgradeCost || 1000;  // Default to 5 if nextUpgradeCost is undefined

    if (points < nextUpgradeCost) {
      return res.status(400).send('Not enough points');
    }

    await userRef.update({
      points: points - nextUpgradeCost,
      upgradeLevel: upgradeLevel + 1,
      nextUpgradeCost: nextUpgradeCost + 1000,
    });

    res.send({ success: true });
  } catch (error) {
    console.error('Error handling purchase:', error.message);
    res.status(500).send('Internal Server Error');
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


// const express = require('express');
// const bodyParser = require('body-parser');
// const axios = require('axios');
// const cors = require('cors')
// const { db } = require('./firebaseAdmin');
// const { doc } = require('firebase-admin/firestore');
// const { getDoc, setDoc, updateDoc, increment } = require('firebase/firestore');


// const app = express();
// app.use(bodyParser.json());
// app.use(cors())

// const BOT_TOKEN = '7403882519:AAGo3dLA5GxwaVeNRfrmM8BmFj55MqBIopo';
// const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

// app.post('/webhook', async (req, res) => {
//   const { message } = req.body;

//   if (message && message.text === '/tap') {
//     const chatId = message.chat.id;
//     const userId = message.from.username || message.from.id.toString();
//     const userRef = db.collection('users').doc(userId);
//     const userDoc = await getDoc(userRef);

//     let points;
//     if (userDoc.exists()) {
//       points = userDoc.data().points + 1;
//       await updateDoc(userRef, { points });
//     } else {
//       points = 1;
//       await setDoc(userRef, { points });
//     }

//     await axios.post(`${TELEGRAM_API}/sendMessage`, {
//       chat_id: chatId,
//       text: `You have ${points} points!`,
//     });
//   }

//   res.sendStatus(200);
// });

// app.post('/purchase', async (req, res) => {
//   const { userId } = req.body;

//   try {
//     const userRef = doc(db, 'users', userId);  // Correct usage of `doc`
//     const userDoc = await getDoc(userRef);

//     if (!userDoc.exists()) {
//       return res.status(404).send('User not found');
//     }

//     const userData = userDoc.data();
//     const { points, upgradeLevel, nextUpgradeCost } = userData;

//     if (points < nextUpgradeCost) {
//       return res.status(400).send('Not enough points');
//     }

//     // Update user points and upgrade status
//     await updateDoc(userRef, {
//       points: points - nextUpgradeCost,
//       upgradeLevel: upgradeLevel + 1,
//       nextUpgradeCost: nextUpgradeCost + 5,
//     });

//     res.send({ success: true });
//   } catch (error) {
//     console.error('Error handling purchase:', error.message);
//     res.status(500).send('Internal Server Error');
//   }
// });

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });


