import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../shared/services/auth.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-bypass',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex flex-col items-center justify-center min-h-[60vh] py-8 mt-24">
      <div class="text-center mb-4">
        <span class="text-3xl font-extrabold tracking-tight text-primary">Backup Unlock Request</span>
      </div>
      <form (ngSubmit)="submitBypass()" class="w-full max-w-md p-6 bg-surface-900 rounded-lg shadow">
        <div class="mb-4">
          <label for="roomId" class="block text-sm font-medium text-surface-500 mb-1">Room ID</label>
          <input id="roomId" name="roomId" [(ngModel)]="roomId" required class="w-full p-2 rounded bg-surface-100 border border-surface-300 text-black" />
        </div>
        <button type="submit" class="px-4 py-2 bg-primary text-white rounded w-full" [disabled]="status === 'processing'">Send Unlock Request</button>
        <div class="text-center mt-2 min-h-[1.5rem]">
          <span *ngIf="status === 'processing'" class="text-surface-500">Processing...</span>
          <span *ngIf="status === 'success'" class="text-green-500">Unlock request sent!</span>
          <span *ngIf="status === 'error'" class="text-red-500">Failed to send request.</span>
        </div>
      </form>
    </div>
  `,
  styles: [``],
})
export class BypassPage {
  public roomId = '';
  public status: 'idle' | 'processing' | 'success' | 'error' = 'idle';
  private _authService = inject(AuthService);
  private _http = inject(HttpClient);

  async submitBypass() {
    if (!this.roomId) return;
    this.status = 'processing';
    const token = await this._authService.asyncToken;
    try {
      await this._http.post('/api/auth/bypass', { roomId: this.roomId }, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      }).toPromise();
      this.status = 'success';
      setTimeout(() => this.status = 'idle', 2000);
    } catch (err) {
      this.status = 'error';
      setTimeout(() => this.status = 'idle', 2000);
    }
  }
}
