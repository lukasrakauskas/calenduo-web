import useCalendar from '@veccu/react-calendar'
import {format} from 'date-fns'
import locale from 'date-fns/locale/en-US'
import {ChevronRightIcon, ChevronLeftIcon} from '@heroicons/react/solid'
import clsx from 'clsx'

const Calendar = () => {
  const {cursorDate, headers, body, navigation, view} = useCalendar({
    defaultWeekStart: 1,
  })

  const yyyyMM = format(cursorDate, 'yyyy-MM')

  return (
    <div className="flex flex-col p-8 w-full h-full bg-white rounded">
      <table className="w-full">
        <caption>
          <nav>
            <div className="flex justify-between w-full">
              <div className="flex flex-row gap-8">
                <button
                  onClick={view.showMonthView}
                  // isActive={view.isMonthView}
                  aria-label="button for changing view type to month"
                >
                  Month
                </button>
                <button
                  onClick={view.showWeekView}
                  // isActive={view.isWeekView}
                  aria-label="button for changing view type to week"
                >
                  Week
                </button>
                <button
                  onClick={view.showDayView}
                  // isActive={view.isDayView}
                  aria-label="button for changing view type to day"
                >
                  Day
                </button>
              </div>
              <p className="text-2xl" data-testid="cursor-date">
                {format(cursorDate, 'MMMM yyyy')}
              </p>
              <div className="flex flex-row gap-8">
                <button
                  aria-label="button for navigating to prev calendar"
                  onClick={navigation.toNext}
                >
                  <ChevronLeftIcon className="w-6 h-6" />
                </button>
                <button
                  onClick={navigation.setToday}
                  aria-label="button for navigating to today calendar"
                >
                  TODAY
                </button>
                <button
                  aria-label="button for navigating to next calendar"
                  onClick={navigation.toNext}
                >
                  <ChevronRightIcon className="w-6 h-6" />
                </button>
              </div>
            </div>
          </nav>
        </caption>
        <thead>
          <tr>
            {headers.weekDays.map(({key, value}) => {
              return (
                <th
                  className="w-1/7 h-12 text-gray-600 font-normal"
                  key={key}
                  data-testid="calendar-weekends"
                >
                  {format(value, 'cccc', {locale})}
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody>
          {body.value.map(week => {
            const {key, value: days} = week

            return (
              <tr key={key} data-testid="calendar-weeks">
                {days.map(day => {
                  const {key, date, isCurrentDate, isCurrentMonth, isWeekend} =
                    day

                  return (
                    <td
                      key={key}
                      className={clsx(
                        'border-2',
                        !isCurrentMonth && 'opacity-20',
                      )}
                      data-testid={
                        isCurrentDate ? 'calendar-cell--today' : 'calendar-cell'
                      }
                    >
                      {isCurrentDate ? (
                        <p className="text-bold">
                          <time
                            dateTime={`${yyyyMM}-${String(date).padStart(
                              2,
                              '0',
                            )}`}
                          >
                            {date}
                          </time>
                        </p>
                      ) : (
                        <p className={clsx(isWeekend && 'text-red-500')}>
                          <time
                            dateTime={`${yyyyMM}-${String(date).padStart(
                              2,
                              '0',
                            )}`}
                          >
                            {date}
                          </time>
                        </p>
                      )}
                    </td>
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default Calendar
