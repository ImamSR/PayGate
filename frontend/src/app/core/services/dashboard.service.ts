import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface TransactionSummaryResponse {
  transactionId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserDashboardResponse {
  currentBalance: number;
  totalSpent: number;
  activeTransactionsCount: number;
  recentTransactions: TransactionSummaryResponse[];
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getUserDashboard(): Observable<UserDashboardResponse> {
    return this.http.get<UserDashboardResponse>(`${this.apiUrl}/dashboard/user`);
  }
}
