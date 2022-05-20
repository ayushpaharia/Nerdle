import { useEffect, useLayoutEffect, useState } from "react"

import Navbar from "components/Navbar"
import Game from "components/Game"
import ModalWithScore from "components/ModalWithScore"
import Rules from "components/Rules"

function App() {
  const [open, setOpen] = useState<boolean>(false)
  const [yourScore, setYourScore] = useState<string>("")
  const [scoreArray, setScoreArray] = useState<number[][]>([[]])
  const [showRules, setShowRules] = useState<boolean>(true)

  useEffect(() => {
    getYourScore()
    return () => {
      setShowRules(false)
    }
  }, [scoreArray])

  useLayoutEffect(() => {
    setTimeout(() => setOpen(true), 1000)
  }, [])

  const getYourScore = () => {
    setYourScore(() => {
      return scoreArray
        .filter((x) => x.find((y) => y > 0))
        .map((row) =>
          row
            .map((col) => {
              if (col === 2) return "🟩"
              if (col === 1) return "⬛️"
              return "🟨"
            })
            .join(""),
        )
        .join("\n")
    })
  }

  return (
    <>
      <div
        onClick={() => setOpen(!open)}
        className={`${
          open ? "visibile" : "invisible"
        } absolute z-10 grid w-screen h-screen bg-black bg-opacity-20 overflow-y-hidden place-items-center`}
      >
        {showRules ? (
          <Rules open={open} />
        ) : (
          <ModalWithScore
            yourScore={yourScore}
            open={open}
            scoreArray={scoreArray}
          />
        )}
      </div>
      <div>
        <Navbar />
        <Game
          setOpen={setOpen}
          setShowRules={setShowRules}
          setScoreArray={setScoreArray}
        />
      </div>
    </>
  )
}

export default App
