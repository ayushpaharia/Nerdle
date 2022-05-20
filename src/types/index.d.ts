type GameSquare = {
  value: string
  state: "default" | "incorrect" | "correct" | "partially-correct" | "empty"
}

type DifficultyConfig = {
  name: string
  ROWS: number
  color: string
}
type SetState<T> = React.Dispatch<React.SetStateAction<T>>
