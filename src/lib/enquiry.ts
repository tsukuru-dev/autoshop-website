import { services } from '../data/site';

export type Enquiry = { name: string; phone: string; email: string; registration: string; service: string; date: string; message: string };
export function validateEnquiry(form: FormData, today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/London' }).format(new Date())): Enquiry {
  const field = (key: string, max: number, required = true) => {
    const raw = form.get(key);
    if (raw !== null && typeof raw !== 'string') throw new Error('Invalid form fields.');
    const value = (raw || '').trim();
    if ((required && !value) || value.length > max) throw new Error(`Please check the ${key} field.`);
    return value;
  };
  const enquiry = { name: field('name', 100), phone: field('phone', 30), email: field('email', 254), registration: field('registration', 15).toUpperCase(), service: field('service', 50), date: field('date', 10, false), message: field('message', 3000) };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(enquiry.email) || /[\r\n]/.test(enquiry.name)) throw new Error('Please enter a valid name and email address.');
  if (!/^[+\d\s().-]{7,30}$/.test(enquiry.phone) || enquiry.phone.replace(/\D/g, '').length < 7) throw new Error('Please enter a valid phone number.');
  if (!/^[A-Z0-9 -]{2,15}$/.test(enquiry.registration)) throw new Error('Please check the vehicle registration.');
  if (![...services.map(s => s.name), 'Something else'].includes(enquiry.service)) throw new Error('Please choose a service.');
  if (enquiry.date && (!/^\d{4}-\d{2}-\d{2}$/.test(enquiry.date) || Number.isNaN(Date.parse(enquiry.date)) || new Date(enquiry.date).toISOString().slice(0, 10) !== enquiry.date || enquiry.date < today)) throw new Error('Please choose today or a future date.');
  return enquiry;
}
