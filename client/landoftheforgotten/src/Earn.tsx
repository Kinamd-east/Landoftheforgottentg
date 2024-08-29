import React, { useState, useEffect } from 'react'
import { db } from './firebase';
import LoadingPage from './LoadingPage';
import { doc, getDoc, setDoc, updateDoc, collection, getDocs, QuerySnapshot, deleteDoc } from 'firebase/firestore';
import { bear, coin, highVoltage, rocket, trophy, skeleton, heart, skeleton2, skeleton3, skeleton4, skeleton5, skeleton6, skeleton7, skeleton8, background2 } from './images';
import { background, back2, back3 } from './images';

const generateUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

function Earn() {
    const [petals, setPetals] = useState(0);
    const [buttonText, setButtonText] = useState('Confirm');
    const [loading, setLoading] = useState(false);
    const [loadingPage, setLoadingPage] = useState(false)
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
    const [loginStreak, setLoginStreak] = useState(0);
    const [quests, setQuests] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedQuest, setSelectedQuest] = useState(null);
    const [isDailyLoginModalOpen, setIsDailyLoginModalOpen] = useState(false);
    const [dailyLoginData, setDailyLoginData] = useState({ currentDay: 1, lastLogin: null, rewardsClaimed: [] });

    useEffect(() => {
        const fetchQuests = async () => {
            const questCollection = collection(db, 'quests');
            const questSnapshot = await getDocs(questCollection);
            const questList = questSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setQuests(questList);
        };

        fetchQuests();
    }, []);


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
             setLoginStreak(userData.loginStreak || 0);
             setDailyLoginData(userData.dailyLoginData || { currentDay: 1, lastLogin: null, rewardsClaimed: [] });
 
             handleDailyLogin(userData.lastLogin, userData.loginStreak);
             setBoostLevel(userData.boostLevel);
             setBoostPrice(userData.boostPrice);
             setHealth(userData.health);
             setMaxHealth(userData.maxHealth);
             setEnergy(userData.energy);
             setMaxEnergy(userData.maxEnergy);
             setEnergyUpgradePrice(userData.energyUpgradePrice);
         } else {
             await setDoc(userRef, {
                 loginStreak: 0,
                 lastLogin: null,
                 petals: 1000,
                 boostLevel: 0,
                 boostPrice: 1000,
                 health: 1000000,
                 maxHealth: 1000000,
                 energy: 1000,
                 maxEnergy: 1000,
                 energyUpgradePrice: 1000,
                 invitedUsers: [],
                 dailyLoginData: { currentDay: 1, lastLogin: null, rewardsClaimed: [] }
             });
         }
       } catch (error) {
        console.error('Error loading user data:', error);
       }finally {
        setLoadingPage(false); // Set loading to false after data is fetched
      }
    };

    const openModal = (quest) => {
        setSelectedQuest(quest);
        setIsModalOpen(true);
    };
    const handleDailyLogin = (lastLogin, currentStreak) => {
        const today = new Date().setHours(0, 0, 0, 0); // Midnight today
        const lastLoginDate = lastLogin ? lastLogin.toDate().setHours(0, 0, 0, 0) : null;
        let newStreak = 1;
        const newLoginDays = [];

        if (lastLoginDate) {
            const diffDays = Math.round((today - lastLoginDate) / (1000 * 60 * 60 * 24));

            if (diffDays === 1) {
                newStreak = currentStreak + 1;
            } else if (diffDays > 1) {
                newStreak = 1;
            } else {
                return;
            }
        }

        // Update the login days array
        for (let i = 0; i < newStreak; i++) {
            newLoginDays.push({
                day: i + 1,
                claimed: i < currentStreak
            });
        }

        // Add the current day status
        newLoginDays.push({
            day: newStreak + 1,
            claimed: false
        });

        const reward = Math.min(newStreak * 50, 2500);
        const newPetals = petals + reward;
        setPetals(newPetals);
        setLoginStreak(newStreak);
        setDailyLoginData(prevData => ({
            ...prevData,
            currentDay: newStreak + 1,
            rewardsClaimed: newLoginDays.filter(d => d.claimed).map(d => d.day)
        }));

        // Update Firestore
        const userRef = doc(db, 'users', uid);
        updateDoc(userRef, {
            petals: newPetals,
            loginStreak: newStreak,
            lastLogin: new Date(),
            dailyLoginData: {
                currentDay: newStreak + 1,
                lastLogin: new Date(),
                rewardsClaimed: newLoginDays.filter(d => d.claimed).map(d => d.day)
            }
        });
    };


    const handleDailyLoginClick = () => {
        setIsDailyLoginModalOpen(true);
    };

    const handleClaimReward = async () => {
        const today = new Date().toDateString();
        const userRef = doc(db, 'users', uid);

        let { currentDay, lastLogin, rewardsClaimed } = dailyLoginData;

        if (lastLogin) {
            const lastLoginDate = lastLogin.toDate().toDateString();
            if (lastLoginDate === today) {
                alert('You have already claimed today\'s reward.');
                return;
            }
        }

        if (lastLogin && lastLogin.toDate().toDateString() !== today) {
            // If the last login was not yesterday, reset progress
            currentDay = 1;
            rewardsClaimed = [];
        } else if (currentDay < 50) {
            currentDay++;
        } else {
            currentDay = 1; // Reset after day 50
        }

        const rewardAmount = currentDay * 50;
        rewardsClaimed.push(currentDay);

        const newPetals = petals + rewardAmount;
        setPetals(newPetals);

        setDailyLoginData({
            currentDay,
            lastLogin: new Date(),
            rewardsClaimed
        });
        setIsDailyLoginModalOpen(false);

        await updateDoc(userRef, {
            petals: newPetals,
            dailyLoginData: { currentDay, lastLogin: new Date(), rewardsClaimed }
        });
    };

    const handleConfirmClick = () => {
        if (buttonText === 'Confirm') {
            // Open the link in a new tab
            window.open(selectedQuest.link, '_blank');

            // Start the loading state and set a timeout to change the button text
            setLoading(true);
            setTimeout(() => {
                setButtonText('Take Reward');
                setLoading(false);
            }, 5000);
        } else {
            // If the button says "Take Reward," award the reward and close the modal
            handleReward();
            setIsModalOpen(false)// Close the modal
        }
    };

    const handleReward = async () => {
        try {
            // Add reward to user's petals balance and remove the quest from the database
            const userId = uid; // replace with the actual user id
            const questId = selectedQuest.id
            const questDocRef = doc(db, 'quests', questId);
            const rewardAmount = Number(selectedQuest.reward);
        const newPetals = Number(petals) + rewardAmount;
            setPetals(newPetals);

            await updateDoc(doc(db, 'users', uid), { petals: newPetals });


            // Remove quest from the database
            await deleteDoc(questDocRef);
            console.log(`Quest ${questId} successfully deleted`);
            window.location.reload()
        } catch (error) {
            console.error("Error deleting quest: ", error);
        }

    };

    if (loadingPage) return <LoadingPage />; // Show loading indicator

    return (
        <div className="min-h-screen px-4 flex flex-col text-white font-medium items-center bg-[#1f1f1f]">

            <div className="absolute inset-0 h-1/2 bg-gradient-overlay z-0"></div>
            <div className="absolute inset-0 flex items-center justify-center z-0">
                <div className="radial-gradient-overlay"></div>
            </div>

            <div className="w-full z-10 min-h-screen flex flex-col text-white items-center">
                <div className="mt-12 text-5xl font-bold flex items-center">
                    <img src={coin} width={44} height={44} />
                    <span className="ml-2">{petals.toLocaleString()}</span>
                </div>
                <h1 className='mt-10 text-4xl'>Earn more</h1>

                <div className="top-0 left-0 px-4 pt-8 z-10 flex flex-col text-white">
                    <div className='mt-10'>
                        <h1 className='m-4 text-xl'>Daily</h1>
                        <div className='mb-10'>
                            <button
                                className="text-center relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-2xl font-medium text-white rounded-lg group max-"
                                onClick={() => setIsDailyLoginModalOpen(true)}
                            >
                                <span className="h-20 relative px-5 py-2.5 transition-all ease-in duration-100 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
                                    Daily Login
                                </span>
                            </button>
                        </div>
                    </div>
                    <div className='free-boost mt-10'>
                        <h1 className='m-4 text-xl'>Social tasks</h1>
                        {quests.map(quest => (
                            <div className='mb-10' key={quest.id}>
                                <button
                                    className="text-center relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-2xl font-medium text-gray-900 rounded-lg group"
                                    onClick={() => openModal(quest)}
                                >
                                    <span className="h-20 relative px-5 py-2.5 transition-all ease-in duration-100 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
                                        {quest.title} - {quest.reward}
                                    </span>
                                </button>
                            </div>
                        ))}
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
                                        <h2 className="text-xl font-bold py-4 text-gray-500">Social task</h2>
                                        {selectedQuest && (
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-500 mb-4">{selectedQuest.title}</h3>
                                                <p className="text-gray-500 mb-4">{selectedQuest.description}</p>
                                                <p className="text-gray-500 mb-4">Reward: {selectedQuest.reward}</p>
                                                <div className="p-3 mt-2 text-center space-x-4 md:block">
                                                    <button className={`confirm-button mb-2 md:mb-0 bg-gray-500 border border-gray-500 px-5 py-2 text-sm shadow-sm font-medium tracking-wider text-white rounded-full hover:shadow-lg hover:bg-gray-600 ${loading && 'loading'}`} onClick={handleConfirmClick}>{buttonText}</button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {isDailyLoginModalOpen && (
                        <div className="min-w-screen h-screen animated fadeIn faster  fixed  left-0 top-0 flex justify-center items-center inset-0 z-50 outline-none focus:outline-none bg-no-repeat bg-center bg-cover">
                            <div className="absolute bg-black opacity-80 inset-0 z-0"></div>
                            <div className="w-full  max-w-lg p-5 relative mx-auto my-auto rounded-xl shadow-lg  bg-white ">
                                <div className="">
                                    <div className="text-center p-5 flex-auto justify-center">
                                        <button
                                            type="button"
                                            onClick={() => setIsDailyLoginModalOpen(false)}
                                            className="absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 inline-flex items-center"
                                        >
                                            <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 1l12 12M13 1 1 13" />
                                            </svg>
                                            <span className="sr-only">Close modal</span>
                                        </button>
                                        <h2 className="text-xl font-bold py-4 text-gray-500">Daily Login Rewards</h2>
                                        <div className="grid grid-cols-5 gap-4">
                                            {Array.from({ length: 50 }).map((_, index) => (
                                                <div
                                                    key={index}
                                                    className={`p-2 text-center rounded-lg text-black ${index < dailyLoginData.currentDay - 1 ? 'bg-green-200' : 'bg-gray-100'}`}
                                                >
                                                    {index + 1}
                                                    {dailyLoginData.rewardsClaimed.includes(index + 1) && (
                                                        <span className="text-green-500 ml-2">&#10003;</span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                        <div className="text-center pt-4">
                                            <p className="mt-4">Today's Reward: {Math.min(dailyLoginData.currentDay * 50, 2500)} petals</p>
                                            <button
                                                className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 mt-4"
                                                onClick={handleClaimReward}
                                            >
                                                Claim Reward
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </div >
    )
}

export default Earn
