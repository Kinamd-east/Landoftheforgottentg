import React, { useEffect, useState } from 'react'
import { scare } from './images'

function LoadingPage() {
  const dotDiv = document.getElementById('dot-div')
  const anotherDotDiv = document.getElementById('new-dot')
  const newDiv = document.createElement('h2')
  newDiv.innerHTML = '.'
  const anotherDiv = document.createElement('h2')
  anotherDiv.innerHTML = '.'
  const [loading, setLoading] = useState(0)
  setTimeout(() => {
    if (loading <= 100) {
      const load = loading + 20
      setLoading(load)
      console.log(loading)
      dotDiv?.append(newDiv)
      anotherDotDiv?.append(anotherDiv)
    }
    else if(loading == 100) {
      console.error('Network error')
    }
  }, 1000);
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     if (loading < 100) {
  //       // setHealth(prev => Math.min(prev + 1, maxHealth));
  //       // setEnergy(prev => Math.max(prev - 1, 0));
  //       // updateDoc(doc(db, 'users', uid), { health: Math.min(health + 1, maxHealth), energy: Math.max(energy - 1, 0) });
  //       const load = loading + 20
  //       setIsLoading(load)
  //       console.log(loading)
  //     }
  //   }, 1000);
  //   return () => clearInterval(interval);
  // })
  console.dir(dotDiv)
  // setTimeout(() => {
  //   dotDiv.innerHTML = '.'
  // }, 1000)
  return (
    <div className='min-h-screen fixed bottom-0 left-0 w-full px-4 pb-7 z-10' style={{ backgroundImage: `url(${scare})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', }}>
      <h1 className='text-white scare-text text-2xl'>We will all be forgotten...</h1>
      <div className='text-white text-2xl flex flex-row x-div justify-center w-full flex-wrap'>
        <h1 className='x-text'>x</h1>
        <div className='dot flex flex-row items-center' id='dot-div'>
          {/* <h2>.</h2>
          <h2>.</h2>
          <h2>.</h2>
          <h2>.</h2>
          <h2>.</h2>
          <h2>.</h2>
          <h2>.</h2>
          <h2>.</h2>
          <h2>.</h2>
          <h2>.</h2> */}
        </div>
        <h1 className='x-text'>x</h1>
        <div className='dot flex flex-row items-center' id='new-dot'>
          {/* <h2>.</h2>
          <h2>.</h2>
          <h2>.</h2>
          <h2>.</h2>
          <h2>.</h2>
          <h2>.</h2>
          <h2>.</h2>
          <h2>.</h2>
          <h2>.</h2>
          <h2>.</h2> */}
        </div>
        <h1 className='x-text'>x</h1>
      </div>
    </div>
  )
}

export default LoadingPage
