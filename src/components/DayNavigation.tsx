import { Calendar, Info } from 'lucide-react';

interface DayNavigationProps {
  tripStartDate: string | null;
  tripEndDate: string | null;
  selectedDate: string | null;
  onSelectDate: (date: string | null) => void;
}

export default function DayNavigation({ tripStartDate, tripEndDate, selectedDate, onSelectDate }: DayNavigationProps) {
  if (!tripStartDate || !tripEndDate) {
    return null;
  }

  const generateDays = () => {
    // Parse dates as local dates to avoid timezone issues
    const [startYear, startMonth, startDay] = tripStartDate.split('-').map(Number);
    const [endYear, endMonth, endDay] = tripEndDate.split('-').map(Number);

    const start = new Date(startYear, startMonth - 1, startDay);
    const end = new Date(endYear, endMonth - 1, endDay);
    const days = [];

    let current = new Date(start);
    while (current <= end) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return days;
  };

  const days = generateDays();

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const getDayLabel = (date: Date, index: number) => {
    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'short' });
    return `Day ${index + 1} - ${dayOfWeek}`;
  };

  const getDateString = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center space-x-2 mb-3">
        <Calendar className="w-5 h-5 text-gray-600" />
        <h3 className="text-sm font-semibold text-gray-700">Trip Days</h3>
      </div>

      <div className="flex items-center space-x-2 overflow-x-auto pb-2">
        <button
          onClick={() => onSelectDate(null)}
          className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${
            selectedDate === null
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All Days
        </button>

        <button
          onClick={() => onSelectDate('important-info')}
          className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition flex items-center space-x-2 ${
            selectedDate === 'important-info'
              ? 'bg-amber-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Info className="w-4 h-4" />
          <span>Important Info</span>
        </button>

        {days.map((day, index) => {
          const dateStr = getDateString(day);
          const isSelected = selectedDate === dateStr;

          return (
            <button
              key={dateStr}
              onClick={() => onSelectDate(dateStr)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${
                isSelected
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <div className="text-left">
                <div className="font-semibold">{getDayLabel(day, index)}</div>
                <div className={`text-xs ${isSelected ? 'text-primary-100' : 'text-gray-500'}`}>
                  {formatDate(day)}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
