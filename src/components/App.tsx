import { useEffect, useState } from "react"
import Navbar from "components/Navbar"
import Game from "components/Game"

function App() {
  const [open, setOpen] = useState<boolean>(false)
  const [yourScore, setYourScore] = useState<string>("")
  const [scoreArray, setScoreArray] = useState<number[][]>([[]])

  useEffect(() => {
    getYourScore()
  }, [scoreArray])

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

  const getScoreHeight = () => {
    return yourScore.length === 0 ? 0 : yourScore.split("\n").length
  }

  return (
    <>
      <div
        onClick={() => setOpen(!open)}
        className={`${
          open ? "visibile" : "invisible"
        } absolute z-10 grid w-screen  h-screen overflow-y-hidden place-items-center`}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className={`${
            open ? "translate-y-0" : "translate-y-[100vh]"
          } px-10 py-6 bg-gray-50 rounded-md shadow-md transition-all duration-500 ease-in-out transform`}
        >
          <h1 className="mb-2 text-2xl font-black text-black">Your Score</h1>
          <textarea
            style={{
              height: 27 + getScoreHeight() * 26 + 27,
              width: 15 + scoreArray[0].length * 24 + 15,
            }}
            className="pt-6 overflow-y-hidden text-xl font-bold text-center bg-gray-200 rounded-sm outline-none resize-none "
            disabled
            value={yourScore}
          />
        </div>
      </div>
      <div>
        <Navbar />
        <Game setOpen={setOpen} setScoreArray={setScoreArray} />
      </div>
    </>
  )
}

export default App
