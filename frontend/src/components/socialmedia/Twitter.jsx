import React, { useEffect, useState } from 'react'

function Twitter() {
  const [countdown, setCountdown] = useState(3)
  const TwitterUrl = "https://www.x.com/wuplish/" 

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev === 1) {
          window.location.href = TwitterUrl
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const handleSkip = () => {
    window.location.href = TwitterUrl
  }

  return (
    <div className="redirect-page">
      <h1>Twitter Sayfasına Yönlendiriliyorsunuz...</h1>
      <p>{countdown} saniye içinde otomatik yönlendirme yapılacak.</p>
      <button className="skip-button" onClick={handleSkip}>Hemen Geç</button>
      <p>
        <a href={TwitterUrl} target="_blank" rel="noreferrer">
          Yönlendirme gerçekleşmezse buraya tıklayın.
        </a>
      </p>
    </div>
  )
}

export default Twitter
