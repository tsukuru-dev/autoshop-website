import { services } from '../data/site';

export type Enquiry = { name: string; phone: string; email: string; registration: string; services: string[]; urgency: string; date: string; message: string };
export function validateEnquiry(form: FormData, today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/London' }).format(new Date())): Enquiry {
  const field = (key: string, max: number, required = true) => {
    const raw = form.get(key);
    if (raw !== null && typeof raw !== 'string') throw new Error('Invalid form fields.');
    const value = (raw || '').trim();
    if ((required && !value) || value.length > max) throw new Error(`Please check the ${key} field.`);
    return value;
  };
  const selectedServices = form.getAll('service');
  const allowedServices = [...services.map(service => service.name), 'Something else'];
  if (!selectedServices.length || selectedServices.some(service => typeof service !== 'string' || !allowedServices.includes(service)) || new Set(selectedServices).size !== selectedServices.length) throw new Error('Please choose at least one valid service.');
  const enquiry = { name: field('name', 100), phone: field('phone', 30), email: field('email', 254), registration: field('registration', 15).toUpperCase(), services: selectedServices as string[], urgency: field('urgency', 40), date: field('date', 10, false), message: field('message', 3000, false) };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(enquiry.email) || /[\r\n]/.test(enquiry.name)) throw new Error('Please enter a valid name and email address.');
  if (!/^[+\d\s().-]{7,30}$/.test(enquiry.phone) || enquiry.phone.replace(/\D/g, '').length < 7) throw new Error('Please enter a valid phone number.');
  if (!/^[A-Z0-9 -]{2,15}$/.test(enquiry.registration)) throw new Error('Please check the vehicle registration.');
  if (!['As soon as possible', 'Within the next few days', 'Within a week', 'I’m flexible', 'I have a specific date'].includes(enquiry.urgency)) throw new Error('Please tell us how soon you need the work done.');
  if (enquiry.urgency === 'I have a specific date' && !enquiry.date) throw new Error('Please choose your preferred date.');
  if (enquiry.urgency !== 'I have a specific date' && enquiry.date) throw new Error('Please choose “I have a specific date” before selecting a date.');
  if (enquiry.date && (!/^\d{4}-\d{2}-\d{2}$/.test(enquiry.date) || Number.isNaN(Date.parse(enquiry.date)) || new Date(enquiry.date).toISOString().slice(0, 10) !== enquiry.date || enquiry.date < today)) throw new Error('Please choose today or a future date.');
  return enquiry;
}
