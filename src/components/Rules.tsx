import React from "react"
import { ColoredSquare } from "components/ColoredSquare"

type RulesType = {
  open: boolean
}

export const Rules: React.FC<RulesType> = ({ open }) => {
  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className={`${
        open ? "translate-y-0" : "translate-y-[100vh]"
      } px-10 py-6 bg-gray-50 rounded-md shadow-md transition-all duration-500 ease-in-out transform flex flex-col gap-4 text-gray-700`}
    >
      <span className="flex items-center justify-center gap-4 text-2xl font-black">
        <button>
          <a href="https://rebrand.ly/nerdle-translate">
            <img
              src="https://ik.imagekit.io/rezza/translate_IilSwbtdm.png?ik-sdk-version=javascript-1.4.3"
              width={30}
              alt="Translate"
            />
          </a>
        </button>
        How to Play Nerdle
      </span>
      <p className="font-bold text-center text-md">RULES</p>
      <ul className="text-xs list-disc">
        <li>Each guess is a calculation</li>
        <li>You can use 0 1 2 3 4 5 6 7 8 9 + - * / or =.</li>
        <li>Calculations are done with BEDMAS</li>
        <li>
          We follow{" "}
          <a
            className="font-bold text-green-500 underline"
            href="https://www.mathsisfun.com/operation-order-bodmas.html"
          >
            BODMAS
          </a>
          .
        </li>
        <li>
          Order of answer matters.
          <br /> 10+20=30 ✅ <b>but,</b> 20+10=30 ❌{" "}
        </li>
      </ul>
      <div className="flex flex-col gap-2">
        <span className="flex gap-[2px]">
          {ColoredSquare({ value: "1", state: "correct" })}
          {ColoredSquare({ value: "0" })}
          {ColoredSquare({ value: "*" })}
          {ColoredSquare({ value: "2" })}
          {ColoredSquare({ value: "0" })}
          {ColoredSquare({ value: "=" })}
          {ColoredSquare({ value: "2" })}
          {ColoredSquare({ value: "0" })}
          {ColoredSquare({ value: "0" })}
        </span>
        <p className="text-xs font-bold text-center">
          1 is in it's correct spot
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <span className="flex gap-[2px]">
          {ColoredSquare({ value: "1" })}
          {ColoredSquare({ value: "0" })}
          {ColoredSquare({ value: "*" })}
          {ColoredSquare({ value: "2", state: "partially-correct" })}
          {ColoredSquare({ value: "0" })}
          {ColoredSquare({ value: "=" })}
          {ColoredSquare({ value: "2", state: "partially-correct" })}
          {ColoredSquare({ value: "0" })}
          {ColoredSquare({ value: "0" })}
        </span>
        <p className="text-xs font-bold text-center">
          2 is in the solution but in the wrong spot
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <span className="flex gap-[2px]">
          {ColoredSquare({ value: "1" })}
          {ColoredSquare({ value: "0" })}
          {ColoredSquare({ value: "*", state: "incorrect" })}
          {ColoredSquare({ value: "2" })}
          {ColoredSquare({ value: "0" })}
          {ColoredSquare({ value: "=" })}
          {ColoredSquare({ value: "2" })}
          {ColoredSquare({ value: "0" })}
          {ColoredSquare({ value: "0" })}
        </span>
        <p className="text-xs font-bold text-center">
          * doesn't exists in the solution
        </p>
      </div>
      <div className="text-xs leading-[16px] text-center">
        If your answer has two 2s and your input has one,
        <br /> you will only get 1 yellow square
      </div>
    </div>
  )
}

export default Rules
