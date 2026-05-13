import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

export interface PaymentRequest {
  amount: number;
  currency: string;
  paymentMethod: string;
}

export interface PaymentResponse {
  transactionId: string;
  status: string;
  timestamp: string;
  message?: string;
}

export interface TransactionSummary {
  transactionId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  status: string;
  message?: string | null;
  createdAt: string;
  updatedAt: string;
  processedAt?: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  constructor(private http: HttpClient) {}

  createPayment(request: PaymentRequest): Observable<PaymentResponse> {
    return this.http.post<PaymentResponse>(`${environment.apiUrl}/payments`, request);
  }

  getTransactions(): Observable<TransactionSummary[]> {
    return this.http.get<TransactionSummary[]>(`${environment.apiUrl}/transactions`);
  }
}
