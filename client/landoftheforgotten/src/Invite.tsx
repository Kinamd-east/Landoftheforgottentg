import React, { useEffect, useState } from 'react';
import WebApp from '@twa-dev/sdk'
import { doc, getDoc, updateDoc, arrayUnion, setDoc } from 'firebase/firestore';
import LoadingPage from './LoadingPage';
import { Link } from 'react-router-dom';
import { db } from './firebase';
import { background, back2, back3, coin, Arrow } from './images';


const generateUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

const InvitePage = () => {
  const [inviteLink, setInviteLink] = useState('');
  const [buttonText, setButtonText] = useState('Confirm');
  const [completedQuests, setCompletedQuests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [boostLevel, setBoostLevel] = useState(0);
  const [boostPrice, setBoostPrice] = useState(1000);
  const [health, setHealth] = useState(1000000);
  const [maxHealth, setMaxHealth] = useState(1000000);
  const [energy, setEnergy] = useState(1000);
  const [maxEnergy, setMaxEnergy] = useState(1000);
  const [energyUpgradePrice, setEnergyUpgradePrice] = useState(1000);
  const [uid, setUid] = useState(localStorage.getItem('uid') || generateUID());
  const [tapPosition, setTapPosition] = useState(null);
  const [increments, setIncrements] = useState([]);
  const [tapEffect, setTapEffect] = useState(false);
  const [clicks, setClicks] = useState([]);
  const [quests, setQuests] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dailyLoginData, setDailyLoginData] = useState({ currentDay: 0, lastLogin: null, rewardsClaimed: [] });
  const [selectedQuest, setSelectedQuest] = useState(null);
  const [petals, setPetals] = useState(0);
  const [invitedUsers, setInvitedUsers] = useState([]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const referrerId = params.get('referrerId'); // Get referrerId from URL params

    const handleReferral = async () => {
      if (referrerId && referrerId !== uid) {
        const referrerRef = doc(db, 'users', referrerId);

        try {
          const referrerSnap = await getDoc(referrerRef);

          if (!referrerSnap.exists()) {
            console.error('Referrer document does not exist!');
            return;
          }

          const referrerData = referrerSnap.data();
          const newInvitedUsers = referrerData.invitedUsers || [];
          const currentPetals = parseInt(referrerData.petals) || 0;

          console.log('Referrer Data:', referrerData);
          console.log('Current Invited Users:', newInvitedUsers);
          console.log('Current Petals:', currentPetals);

          // Check if the user is already in the invitedUsers array
          if (!newInvitedUsers.includes(uid)) {
            console.log('User not in invitedUsers, adding and rewarding petals.');

            newInvitedUsers.push(uid);

            // Update the referrer's document with the new user's ID and increment petals
            await updateDoc(referrerRef, {
              invitedUsers: newInvitedUsers,
              petals: currentPetals + 100, // Increment petals by 100
            });

            console.log('Update succeeded: User added and petals rewarded.');
          } else {
            console.log('User is already in the invitedUsers array.');
          }
        } catch (error) {
          console.error('Update failed: ', error);
        }
      }
    };

    handleReferral();
  }, [location.search, uid]);

  useEffect(() => {
    if (uid) {
      const link = `${window.location.origin}/invites?referrerId=${uid}`;
      setInviteLink(link);
      loadInvitedUsers(uid);
    }
  }, [uid]);

  useEffect(() => {
    localStorage.setItem('uid', uid);
    loadUserData(uid);
  }, [uid]);

  const loadUserData = async (uid) => {
    try {
        const userRef = doc(db, 'users', uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
            const userData = userSnap.data();
            setPetals(userData.petals);
            setBoostLevel(userData.boostLevel);
            setBoostPrice(userData.boostPrice);
            setHealth(userData.health);
            setMaxHealth(userData.maxHealth);
            setEnergy(userData.energy);
            setCompletedQuests(userData.completedQuests || []); // Initialize completedQuests if not present
            setMaxEnergy(userData.maxEnergy);
            setEnergyUpgradePrice(userData.energyUpgradePrice);
            setDailyLoginData(userData.dailyLoginData || { currentDay: 0, lastLogin: null, rewardsClaimed: [] }); // Initialize dailyLoginData if not present
        } else {
            const defaultData = { petals: 1000, boostLevel: 0, boostPrice: 1000, health: 1000000, maxHealth: 1000000, energy: 1000, maxEnergy: 1000, energyUpgradePrice: 1000, invitedUsers: [], completedQuests: [], dailyLoginData: { currentDay: 0, lastLogin: null, rewardsClaimed: [] }};
            await setDoc(userRef, defaultData);
            setDailyLoginData(defaultData.dailyLoginData);
        }
    } catch (error) {
        console.error('Error loading user data:', error);
    } finally {
        setLoading(false); // Set loading to false after data is fetched
    }
};


  const loadInvitedUsers = async (uid) => {
    try {
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const userData = userSnap.data();
        setInvitedUsers(userData.invitedUsers || []);
      }
    } catch (error) {
      console.error('Error loading invited users:', error);
    }
  };
  const handleCopyLink = (value) => {
    navigator.clipboard.writeText(value)
    alert('Link copied to clipboard')

  }
  if (loading) return <LoadingPage />; // Show loading indicator


  return (
    <div className="min-h-screen px-4 flex flex-col text-white font-medium items-center bg-[#1f1f1f]">
      <div className="w-full z-10 min-h-screen flex flex-col text-white items-center">
        <Link to="/">
          <img src={Arrow} alt="" className="absolute top-4 left-4 w-12 h-12" />

        </Link>
        <div className="mt-12 text-5xl font-bold flex items-center">
          <img src={coin} width={44} height={44} />
          <span className="ml-2">{petals.toLocaleString()}</span>
        </div>
        <h1 className="text-3xl mb-4">Invite Friends</h1>

        <div className="top-0 left-0 px-4 pt-8 z-10 flex flex-col text-white">
          <div className='free-boost mt-10'>
            <p className="mb-4">Share this link to invite your friends:</p>
            <div className='mb-10'>
              <input
                type="text"
                readOnly
                value={inviteLink}
                className="px-4 py-2 bg-gray-800 text-white rounded-lg w-80 mb-4"
                onClick={() => handleCopyLink(inviteLink)}
              />
            </div>
            <div className='mb-10'> <button type="button" className="mb-2 me-2 w-full rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:outline-none focus:ring-4 focus:ring-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white dark:focus:ring-gray-700" onClick={() => {
              handleCopyLink(inviteLink)
            }}>Copy Link</button>
            </div>
          </div>
          <h2 className="text-2xl mb-4">Invited Users:</h2>
          <ul className="list-disc">
            {invitedUsers.length > 0 ? (
              invitedUsers.map((userId, index) => (
                <li key={index} className="text-lg">{userId}</li>
              ))
            ) : (
              <li className="text-lg">No invites yet</li>
            )}
          </ul>
        </div>
      </div>


    </div>
  );
};

export default InvitePage;
