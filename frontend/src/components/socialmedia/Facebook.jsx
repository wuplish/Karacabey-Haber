import React, { useEffect, useState } from 'react'

function Facebook() {
  const [countdown, setCountdown] = useState(3)
  const facebookUrl = "https://www.facebook.com/wuplish/" 

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev === 1) {
          window.location.href = facebookUrl
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const handleSkip = () => {
    window.location.href = facebookUrl
  }

  return (
    <div className="redirect-page">
      <h1>Facebook Sayfasına Yönlendiriliyorsunuz...</h1>
      <p>{countdown} saniye içinde otomatik yönlendirme yapılacak.</p>
      <button className="skip-button" onClick={handleSkip}>Hemen Geç</button>
      <p>
        <a href={facebookUrl} target="_blank" rel="noreferrer">
          Yönlendirme gerçekleşmezse buraya tıklayın.
        </a>
      </p>
    </div>
  )
}

export default Facebook
