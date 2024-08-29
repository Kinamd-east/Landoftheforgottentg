import React, { useState, useEffect } from 'react'
import { db } from './firebase';
import { Link } from 'react-router-dom';
import LoadingPage from './LoadingPage';
// import {handleFirstShieldPotion} from './ShieldProtection'
import { toNano } from '@ton/ton';
import { useTonWallet, useTonConnectUI } from '@tonconnect/ui-react';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { bear, coin, Arrow, highVoltage, rocket, trophy, skeleton, heart, skeleton2, skeleton3, skeleton4, skeleton5, skeleton6, skeleton7, skeleton8, background2 } from './images';
import { TonConnectButton } from '@tonconnect/ui-react';

const generateUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

function Boost() {
  const [petals, setPetals] = useState(0);
  const [boostLevel, setBoostLevel] = useState(0);
  const [loading, setLoading] = useState(true); // Loading state
  const [boostPrice, setBoostPrice] = useState(1000);
  const [health, setHealth] = useState(1000000);
  const [maxHealth, setMaxHealth] = useState(1000000);
  const [planDuration, setPlanDuration] = useState(7); // Default to 7 days
  const [tonConnectUI, setOptions] = useTonConnectUI();
  const [isPlanActive, setIsPlanActive] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [energy, setEnergy] = useState(1000);
  const [maxEnergy, setMaxEnergy] = useState(1000);
  const [energyUpgradePrice, setEnergyUpgradePrice] = useState(1000);
  const [uid, setUid] = useState(localStorage.getItem('uid') || generateUID());
  const [tapPosition, setTapPosition] = useState(null);
  const [increments, setIncrements] = useState([]);
  const [tapEffect, setTapEffect] = useState(false);
  const [clicks, setClicks] = useState([]);
  const connected = useTonWallet()

  useEffect(() => {
    localStorage.setItem('uid', uid);
    loadUserData(uid);
  }, [uid]);

  useEffect(() => {
    // Check if the plan was previously activated
    const storedActivationTime = localStorage.getItem('activationTime');
    const storedPlanDuration = localStorage.getItem('planDuration');

    if (storedActivationTime && storedPlanDuration) {
      const currentTime = Date.now();
      const timeDifference = currentTime - parseInt(storedActivationTime, 10);

      // Convert the stored duration to milliseconds
      const planDurationInMs = parseInt(storedPlanDuration, 10) * 24 * 60 * 60 * 1000;

      if (timeDifference < planDurationInMs) {
        setIsPlanActive(true);
      } else {
        setIsPlanActive(false);
      }
    }
  }, []);

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
        setMaxEnergy(userData.maxEnergy);
        setEnergyUpgradePrice(userData.energyUpgradePrice);
      } else {
        await setDoc(userRef, { petals: 1000, boostLevel: 0, boostPrice: 1000, health: 1000000, maxHealth: 1000000, energy: 1000, maxEnergy: 1000, energyUpgradePrice: 1000, invitedUsers: [] });
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false); // Set loading to false after data is fetched
    }
  };


  const handleBoost = async () => {
    if (petals >= boostPrice) {
      const newBoostLevel = boostLevel + 1;
      const newBoostPrice = boostPrice + 1000;
      const newPetals = petals - boostPrice;

      setBoostLevel(newBoostLevel);
      setBoostPrice(newBoostPrice);
      setPetals(newPetals);

      await updateDoc(doc(db, 'users', uid), { boostLevel: newBoostLevel, boostPrice: newBoostPrice, petals: newPetals });
    } else {
      alert('Not enough petals to buy a boost!');
    }
  };

  const handleEnergyUpgrade = async () => {
    if (petals >= energyUpgradePrice) {
      const newMaxEnergy = maxEnergy + 1000;
      const newEnergyUpgradePrice = energyUpgradePrice + 1000;
      const newPetals = petals - energyUpgradePrice;

      setMaxEnergy(newMaxEnergy);
      setEnergy(newMaxEnergy);
      setEnergyUpgradePrice(newEnergyUpgradePrice);
      setPetals(newPetals);

      await updateDoc(doc(db, 'users', uid), { maxEnergy: newMaxEnergy, energy: newMaxEnergy, energyUpgradePrice: newEnergyUpgradePrice, petals: newPetals });
    } else {
      alert('Not enough petals to buy an energy upgrade!');
    }
  };

  useEffect(() => {
    const storedPlanActive = localStorage.getItem('isPlanActive');
    if (storedPlanActive === 'true') {
      setIsPlanActive(true);
    }
  }, []);

  const handleFirstShieldPotion = async (duration) => {
    // Add first shield potion logic here
    if (connected) {
      if (duration === 7) {
        if (isPlanActive === true) {
          alert('You already have a plan active!')
        } else {
          const userAmount = (0.003 * 1e9).toString();
          const transaction = {
            validUntil: Math.floor(Date.now() / 1000) + 360,
            messages: [
              {
                address: "0QCYM7d3gXybi1HNulFdLddRJvxECK2GruQRCeJmf9g7Rs7R", // destination address
                amount: userAmount //Toncoin in nanotons
              }
            ]

          }
          await tonConnectUI.sendTransaction(transaction);
          console.log(transaction)
          console.log("User has payed for the 7 day plan for shield potion")
          setIsPlanActive(true);
          setPlanDuration(duration);
          // Store the activation timestamp and the selected duration
          localStorage.setItem('isPlanActive', 'true');
          localStorage.setItem('activationTime', Date.now().toString());
          localStorage.setItem('planDuration', duration.toString());
        }
      } else if (duration === 14) {
        if (isPlanActive === true) {
          alert('You already have a plan active!')
        } else {
          const userAmount = (0.006 * 1e9).toString();
          const transaction = {
            validUntil: Math.floor(Date.now() / 1000) + 360,
            messages: [
              {
                address: "0QCYM7d3gXybi1HNulFdLddRJvxECK2GruQRCeJmf9g7Rs7R", // destination address
                amount: userAmount //Toncoin in nanotons
              }
            ]

          }
          await tonConnectUI.sendTransaction(transaction);
          console.log(transaction)
          console.log("User has payed for the 14 day plan for shield potion")
          setIsPlanActive(true);
          setPlanDuration(duration);
          // Store the activation timestamp and the selected duration
          localStorage.setItem('isPlanActive', 'true');
          localStorage.setItem('activationTime', Date.now().toString());
          localStorage.setItem('planDuration', duration.toString());
        }
      } else if (duration === 21) {
        if (isPlanActive === true) {
          alert('You already have a plan active!')
        } else {
          const userAmount = (0.009 * 1e9).toString();
          const transaction = {
            validUntil: Math.floor(Date.now() / 1000) + 360,
            messages: [
              {
                address: "0QCYM7d3gXybi1HNulFdLddRJvxECK2GruQRCeJmf9g7Rs7R", // destination address
                amount: userAmount //Toncoin in nanotons
              }
            ]

          }
          await tonConnectUI.sendTransaction(transaction);
          console.log(transaction)
          console.log("User has payed for the 21 day plan for shield potion")
          setIsPlanActive(true);
          setPlanDuration(duration);
          // Store the activation timestamp and the selected duration
          localStorage.setItem('isPlanActive', 'true');
          localStorage.setItem('activationTime', Date.now().toString());
          localStorage.setItem('planDuration', duration.toString());
        }
      }
    }
  }


  if (loading) return <LoadingPage />; // Show loading indicator

  return (
    <div className="min-h-screen px-4 flex flex-col items-center text-white font-medium bg-[#1f1f1f]">
      <Link to="/">
        <img src={Arrow} alt="" className="absolute top-4 left-4 w-12 h-12" />

      </Link>

      {/* <div className="absolute inset-0 h-1/2 bg-gradient-overlay z-0"></div> */}
      {/* <div className="absolute inset-0 flex items-center justify-center z-0">
        <div className="radial-gradient-overlay"></div>
      </div> */}

      <div className="z-10 min-h-screen flex flex-col items-center text-white">

        <div className="top-0 left-0 px-4 pt-8 z-10 flex flex-col items-center text-white">
          <div className="mt-12 text-5xl font-bold flex items-center">
            <img src={coin} width={44} height={44} />
            <span className="ml-2">{petals.toLocaleString()}</span>
          </div>
          <h1 className='mt-10 text-2xl'>BOOSTS!!!</h1>
          <div className='free-boost mt-10'>
            <div className='mb-10'> <button type="button" className="mb-2 me-2 w-full rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:outline-none focus:ring-4 focus:ring-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white dark:focus:ring-gray-700" onClick={handleEnergyUpgrade}>Buy Energy - {energyUpgradePrice}</button>
            </div>
            <div className=' mb-10'><button type="button" className="mb-2 me-2 w-full rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:outline-none focus:ring-4 focus:ring-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white dark:focus:ring-gray-700" onClick={handleBoost}>Buy Taps - {boostPrice}
            </button></div>
            <div className=' mb-10'><button type="button" className="mb-2 me-2 w-full rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:outline-none focus:ring-4 focus:ring-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white dark:focus:ring-gray-700" onClick={() => setIsModalOpen(true)}>Shield Potion
            </button></div>
          </div>
        </div>
        {isModalOpen && (
          <div className="min-w-screen h-screen animated fadeIn faster  fixed  left-0 top-0 flex justify-center items-center inset-0 z-50 outline-none focus:outline-none bg-no-repeat bg-center bg-cover">
            <div className="absolute bg-black opacity-80 inset-0 z-0"></div>
            <div className="w-full  max-w-lg p-5 relative mx-auto my-auto rounded-xl shadow-lg  bg-white ">
              <div className="">
                <div className="text-center p-5 flex-auto justify-center">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 flex justify-center items-center">
                    <svg className="w-3 h-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 1l6 6m0 0l6 6M7 7l6-6M7 7l-6 6" />
                    </svg>
                    <span className="sr-only">Close modal</span>
                  </button>
                  <h2 className="text-xl font-bold py-4 text-gray-500">Purchase shield potion</h2>
                  <div className='flex flex-col items-center justify-center'>
                    <h3 className="text-lg font-semibold text-gray-500 mb-4">{connected ? 'Connected wallet' : 'Connect your wallet'}</h3>
                    <TonConnectButton />
                    {connected ?
                      <div className="p-3 mt-2 text-center space-x-4 md:block">
                        <button type="button" className="mb-2 me-2 w-32 rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:outline-none focus:ring-4 focus:ring-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white dark:focus:ring-gray-700" onClick={() => handleFirstShieldPotion(7)}>7 days / 0.003 TON
                        </button>
                        <button type="button" className="mb-2 me-2 w-32 rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:outline-none focus:ring-4 focus:ring-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white dark:focus:ring-gray-700" onClick={() => handleFirstShieldPotion(14)}>14 days / 0.006 TON
                        </button>
                        <button type="button" className="mb-2 me-2 w-32 rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:outline-none focus:ring-4 focus:ring-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white dark:focus:ring-gray-700" onClick={() => handleFirstShieldPotion(21)}>21 days / 0.009 TON
                        </button>
                        {/* <button className={`confirm-button mb-2 md:mb-0 bg-gray-500 border border-gray-500 px-5 py-2 text-sm shadow-sm font-medium tracking-wider text-white rounded-full hover:shadow-lg hover:bg-gray-600 ${loading && 'loading'}`} onClick={handleConfirmClick}>{buttonText}</button> */}
                      </div>
                      : ''}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>


    </div>
  )
}

export default Boost
