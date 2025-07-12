import { HttpClient } from '@angular/common/http';
import { inject, signal } from '@angular/core';

export abstract class Service<T> {
  protected _httpClient: HttpClient = inject(HttpClient);
  protected _dataList = signal<T[]>([]);
  public data = this._dataList.asReadonly();
}
