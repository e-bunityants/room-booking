import { Metrics } from '../types';

export interface Report {
  from: string;
  to: string;
  roomsMetric: Record<
    string,
    {
      roomNumber: string;
      occupancyDays: Metrics;
    }
  >;
}
