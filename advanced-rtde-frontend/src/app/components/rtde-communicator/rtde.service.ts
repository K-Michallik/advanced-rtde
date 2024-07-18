// rtde.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, interval, Observable, Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class RtdeService {
  private backendProtocol = 'http:';
  private backendUrl: string;
  private pollingSubscription: Subscription;

  private runtimeStateSubject = new BehaviorSubject<number | null>(null);
  private safetyStatusSubject = new BehaviorSubject<number | null>(null);
  private actualTcpPoseSubject = new BehaviorSubject<number[] | null>(null);
  private errorSubject = new BehaviorSubject<string | null>(null);

  readonly runtimeState$ = this.runtimeStateSubject.asObservable();
  readonly safetyStatus$ = this.safetyStatusSubject.asObservable();
  readonly actualTcpPose$ = this.actualTcpPoseSubject.asObservable();
  readonly error$ = this.errorSubject.asObservable();

  constructor(private http: HttpClient) {}

  setBackendUrl(url: string) {
    this.backendUrl = url;
  }

  startMonitoring(): Observable<any> {
    const fullUrl = `${this.backendProtocol}//${this.backendUrl}/start`;
    return this.http.post(fullUrl, {}).pipe(
      tap({
        next: () => this.startPolling(),
        error: error => this.errorSubject.next(error.message)
      })
    );
  }

  stopMonitoring(): Observable<any> {
    const fullUrl = `${this.backendProtocol}//${this.backendUrl}/stop`;
    return this.http.post(fullUrl, {}).pipe(
      tap({
        next: () => this.stopPolling(),
        error: error => this.errorSubject.next(error.message)
      })
    );
  }

  fetchState(): void {
    const fullUrl = `${this.backendProtocol}//${this.backendUrl}/state`;
    this.http.get<{ runtime_state: number; safety_status: number; actual_TCP_pose: number[] }>(fullUrl).subscribe({
      next: state => {
        this.runtimeStateSubject.next(state.runtime_state);
        this.safetyStatusSubject.next(state.safety_status);
        this.actualTcpPoseSubject.next(state.actual_TCP_pose);
      },
      error: error => this.errorSubject.next(error.message)
    });
  }

  private startPolling(): void {
    this.pollingSubscription = interval(1000).subscribe(() => {
      this.fetchState();
    });
  }

  private stopPolling(): void {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
    }
  }
}