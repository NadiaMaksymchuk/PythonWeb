import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { OccupancyStatus, StorageRoom } from '../../models/storage-room.model';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { StorageRoomService } from '../../services/storage-room.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home-admin',
  standalone: true,
  imports: [NgIf, NgFor, CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './home-admin.component.html',
  styleUrl: './home-admin.component.css',
})
export class HomeAdminComponent implements OnInit {
  adminEmail: string | null = null;
  errorMessage: string | null = null;
  storageRooms: StorageRoom[] = [];
  selectedStorageRoom: StorageRoom | null = null;
  storageRoomForm: FormGroup;
  isEditMode: boolean = false;
  error: string = '';
  occupancyStatuses = Object.values(OccupancyStatus);

  constructor(
    private storageRoomService: StorageRoomService,
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    this.storageRoomForm = this.fb.group({
      room_type: ['', Validators.required],
      location: ['', Validators.required],
      occupancy_status: [OccupancyStatus.Empty, Validators.required],
      description: [''],
    });
  }

  ngOnInit(): void {
    this.authService.adminAuth().subscribe({
      next: (email: string) => {
        this.adminEmail = email;
        this.errorMessage = null;
      },
      error: (err) => {
        if (err.error && err.error.detail && err.error.detail.message) {
          this.errorMessage = err.error.detail.message;
        } else {
          this.errorMessage =
            'Unauthorized or session expired. Please log in again.';
        }
        this.adminEmail = null;
        console.error(err);
      },
    });

    this.loadStorageRooms();
  }

  loadStorageRooms(): void {
    this.storageRoomService.getAllStorageRooms().subscribe({
      next: (data) => {
        this.storageRooms = data;
      },
      error: (err) => {
        this.error = err;
      },
    });
  }

  onSubmit(): void {
    if (this.storageRoomForm.invalid) {
      this.storageRoomForm.markAllAsTouched();
      return;
    }

    const formValue = this.storageRoomForm.value;

    if (this.isEditMode && this.selectedStorageRoom) {
      this.storageRoomService
        .updateStorageRoom(this.selectedStorageRoom.id, formValue)
        .subscribe({
          next: (updatedRoom) => {
            const index = this.storageRooms.findIndex(
              (room) => room.id === updatedRoom.id
            );
            if (index !== -1) {
              this.storageRooms[index] = updatedRoom;
            }
            this.resetForm();
          },
          error: (err) => {
            this.error = err;
          },
        });
    } else {
      this.storageRoomService.createStorageRoom(formValue).subscribe({
        next: (newRoom) => {
          this.storageRooms.push(newRoom);
          this.resetForm();
        },
        error: (err) => {
          this.error = err;
        },
      });
    }
  }

  editStorageRoom(room: StorageRoom): void {
    this.isEditMode = true;
    this.selectedStorageRoom = room;
    this.storageRoomForm.patchValue({
      room_type: room.room_type,
      location: room.location,
      occupancy_status: room.occupancy_status,
      description: room.description,
    });
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  deleteStorageRoom(room: StorageRoom): void {
    if (
      confirm(
        `Are you sure you want to delete storage room "${room.room_type}"?`
      )
    ) {
      this.storageRoomService.deleteStorageRoom(room.id).subscribe({
        next: (deletedRoom) => {
          this.storageRooms = this.storageRooms.filter(
            (r) => r.id !== deletedRoom.id
          );
        },
        error: (err) => {
          this.error = err;
        },
      });
    }
  }

  resetForm(): void {
    this.isEditMode = false;
    this.selectedStorageRoom = null;
    this.storageRoomForm.reset({
      room_type: '',
      location: '',
      occupancy_status: OccupancyStatus.Empty,
      description: '',
    });
    this.error = '';
  }
}
