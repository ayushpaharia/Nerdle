import { useEffect, useState } from "react"
import { evaluate } from "mathjs"

type GameSquare = {
  value: string
  state: "default" | "incorrect" | "correct" | "partially-correct" | "empty"
}

function create2DArray(rows: number, cols: number): Array<Array<GameSquare>> {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({ value: "", state: "default" })),
  )
}

function checkIfValidEquation(equation: string): boolean {
  if (!equation.split("").find((char) => char === "=")) {
    return false
  }
  const LHS = equation.split("=")[0]
  const RHS = equation.split("=")[1]
  return evaluate(LHS) == evaluate(RHS)
}

const Answers = [
  "1+2-3=0",
  "5/5=1",
  "10*10=100",
  "5+60=65",
  "200/100=2",
  "144/12+1=13",
]
const chooseRandomEquation = (): string => {
  return Answers[Math.floor(Math.random() * Answers.length)]
}

function Game() {
  const [answerEquation, setAnswerEquation] = useState(chooseRandomEquation())
  const [cheat, setCheat] = useState(false)
  const ROWS = 2
  const COLS = answerEquation.length

  useEffect(() => {
    SetGameMatrix(create2DArray(ROWS, COLS))
  }, [answerEquation])

  const [guessCount, setGuessCount] = useState(0)
  const [gameState, setGameState] = useState<"playing" | "lost" | "won">(
    "playing",
  )
  const [headValue, setHeadValue] = useState("")

  useEffect(() => {
    setHeadValue("[playing...]")
    if (guessCount == ROWS) {
      setGameState("lost")
      setHeadValue("[lost...]")
      setIsError(true)
    }
  }, [guessCount])

  const [isValidEquation, setIsValidEquation] = useState(true)
  const [isError, setIsError] = useState(false)

  useEffect(() => {
    let isValidEquation = checkIfValidEquation(answerEquation)

    setIsValidEquation(isValidEquation)
    setIsError(!isValidEquation)
  }, [])

  useEffect(() => {
    if (!isValidEquation) {
      setIsError(true)
      setHeadValue("[Invalid equation]")
    }
  }, [isError])

  const [GameMatrix, SetGameMatrix] = useState(create2DArray(ROWS, COLS))

  const handleInputChange = ({
    e,
    rowIndex,
    colIndex,
  }: {
    e: React.KeyboardEvent<HTMLInputElement>
    rowIndex: number
    colIndex: number
  }) => {
    if (e.key.toLowerCase() === "enter") {
      takeAGuess()
      return
    }
    if (e.key.toLowerCase() === " ") {
      // TODO: goto next input
      return
    }

    // Check valid character 0-9 or + - * /
    if (e.key.match(/[\d+/*-=]/)) {
      SetGameMatrix((prev) => {
        const newMatrix = [...prev]
        newMatrix[rowIndex][colIndex] = { value: e.key, state: "default" }
        return newMatrix
      })
    } else console.log("Invalid input ", e.key)
  }

  const takeAGuess = () => {
    let isFilled = true
    let answer = ""
    for (let i = 0; i < COLS; i++) {
      if (GameMatrix[guessCount][i].value === "") {
        SetGameMatrix((prev) => {
          const newMatrix = [...prev]
          newMatrix[guessCount][i] = { value: "", state: "empty" }
          return newMatrix
        })
        isFilled = false
      } else answer = answer.concat(GameMatrix[guessCount][i].value)
    }
    if (isFilled) {
      // Evaluate Answer
      if (!checkIfValidEquation(answer)) {
        console.log("[Invalid answer]")
        setIsError(true)
        setHeadValue("[Invalid Equation]")
      } else {
        setIsError(false)
        const newMatrix = [...GameMatrix]
        for (let i = 0; i < COLS; i++) {
          SetGameMatrix(() => {
            if (answer[i] === answerEquation[i]) {
              newMatrix[guessCount][i] = { value: answer[i], state: "correct" }
            } else if (
              answerEquation.split("").find((char) => char === answer[i])
            ) {
              newMatrix[guessCount][i] = {
                value: answer[i],
                state: "partially-correct",
              }
            } else {
              newMatrix[guessCount][i] = {
                value: answer[i],
                state: "incorrect",
              }
            }
            return newMatrix
          })
        }
        setGuessCount((prev) => prev + 1)
        setHeadValue("")
      }
    }
  }

  return (
    <div className="grid h-full place-items-center">
      {/* Game State */}
      <div
        className={`relative w-[496px] rounded-lg p-8 mb-10 text-center text-3xl font-bold tracking-tighter bg-gray-100 ${
          isError ? "text-red-500" : "text-green-500"
        }`}
      >
        <span className="absolute top-0 left-0 mt-2 ml-2 text-xs tracking-wider text-gray-400 uppercase">
          Game State:
        </span>
        {headValue}
      </div>
      {/* GameMatrix */}
      <div className="flex flex-col items-center gap-2">
        <div className="flex flex-col gap-2">
          {GameMatrix.map((row, rowIndex) => {
            return (
              <div className="flex gap-2" key={rowIndex}>
                {row.map((col, colIndex) => (
                  <CustomInput
                    inputValue={col}
                    rowIndex={rowIndex}
                    colIndex={colIndex}
                    key={`${rowIndex}-${colIndex}`}
                    handleInputChange={handleInputChange}
                    guesses={guessCount}
                  />
                ))}
              </div>
            )
          })}
        </div>
        {/* Buttons */}
        <div className="flex justify-center gap-2 mt-10">
          <button
            onClick={takeAGuess}
            className="px-6 py-4 font-black text-white bg-green-500"
          >
            Guess 🤔
          </button>

          <button
            onClick={() => {
              SetGameMatrix(create2DArray(ROWS, COLS))
              setGuessCount(0)
              setIsError(false)
            }}
            className="px-6 py-4 font-black text-white bg-red-500"
          >
            Reset 💀
          </button>
          <button
            onClick={() => {
              setAnswerEquation(chooseRandomEquation())
              setGuessCount(0)
              setIsError(false)
            }}
            className="px-6 py-4 font-black text-white bg-blue-500"
          >
            New ✨
          </button>
          <button
            onClick={() => setCheat((prev) => !prev)}
            className="px-6 py-4 font-black text-white bg-black"
          >
            Cheat 👶
          </button>
        </div>
        {/* Reference */}
        {cheat && (
          <div className="flex gap-2 mt-2">
            {new Array(COLS).fill(0).map((_, idx) => {
              return (
                <div
                  key={`custom-${idx}`}
                  className="flex items-center justify-center w-16 h-16 bg-gray-200"
                >
                  <input
                    type="text"
                    className="w-16 h-16 text-3xl font-bold text-center text-white bg-black outline-none "
                    value={answerEquation[idx]}
                    disabled
                  />
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

type CustomInputProps = {
  inputValue: GameSquare
  rowIndex: number
  colIndex: number
  handleInputChange: (e: any) => void
  guesses: number
}

const CustomInput: React.FC<CustomInputProps> = ({
  inputValue,
  rowIndex,
  colIndex,
  handleInputChange,
  guesses,
}) => {
  const { value, state } = inputValue
  const color = (state: string): string => {
    return state === "correct"
      ? "bg-green-500"
      : state === "empty"
      ? "bg-yellow-200"
      : state === "partially-correct"
      ? "bg-yellow-400"
      : state === "default"
      ? "bg-gray-200"
      : "bg-black text-white"
  }

  return (
    <div className="flex items-center justify-center w-16 h-16 bg-gray-200">
      <input
        type="text"
        className={`w-16 h-16 text-3xl text-center  outline-none ${color(
          state,
        )}`}
        value={value ? (value as string) : ""}
        disabled={guesses !== rowIndex}
        onKeyDown={(e) => handleInputChange({ e, rowIndex, colIndex })}
        onChange={() => {}}
      />
    </div>
  )
}

export default Game
