import React, { useEffect, useState } from 'react'

function Instagram() {
  const [countdown, setCountdown] = useState(3)
  const instagramUrl = "https://www.instagram.com/wuplishwq/" 

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev === 1) {
          window.location.href = instagramUrl
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const handleSkip = () => {
    window.location.href = instagramUrl
  }

  return (
    <div className="redirect-page">
      <h1>Instagram Sayfasına Yönlendiriliyorsunuz...</h1>
      <p>{countdown} saniye içinde otomatik yönlendirme yapılacak.</p>
      <button className="skip-button" onClick={handleSkip}>Hemen Geç</button>
      <p>
        <a href={instagramUrl} target="_blank" rel="noreferrer">
          Yönlendirme gerçekleşmezse buraya tıklayın.
        </a>
      </p>
    </div>
  )
}

export default Instagram
