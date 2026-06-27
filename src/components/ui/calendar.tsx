"use client"

import * as React from "react"
import { DayPicker } from "react-day-picker"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row gap-4",
        month: "flex flex-col gap-4",
        month_caption: "flex justify-center pt-1 relative items-center w-full",
        caption_label: "text-sm font-medium",
        nav: "flex items-center gap-1",
        button_previous: "absolute left-1 h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 inline-flex items-center justify-center rounded-md border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors",
        button_next: "absolute right-1 h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 inline-flex items-center justify-center rounded-md border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors",
        month_grid: "w-full border-collapse space-x-1",
        weekdays: "flex",
        weekday: "text-zinc-500 rounded-md w-8 font-normal text-[0.8rem] dark:text-zinc-400 text-center",
        weeks: "",
        week: "flex w-full mt-2",
        day: cn(
          "relative p-0 text-center text-sm focus-within:relative focus-within:z-20",
        ),
        day_button: cn(
          "h-8 w-8 p-0 font-normal rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors mx-auto flex items-center justify-center",
          "aria-selected:opacity-100"
        ),
        selected: "bg-indigo-600 text-white hover:bg-indigo-600 hover:text-white focus:bg-indigo-600 focus:text-white rounded-md dark:bg-indigo-600 dark:text-white",
        today: "bg-zinc-100 text-zinc-900 rounded-md dark:bg-zinc-800 dark:text-zinc-50",
        outside: "text-zinc-400 opacity-50 dark:text-zinc-500",
        disabled: "text-zinc-400 opacity-50 dark:text-zinc-500",
        hidden: "invisible",
        range_middle: "aria-selected:bg-indigo-100 aria-selected:text-indigo-900",
        dropdowns: "flex gap-2 items-center",
        dropdown: "border border-zinc-200 dark:border-zinc-700 rounded-md px-2 py-1 text-sm bg-white dark:bg-zinc-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) =>
          orientation === "left"
            ? <ChevronLeft className="h-4 w-4" />
            : <ChevronRight className="h-4 w-4" />,
      }}
      {...props}
    />
  )
}

Calendar.displayName = "Calendar"

export { Calendar }
