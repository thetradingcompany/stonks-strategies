import {
  addBusinessDays,
  addHours,
  addMinutes,
  addSeconds,
  endOfDay,
  setMilliseconds,
  setSeconds,
  startOfDay,
  startOfHour,
  subBusinessDays,
  subMinutes,
  subSeconds,
  format,
} from 'date-fns';

export class DateFormatter {
  public date: Date;
  constructor(date?: Date | string) {
    this.date = date ? new Date(date) : new Date();
  }

  static get currentISODate(): string {
    return new Date().toISOString();
  }

  static get currentDate(): Date {
    return new Date();
  }

  get ISODate(): string {
    return this.date.toISOString();
  }

  get dataKeyFormatDate(): string {
    return format(this.date, 'yyyy-MM-dd').toString()
  }

  get startOfDay(): DateFormatter {
    return new DateFormatter(this.startOfDayDate);
  }

  get startOfDayDate(): Date {
    return startOfDay(this.date);
  }

  get startOfDayISODate(): string {
    return this.startOfDayDate.toISOString();
  }

  get endOfDay(): DateFormatter {
    return new DateFormatter(this.endOfDayDate);
  }

  get endOfDayDate(): Date {
    return endOfDay(this.date);
  }

  get endOfDayISODate(): string {
    return this.endOfDayDate.toISOString();
  }

  gotoStartOfHour(): DateFormatter {
    return new DateFormatter(startOfHour(this.date));
  }

  addDays(days: number): DateFormatter {
    return new DateFormatter(addBusinessDays(this.date, days));
  }

  addHours(hours: number): DateFormatter {
    return new DateFormatter(addHours(this.date, hours));
  }

  addSeconds(seconds: number): DateFormatter {
    return new DateFormatter(addSeconds(this.date, seconds));
  }

  addMinutes(minutes: number): DateFormatter {
    return new DateFormatter(addMinutes(this.date, minutes));
  }

  subDays(days: number): DateFormatter {
    return new DateFormatter(subBusinessDays(this.date, days));
  }

  subMinutes(minutes: number): DateFormatter {
    return new DateFormatter(subMinutes(this.date, minutes));
  }

  subSeconds(seconds: number): DateFormatter {
    return new DateFormatter(subSeconds(this.date, seconds));
  }

  setSeconds(seconds: number): DateFormatter {
    return new DateFormatter(setSeconds(this.date, seconds));
  }

  setMilliSeconds(milliseconds: number): DateFormatter {
    return new DateFormatter(setMilliseconds(this.date, milliseconds));
  }
}