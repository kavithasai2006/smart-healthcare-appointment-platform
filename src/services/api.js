// Centralized API Service for SmartCare Platform
// Primary source: Node.js + Express + MongoDB backend
// Graceful fallback: LocalStorage & static AP dataset when offline

import { apLocations, hospitalsByLocation, doctors as staticDoctors } from '../data/doctors.js';

const API_BASE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL) ||
  'http://localhost:5000/api';

// Safe localStorage accessors
const getStorage = (key) => {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }
  return null;
};

const setStorage = (key, val) => {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      localStorage.setItem(key, val);
    } catch (e) {
      console.error(e);
    }
  }
};

const removeStorage = (key) => {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error(e);
    }
  }
};

// Helper to get auth token
const getAuthHeaders = () => {
  const token = getStorage('smartcareToken');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// Generic request wrapper with timeout and fallback
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...(options.headers || {}),
    },
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout

  try {
    const res = await fetch(url, { ...config, signal: controller.signal });
    clearTimeout(timeoutId);

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || `HTTP ${res.status}`);
    }
    return { success: true, data };
  } catch (error) {
    clearTimeout(timeoutId);
    return {
      success: false,
      error: error.message || 'Network request failed',
      isOffline:
        error.name === 'AbortError' ||
        error.message.includes('Failed to fetch') ||
        error.message.includes('NetworkError'),
    };
  }
}

// ================= AUTH API =================
export const authApi = {
  async register(fullName, email, password, phone = '') {
    const res = await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ fullName, email, password, phone }),
    });

    if (res.success && res.data.token) {
      setStorage('smartcareToken', res.data.token);
      setStorage('smartcareUser', JSON.stringify(res.data.user));
      return { success: true, message: res.data.message, user: res.data.user };
    }

    // LocalStorage fallback if server unreachable
    if (res.isOffline) {
      console.warn('Backend unavailable, using LocalStorage fallback for registration');
      const existing = JSON.parse(getStorage('smartcareUsers') || '[]');
      if (existing.some((u) => u.email.toLowerCase() === email.toLowerCase().trim())) {
        return { success: false, message: 'An account with this email already exists (offline mode).' };
      }
      const newUser = { id: Date.now().toString(), fullName, email: email.toLowerCase().trim(), password, phone };
      existing.push(newUser);
      setStorage('smartcareUsers', JSON.stringify(existing));
      return { success: true, message: 'Registration successful (offline mode)!' };
    }

    return { success: false, message: res.error };
  },

  async login(email, password) {
    const res = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (res.success && res.data.token) {
      setStorage('smartcareToken', res.data.token);
      setStorage('smartcareUser', JSON.stringify(res.data.user));
      return { success: true, message: res.data.message, user: res.data.user };
    }

    // LocalStorage fallback if server unreachable
    if (res.isOffline) {
      console.warn('Backend unavailable, using LocalStorage fallback for login');
      const existing = JSON.parse(getStorage('smartcareUsers') || '[]');
      const matched = existing.find(
        (u) => u.email.toLowerCase() === email.toLowerCase().trim() && u.password === password
      );
      if (!matched) {
        return { success: false, message: 'Invalid email or password (offline mode).' };
      }
      const sessionUser = { id: matched.id, fullName: matched.fullName, email: matched.email };
      setStorage('smartcareUser', JSON.stringify(sessionUser));
      return { success: true, message: 'Login successful (offline mode)!', user: sessionUser };
    }

    return { success: false, message: res.error };
  },

  async getMe() {
    const res = await request('/auth/me');
    if (res.success) return res.data.user;
    return null;
  },

  async updateProfile(fullName, phone) {
    const res = await request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify({ fullName, phone }),
    });
    if (res.success && res.data.user) {
      setStorage('smartcareUser', JSON.stringify(res.data.user));
      return { success: true, message: res.data.message, user: res.data.user };
    }
    return { success: false, message: res.error || 'Failed to update profile' };
  },

  logout() {
    removeStorage('smartcareToken');
    removeStorage('smartcareUser');
  },
};

// ================= LOCATIONS API =================
export const locationApi = {
  async getLocations() {
    const res = await request('/locations');
    if (res.success && Array.isArray(res.data.data)) {
      return res.data.data.map((l) => l.name);
    }
    // Fallback to AP locations
    return apLocations;
  },
};

