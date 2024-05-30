import React, { Fragment, useState, useEffect, useCallback } from 'react';
import {
  addMonths,
  subMonths,
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
  isSameDay,
  isWithinInterval,
  isBefore,
  getMonth,
  isSameMonth
} from 'date-fns';
import cn from 'classnames';
import './Calendar.css';

export interface ICalendarPeriod {
  start: Date | null;
  end: Date | null;
}

export type MonthType = "current" | "future";

export const weekDayNames = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"] as const;
export const monthsMap = {
  0: "Январь",
  1: "Февраль",
  2: "Март",
  3: "Апрель",
  4: "Май",
  5: "Июнь",
  6: "Июль",
  7: "Август",
  8: "Сентябрь",
  9: "Октябрь",
  10: "Ноябрь",
  11: "Декабрь",
};

export const ArrowMonthBack = () => (
  <svg width="4.314087" height="11.640381" viewBox="0 0 4.31409 11.6404" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs/>
    <path id="Union" d="M3.97 0.1C3.63 -0.11 3.19 0 2.98 0.35L0.2 5.07C-0.07 5.53 -0.07 6.1 0.2 6.56L2.98 11.29C3.19 11.63 3.63 11.74 3.97 11.53C4.3 11.33 4.41 10.9 4.21 10.56L1.64 6.2C1.5 5.96 1.5 5.67 1.64 5.43L4.21 1.07C4.41 0.73 4.3 0.3 3.97 0.1Z" fill="#04153E" fillOpacity="1.000000" fillRule="nonzero"/>
  </svg>
);

export const ArrowMonthNext = () => (
  <svg width="4.313477" height="11.638672" viewBox="0 0 4.31348 11.6387" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs/>
    <path id="Double Union" d="M1.32483 11.2883C1.12268 11.6311 0.678589 11.7417 0.339478 11.5334C0.00866699 11.3303 -0.0983887 10.8997 0.0987549 10.5654L2.66943 6.20605C2.81018 5.96753 2.81018 5.67114 2.66943 5.43237L0.0987549 1.07324C-0.0983887 0.73877 0.00866699 0.308105 0.339478 0.105225C0.678589 -0.103027 1.12268 0.00732422 1.32483 0.350098L4.11084 5.07446C4.38098 5.53271 4.38098 6.10571 4.11084 6.56421L1.32483 11.2883Z" clipRule="evenodd" fill="#000000" fillOpacity="1.000000" fillRule="evenodd"/>
  </svg>
);

type CalendarDaysProps = {
  start: Date | null;
  end: Date | null;
  periodStart: Date | null;
  periodEnd: Date | null;
  selectedDate: Date | null;
  currentDate: Date | null;
  onDayClick(day: Date): void;
};

export const CalendarDays = ({
  start, end, periodStart, periodEnd, selectedDate, currentDate, onDayClick
}: CalendarDaysProps) => {
  if (!(start && end)) {
    return <Fragment />;
  }
  const days = eachDayOfInterval({ start, end });
  const currentDay = currentDate && getMonth(currentDate);

  return (
    <ul className="infp-calendar-days">
      {days.map(day => (
        <li
          key={day.toDateString()}
          className={cn(
            "infp-calendar-days__day",
            { "infp-calendar-days__day_selected": 
              (periodStart && isSameDay(day, periodStart)) || 
              (periodEnd && isSameDay(day, periodEnd))
            },
            { "infp-calendar-days__day_in-range": periodStart && periodEnd && isWithinInterval(day, { start: periodStart, end: periodEnd }) },
            { "infp-calendar-days__day_current-month": getMonth(day) === currentDay }
          )}
          onClick={() => onDayClick(day)}
        >
          {format(day, "d")}
        </li>
      ))}
    </ul>
  );
};

type CalendarHeaderProps = {
  date: Date;
  monthType: MonthType;
  onSwitchPrevious(monthType: MonthType): void;
  onSwitchNext(monthType: MonthType): void;
};

export const CalendarHeader = ({
  date, monthType, onSwitchPrevious, onSwitchNext
}: CalendarHeaderProps) => (
  <div className="calendar-header">
    <IconButton
      onClick={() => onSwitchPrevious(monthType)}
      className="calendar-header__switch-btn custom-reset-btn"
    >
      <ArrowMonthBack />
    </IconButton>
    <div className="calendar-header__title">
      <span>{monthsMap[date.getMonth() as keyof typeof monthsMap]}</span>
      <span>{date.getFullYear()}</span>
    </div>
    <IconButton
      onClick={() => onSwitchNext(monthType)}
      className="calendar-header__switch-btn custom-reset-btn"
    >
      <ArrowMonthNext />
    </IconButton>
  </div>
);

