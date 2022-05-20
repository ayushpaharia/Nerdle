import { evaluate } from "mathjs"

// Create row x cols matrix
export function create2DArray(rows: number, cols: number): GameSquare[][] {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({ value: "", state: "default" })),
  )
}

// Checks for the validity of an equation
export function checkIfValidEquation(equation: string): boolean {
  if (!equation.split("").find((char) => char === "=")) {
    return false
  }
  const LHS = equation.split("=")[0]
  const RHS = equation.split("=")[1]
  return evaluate(LHS) == evaluate(RHS)
}
