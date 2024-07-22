import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BackendService {
  private socket: WebSocket;
  private dataSubject: BehaviorSubject<any> = new BehaviorSubject(null);
  private randomNumberSubject: BehaviorSubject<number | null> = new BehaviorSubject<number | null>(null);
  
  public readonly data$: Observable<any> = this.dataSubject.asObservable();
  public readonly randomNumber$: Observable<number | null> = this.randomNumberSubject.asObservable();
  
  private protocol: string = 'ws://';


  constructor(private http: HttpClient) {}

  connect(url: string): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      this.socket = new WebSocket(this.protocol + url + '/ws');
      this.socket.onmessage = (event) => this.dataSubject.next(JSON.parse(event.data));
      this.socket.onopen = () => console.log('WebSocket connection opened');
      this.socket.onclose = () => console.log('WebSocket connection closed');
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.dataSubject.next(null);
    }
  }

  fetchRandomNumber(url: string): void {
    const fullUrl = 'http://' + url + '/random-number';
    this.http.get<{ random_number: number }>(fullUrl).subscribe(response => {
      this.randomNumberSubject.next(response.random_number);
    });
  }

  setDigitalOutput(url: string, digitalOutput: number, value: number, offset: number = 0): void {
    const fullUrl = 'http://' + url + '/set-digital-output';
    this.http.post(fullUrl, { digital_output: digitalOutput, value: value, offset: offset }).subscribe();
  }

}