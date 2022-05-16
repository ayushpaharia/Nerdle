import React, { useEffect, useState } from "react"
import { evaluate } from "mathjs"
import axios from "axios"

let API_KEY = import.meta.env.VITE_JSONBIN_API_KEY

type GameSquare = {
  value: string
  state: "default" | "incorrect" | "correct" | "partially-correct" | "empty"
}
type DifficultyConfig = {
  name: string
  ROWS: number
  color: string
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

const RowsByDifficultyLevel = [
  { name: "easy", rows: 6, color: "#99fc37" },
  { name: "amateur", rows: 5, color: "#cafc25" },
  { name: "medium", rows: 4, color: "#fcd825" },
  { name: "hard", rows: 3, color: "#f77171" },
  { name: "very-hard", rows: 2, color: "#ef4343" },
  { name: "extreme", rows: 1, color: "#dc2626" },
]

type SetState<T> = React.Dispatch<React.SetStateAction<T>>
const Game: React.FC<{
  setOpen: SetState<boolean>
  setScoreArray: SetState<number[][]>
}> = ({ setOpen, setScoreArray }) => {
  const [answers, setAnswers] = useState<string[]>(["1+2+3=6"])
  const [difficultyConfig, setDifficultyConfig] = useState<DifficultyConfig[]>([
    { name: "", color: "", ROWS: 6 },
  ])
  const [buttonConfig, setButtonConfig] = useState<{
    reset: boolean
    cheat: boolean
  }>({ reset: false, cheat: false })

  const [loading, setLoading] = useState(true)

  // Choose a Random equation from the list
  const chooseRandomEquation = (): string => {
    return answers[Math.floor(Math.random() * answers.length)]
  }

  // Answer Equation for current game
  const [answerEquation, setAnswerEquation] = useState<string>("")

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

  // On Mount
  let masterKey = API_KEY
  const fetchConfig = async () => {
    let {
      data: { record },
    } = await axios({
      url: "https://api.jsonbin.io/v3/b/62824f03019db46796a1252a",
      method: "get",
      headers: {
        "X-Master-Key": masterKey,
      },
    })
    return record
  }

  useEffect(() => {
    fetchConfig()
      .then((record) => {
        setAnswerEquation(chooseRandomEquation())
        setLoading(false)
        setAnswers(record.answers)
        setDifficultyConfig(record.difficulty_config)
        setButtonConfig(record.buttons_config)
      })
      .catch((err) => console.log(err))
  }, [])

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

  // NewMatrix if AnswerEquation or ROWS changes
  useEffect(() => {
    SetGameMatrix(create2DArray(ROWS, COLS))
  }, [answerEquation, difficultyLevel])

  return (
    <>
      {loading ? (
        <div className="grid h-[80vh] place-items-center">
          <div className="flex gap-6 text-4xl font-black">
            Loading
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-10 h-10 animate-spin"
              viewBox="0 0 512 512"
            >
              <path d="M304 48C304 74.51 282.5 96 256 96C229.5 96 208 74.51 208 48C208 21.49 229.5 0 256 0C282.5 0 304 21.49 304 48zM304 464C304 490.5 282.5 512 256 512C229.5 512 208 490.5 208 464C208 437.5 229.5 416 256 416C282.5 416 304 437.5 304 464zM0 256C0 229.5 21.49 208 48 208C74.51 208 96 229.5 96 256C96 282.5 74.51 304 48 304C21.49 304 0 282.5 0 256zM512 256C512 282.5 490.5 304 464 304C437.5 304 416 282.5 416 256C416 229.5 437.5 208 464 208C490.5 208 512 229.5 512 256zM74.98 437C56.23 418.3 56.23 387.9 74.98 369.1C93.73 350.4 124.1 350.4 142.9 369.1C161.6 387.9 161.6 418.3 142.9 437C124.1 455.8 93.73 455.8 74.98 437V437zM142.9 142.9C124.1 161.6 93.73 161.6 74.98 142.9C56.24 124.1 56.24 93.73 74.98 74.98C93.73 56.23 124.1 56.23 142.9 74.98C161.6 93.73 161.6 124.1 142.9 142.9zM369.1 369.1C387.9 350.4 418.3 350.4 437 369.1C455.8 387.9 455.8 418.3 437 437C418.3 455.8 387.9 455.8 369.1 437C350.4 418.3 350.4 387.9 369.1 369.1V369.1z" />
            </svg>
          </div>
        </div>
      ) : (
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
                    setHeadValue({
                      value: "[playing...]",
                      color: "text-green-500",
                    })
                }}
                className={`${
                  buttonConfig.reset ? "" : "hidden"
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
                  setHeadValue({
                    value: "[Cheat used...]",
                    color: "text-red-500",
                  })
                }}
                className={`${
                  buttonConfig.cheat ? "" : "hidden"
                } px-6 py-4 font-black text-white bg-black`}
              >
                Cheat 👶
              </button>
              <CustomButton
                difficultyLevel={difficultyLevel}
                onClick={toggleDifficulty}
                colorPalette={RowsByDifficultyLevel.map(
                  (DL: { color: any }) => DL.color,
                )}
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
      )}
    </>
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
  colorPalette: string[]
}
const CustomButton: React.FC<Partial<CustomButtonProps>> = ({
  children,
  difficultyLevel,
  onClick,
  colorPalette,
}) => {
  let palette = [
    "bg-[#99fc37]",
    "bg-[#cafc25]",
    "bg-[#fcd825]",
    "bg-[#f77171]",
    "bg-[#ef4343]",
    "bg-[#dc2626]",
  ]

  const getColor = (DL: number) => {
    if (colorPalette) {
      // TODO: get colors from config
      let color = palette.reverse().at(DL === undefined ? 0 : -(DL + 1))
      return color
    } else console.log("No Palette")
  }

  return (
    <button
      onClick={onClick}
      className={`px-6 py-4 font-black text-white ${getColor(
        difficultyLevel as number,
      )}`}
    >
      {children}
    </button>
  )
}

export default Game
