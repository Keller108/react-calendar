import React, { useState } from 'react';
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
  isToday,
  getMonth,
  getYear,
  isSameMonth
} from 'date-fns';
import './Calendar.css';

export const Calendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [futureDate, setFutureDate] = useState(addMonths(new Date(), 1));
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [periodStart, setPeriodStart] = useState<Date | null>(null);
  const [periodEnd, setPeriodEnd] = useState<Date | null>(null);

  const today = new Date();

  const handleDayClick = (day: Date) => {
    if (!periodStart || (periodStart && periodEnd)) {
      setPeriodStart(day);
      setPeriodEnd(null);
      setSelectedDate(day);
    } else if (periodStart && !periodEnd) {
      if (isBefore(day, periodStart)) {
        setPeriodStart(day);
        setPeriodEnd(periodStart);
        setSelectedDate(null);
      } else {
        setPeriodEnd(day);
        setSelectedDate(null);
      }
    }
  };

  const handleReset = () => {
    setPeriodStart(null);
    setPeriodEnd(null);
    setSelectedDate(null);
  };

  const renderDays = (start: Date, end: Date, currentMonth: number) => {
    const days = eachDayOfInterval({ start, end });
    const weeks: JSX.Element[][] = [];
    let week: JSX.Element[] = [];

    days.forEach((day, index) => {
      const dayElement = (
        <div
          key={index}
          className={`day 
            ${selectedDate && isSameDay(day, selectedDate) ? 'selected' : ''} 
            ${periodStart && periodEnd && isWithinInterval(day, { start: periodStart, end: periodEnd }) ? 'in-range' : ''} 
            ${isSameDay(day, today) ? 'today' : ''} 
            ${getMonth(day) === currentMonth ? 'current-month' : ''}`}
          onClick={() => handleDayClick(day)}
        >
          <span className="day-number">{format(day, 'd')}</span>
        </div>
      );
      week.push(dayElement);
      if (week.length === 7 || index === days.length - 1) {
        weeks.push(week);
        week = [];
      }
    });

    return weeks.map((week, index) => (
      <div className="week" key={index}>
        {week}
      </div>
    ));
  };

  const renderMonth = (date: Date, monthType: 'current' | 'future') => {
    const start = startOfMonth(date);
    const end = endOfMonth(date);
    const startDate = startOfWeek(start, { weekStartsOn: 1 });
    const endDate = endOfWeek(end, { weekStartsOn: 1 });
    const currentMonth = getMonth(date);

    return (
      <div className="calendar">
        <div className="month-header">
          <button onClick={() => handlePreviousMonth(monthType)}>&lt;</button>
          {format(date, 'MMMM yyyy')}
          <button onClick={() => handleNextMonth(monthType)}>&gt;</button>
        </div>
        <div className="weekdays">
          <div className="weekday">Mon</div>
          <div className="weekday">Tue</div>
          <div className="weekday">Wed</div>
          <div className="weekday">Thu</div>
          <div className="weekday">Fri</div>
          <div className="weekday">Sat</div>
          <div className="weekday">Sun</div>
        </div>
        <div className="days">{renderDays(startDate, endDate, currentMonth)}</div>
      </div>
    );
  };

  const handlePreviousMonth = (monthType: 'current' | 'future') => {
    if (monthType === 'current') {
      setCurrentDate(subMonths(currentDate, 1));
      if (isSameMonth(currentDate, futureDate)) {
        setFutureDate(subMonths(futureDate, 1));
      }
    } else {
      const newFutureDate = subMonths(futureDate, 1);
      if (isSameMonth(newFutureDate, currentDate)) {
        setCurrentDate(subMonths(currentDate, 1));
      }
      setFutureDate(newFutureDate);
    }
  };

  const handleNextMonth = (monthType: 'current' | 'future') => {
    if (monthType === 'current') {
      const newCurrentDate = addMonths(currentDate, 1);
      if (isSameMonth(newCurrentDate, futureDate)) {
        setFutureDate(addMonths(futureDate, 1));
      }
      setCurrentDate(newCurrentDate);
    } else {
      setFutureDate(addMonths(futureDate, 1));
    }
  };

  return (
    <div className="calendar-container">
      <div className="calendars">
        {renderMonth(currentDate, 'current')}
        {renderMonth(futureDate, 'future')}
      </div>
      <button onClick={handleReset}>Reset Selection</button>
      <div className="selected-info">
        <p>Selected Date: {selectedDate ? format(selectedDate, 'PPP') : 'None'}</p>
        <p>Selected Range: {periodStart ? format(periodStart, 'PPP') : 'None'} - {periodEnd ? format(periodEnd, 'PPP') : 'None'}</p>
      </div>
    </div>
  );
};