// ================= HOSPITALS API =================
export const hospitalApi = {
  async getHospitals(location = '') {
    const endpoint = location ? `/hospitals?location=${encodeURIComponent(location)}` : '/hospitals';
    const res = await request(endpoint);
    if (res.success && Array.isArray(res.data.data)) {
      return res.data.data.map((h) => h.name);
    }
    // Fallback
    if (location && hospitalsByLocation[location]) {
      return hospitalsByLocation[location];
    }
    return Object.values(hospitalsByLocation).flat();
  },

  async getHospitalListWithDetails(location = '') {
    const endpoint = location ? `/hospitals?location=${encodeURIComponent(location)}` : '/hospitals';
    const res = await request(endpoint);
    if (res.success && Array.isArray(res.data.data)) {
      return res.data.data.map((h) => ({
        id: h._id || h.id,
        _id: h._id || h.id,
        name: h.name,
        locationName: h.locationName || (typeof h.location === 'object' ? h.location?.name : h.location),
        city: h.city || h.locationName,
        address: h.address || 'Andhra Pradesh',
        phone: h.phone || '0863-2222222',
        rating: h.rating || 4.8,
        specialties: h.specialties || [],
        isSample: h.isSample || h.name.startsWith('[Sample]'),
        isActive: h.isActive !== false,
      }));
    }
    return [];
  },
};

// ================= DOCTORS API =================
export const doctorApi = {
  async getDoctors(filters = {}) {
    const queryParams = new URLSearchParams();
    if (filters.location) queryParams.append('location', filters.location);
    if (filters.hospital) queryParams.append('hospital', filters.hospital);
    if (filters.specialization) queryParams.append('specialization', filters.specialization);
    if (filters.search) queryParams.append('search', filters.search);

    const qs = queryParams.toString();
    const res = await request(qs ? `/doctors?${qs}` : '/doctors');

    if (res.success && Array.isArray(res.data.data)) {
      return res.data.data.map((doc) => ({
        id: doc._id || doc.id,
        _id: doc._id || doc.id,
        name: doc.name,
        specialization: doc.specialization,
        location: doc.locationName || (typeof doc.location === 'object' ? doc.location?.name : doc.location),
        locationId: doc.locationId || (typeof doc.location === 'object' ? doc.location?._id : doc.location),
        hospital: doc.hospitalName || (typeof doc.hospital === 'object' ? doc.hospital?.name : doc.hospital),
        hospitalId: doc.hospitalId || (typeof doc.hospital === 'object' ? doc.hospital?._id : doc.hospital),
        rating: doc.rating,
        experience: doc.experience,
        fee: doc.fee,
        availableDays: doc.availableDays,
        timeSlots: doc.timeSlots,
        image: doc.image || '👨‍⚕️',
      }));
    }

    if (!res.success) {
      throw new Error(res.error || 'Failed to fetch doctors from MongoDB backend');
    }

    return [];
  },

  async getSpecializations(filters = {}) {
    const queryParams = new URLSearchParams();
    if (filters.location) queryParams.append('location', filters.location);
    if (filters.hospital) queryParams.append('hospital', filters.hospital);

    const qs = queryParams.toString();
    const res = await request(qs ? `/doctors/specializations?${qs}` : '/doctors/specializations');

    if (res.success && Array.isArray(res.data.data)) {
      return res.data.data;
    }

    if (!res.success) {
      throw new Error(res.error || 'Failed to fetch specializations from backend');
    }

    return [];
  },
};

