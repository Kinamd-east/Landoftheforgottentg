import React, { useState, useEffect } from 'react'
import { db } from './firebase';
import { Link } from 'react-router-dom';
import LoadingPage from './LoadingPage';
import { doc, getDoc, setDoc, updateDoc, collection, getDocs, QuerySnapshot, deleteDoc } from 'firebase/firestore';
import { bear, coin, Arrow, highVoltage, rocket, trophy, skeleton, heart, skeleton2, skeleton3, skeleton4, skeleton5, skeleton6, skeleton7, skeleton8, background2 } from './images';
import { background, back2, back3 } from './images';

const generateUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

function Earn() {
    const [petals, setPetals] = useState(1000);
    const [buttonText, setButtonText] = useState('Confirm');
    const [loading, setLoading] = useState(false);
    const [loadingPage, setLoadingPage] = useState(true)
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
    const [dailyLoginData, setDailyLoginData] = useState({ currentDay: 0, lastLogin: null, rewardsClaimed: [] });

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
            setLoadingPage(false); // Set loading to false after data is fetched
        }
    };
    const openModal = (quest) => {
        setSelectedQuest(quest);
        setIsModalOpen(true);
    };


    const handleClaimReward = async () => {
        const today = new Date().setHours(0, 0, 0, 0); // Normalize today's date to midnight
        const userRef = doc(db, 'users', uid);

        let { currentDay, lastLogin, rewardsClaimed } = dailyLoginData;

        // Normalize last login date if it exists
        const lastLoginDate = lastLogin ? new Date(lastLogin).setHours(0, 0, 0, 0) : null;

        // Check if reward has already been claimed today
        if (lastLoginDate && lastLoginDate === today) {
            alert("You've already claimed today's reward.");
            return;
        }

        // Check if the last login was yesterday
        const isNextDay = lastLoginDate && (today - lastLoginDate) === 24 * 60 * 60 * 1000;

        // Reset streak if last login was more than 1 day ago
        if (lastLoginDate && !isNextDay) {
            currentDay = 1;
            rewardsClaimed = [];
        } else if (isNextDay) {
            // Increment streak if last login was yesterday
            currentDay = currentDay < 50 ? currentDay + 1 : 1;
        } else {
            // Handle first login or if lastLoginDate is null
            currentDay = 1;
            rewardsClaimed = [];
        }

        const rewardAmount = Math.min(currentDay * 50, 2500);
        rewardsClaimed.push(currentDay);
        const newPetals = Number(petals) + rewardAmount; // Convert petals to number before adding

        // Update state
        setPetals(newPetals);
        setDailyLoginData({
            currentDay,
            lastLogin: new Date().toISOString(),
            rewardsClaimed
        });
        setIsDailyLoginModalOpen(false);

        // Update Firestore
        await updateDoc(userRef, {
            petals: newPetals,
            dailyLoginData: { currentDay, lastLogin: new Date().toISOString(), rewardsClaimed }
        });

        // Save to local storage
        localStorage.setItem('dailyLoginData', JSON.stringify({
            currentDay,
            lastLogin: new Date().toISOString(),
            rewardsClaimed
        }));
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
    if (loadingPage) return <LoadingPage />; // Show loading indicator

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
                <h1 className='mt-10 text-4xl'>Earn more</h1>

                <div className="top-0 left-0 px-4 pt-8 z-10 flex flex-col text-white">
                    <ul className="flex flex-wrap text-sm font-medium text-center text-gray-500 dark:text-gray-400 m-4">
                        <li className="me-2">
                            <a href="#" className="inline-block px-4 py-3 rounded-lg hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 dark:hover:text-white" onClick={() => handleFreeClick(1)} aria-current="page">Daily task</a>
                        </li>
                        <li className="me-2">
                            <a href="#" className="inline-block px-4 py-3 rounded-lg hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 dark:hover:text-white" onClick={() => handleFreeClick(2)}>Social tasks</a>
                        </li>
                    </ul>
                    <div className='mt-10' id='firstBoost'>
                        <div className='mb-10'> <button type="button" className="mb-2 me-2 w-full rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:outline-none focus:ring-4 focus:ring-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white dark:focus:ring-gray-700" onClick={() => setIsDailyLoginModalOpen(true)}>Daily Login</button>
                        </div>
                    </div>
                    <div className='free-boost mt-10 hidden' id='secondBoost'>
                        {/* <h1 className='m-4 text-xl'>Social tasks</h1> */}
                        {quests && quests.length === 0 ? (
                            <div className="text-center text-xl text-gray-600">
                                No quests available
                            </div>
                        ) : (
                            quests && quests.map(quest => (
                                <div className='mb-10' key={quest.id}> <button type="button" className="mb-2 me-2 w-full rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:outline-none focus:ring-4 focus:ring-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white dark:focus:ring-gray-700" onClick={() => openModal(quest)}>{quest.title} - {quest.reward}</button>
                                </div>
                            ))
                        )}


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
                        <div className="min-w-screen h-screen animated fadeIn faster fixed left-0 top-0 flex justify-center items-center inset-0 z-50 outline-none focus:outline-none bg-no-repeat bg-center bg-cover">
                            <div className="absolute bg-black opacity-80 inset-0 z-0"></div>
                            <div className="w-full max-w-lg p-5 relative mx-auto my-auto rounded-xl shadow-lg bg-white max-h-screen overflow-y-auto">
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
                                    <p>Day {dailyLoginData.currentDay}</p>
                                    <p className="text-lg font-medium">Reward: {Math.min(dailyLoginData.currentDay * 50, 2500)} petals</p>
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
                    )}
                </div>

            </div>
        </div >
    )
}

export default Earn
