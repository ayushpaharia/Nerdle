import React, { useEffect, useState } from "react"
import { evaluate } from "mathjs"

type GameSquare = {
  value: string
  state: "default" | "incorrect" | "correct" | "partially-correct" | "empty"
}

// Create row x cols matrix
function create2DArray(rows: number, cols: number): Array<Array<GameSquare>> {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({ value: "", state: "default" })),
  )
}

// Checks for the validity of an equation
function checkIfValidEquation(equation: string): boolean {
  if (!equation.split("").find((char) => char === "=")) {
    return false
  }
  const LHS = equation.split("=")[0]
  const RHS = equation.split("=")[1]
  return evaluate(LHS) == evaluate(RHS)
}

// List of Equation for the game
const Answers: Array<string> = [
  "1+2-3=0",
  "5/5=1",
  "10*10=100",
  "5+60=65",
  "200/100=2",
  "144/12+1=13",
]

// Choose a Random equation from the list
const chooseRandomEquation = (): string => {
  return Answers[Math.floor(Math.random() * Answers.length)]
}

const Game: React.FC = () => {
  // Answer Equation for current game
  const [answerEquation, setAnswerEquation] = useState<string>(
    chooseRandomEquation(),
  )

  // Number of rows and columns in the game
  const [ROWS, setROWS] = useState<number>(6)
  const COLS = answerEquation.length

  // Checks if cheats are on
  const [cheat, setCheat] = useState<boolean>(false)
  // Checks if cheats were used for current equation
  const [isCheatUsed, setIsCheatUsed] = useState<boolean>(false)

  // Current Guesses made
  const [guessCount, setGuessCount] = useState<number>(0)
  // Game Difficulty
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">(
    "easy",
  )

  // NewMatrix if AnswerEquation or ROWS changes
  useEffect(() => {
    SetGameMatrix(create2DArray(ROWS, COLS))
  }, [answerEquation, difficulty])

  // Difficulty Toggle bw easy(6-rows), medium(4-rows) and hard(2-rows)
  function toggleDifficulty() {
    if (guessCount === 0) {
      if (difficulty === "easy") {
        setDifficulty("medium")
        setROWS(4)
      } else if (difficulty === "medium") {
        setDifficulty("hard")
        setROWS(2)
      } else {
        setDifficulty("easy")
        setROWS(6)
      }
    }
  }

  // Value of the Head
  const [headValue, setHeadValue] = useState({
    value: "[playing...]",
    color: "green",
  })

  useEffect(() => {
    // Checks if the game is Won
    if (
      guessCount > 0 &&
      GameMatrix[guessCount - 1].filter((col) => {
        return col.state === "correct"
      }).length === COLS
    ) {
      if (!isCheatUsed) setHeadValue({ value: "[Won...]", color: "green" })
      else {
        setHeadValue({ value: "[Cheat used...]", color: "red" })
      }
      setGuessCount(-1)
    } else if (guessCount == ROWS) {
      setHeadValue({ value: "[Lost...]", color: "red" })
      setGuessCount(-1)
    }
  }, [guessCount])

  useEffect(() => {
    let isValid = checkIfValidEquation(answerEquation)

    if (!isValid) {
      setHeadValue({ value: "[Invalid Equation...]", color: "red" })
    } else setHeadValue({ value: "[playing...]", color: "green" })
  }, [answerEquation])

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
    } else if (e.key.toLowerCase() === " " || e.key.toLowerCase() === "tab") {
      // TODO: goto next input
      return
    }
    // Check valid character 0-9 or + - * /
    else if (e.key.match(/[\d+/*-=]/)) {
      SetGameMatrix((prev) => {
        const newMatrix = [...prev]
        newMatrix[rowIndex][colIndex] = { value: e.key, state: "default" }
        return newMatrix
      })
    } else console.log("Invalid input ", e.key)
  }

  const takeAGuess = () => {
    if (guessCount === -1) return
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
        setHeadValue({ value: "[Invalid Equation]", color: "red" })
      } else {
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
        if (guessCount !== ROWS) {
          setGuessCount((prev) => prev + 1)
        }
        setHeadValue({ value: "[playing...]", color: "green" })
      }
    }
  }

  return (
    <div className="grid h-full place-items-center">
      {/* Game State */}
      <div
        className={`text-${headValue.color}-500 relative w-[496px]  rounded-lg p-8 mb-10 text-center text-3xl font-bold tracking-tighter bg-gray-100`}
      >
        <span className="absolute top-0 left-0 mt-2 ml-2 text-xs tracking-wider text-gray-400 uppercase">
          Game State:
        </span>
        {headValue.value}
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
              if (!isCheatUsed)
                setHeadValue({ value: "[playing...]", color: "green" })
            }}
            className="px-6 py-4 font-black text-white bg-red-500"
          >
            Reset 💀
          </button>
          <button
            onClick={() => {
              setAnswerEquation(chooseRandomEquation())
              setGuessCount(0)
              setIsCheatUsed(false)
            }}
            className="px-6 py-4 font-black text-white bg-blue-500"
          >
            New ✨
          </button>
          <button
            onClick={() => {
              setCheat((prev) => {
                setIsCheatUsed(true)
                return !prev
              })
              setHeadValue({ value: "[Cheat used...]", color: "red" })
            }}
            className="px-6 py-4 font-black text-white bg-black"
          >
            Cheat 👶
          </button>
          <button
            onClick={toggleDifficulty}
            className={`px-6 py-4 font-black text-white  ${
              difficulty === "easy"
                ? "bg-gray-300"
                : difficulty === "medium"
                ? "bg-yellow-300"
                : "bg-red-600"
            }`}
          >
            {/* capitalize string */}
            {difficulty.charAt(0).toUpperCase() + difficulty.slice(1) + " 🤖"}
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
