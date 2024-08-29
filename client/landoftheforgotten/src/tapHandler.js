import { doc, setDoc, updateDoc, increment, getDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';

const handleTap = async (userId) => {
  console.log('handleTap called with userId:', userId);

  try {
    const userDocRef = doc(db, 'userTaps', userId);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      await updateDoc(userDocRef, {
        tapCount: increment(1)
      });
    } else {
      await setDoc(userDocRef, {
        userId,
        tapCount: 1
      });
    }

    console.log('Tap recorded successfully');
  } catch (error) {
    console.error('Error recording tap:', error);

    if (error instanceof TypeError) {
      console.error('TypeError:', error.message);
    } else {
      console.error('Other error:', error);
    }
  }
};

export { handleTap };
