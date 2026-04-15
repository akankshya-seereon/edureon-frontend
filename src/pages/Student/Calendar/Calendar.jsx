import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, BookOpen, Award, CheckSquare, Umbrella } from 'lucide-react';

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 1, 3)); // February 3, 2026
  const [selectedDate, setSelectedDate] = useState(new Date(2026, 1, 3));
  const [filters, setFilters] = useState({
    classes: true,
    exams: true,
    assignments: true,
    holidays: true,
  });
  const [stats, setStats] = useState({
    classes: 2,
    exams: 2,
    assignments: 2,
    holidays: 1,
  });

  // Mock events data
  const allEvents = [
    {
      id: 1,
      title: 'Winter Break',
      type: 'holidays',
      date: new Date(2026, 1, 20),
      description: 'University Holiday',
      icon: '🏖️',
    },
    {
      id: 2,
      title: 'Advanced Mathematics',
      type: 'classes',
      date: new Date(2026, 1, 10),
      description: 'Room 101',
      icon: '📚',
    },
    {
      id: 3,
      title: 'Physics Exam',
      type: 'exams',
      date: new Date(2026, 1, 15),
      description: 'Hall A',
      icon: '📝',
    },
    {
      id: 4,
      title: 'Project Assignment',
      type: 'assignments',
      date: new Date(2026, 1, 12),
      description: 'Due by 5 PM',
      icon: '✅',
    },
    {
      id: 5,
      title: 'Biology Class',
      type: 'classes',
      date: new Date(2026, 1, 18),
      description: 'Lab Session',
      icon: '📚',
    },
    {
      id: 6,
      title: 'Chemistry Exam',
      type: 'exams',
      date: new Date(2026, 1, 25),
      description: 'Hall B',
      icon: '📝',
    },
  ];

  const filteredEvents = allEvents.filter(event => filters[event.type]);

  // Get upcoming events sorted by date
  const upcomingEvents = filteredEvents
    .sort((a, b) => a.date - b.date)
    .slice(0, 5);

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const toggleFilter = (filterName) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: !prev[filterName],
    }));
  };

  const isDateMarked = (day) => {
    const dateToCheck = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return allEvents.some(event => {
      const eventDate = new Date(event.date);
      return (
        eventDate.getDate() === dateToCheck.getDate() &&
        eventDate.getMonth() === dateToCheck.getMonth() &&
        eventDate.getFullYear() === dateToCheck.getFullYear()
      );
    });
  };

  const getEventTypeIcon = (type) => {
    const icons = {
      classes: <BookOpen className="w-5 h-5" />,
      exams: <Award className="w-5 h-5" />,
      assignments: <CheckSquare className="w-5 h-5" />,
      holidays: <Umbrella className="w-5 h-5" />,
    };
    return icons[type];
  };

  const getEventTypeColor = (type) => {
    const colors = {
      classes: 'bg-blue-100 text-blue-700 border-blue-300',
      exams: 'bg-red-100 text-red-700 border-red-300',
      assignments: 'bg-emerald-100 text-emerald-700 border-emerald-300',
      holidays: 'bg-purple-100 text-purple-700 border-purple-300',
    };
    return colors[type];
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const daysArray = [];

  for (let i = 0; i < firstDay; i++) {
    daysArray.push(null);
  }

  for (let i = 1; i <= daysInMonth; i++) {
    daysArray.push(i);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-8xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl text-left font-bold text-slate-900 mb-2">Academic Calendar</h1>
          <p className="text-lg text-left text-slate-600">View your classes, exams, and important dates</p>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Left Column - Calendar */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                  📅 Calendar
                </h2>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-3 mb-6">
                {[
                  { key: 'classes', label: 'Classes', icon: '📚' },
                  { key: 'exams', label: 'Exams', icon: '📝' },
                  { key: 'assignments', label: 'Assignments', icon: '✅' },
                  { key: 'holidays', label: 'Holidays', icon: '🏖️' },
                ].map(filter => (
                  <label key={filter.key} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters[filter.key]}
                      onChange={() => toggleFilter(filter.key)}
                      className="w-5 h-5 rounded"
                    />
                    <span className="text-slate-700 font-medium">{filter.label}</span>
                  </label>
                ))}
              </div>

              {/* Calendar Widget */}
              <div className="border border-slate-200 rounded-lg p-6">
                {/* Month/Year Navigation */}
                <div className="flex items-center justify-between mb-6">
                  <button
                    onClick={previousMonth}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-all"
                  >
                    <ChevronLeft className="w-5 h-5 text-slate-600" />
                  </button>
                  <h3 className="text-xl font-bold text-slate-900">
                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                  </h3>
                  <button
                    onClick={nextMonth}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-all"
                  >
                    <ChevronRight className="w-5 h-5 text-slate-600" />
                  </button>
                </div>

                {/* Days of Week */}
                <div className="grid grid-cols-7 gap-2 mb-4">
                  {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                    <div key={day} className="text-center text-lg font-semibold text-slate-600 text-md py-2">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Days */}
                <div className="grid grid-cols-7 gap-2">
                  {daysArray.map((day, index) => (
                    <button
                      key={index}
                      onClick={() => day && setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))}
                      className={`
                        aspect-square py-2 rounded-lg font-semibold transition-all text-md
                        ${!day ? 'bg-transparent' : ''}
                        ${day === selectedDate.getDate() && currentDate.getMonth() === selectedDate.getMonth()
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-50 text-slate-900 hover:bg-slate-100'
                        }
                        ${day && isDateMarked(day) ? 'ring-2 ring-blue-400' : ''}
                      `}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Upcoming Events */}
          <div>
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Upcoming Events</h2>

              <div className="space-y-4">
                {upcomingEvents.length > 0 ? (
                  upcomingEvents.map(event => (
                    <div
                      key={event.id}
                      className={`p-4 rounded-lg border ${getEventTypeColor(event.type)}`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl flex-shrink-0">{event.icon}</span>
                        <div className="flex-1">
                          <h4 className="font-semibold text-slate-900">{event.title}</h4>
                          <p className="text-md text-slate-600">{event.description}</p>
                          <p className="text-md text-slate-500 mt-2">
                            {event.date.toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500 text-center py-8">No events scheduled</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { key: 'classes', label: 'Classes', icon: '📚', color: 'bg-blue-100' },
            { key: 'exams', label: 'Exams', icon: '📝', color: 'bg-red-100' },
            { key: 'assignments', label: 'Assignments', icon: '✅', color: 'bg-emerald-100' },
            { key: 'holidays', label: 'Holidays', icon: '🏖️', color: 'bg-purple-100' },
          ].map(stat => (
            <div key={stat.key} className="bg-white rounded-lg p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3">
                <div className={`${stat.color} rounded-lg w-12 h-12 flex items-center justify-center text-xl`}>
                  {stat.icon}
                </div>
                <div>
                  <p className="text-md text-slate-600 font-medium">{stat.label}</p>
                  <p className="text-3xl font-bold text-slate-900">{stats[stat.key]}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}