type CalendarMonthProps = {
  header: JSX.Element;
  weekdays: JSX.Element;
  days: JSX.Element;
};

export const CalendarMonth = ({ header, weekdays, days }: CalendarMonthProps) => (
  <div className="infp-calendar-month">
    <div className="infp-calendar-month__header">
      {header}
    </div>
    <div className="infp-calendar-month__weekday-names">
      {weekdays}
    </div>
    <div className="infp-calendar-month__days">
      {days}
    </div>
  </div>
);

export const CalendarWeekdays = () => (
  <ul className="infp-calendar-weekdays">
    {weekDayNames.map(
      (name, idx, array) => <li
        key={name + idx}
        className={cn(
          "infp-calendar-weekdays__weekday",
          { "infp-calendar-weekdays__weekday_weekend": idx >= (array.length - 2) }
        )}
      >
        {name}
      </li>
    )}
  </ul>
);

export function useMonthData(currentMonth: Date, nextMonth: Date) {
  const [currentMonthData, setCurrentMonthData] = useState<ICalendarPeriod>({ start: null, end: null });
  const [nextMonthData, setNextMonthData] = useState<ICalendarPeriod>({ start: null, end: null });

  useEffect(() => {
    const currentStart = startOfMonth(currentMonth);
    const currentEnd = endOfMonth(currentMonth);
    setCurrentMonthData({
      start: startOfWeek(currentStart, { weekStartsOn: 1 }),
      end: endOfWeek(currentEnd, { weekStartsOn: 1 })
    });
    const nextStart = startOfMonth(nextMonth);
    const nextEnd = endOfMonth(nextMonth);
    setNextMonthData({
      start: startOfWeek(nextStart, { weekStartsOn: 1 }),
      end: endOfWeek(nextEnd, { weekStartsOn: 1 })
    });
  }, [currentMonth, nextMonth]);

  return { currentMonthData, nextMonthData };
}

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [futureDate, setFutureDate] = useState(addMonths(currentDate, 1));
  const [periodStart, setPeriodStart] = useState<Date | null>(null);
  const [periodEnd, setPeriodEnd] = useState<Date | null>(null);

  const { currentMonthData, nextMonthData } = useMonthData(currentDate, futureDate);

  const handleDayClick = useCallback((day: Date) => {
    if (!periodStart) {
      setPeriodStart(day);
    } else if (!periodEnd) {
      if (isBefore(day, periodStart) || isSameDay(day, periodStart)) {
        setPeriodStart(day);
      } else {
        setPeriodEnd(day);
      }
    } else {
      setPeriodStart(day);
      setPeriodEnd(null);
    }
  }, [periodStart, periodEnd]);

  const handlePreviousMonth = useCallback((monthType: MonthType) => {
    if (monthType === 'current') {
      setCurrentDate(prevDate => subMonths(prevDate, 1));
      setFutureDate(prevDate => subMonths(prevDate, 1));
    } else if (monthType === 'future') {
      setFutureDate(prevDate => subMonths(prevDate, 1));
    }
  }, [setCurrentDate, setFutureDate]);

  const handleNextMonth = useCallback((monthType: MonthType) => {
    if (monthType === 'current') {
      setCurrentDate(prevDate => addMonths(prevDate, 1));
      setFutureDate(prevDate => addMonths(prevDate, 1));
    } else if (monthType === 'future') {
      setFutureDate(prevDate => addMonths(prevDate, 1));
    }
  }, [setCurrentDate, setFutureDate]);

  return (
    <div className="infp-calendar">
      <CalendarMonth
        header={
          <CalendarHeader
            date={currentDate}
            monthType="current"
            onSwitchPrevious={handlePreviousMonth}
            onSwitchNext={handleNextMonth}
          />
        }
        weekdays={<CalendarWeekdays />}
        days={
          <CalendarDays
            start={currentMonthData.start}
            end={currentMonthData.end}
            periodStart={periodStart}
            periodEnd={periodEnd}
            selectedDate={null}
            currentDate={currentDate}
            onDayClick={handleDayClick}
          />
        }
      />
      <CalendarMonth
        header={
          <CalendarHeader
            date={futureDate}
            monthType="future"
            onSwitchPrevious={handlePreviousMonth}
            onSwitchNext={handleNextMonth}
          />
        }
        weekdays={<CalendarWeekdays />}
        days={
          <CalendarDays
            start={nextMonthData.start}
            end={nextMonthData.end}
            periodStart={periodStart}
            periodEnd={periodEnd}
            selectedDate={null}
            currentDate={futureDate}
            onDayClick={handleDayClick}
          />
        }
      />
    </div>
  );
}
