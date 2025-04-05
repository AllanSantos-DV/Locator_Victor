import { BaseEntity } from './common';

export interface Customer extends BaseEntity {
  name: string;
  email: string;
  document: string;
  phone: string;
  address: string;
}

export interface CustomerFormData {
  name: string;
  email: string;
  document: string;
  phone: string;
  address: string;
} 