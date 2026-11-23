import React from 'react';
import { format, parseISO } from 'date-fns';

/**
 * Format Indian Rupee currency (e.g. ₹1,25,000)
 */
export function formatINR(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(Number(amount))) return '₹0';
  const num = Math.round(Number(amount));
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(num);
}

/**
 * Clean phone number to 10 digits
 */
export function cleanPhoneNumber(phone: string | null | undefined): string {
  if (!phone) return '';
  return phone.replace(/\D/g, '').slice(-10);
}

/**
 * Format 10-digit phone for easy scanning: 98765 43210
 */
export function formatPhone(phone: string | null | undefined): string {
  const clean = cleanPhoneNumber(phone);
  if (clean.length === 10) {
    return `${clean.slice(0, 5)} ${clean.slice(5)}`;
  }
  return clean || '—';
}

/**
 * Format Date to readable string (e.g. 24 Apr, 04:30 PM)
 */
export function formatDateTime(dateInput: any): string {
  if (!dateInput) return '—';
  try {
    let date: Date;
    if (dateInput?.toDate && typeof dateInput.toDate === 'function') {
      date = dateInput.toDate();
    } else if (typeof dateInput === 'string') {
      date = parseISO(dateInput);
    } else if (dateInput instanceof Date) {
      date = dateInput;
    } else if (typeof dateInput === 'number') {
      date = new Date(dateInput);
    } else {
      return '—';
    }
    return format(date, 'dd MMM, hh:mm a');
  } catch (err) {
    return String(dateInput);
  }
}

/**
 * Format Date to concise string: 24 Apr 2026
 */
export function formatDateOnly(dateInput: any): string {
  if (!dateInput) return '—';
  try {
    let date: Date;
    if (dateInput?.toDate && typeof dateInput.toDate === 'function') {
      date = dateInput.toDate();
    } else if (typeof dateInput === 'string') {
      date = parseISO(dateInput);
    } else if (dateInput instanceof Date) {
      date = dateInput;
    } else {
      return '—';
    }
    return format(date, 'dd MMM yyyy');
  } catch {
    return String(dateInput);
  }
}

/**
 * Check if a date string/timestamp is overdue (before today)
 */
export function isOverdue(dateStr: string | null | undefined): boolean {
  if (!dateStr) return false;
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const date = new Date(dateStr);
    date.setHours(0, 0, 0, 0);
    return date < today;
  } catch {
    return false;
  }
}

/**
 * Check if a date string/timestamp is due today
 */
export function isDueToday(dateStr: string | null | undefined): boolean {
  if (!dateStr) return false;
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const date = new Date(dateStr);
    date.setHours(0, 0, 0, 0);
    return date.getTime() === today.getTime();
  } catch {
    return false;
  }
}

/**
 * Build WhatsApp click-to-chat URL with concise message
 */
export function buildWhatsAppLink(phone: string, customerName: string, preferredModel?: string): string {
  const cleanPhone = cleanPhoneNumber(phone);
  const target = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
  const modelText = preferredModel && preferredModel !== 'Not Decided' ? ` regarding *${preferredModel}*` : '';
  const message = `Hello ${customerName}, greeting from *VR Electric*${modelText}! How can we help you with test ride or booking today?`;
  return `https://wa.me/${target}?text=${encodeURIComponent(message)}`;
}

/**
 * Export JSON data array to downloadable CSV file
 */
export function exportToCSV(filename: string, rows: Record<string, any>[]): void {
  if (!rows || !rows.length) return;
  const separator = ',';
  const keys = Object.keys(rows[0]);
  
  const csvContent =
    keys.join(separator) +
    '\n' +
    rows.map(row => {
      return keys.map(k => {
        let cell = row[k] === null || row[k] === undefined ? '' : row[k];
        cell = typeof cell === 'object' ? JSON.stringify(cell) : String(cell);
        cell = cell.replace(/"/g, '""');
        if (cell.search(/("|,|\n)/g) >= 0) {
          cell = `"${cell}"`;
        }
        return cell;
      }).join(separator);
    }).join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${format(new Date(), 'yyyy-MM-dd')}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
