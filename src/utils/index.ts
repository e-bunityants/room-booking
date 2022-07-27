import * as moment from 'moment';
import { RangeDateDTO } from 'src/module/hotel-management/dtos/range-date.dto';

export const castDate = (date: any) => `cast('${date}' AS DATE)`;

export const castInt = (value: any) => `cast('${value}' AS INT)`;

export const generateDate = (date: RangeDateDTO, startDayOfMonth: number) =>
  [...Array(moment(date.endDate).diff(date.startDate, 'days') + 1).keys()].map(
    (d) => d + startDayOfMonth,
  );

export const generateDateFullOrPartMonth = (
  startDate: moment.Moment,
  date: RangeDateDTO,
  startDayOfMonth: number,
): number[] => {
  let periodDays: number[];
  if (
    startDate.date() == 1 &&
    moment(date.endDate).date() == startDate.endOf('M').date()
  ) {
    periodDays = [...Array(startDate.endOf('M').date()).keys()].map(
      (d) => d + 1,
    );
  } else {
    periodDays = generateDate(date, startDayOfMonth);
  }
  return periodDays;
};

export const generateRangOfDate = (reportDate: RangeDateDTO) => {
  const rangeDate: RangeDateDTO[] = [];

  const startDate = moment(reportDate.startDate);
  const endDate = moment(reportDate.endDate);
  const start = moment(reportDate.startDate);
  const end = moment(reportDate.endDate);
  const isSameMonth = startDate
    .clone()
    .startOf('M')
    .isSame(endDate.clone().startOf('M'));

  if (isSameMonth) {
    rangeDate.push({
      startDate: startDate.format('YYYY-MM-DD'),
      endDate: endDate.format('YYYY-MM-DD'),
    });
  } else {
    let isFirstLoop = true;

    while (end.startOf('month').isSameOrAfter(start.startOf('month'))) {
      const isLessThenEndDate = end.isSameOrBefore(start.endOf('month'));

      rangeDate.push({
        startDate: isFirstLoop
          ? startDate.format('YYYY-MM-DD')
          : start.startOf('month').format('YYYY-MM-DD'),
        endDate: isLessThenEndDate
          ? endDate.format('YYYY-MM-DD')
          : start.endOf('month').format('YYYY-MM-DD'),
      });
      start.add(1, 'month');
      isFirstLoop = false;
    }
  }
  return rangeDate;
};
