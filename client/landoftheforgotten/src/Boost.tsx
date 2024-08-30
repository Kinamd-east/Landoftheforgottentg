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

const getStoredValue = (key, defaultValue) => {
  const storedValue = localStorage.getItem(key);
  return storedValue !== null ? JSON.parse(storedValue) : defaultValue;
};
function Boost() {
  const [petals, setPetals] = useState(0);
  const [boostLevel, setBoostLevel] = useState(0);
  const [loading, setLoading] = useState(true); // Loading state
  const [boostPrice, setBoostPrice] = useState(1000);
  const [freeBoostsUsed, setFreeBoostsUsed] = useState(0);
  const [freeTapBoostsUsed, setFreeTapBoostsUsed] = useState(0);
  const [tapBoostCooldown, setTapBoostCooldown] = useState(false);
  const [tapPoints, setTapPoints] = useState(1);
  const [isTapBoostActive, setIsTapBoostActive] = useState(false);
  const [isCooldown, setIsCooldown] = useState(false);
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
    // Check if cooldown has expired
    const storedTapBoostsUsed = parseInt(localStorage.getItem('freeTapBoostsUsed')) || 0;
    setFreeTapBoostsUsed(storedTapBoostsUsed);
    const lastBoostTime = parseInt(localStorage.getItem('lastTapBoostTime'));
    if (lastBoostTime) {
      const currentTime = Date.now();
      const timeDifference = currentTime - lastBoostTime;
      const boostCooldown = 24 * 60 * 60 * 1000; // 24 hours

      if (timeDifference < boostCooldown) {
        setTapBoostCooldown(true);
      } else {
        // Reset boosts if cooldown period is over
        setFreeTapBoostsUsed(0);
        localStorage.setItem('freeTapBoostsUsed', '0');
        setTapBoostCooldown(false);
      }

    }
  }, []);

  useEffect(() => {
    const storedBoostsUsed = parseInt(localStorage.getItem('freeBoostsUsed')) || 0;
    setFreeBoostsUsed(storedBoostsUsed);

    const lastBoostTime = parseInt(localStorage.getItem('lastBoostTime'));
    if (lastBoostTime) {
      const currentTime = Date.now();
      const timeDifference = currentTime - lastBoostTime;
      const boostCooldown = 24 * 60 * 60 * 1000; // 24 hours

      if (timeDifference < boostCooldown) {
        setIsCooldown(true);
      } else {
        // Reset boosts if cooldown period is over
        setFreeBoostsUsed(0);
        localStorage.setItem('freeBoostsUsed', '0');
        setIsCooldown(false);
      }
    }
  }, []);


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
      alert('Successfully upgraded your tapping power')

      await updateDoc(doc(db, 'users', uid), { boostLevel: newBoostLevel, boostPrice: newBoostPrice, petals: newPetals });
    } else {
      alert('Not enough petals to buy a tapping boost!');
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
      alert('Successfully upgraded your energy')

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

  const handleFreeBoost = async () => {
    if (isCooldown) {
      alert('You have used all your free boosts. Please wait 24 hours before using it again.');
      return;
    }

    if (freeBoostsUsed >= 3) {
      const currentTime = Date.now();
      localStorage.setItem('lastBoostTime', currentTime.toString());
      setIsCooldown(true);
      alert('You have used all your free boosts. Please wait 24 hours before using it again.');
      return;
    }

    // Perform the energy upgrade without paying petals
    if (energy < maxEnergy) {
      const diff = maxEnergy - energy;
      const newEnergy = energy + diff;

      // Immediately update the boost count before proceeding
      const updatedFreeBoostsUsed = freeBoostsUsed + 1;
      setFreeBoostsUsed(updatedFreeBoostsUsed);
      localStorage.setItem('freeBoostsUsed', updatedFreeBoostsUsed.toString());

      // Update energy
      setEnergy(newEnergy);
      await updateDoc(doc(db, 'users', uid), { energy: newEnergy });

      alert('Successfully upgraded your energy with a free boost!');
    } else {
      alert('Your energy is already at maximum!');
    }
  };


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
  const handleFreeClick = (num) => {
    const firstDiv = document.getElementById('firstBoost');
    const secondDiv = document.getElementById('secondBoost');
    const firstText = document.getElementById('firstBoostDiv');
    const secondText = document.getElementById('secondBoostDiv');
  
    if (num === 1) {
      // Show first div and hide second div
      firstDiv?.classList.remove('hidden');
      secondDiv?.classList.add('hidden');
  
      // Add active class to first text and remove from second text
      firstText?.classList.add('active');
      secondText?.classList.remove('active');
  
      console.log('Free clicked 1');
    } else if (num === 2) {
      // Show second div and hide first div
      secondDiv?.classList.remove('hidden');
      firstDiv?.classList.add('hidden');
  
      // Add active class to second text and remove from first text
      secondText?.classList.add('active');
      firstText?.classList.remove('active');
  
      console.log('Free clicked 2');
    }
  };

  const activateTapBoost = async() => {
    const originalBoostLevel = boostLevel;
    if (tapBoostCooldown) {
      alert('You have used all your free tapping boosts. Please wait 24 hours before using it again.');
      return;
    }

    if (freeTapBoostsUsed >= 3) {
      const currentTime = Date.now();
      localStorage.setItem('lastTapBoostTime', currentTime.toString());
      setTapBoostCooldown(true);
      // setIsTapBoostActive(true)
      alert('You have used all your free tapping boosts. Please wait 24 hours before using it again.');
      return;
    }

    if(!isTapBoostActive) {
      const updatedFreeTapBoostsUsed = freeTapBoostsUsed + 1;

    let newBoostLevel;
    if (boostLevel === 0) {
      newBoostLevel = 10;
    } else {
      newBoostLevel = boostLevel * 10;
    }

    console.log(`Boost level before activation: ${boostLevel}`);
    setBoostLevel(newBoostLevel);
    setIsTapBoostActive(true);
    setFreeTapBoostsUsed(updatedFreeTapBoostsUsed);
    localStorage.setItem('freeTapBoostsUsed', updatedFreeTapBoostsUsed.toString());
    alert("Tap Boost active")
    await updateDoc(doc(db, 'users', uid), { boostLevel: newBoostLevel });

    console.log(`Boost level after activation: ${newBoostLevel}`);
    setTimeout(async () => {
      console.log('Tap boost time is up.');
      setIsTapBoostActive(false);
      setBoostLevel(originalBoostLevel);
      await updateDoc(doc(db, 'users', uid), { boostLevel: originalBoostLevel });
      console.log('Tap boost has ended, boost level reverted to 0', originalBoostLevel);
      window.location.reload()
    }, 10000);
    } else {
      alert("You already have an active boost")
    }
    
  };


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


          <ul className="flex flex-wrap text-sm font-medium text-center text-gray-500 dark:text-gray-400 m-4">
            <li className="me-2">
              <a href="#" className="inline-block px-4 py-3 rounded-lg hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 dark:hover:text-white" onClick={() => handleFreeClick(1)} aria-current="page" id='firstBoostDiv'>Free Boost</a>
            </li>
            <li className="me-2">
              <a href="#" className="inline-block px-4 py-3 rounded-lg hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 dark:hover:text-white" onClick={() => handleFreeClick(2)} id='secondBoostDiv'>Paid Boost</a>
            </li>
          </ul>
          <div className='free-boost mt-10' id='firstBoost'>
            <div className='mb-10'> <button type="button" className="mb-2 me-2 w-full rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:outline-none focus:ring-4 focus:ring-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white dark:focus:ring-gray-700" onClick={handleFreeBoost}>Free Energy Boost</button>
            </div>
            <div className=' mb-10'><button type="button" className="mb-2 me-2 w-full rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:outline-none focus:ring-4 focus:ring-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white dark:focus:ring-gray-700" onClick={activateTapBoost}>Free Taps Boost
            </button></div>
          </div>
          <div className='free-boost mt-10 hidden' id='secondBoost'>
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
