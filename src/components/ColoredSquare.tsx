type ColoredSquareType = {
  value: string
  state?: "correct" | "incorrect" | "partially-correct" | "default"
}

export const ColoredSquare: React.FC<ColoredSquareType> = ({
  value,
  state = "default",
}) => {
  const getColorByState = (state: string): string => {
    let states: Record<string, string> = {
      correct: "bg-green-500",
      incorrect: "bg-black",
      "partially-correct": "bg-yellow-500",
      default: "bg-gray-300",
    }
    return states[state]
  }

  return (
    <span
      className={`${getColorByState(
        state,
      )} flex justify-center w-9 py-1 text-lg font-bold text-white`}
    >
      {value}
    </span>
  )
}
