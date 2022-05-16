import React, { useEffect, useState } from "react"
import { evaluate } from "mathjs"

type GameSquare = {
  value: string
  state: "default" | "incorrect" | "correct" | "partially-correct" | "empty"
}

// Create row x cols matrix
function create2DArray(rows: number, cols: number): GameSquare[][] {
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
const Answers: string[] = [
  "1+2-3=0",
  "5/5=1",
  "10*10=100",
  "5+60=65",
  "200/100=2",
  "144/12+1=13",
]

// Custom colors
const dP: string[] = [
  "bg-[#99fc37]",
  "bg-[#cafc25]",
  "bg-[#fcd825]",
  "bg-[#f77171]",
  "bg-[#ef4343]",
  "bg-[#dc2626]",
].reverse()

const buttons = {
  reset: false,
  cheat: false,
}

const RowsByDifficultyLevel = [
  { name: "easy", rows: 6, color: "#99fc37" },
  { name: "amateur", rows: 5, color: "#cafc25" },
  { name: "medium", rows: 4, color: "#fcd825" },
  { name: "hard", rows: 3, color: "#f77171" },
  { name: "very-hard", rows: 2, color: "#ef4343" },
  { name: "extreme", rows: 1, color: "#dc2626" },
]

// Choose a Random equation from the list
const chooseRandomEquation = (): string => {
  return Answers[Math.floor(Math.random() * Answers.length)]
}

type SetState<T> = React.Dispatch<React.SetStateAction<T>>
const Game: React.FC<{
  setOpen: SetState<boolean>
  setScoreArray: SetState<number[][]>
}> = ({ setOpen, setScoreArray }) => {
  // Answer Equation for current game
  const [answerEquation, setAnswerEquation] = useState<string>(
    chooseRandomEquation(),
  )

  // Game Difficulty
  const [difficultyLevel, setDifficultyLevel] = useState<number>(0)

  // Number of rows and columns in the game
  const [ROWS, setROWS] = useState<number>(RowsByDifficultyLevel[0].rows)
  const COLS = answerEquation.length

  const SetDifficultyAndRow = (diff: number, rows: number) => {
    setDifficultyLevel(diff)
    setROWS(rows)
  }

  // Checks if cheats are on
  const [cheat, setCheat] = useState<boolean>(false)
  // Checks if cheats were used for current equation
  const [isCheatUsed, setIsCheatUsed] = useState<boolean>(false)

  // Current Guesses made
  const [guessCount, setGuessCount] = useState<number>(0)

  // NewMatrix if AnswerEquation or ROWS changes
  useEffect(() => {
    SetGameMatrix(create2DArray(ROWS, COLS))
  }, [answerEquation, difficultyLevel])

  // Difficulty
  function toggleDifficulty() {
    if (guessCount === 0) {
      if (difficultyLevel === RowsByDifficultyLevel.length - 1)
        SetDifficultyAndRow(0, RowsByDifficultyLevel[0].rows)
      else
        SetDifficultyAndRow(
          difficultyLevel + 1,
          RowsByDifficultyLevel[difficultyLevel + 1].rows,
        )
    }
  }

  // Value of the Head
  const [headValue, setHeadValue] = useState({
    value: "[playing...]",
    color: "text-green-500",
  })

  // Everytime User Gusses
  useEffect(() => {
    // Checks if the game is Won
    if (
      // Check all the squares in row [guessCount - 1] are have state = "correct"
      guessCount > 0 &&
      GameMatrix[guessCount - 1].filter((col) => {
        return col.state === "correct"
      }).length === COLS
    ) {
      if (!isCheatUsed) {
        setHeadValue({ value: "[Won...]", color: "text-green-500" })

        // Return info to parent component
        setScoreArray(() => {
          let scoreArray: number[][] = GameMatrix.map((row, idx) => {
            return row.map((col) => {
              if (col.state === "default") return -1
              if (col.state === "correct") return 2
              if (col.state === "incorrect") return 0
              else return 1
            })
          })
          console.log(scoreArray)

          return scoreArray
        })
        setOpen(true)
      } else {
        setHeadValue({ value: "[Cheat used...]", color: "text-red-500" })
      }
      setGuessCount(-1) // disable all the squares
    } else if (guessCount == ROWS) {
      setHeadValue({ value: "[Lost...]", color: "text-red-500" })
      setGuessCount(-1) // disable all the squares
    }
  }, [guessCount])

  // Everytime Answer Equation changes
  useEffect(() => {
    let isValid = checkIfValidEquation(answerEquation)

    if (!isValid) {
      setHeadValue({ value: "[Invalid Equation...]", color: "text-red-500" })
    } else setHeadValue({ value: "[playing...]", color: "text-green-500" })
  }, [answerEquation])

  // Initialize GameMatrix
  const [GameMatrix, SetGameMatrix] = useState(create2DArray(ROWS, COLS))

  // OnKeyDown on any enabled input
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
    else if (e.key.match(/[\d+/*-=^]/)) {
      SetGameMatrix((prev) => {
        const newMatrix = [...prev]
        newMatrix[rowIndex][colIndex] = { value: e.key, state: "default" }
        return newMatrix
      })
    } else console.log("Invalid input ", e.key)
  }

  // Check Against Answer
  const takeAGuess = () => {
    if (guessCount === -1) return
    let isFilled = true
    let answer = ""

    // In row [guessCount] if empty set Square.state = "empty" & set isFilled = false
    for (let i = 0; i < COLS; i++) {
      if (GameMatrix[guessCount][i].value === "") {
        SetGameMatrix((prev) => {
          const newMatrix = [...prev]
          newMatrix[guessCount][i] = { value: "", state: "empty" }
          return newMatrix
        })
        isFilled = false
        // else concant on answer
      } else answer = answer.concat(GameMatrix[guessCount][i].value)
    }
    if (isFilled) {
      // Evaluate Answer
      if (!checkIfValidEquation(answer)) {
        setHeadValue({ value: "[Invalid Equation]", color: "text-red-500" })
      } else {
        const newMatrix = [...GameMatrix]
        for (let i = 0; i < COLS; i++) {
          SetGameMatrix(() => {
            if (answer[i] === answerEquation[i]) {
              // Matches for correct
              newMatrix[guessCount][i] = { value: answer[i], state: "correct" }
            } else if (
              answerEquation.split("").find((char) => char === answer[i])
            ) {
              newMatrix[guessCount][i] = {
                // Matches if any char in answerEquation
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
        setHeadValue({ value: "[playing...]", color: "text-green-500" })
      }
    }
  }

  return (
    <div className="grid h-full place-items-center">
      {/* Game State */}
      <div
        className={`${headValue.color} relative w-[496px] rounded-lg py-4 mb-6  text-center text-3xl font-bold tracking-tighter bg-gray-100`}
      >
        <span className="absolute top-0 left-0 mt-2 ml-2 text-xs tracking-wider text-gray-400 uppercase">
          Game State:
        </span>
        {headValue.value}
      </div>

      <div className="flex flex-col items-center gap-2 ">
        {/* GameMatrix */}
        <div className="flex flex-col gap-2 mb-6">
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
        <div className="flex justify-center gap-2 ">
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
                setHeadValue({ value: "[playing...]", color: "text-green-500" })
            }}
            className={`${
              buttons.reset ? "" : "hidden"
            } px-6 py-4 font-black text-white bg-red-500`}
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
              setHeadValue({ value: "[Cheat used...]", color: "text-red-500" })
            }}
            className={`${
              buttons.cheat ? "" : "hidden"
            } px-6 py-4 font-black text-white bg-black`}
          >
            Cheat 👶
          </button>
          <CustomButton
            difficultyLevel={difficultyLevel}
            onClick={toggleDifficulty}
          >
            {RowsByDifficultyLevel[difficultyLevel].name
              .charAt(0)
              .toUpperCase() +
              RowsByDifficultyLevel[difficultyLevel].name.slice(1) +
              " 🤖"}
          </CustomButton>
        </div>

        {/* Cheat */}
        {cheat && (
          <div className="flex gap-2 ">
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

type CustomButtonProps = {
  children: React.ReactNode
  difficultyLevel: number
  onClick: () => any
  color: string
}
const CustomButton: React.FC<Partial<CustomButtonProps>> = ({
  children,
  difficultyLevel,
  onClick,
}) => {
  // TODO: get colors from config
  // dP = RowsByDifficultyLevel.map((difficultyLevel) => difficultyLevel.color).reverse()

  return (
    <button
      onClick={onClick}
      className={`px-6 py-4 font-black text-white ${dP.at(
        difficultyLevel === undefined ? 0 : -(difficultyLevel + 1),
      )}`}
    >
      {children}
    </button>
  )
}

export default Game
