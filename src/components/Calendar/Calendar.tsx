import React, { useState } from 'react';
import {
  addMonths,
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
} from 'date-fns';
import './Calendar.css';

export const Calendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [periodStart, setPeriodStart] = useState<Date | null>(null);
  const [periodEnd, setPeriodEnd] = useState<Date | null>(null);

  const today = new Date();
  const nextMonth = addMonths(currentDate, 1);

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

  const renderDays = (start: Date, end: Date) => {
    const days = eachDayOfInterval({ start, end });
    return days.map(day => (
      <div
        key={day.toString()}
        className={`day 
          ${selectedDate && isSameDay(day, selectedDate) ? 'selected' : ''} 
          ${periodStart && periodEnd && isWithinInterval(day, { start: periodStart, end: periodEnd }) ? 'in-range' : ''} 
          ${isSameDay(day, today) ? 'today' : ''}`}
        onClick={() => handleDayClick(day)}
      >
        <span className="day-number">{format(day, 'd')}</span>
      </div>
    ));
  };

  const renderMonth = (date: Date) => {
    const start = startOfMonth(date);
    const end = endOfMonth(date);
    const startDate = startOfWeek(start, { weekStartsOn: 1 });
    const endDate = endOfWeek(end, { weekStartsOn: 1 });

    return (
      <div className="month">
        <div className="month-title">{format(date, 'MMMM yyyy')}</div>
        <div className="weekdays">
          <div className="weekday">Mon</div>
          <div className="weekday">Tue</div>
          <div className="weekday">Wed</div>
          <div className="weekday">Thu</div>
          <div className="weekday">Fri</div>
          <div className="weekday">Sat</div>
          <div className="weekday">Sun</div>
        </div>
        <div className="days">{renderDays(startDate, endDate)}</div>
      </div>
    );
  };

  const handlePreviousMonth = () => {
    setCurrentDate(addMonths(currentDate, -1));
  };

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  return (
    <div>
      <button onClick={handlePreviousMonth}>Previous Month</button>
      <button onClick={handleNextMonth}>Next Month</button>
      <div className="calendar">
        {renderMonth(currentDate)}
        {renderMonth(nextMonth)}
      </div>
      <button onClick={handleReset}>Reset Selection</button>
    </div>
  );
};