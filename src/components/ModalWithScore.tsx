import React from "react"

type ModalWithScoreType = {
  yourScore: string
  open: boolean
  scoreArray: number[][]
}

const ModalWithScore: React.FC<ModalWithScoreType> = ({
  yourScore,
  open,
  scoreArray,
}) => {
  const getScoreHeight = (): number => {
    return yourScore.length === 0 ? 0 : yourScore.split("\n").length
  }
  const getTextBoxtSize = (): { x: number; y: number } => {
    return {
      x: 27 + getScoreHeight() * 26 + 27,
      y: 15 + scoreArray[0].length * 24 + 15,
    }
  }
  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className={`${
        open ? "translate-y-0" : "translate-y-[100vh]"
      } px-10 py-6 bg-gray-50 rounded-md shadow-md transition-all duration-500 ease-in-out transform `}
    >
      <div className="flex flex-col">
        <h1 className="mb-2 text-2xl font-black text-black">Your Score</h1>
        <textarea
          style={{
            height: yourScore.length > 1 ? getTextBoxtSize().x : 80,
            width: yourScore.length > 1 ? getTextBoxtSize().y : 200,
          }}
          className="pt-6 overflow-y-hidden text-xl font-bold text-center bg-gray-200 rounded-sm outline-none resize-none "
          disabled
          value={yourScore}
        />
        <button
          style={{
            height: 60,
            width: yourScore.length > 1 ? getTextBoxtSize().y : 200,
          }}
          className="py-4 mt-4 font-black text-white bg-purple-500  whitespace-nowrap"
          onClick={() => {
            navigator.clipboard.writeText(yourScore)
          }}
        >
          Click To Copy!
        </button>
      </div>
    </div>
  )
}

export default ModalWithScore
