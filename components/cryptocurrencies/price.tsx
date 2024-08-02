import React, { useEffect, useState } from 'react'
import { formatCrypto, fetchCryptoData, fetchSPLTokenData } from '@/lib/utils'
import Spinner from '@/components/Spinner'

interface PriceProps {
  type: 'cryptocurrency' | 'currency' | 'token'
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
        if (type === 'cryptocurrency' && symbol) {
          const data = await fetchCryptoData(symbol)
          if (data) {
            setPrice(data.price)
          } else {
            throw new Error('No price data available for cryptocurrency')
          }
        } else if (type === 'token' && tokenAddress) {
          const data = await fetchSPLTokenData(tokenAddress)
          if (data) {
            setPrice(data.price)
          } else {
            throw new Error('No price data available for SPL token')
          }
        } else {
          throw new Error('Invalid type or missing parameters')
        }
      } catch (err) {
        setError((err as Error).message || 'Failed to fetch price')
      } finally {
        setLoading(false)
      }
    }

    fetchPrice()
  }, [type, symbol, tokenAddress])

  if (loading) {
    return <Spinner />
  }

  if (error) {
    return <div className="error-message">{error}</div>
  }

  return (
    <div className="price-container">
      <h2>{type === 'cryptocurrency' ? `${symbol} Price` : 'Token Price'}</h2>
      <p>
        {price !== null
          ? formatCrypto(price, type === 'cryptocurrency' ? symbol! : tokenAddress!)
          : 'No price available'}
      </p>
    </div>
  )
}

export default Price
