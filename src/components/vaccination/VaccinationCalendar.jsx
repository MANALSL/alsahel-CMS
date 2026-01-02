import React from 'react';
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, format, isSameMonth, isSameDay, isToday, addMonths, subMonths, parseISO, isBefore } from 'date-fns'; // Removed fr import temporarily to avoid locale issues if not available, will use standard format or try-catch later if needed, but for now simple format is fine.
import { fr } from 'date-fns/locale'; // Ensure date-fns is installed with locale support
import { ChevronLeft, ChevronRight, Syringe } from 'lucide-react';
import { clsx } from 'clsx';

const VaccinationCalendar = ({ events, onDateClick, onEventClick }) => {
    const [currentMonth, setCurrentMonth] = React.useState(new Date());

    const days = React.useMemo(() => {
        const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 });
        const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 });
        return eachDayOfInterval({ start, end });
    }, [currentMonth]);

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

    const getEventsForDay = (day) => {
        return events.filter(event => isSameDay(parseISO(event.date), day));
    };

    return (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50/50">
                <h2 className="text-lg font-semibold text-gray-900 capitalize">
                    {format(currentMonth, 'MMMM yyyy', { locale: fr })}
                </h2>
                <div className="flex space-x-2">
                    <button onClick={prevMonth} className="p-2 hover:bg-white rounded-lg border border-transparent hover:border-gray-200 text-gray-600 transition-all">
                        <ChevronLeft size={20} />
                    </button>
                    <button onClick={nextMonth} className="p-2 hover:bg-white rounded-lg border border-transparent hover:border-gray-200 text-gray-600 transition-all">
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            {/* Week days */}
            <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50/30">
                {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(day => (
                    <div key={day} className="py-2 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        {day}
                    </div>
                ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 auto-rows-fr">
                {days.map((day, dayIdx) => {
                    const dayEvents = getEventsForDay(day);
                    const isCurrentMonth = isSameMonth(day, currentMonth);
                    const isDayToday = isToday(day);

                    return (
                        <div
                            key={day.toString()}
                            onClick={() => onDateClick && onDateClick(day)}
                            className={clsx(
                                'min-h-[100px] p-2 border-b border-r border-gray-50 transition-colors hover:bg-blue-50/30 cursor-pointer relative',
                                !isCurrentMonth && 'bg-gray-50/50',
                                dayIdx % 7 === 6 && 'border-r-0' // Remove right border for last column
                            )}
                        >
                            <div className="flex justify-between items-start">
                                <span className={clsx(
                                    'text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full',
                                    isDayToday ? 'bg-primary-600 text-white shadow-md' : isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                                )}>
                                    {format(day, 'd')}
                                </span>
                                {dayEvents.length > 0 && (
                                    <span className="flex h-2 w-2 relative">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                    </span>
                                )}
                            </div>

                            <div className="mt-1 space-y-1">
                                {dayEvents.map(event => (
                                    <div
                                        key={event.id}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (onEventClick && !event.deleted) {
                                                onEventClick(event);
                                            }
                                        }}
                                        className={clsx(
                                            'text-xs px-1.5 py-1 rounded-md border truncate',
                                            !event.deleted && 'cursor-pointer hover:shadow-md transition-shadow',
                                            event.deleted
                                                ? 'bg-gray-100 text-gray-500 border-gray-200 line-through cursor-not-allowed'
                                                : event.status === 'completed'
                                                    ? 'bg-green-50 text-green-700 border-green-100 hover:bg-green-100'
                                                    : isBefore(parseISO(event.date), new Date()) && event.status !== 'completed'
                                                        ? 'bg-red-50 text-red-700 border-red-100 font-medium hover:bg-red-100'
                                                        : 'bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-100'
                                        )}
                                        title={`${event.vaccine} (${event.lot})${event.deleted ? ' — Supprimé' : ''}`}
                                    >
                                        {event.vaccine} - {event.lot}
                                        {event.deleted && <span className="ml-1 text-[10px] text-gray-400">(supprimé)</span>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default VaccinationCalendar;
