'use client'

import { useId, useState } from 'react'
import { useActions, useAIState, useUIState } from 'ai/rsc'
import { formatNumber } from '@/lib/utils'

interface PurchaseProps {
  numberOfShares?: number
  symbol: string
  price: number
  status: 'requires_action' | 'completed' | 'expired'
}

export function Purchase({ numberOfShares, symbol, price, status = 'expired' }: PurchaseProps) {
  const [value, setValue] = useState(numberOfShares || 100)
  const [purchasingUI, setPurchasingUI] = useState<React.ReactNode | null>(null)
  const [aiState, setAIState] = useAIState<typeof AI>()
  const [, setMessages] = useUIState<typeof AI>()
  const { confirmPurchase } = useActions()

  const id = useId()

  function onSliderChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newValue = Number(e.target.value)
    setValue(newValue)

    const message = {
      role: 'system' as const,
      content: `[User has changed to purchase ${newValue} shares of ${symbol}. Total cost: $${(newValue * price).toFixed(2)}]`,
      id
    }

    const lastMessage = aiState.messages[aiState.messages.length - 1]
    if (lastMessage?.id === id) {
      setAIState({
        ...aiState,
        messages: [...aiState.messages.slice(0, -1), message]
      })
    } else {
      setAIState({ ...aiState, messages: [...aiState.messages, message] })
    }
  }

  async function handlePurchase() {
    try {
      const response = await confirmPurchase(symbol, price, value)
      setPurchasingUI(response.purchasingUI)
      setMessages((currentMessages: any) => [...currentMessages, response.newMessage])
    } catch (error) {
      console.error('Purchase failed:', error)
      // Handle purchase error (e.g., show a message to the user)
    }
  }

  return (
    <div className="p-4 text-green-400 border rounded-xl bg-zinc-950">
      <div className="inline-block float-right px-2 py-1 text-xs rounded-full bg-white/10">
        +1.23% ↑
      </div>
      <div className="text-lg text-zinc-300">{symbol}</div>
      <div className="text-3xl font-bold">${price}</div>
      {purchasingUI ? (
        <div className="mt-4 text-zinc-200">{purchasingUI}</div>
      ) : status === 'requires_action' ? (
        <>
          <div className="relative pb-6 mt-6">
            <p>Shares to purchase</p>
            <input
              id="labels-range-input"
              type="range"
              value={value}
              onChange={onSliderChange}
              min="10"
              max="1000"
              aria-label="Number of shares to purchase"
              className="w-full h-1 rounded-lg appearance-none cursor-pointer bg-zinc-600 accent-green-500 dark:bg-zinc-700"
            />
            <div className="flex justify-between text-xs text-zinc-400">
              <span>10</span>
              <span>100</span>
              <span>500</span>
              <span>1000</span>
            </div>
          </div>

          <div className="mt-6">
            <p>Total cost</p>
            <div className="flex flex-wrap items-center text-xl font-bold sm:items-end sm:gap-2 sm:text-3xl">
              <div className="flex flex-col basis-1/3 tabular-nums sm:basis-auto sm:flex-row sm:items-center sm:gap-2">
                {value}
                <span className="mb-1 text-sm font-normal text-zinc-600 sm:mb-0 dark:text-zinc-400">
                  shares
                </span>
              </div>
              <div className="text-center basis-1/3 sm:basis-auto">×</div>
              <span className="flex flex-col basis-1/3 tabular-nums sm:basis-auto sm:flex-row sm:items-center sm:gap-2">
                ${price}
                <span className="mb-1 ml-1 text-sm font-normal text-zinc-600 sm:mb-0 dark:text-zinc-400">
                  per share
                </span>
              </span>
              <div className="pt-2 mt-2 text-center border-t basis-full border-t-zinc-700 sm:mt-0 sm:basis-auto sm:border-0 sm:pt-0 sm:text-left">
                = <span>{formatNumber(value * price)}</span>
              </div>
            </div>
          </div>

          <button
            className="w-full px-4 py-2 mt-6 font-bold bg-green-400 rounded-lg text-zinc-900 hover:bg-green-500"
            onClick={handlePurchase}
          >
            Purchase
          </button>
        </>
      ) : status === 'completed' ? (
        <p className="mb-2 text-white">
          You have successfully purchased {value} shares of {symbol}. Total cost:{' '}
          {formatNumber(value * price)}
        </p>
      ) : status === 'expired' ? (
        <p className="mb-2 text-white">Your checkout session has expired!</p>
      ) : null}
    </div>
  )
}
