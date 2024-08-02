import React, { useEffect, useState } from 'react'
import { formatCrypto, fetchCryptoData, fetchSPLTokenData } from '@/lib/utils'

interface PriceProps {
  type: 'crypto' | 'spl'
  symbol?: string
  tokenAddress?: string
}

const Price: React.FC<PriceProps> = ({ type, symbol, tokenAddress }) => {
  const [price, setPrice] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPrice = async () => {
      setLoading(true)
      setError(null)

      try {
        if (type === 'crypto' && symbol) {
          const data = await fetchCryptoData(symbol)
          if (data) {
            setPrice(data.price)
          }
        } else if (type === 'spl' && tokenAddress) {
          const data = await fetchSPLTokenData(tokenAddress)
          if (data) {
            setPrice(data.price)
          }
        } else {
          throw new Error('Invalid type or missing parameters')
        }
      } catch (err) {
        setError('Failed to fetch price')
      } finally {
        setLoading(false)
      }
    }

    fetchPrice()
  }, [type, symbol, tokenAddress])

  if (loading) {
    return <p>Loading...</p>
  }

  if (error) {
    return <p>{error}</p>
  }

  return (
    <div className="price-container">
      <h2>{type === 'crypto' ? `${symbol} Price` : 'SPL Token Price'}</h2>
      <p>{price !== null ? formatCrypto(price, type === 'crypto' ? symbol! : tokenAddress!) : 'No price available'}</p>
    </div>
  )
}

export default Price
