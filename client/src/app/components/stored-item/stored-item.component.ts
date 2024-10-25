import { Component, OnInit } from '@angular/core';
import { StoredItemService } from '../../services/stored-item.service';
import { StorageRoomService } from '../../services/storage-room.service';
import {
  StoredItemDto,
  StoredItemCreate,
  StoredItemUpdate,
  StoredItemWithStorageRoom,
} from '../../models/stored-item.model';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { forkJoin } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { StorageRoom } from '../../models/storage-room.model';
import { NgIf, NgFor, CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-stored-item',
  standalone: true,
  imports: [NgIf, NgFor, CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './stored-item.component.html',
  styleUrls: ['./stored-item.component.css'],
})
export class StoredItemComponent implements OnInit {
  storedItems: StoredItemWithStorageRoom[] = [];
  selectedStoredItem: StoredItemWithStorageRoom | null = null;
  storedItemForm: FormGroup;
  isEditMode: boolean = false;
  error: string = '';

  // Toast properties
  showSuccessToast: boolean = false;
  toastMessage: string = '';
  toastBgColor: string = 'bg-success';

  // List of all storage rooms for the dropdown
  storageRooms: StorageRoom[] = [];

  constructor(
    private storedItemService: StoredItemService,
    private storageRoomService: StorageRoomService,
    private fb: FormBuilder,
    public authService: AuthService // Made public to use in template
  ) {
    // Initialize the form
    this.storedItemForm = this.fb.group({
      name: ['', Validators.required],
      classification: ['', Validators.required],
      description: [''],
      storageroom_id: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadStorageRooms();
  }

  // Load all storage rooms first, then load stored items
  loadStorageRooms(): void {
    this.storageRoomService.getAllStorageRooms().subscribe({
      next: (data) => {
        this.storageRooms = data;
        this.loadStoredItems();
      },
      error: (err) => {
        this.error = err;
        console.error('Error loading storage rooms:', err);
      },
    });
  }

  // Load all stored items with their storage room details
  loadStoredItems(): void {
    this.storedItemService.getAllStoredItemsWithDetails().subscribe({
      next: (data) => {
        this.storedItems = data;
      },
      error: (err) => {
        this.error = err;
        console.error('Error loading stored items:', err);
      },
    });
  }

  // Handle form submission for create/update
  onSubmit(): void {
    if (this.storedItemForm.invalid) {
      return;
    }

    const formValue = this.storedItemForm.value;

    if (this.isEditMode && this.selectedStoredItem) {
      const updateData: StoredItemUpdate = {
        name: formValue.name,
        classification: formValue.classification,
        description: formValue.description,
        storageroom_id: formValue.storageroom_id,
      };

      this.storedItemService
        .updateStoredItem(this.selectedStoredItem.id, updateData)
        .subscribe({
          next: (updatedItem) => {
            // Update the event in the list
            const index = this.storedItems.findIndex(
              (item) => item.id === updatedItem.id
            );
            if (index !== -1) {
              const updatedStoredItem: StoredItemWithStorageRoom = {
                ...updatedItem,
                storageRoom: this.storageRooms.find(
                  (room) => room.id === updatedItem.storageroom_id
                ),
              };
              this.storedItems[index] = updatedStoredItem;
            }
            this.showToast('Stored item updated successfully!');
            this.resetForm();
          },
          error: (err) => {
            this.error = err;
            console.error('Error updating stored item:', err);
          },
        });
    } else {
      const createData: StoredItemCreate = {
        name: formValue.name,
        classification: formValue.classification,
        description: formValue.description,
        storageroom_id: formValue.storageroom_id,
      };

      this.storedItemService.createStoredItem(createData).subscribe({
        next: (newItem) => {
          const storedItemWithRoom: StoredItemWithStorageRoom = {
            ...newItem,
            storageRoom: this.storageRooms.find(
              (room) => room.id === newItem.storageroom_id
            ),
          };
          this.storedItems.push(storedItemWithRoom);
          this.showToast('Stored item created successfully!');
          this.resetForm();
        },
        error: (err) => {
          this.error = err;
          console.error('Error creating stored item:', err);
        },
      });
    }
  }

  // Edit an existing stored item
  editStoredItem(item: StoredItemWithStorageRoom): void {
    this.isEditMode = true;
    this.selectedStoredItem = item;
    this.storedItemForm.patchValue({
      name: item.name,
      classification: item.classification,
      description: item.description,
      storageroom_id: item.storageroom_id,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Delete a stored item
  deleteStoredItem(item: StoredItemWithStorageRoom): void {
    if (
      confirm(`Are you sure you want to delete the stored item "${item.name}"?`)
    ) {
      this.storedItemService.deleteStoredItem(item.id).subscribe({
        next: () => {
          this.storedItems = this.storedItems.filter((si) => si.id !== item.id);
          this.showToast('Stored item deleted successfully!', 'bg-danger');
        },
        error: (err) => {
          this.error = err;
          console.error('Error deleting stored item:', err);
        },
      });
    }
  }

  // Reset the form to initial state
  resetForm(): void {
    this.isEditMode = false;
    this.selectedStoredItem = null;
    this.storedItemForm.reset({
      name: '',
      classification: '',
      description: '',
      storageroom_id: '',
    });
    this.error = '';
  }

  // Show toast notifications
  showToast(message: string, bgColor: string = 'bg-success'): void {
    this.toastMessage = message;
    this.toastBgColor = bgColor;
    this.showSuccessToast = true;

    // Auto-hide the toast after 3 seconds
    setTimeout(() => {
      this.showSuccessToast = false;
    }, 3000);
  }
}
