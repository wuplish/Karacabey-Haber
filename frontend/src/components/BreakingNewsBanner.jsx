import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import './BreakingNewsBanner.css'

function BreakingNewsBanner() {
  const [breaking, setBreaking] = useState(null)

  useEffect(() => {
    fetch('http://localhost:5000/breaking')
      .then(res => res.json())
      .then(data => {
        if (data?.id) setBreaking(data)
      })
  }, [])

  if (!breaking) return null

  return (
    <div className="breaking-banner">
      <span>🚨 SON DAKİKA</span>
      <Link to={`/post/${breaking.id}`}>{breaking.title}</Link>
    </div>
  )
}

export default BreakingNewsBanner
