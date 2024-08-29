import React, { useEffect, useState } from 'react';
import { db } from './firebase';
import { Link } from 'react-router-dom';
import LoadingPage from './LoadingPage';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { bear, coin, highVoltage, rocket, trophy, skeleton, heart, skeleton2, skeleton3, skeleton4, skeleton5, skeleton6, skeleton7, skeleton8, background2 } from './images';
import { back3 } from './images';

const generateUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

const VictoryModal = ({ onClose }) => (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
    <div className="bg-white p-6 rounded-lg text-center">
      <h2 className="text-xl font-bold mb-4">Victory!</h2>
      <p className="mb-4">You defeated the enemy and earned 3000 petals!</p>
      <button
        className="px-4 py-2 bg-blue-500 text-white rounded"
        onClick={onClose}
      >
        Claim Reward
      </button>
    </div>
  </div>
);


const CoinApp = () => {
  const [petals, setPetals] = useState(1000);
  const [boostLevel, setBoostLevel] = useState(0);
  const [boostPrice, setBoostPrice] = useState(1000);
  const [health, setHealth] = useState(1000000);
  const [maxHealth, setMaxHealth] = useState(1000000);
  const [energy, setEnergy] = useState(1000);
  const [maxEnergy, setMaxEnergy] = useState(1000);
  const [energyUpgradePrice, setEnergyUpgradePrice] = useState(1000);
  const [uid, setUid] = useState(localStorage.getItem('uid') || generateUID());
  const [tapPosition, setTapPosition] = useState(null);
  const [increments, setIncrements]= useState([]);
  const [tapEffect, setTapEffect] = useState(false);
  const [clicks, setClicks] = useState([]);
  const [loading, setLoading] = useState(true); // Loading state
  const [currentImage, setImage] = useState(skeleton); // Initial image
  const [showVictoryModal, setShowVictoryModal] = useState(false); // New state for modal


  const imagesArray = [skeleton, skeleton2, skeleton3, skeleton4, skeleton5, skeleton6, skeleton7, skeleton8];


  useEffect(() => {
    localStorage.setItem('uid', uid);
    loadUserData(uid);
  }, [uid]);

  useEffect(() => {
    const index = (maxHealth / 1000000) - 1; // Determine the image based on maxHealth
    if (index >= 0 && index < imagesArray.length) {
      setImage(imagesArray[index]);
    }
  }, [maxHealth]); // Run this effect whenever maxHealth changes

  useEffect(() => {
    // Attempt to retrieve the Telegram username
    const initializeUser = async () => {
      let username;
      
      try {
        // This assumes you have access to Telegram WebApp SDK
        username = window.Telegram.WebApp.initDataUnsafe.user.username;
      } catch (error) {
        console.log("Telegram username not available:", error);
      }
      
      const finalUid = username || uid;
      setUid(finalUid);
      localStorage.setItem('uid', finalUid);
      await loadUserData(finalUid);
    };

    initializeUser();
  }, [uid]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (energy < maxEnergy && health < maxHealth) {
        setHealth(prev => Math.min(prev + 1, maxHealth));
        setEnergy(prev => Math.max(prev - 1, 0));
        updateDoc(doc(db, 'users', uid), { health: Math.min(health + 1, maxHealth), energy: Math.max(energy - 1, 0) });
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [energy, health, maxEnergy, maxHealth, uid]);

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
        await setDoc(userRef, { petals: 1000, boostLevel: 0, boostPrice: 1000, health: 1000000, maxHealth: 1000000, energy: 1000, maxEnergy: 1000, energyUpgradePrice: 1000, invitedUsers: []  });
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false); // Set loading to false after data is fetched
    }
  };


  const handleTap = async (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (loading || energy <= 0) return;

    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left; // Relative x position
    const y = e.clientY - rect.top;   // Relative y position

    // card.style.transform = `perspective(1000px) rotateX(${-y / 10}deg) rotateY(${x / 10}deg)`;
    // setTimeout(() => {
    //   card.style.transform = '';
    // }, 100);

    const incrementValue = 1 + boostLevel;
    const newPetals = petals + incrementValue;
    const newHealth = Math.max(health - incrementValue, 0);
    const newEnergy = Math.max(energy - incrementValue, 0);

    setPetals(newPetals)
    setHealth(newHealth);
    setEnergy(newEnergy);
    setClicks([...clicks, { id: Date.now(), x, y, value: incrementValue }]);

    await updateDoc(doc(db, 'users', uid), { petals: newPetals, health: newHealth, energy: newEnergy });

    if (newHealth === 0) {
      const nextMaxHealth = maxHealth + 1000000;
      setMaxHealth(nextMaxHealth);
      setShowVictoryModal(true);
      setHealth(nextMaxHealth);
      await updateDoc(doc(db, 'users', uid), { maxHealth: nextMaxHealth, health: nextMaxHealth });
      // Update the image based on the new maxHealth
      const index = (nextMaxHealth / 1000000) - 1;
      if (index >= 0 && index < imagesArray.length) {
        setImage(imagesArray[index]);
      }
    }
  };

  useEffect(() => {
    if (increments.length > 0) {
      const timer = setTimeout(() => {
        setIncrements(increments.filter(increment => Date.now() - increment.id < 1000));
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [increments]);

  const handleAnimationEnd = (id: number) => {
    setClicks((prevClicks) => prevClicks.filter(click => click.id !== id));
  };

  const closeVictoryModal = () => {
    setShowVictoryModal(false);
  };
  
  let allowBannerSlideIn = false;

function runInitialFunction() {
    // This is the function that needs to run first
    allowBannerSlideIn = true;
    console.log('Initial function has run.');
}

function triggerBannerSlideIn() {
    if (allowBannerSlideIn) {
        setTimeout(() => {
            const banner = document.getElementById('marketing-banner');
            banner.classList.add('slide-in');
        }, 5000);
    }
}

// Example usage
runInitialFunction(); // This function needs to be called first
triggerBannerSlideIn(); // This triggers the banner animation after 5 seconds


  if (loading) return <LoadingPage />; // Show loading indicator

  return (
    <div className="min-h-screen px-4 flex flex-col items-center text-white font-medium" style={{
      backgroundImage: `url(${back3})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', height: '100vh' // Ensures it takes the full viewport height
    }}>
      <div className="fixed top-0 left-0 w-full px-4 pt-8 z-10 flex flex-col items-center text-white">
        <div className="w-full cursor-pointer">
          <div className="bg-[#1f1f1f] text-center py-2 rounded-xl">
            <p className="text-lg">Join squad</p>
          </div>
        </div>
        <div className="mt-12 text-5xl font-bold flex items-center">
          <img src={coin} width={44} height={44} />
          <span className="ml-2" id="petalCount">{petals.toLocaleString()}</span>
        </div>
        <div className="text-base mt-2 flex items-center">
          <img src={trophy} width={24} height={24} />
        </div>
      </div>
      <div className="fixed bottom-0 left-0 w-full px-4 pb-4 z-10">
        <div className="w-full flex justify-between gap-2">
          <div className="flex items-center justify-center divforfriends">
            <img src={heart} width={44} height={44} alt="High Voltage" />
            <div className="ml-2 text-left">
              <span className="text-white text-2xl font-bold block">{health}</span>
              <span className="text-white text-large opacity-75">/ {maxHealth}</span>
            </div>
          </div>
          <div className="w-1/3 flex items-center justify-start max-w-32">
            <div className="flex items-center justify-center divforfriends">
              <img src={highVoltage} width={44} height={44} alt="High Voltage" />
              <div className="ml-2 text-left">
                <span className="text-white text-2xl font-bold block">{energy}</span>
                <span className="text-white text-large opacity-75">/ {maxEnergy}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex-grow flex items-center max-w-70 text-sm">
          <div className="w-full bg-[#b69a47] py-4 rounded-2xl flex justify-around">
            <a href="/invites">
              <button className="flex flex-col items-center gap-1">
                <img src={bear} width={30} height={30} alt="Invites" />
                <span>Invites</span>
              </button>
              <div className="dot"></div>
            </a>
            <div className="h-[48px] w-[2px] bg-[#fddb6d]"></div>
            <button className="flex flex-col items-center gap-1">
              <Link to="/earn">
                <img src={coin} width={30} height={30} alt="Earn" />
                <span>Earn</span>
              </Link>
            </button>
            <div className="h-[48px] w-[2px] bg-[#fddb6d]"></div>
            <button className="flex flex-col items-center gap-1">
              <Link to="/boost">
                <img src={rocket} width={30} height={30} alt="boosts" />
                <span>Boosts</span>
              </Link>
            </button>
          </div>
        </div>
        <div className="progress-container sm:order-1">
          <div className="progress-bar" style={{ width: `${(energy / maxEnergy) * 100}%` }}></div>
        </div>
      </div>
      {/* <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <h1 className="text-3xl font-bold mb-4">Petal Tap Game</h1>
        <p className="text-xl mb-4">Petals: <span id="petalCount">{petals}</span></p>
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded mb-4"
          onClick={handleTap}
        >
          Tap
        </button>
        <p className="text-xl mb-4">Boost Level: <span id="boostLevel">{boostLevel}</span></p>
        <p className="text-xl mb-4">Boost Price: <span id="boostPrice">{boostPrice}</span></p>
        <button
          className="px-4 py-2 bg-green-500 text-white rounded mb-4"
          onClick={handleBoost}
        >
          Buy Boost
        </button>
        <button
          className="px-4 py-2 bg-orange-500 text-white rounded mb-4"
          onClick={handleEnergyUpgrade}
        >
          Upgrade Energy
        </button>
        <p className="text-xl mb-4">Health: <span id="health">{health}</span>/{maxHealth}</p>
        <p className="text-xl mb-4">Energy: <span id="energy">{energy}</span>/{maxEnergy}</p>
        <p className="text-xl mb-4">Energy Upgrade Price: <span id="energyUpgradePrice">{energyUpgradePrice}</span></p>
      </div> */}
      <div className="flex-grow flex items-center justify-center">
        <div className="relative mt-20 tap-animation" onClick={handleTap}>
          <img src={currentImage} width={300} height={300} alt="landoftheforgotten" className='flex-wrap ' />
          {clicks.map((click) => (
            <div
              key={click.id}
              className="absolute text-5xl font-bold opacity-100 text-white pointer-events-none increment"
              // style={{
              //   top: `${click.y}px`,
              //   left: `${click.x}px`,
              //   transform: 'translate(-50%, -50%)',
              //   animation: 'float 1s ease-out'
              // }}
              // onAnimationEnd={() => handleAnimationEnd(click.id)}
              onAnimationEnd={() => handleAnimationEnd(click.id)}>
              +{click.value}
            </div>
          ))}
        </div>
        <div
  id="marketing-banner"
  tabIndex={-1}
  className="fixed z-50 flex flex-col md:flex-row justify-between w-[35rem] p-4 -translate-x-1/2 bg-white border border-gray-100 rounded-lg shadow-sm lg:max-w-7xl left-1/2 top-6 dark:bg-gray-700 dark:border-gray-600"
>
  <div className="flex flex-col items-start mb-3 me-4 md:items-center md:flex-row md:mb-0">
    
    <p className="flex items-center text-sm font-normal text-gray-500 dark:text-gray-400">
      Purchase a Potion to protect your energy from being stolen by the enemy
    </p>
  </div>
  <div className="flex items-center flex-shrink-0">
    <a
      href="/boost"
      className="px-5 py-2 me-2 text-xs font-medium text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
    >
      Purchase
    </a>
    <button
      data-dismiss-target="#marketing-banner"
      type="button"
      className="flex-shrink-0 inline-flex justify-center w-7 h-7 items-center text-gray-400 hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 dark:hover:bg-gray-600 dark:hover:text-white"
    >
      <svg
        className="w-3 h-3"
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 14 14"
      >
        <path
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
        />
      </svg>
      <span className="sr-only">Close banner</span>
    </button>
  </div>
</div>


      </div>

      {showVictoryModal && <VictoryModal onClose={closeVictoryModal} />}

    </div>
  );
};

export default CoinApp;