// ================= APPOINTMENTS API =================
export const appointmentApi = {
  async getBookedSlots(doctor, date) {
    if (!doctor || !date) return [];
    const res = await request(
      `/appointments/booked-slots?doctor=${encodeURIComponent(doctor)}&date=${encodeURIComponent(date)}`
    );
    if (res.success && res.data.bookedSlots) {
      return res.data.bookedSlots;
    }

    // Local fallback
    try {
      const local = JSON.parse(getStorage('appointments') || '[]');
      return local
        .filter((apt) => apt.doctor === doctor && apt.date === date && apt.status !== 'Cancelled')
        .map((apt) => apt.time);
    } catch {
      return [];
    }
  },

  async createAppointment(appointmentData) {
    const res = await request('/appointments', {
      method: 'POST',
      body: JSON.stringify(appointmentData),
    });

    if (res.success) {
      // Also sync to localStorage as redundancy
      try {
        const local = JSON.parse(getStorage('appointments') || '[]');
        local.push(res.data.data);
        setStorage('appointments', JSON.stringify(local));
      } catch (e) {
        console.error(e);
      }
      return { success: true, message: res.data.message, appointment: res.data.data };
    }

    // If server offline, save to localStorage
    if (res.isOffline) {
      console.warn('Backend unavailable, saving appointment locally');
      const local = JSON.parse(getStorage('appointments') || '[]');
      const isConflict = local.some(
        (apt) =>
          apt.doctor === appointmentData.doctor &&
          apt.date === appointmentData.date &&
          apt.time === appointmentData.time &&
          apt.status !== 'Cancelled'
      );
      if (isConflict) {
        return {
          success: false,
          message: `The time slot (${appointmentData.time}) on ${appointmentData.date} is already booked (offline check).`,
        };
      }
      const newApt = { ...appointmentData, id: Date.now().toString(), status: 'Confirmed', isOffline: true };
      local.push(newApt);
      setStorage('appointments', JSON.stringify(local));
      return { success: true, message: 'Appointment booked (saved locally)!', appointment: newApt };
    }

    return { success: false, message: res.error };
  },

  async getUserAppointments(userEmail = '') {
    const res = await request(
      userEmail ? `/appointments?email=${encodeURIComponent(userEmail)}` : '/appointments'
    );

    if (res.success && Array.isArray(res.data.data)) {
      return res.data.data.map((apt) => ({
        id: apt.id || apt._id,
        doctor: apt.doctor,
        specialization: apt.specialization || 'Specialist',
        hospital: apt.hospital,
        location: apt.location,
        fee: apt.fee,
        patientName: apt.patient_name || apt.patientName,
        phone: apt.patient_phone || apt.patientPhone || apt.phone,
        email: apt.patient_email || apt.patientEmail || apt.email,
        age: apt.age,
        gender: apt.gender,
        height: apt.height,
        weight: apt.weight,
        bloodPressure: apt.blood_pressure || apt.bloodPressure,
        reason: apt.reason,
        date: apt.appointment_date || apt.date,
        time: apt.appointment_time || apt.time,
        status: apt.status || 'Confirmed',
        createdAt: apt.created_at || apt.createdAt,
      }));
    }

    // Local fallback
    try {
      return JSON.parse(getStorage('appointments') || '[]');
    } catch {
      return [];
    }
  },

  async cancelAppointment(appointmentId) {
    const res = await request(`/appointments/${appointmentId}/cancel`, {
      method: 'PATCH',
    });

    // Also update local storage
    try {
      const local = JSON.parse(getStorage('appointments') || '[]');
      const updated = local.filter((a) => (a._id ? a._id !== appointmentId : a.id !== appointmentId));
      setStorage('appointments', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }

    if (res.success) {
      return { success: true, message: res.data.message };
    }

    return { success: true, message: 'Appointment cancelled successfully' };
  },
};

// ================= ADMIN API =================
export const adminApi = {
  async getStats() {
    const res = await request('/admin/stats');
    return res.success ? res.data.stats : null;
  },
  async getHospitals() {
    const res = await request('/admin/hospitals');
    return res.success ? res.data.data : [];
  },
  async createHospital(payload) {
    return await request('/admin/hospitals', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  async updateHospital(id, payload) {
    return await request(`/admin/hospitals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },
  async toggleHospitalActive(id) {
    return await request(`/admin/hospitals/${id}/toggle-active`, {
      method: 'PATCH',
    });
  },
  async getDoctors(filters = {}) {
    const qs = new URLSearchParams(filters).toString();
    const res = await request(qs ? `/admin/doctors?${qs}` : '/admin/doctors');
    return res.success ? res.data.data : [];
  },
  async createDoctor(payload) {
    return await request('/admin/doctors', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  async updateDoctor(id, payload) {
    return await request(`/admin/doctors/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },
  async toggleDoctorActive(id) {
    return await request(`/admin/doctors/${id}/toggle-active`, {
      method: 'PATCH',
    });
  },
  async getLocations() {
    const res = await request('/admin/locations');
    return res.success ? res.data.data : [];
  },
  async createLocation(payload) {
    return await request('/admin/locations', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  async getAppointments(filters = {}) {
    const qs = new URLSearchParams(filters).toString();
    const res = await request(qs ? `/admin/appointments?${qs}` : '/admin/appointments');
    return res.success ? res.data.data : [];
  },
  async updateAppointmentStatus(id, status) {
    return await request(`/admin/appointments/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },
};

export default {
  auth: authApi,
  locations: locationApi,
  hospitals: hospitalApi,
  doctors: doctorApi,
  appointments: appointmentApi,
  admin: adminApi,
};
