'use client'
import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

export default function SatoshiHome() {
  const [inputText, setInputText] = useState("")
  const [response, setResponse] = useState("")
  const [history, setHistory] = useState<string[]>([])
  const [mintVisible, setMintVisible] = useState(false)
  const [mintedCount, setMintedCount] = useState<number | null>(null)

  const handleSubmit = async () => {
    if (!inputText.trim()) return

    if (inputText.length === 16) {
      const res = await fetch("/api/verifyCode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: inputText, historyLength: history.length })
      })
      const data = await res.json()
      if (data.redirectToChat) {
        window.location.href = "/chat"
        return
      }
    }

    const res = await fetch("/api/askQuestion", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: inputText, history })
    })
    const data = await res.json()
    setResponse(data.answer)
    setHistory([...history, data.answer])

    if (data.triggerMint) {
      setMintVisible(true)
      const mintRes = await fetch("/api/getMintStatus")
      const mintData = await mintRes.json()
      setMintedCount(mintData.count)
    }

    setInputText("")
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
      <motion.h1 className="text-3xl mb-6 font-mono" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>The Satoshi Terminal</motion.h1>

      <Card className="w-full max-w-xl">
        <CardContent>
          <Input
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask a question or enter your code..."
            className="mb-2"
          />
          <Button onClick={handleSubmit} className="w-full mb-4">Submit</Button>
          {response && <p className="font-mono mb-2">{response}</p>}

          {mintVisible && (
            <div className="bg-yellow-100 text-black p-3 rounded-xl">
              <p className="text-sm mb-1">A Fragment is ready to be minted</p>
              <a href="https://nowpayments.io/payment/?iid=5027752605" target="_blank" rel="noreferrer">
                <Button variant="outline" className="w-full">Pay $3.14 to Mint</Button>
              </a>
              {mintedCount !== null && (
                <p className="text-xs mt-2">{mintedCount.toLocaleString()} / 21,000,000 minted</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}