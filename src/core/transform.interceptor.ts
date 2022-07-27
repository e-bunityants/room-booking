import {
  Injectable,
  CallHandler,
  NestInterceptor,
  ExecutionContext,
} from '@nestjs/common';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import * as moment from 'moment';

interface Response<T> {
  data: T;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    const ctx = context.switchToHttp().getResponse();

    return next.handle().pipe(
      map((data) => ({
        statusCode: ctx.statusCode,
        timestamp: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
        data,
      })),
    );
  }
}
