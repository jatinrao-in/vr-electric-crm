import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  collection,
  doc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  getDocs,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { 
  Lead, 
  LeadActivity, 
  AdLog, 
  ShowroomVisitor, 
  SalesRecord, 
  SystemSettings, 
  UserProfile,
  Scooter,
  CustomerVoucher
} from '../types';
import { DEFAULT_SYSTEM_SETTINGS } from '../lib/constants';
import { cleanPhoneNumber } from '../lib/utils';
import { useAuth } from './AuthContext';

interface CRMContextType {
  leads: Lead[];
  activities: Record<string, LeadActivity[]>;
  adLogs: AdLog[];
  visitors: ShowroomVisitor[];
  sales: SalesRecord[];
  users: UserProfile[];
  scooters: Scooter[];
  vouchers: CustomerVoucher[];
  settings: SystemSettings;
  loading: boolean;
  
  // Lead methods
  addLead: (lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt' | 'totalCallsCount' | 'isVisited' | 'isSold'>) => Promise<{ success: boolean; leadId?: string; error?: string }>;
  updateLead: (leadId: string, updates: Partial<Lead>) => Promise<void>;
  deleteLead: (leadId: string) => Promise<void>;
  logCallActivity: (leadId: string, activity: Omit<LeadActivity, 'activityId' | 'leadId' | 'createdAt'>) => Promise<void>;
  fetchActivitiesForLead: (leadId: string) => Promise<LeadActivity[]>;
  checkDuplicatePhone: (phone: string) => Lead | undefined;
  
  // Ad tracker methods
  addAdLog: (log: Omit<AdLog, 'id' | 'createdAt'>) => Promise<void>;
  
  // Showroom & Sales methods
  addShowroomVisitor: (visitor: Omit<ShowroomVisitor, 'id' | 'timestamp'>) => Promise<void>;
  recordSale: (sale: Omit<SalesRecord, 'id' | 'createdAt' | 'timestamp'>) => Promise<void>;

  // Scooter Catalogue methods
  addScooter: (scooter: Omit<Scooter, 'id' | 'createdAt' | 'updatedAt'>) => Promise<{ success: boolean; id?: string; error?: string }>;
  updateScooter: (id: string, updates: Partial<Scooter>) => Promise<void>;
  deleteScooter: (id: string) => Promise<void>;

  // Customer Voucher & Quotation methods
  addVoucher: (voucher: Omit<CustomerVoucher, 'id' | 'createdAt'>) => Promise<{ success: boolean; id?: string; error?: string }>;
  deleteVoucher: (id: string) => Promise<void>;
  
  // Settings & Users
  updateSettings: (newSettings: SystemSettings) => Promise<void>;
  updateUserStatus: (uid: string, isActive: boolean) => Promise<void>;
  updateUserRole: (uid: string, role: any) => Promise<void>;
}

const CRMContext = createContext<CRMContextType | undefined>(undefined);

export const CRMProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();

  // Zero-dummy: pure empty initial states
  const [leads, setLeads] = useState<Lead[]>([]);
  const [activities, setActivities] = useState<Record<string, LeadActivity[]>>({});
  const [adLogs, setAdLogs] = useState<AdLog[]>([]);
  const [visitors, setVisitors] = useState<ShowroomVisitor[]>([]);
  const [sales, setSales] = useState<SalesRecord[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [scooters, setScooters] = useState<Scooter[]>([]);
  const [vouchers, setVouchers] = useState<CustomerVoucher[]>([]);
  const [settings, setSettings] = useState<SystemSettings>(DEFAULT_SYSTEM_SETTINGS);
  const [loading, setLoading] = useState(true);

  // Real-time Firestore Listeners (Live Production Data Only)
  useEffect(() => {
    if (!currentUser) {
      setLeads([]);
      setAdLogs([]);
      setVisitors([]);
      setSales([]);
      setUsers([]);
      setScooters([]);
      setVouchers([]);
      setLoading(false);
      return;
    }

    try {
      // 1. Live Leads Listener
      const qLeads = query(collection(db, 'leads'), orderBy('createdAt', 'desc'));
      const unsubLeads = onSnapshot(qLeads, (snapshot) => {
        const list: Lead[] = [];
        snapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() } as Lead);
        });
        setLeads(list);
      }, (err) => {
        console.warn('Firestore leads listener:', err.message);
      });

      // 2. Live Ad Metrics Listener
      const qAds = query(collection(db, 'ad_metrics'), orderBy('date', 'desc'));
      const unsubAds = onSnapshot(qAds, (snapshot) => {
        const list: AdLog[] = [];
        snapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() } as AdLog);
        });
        setAdLogs(list);
      }, (err) => {
        console.warn('Firestore ad_metrics listener:', err.message);
      });

      // 3. Live Showroom Visitors Listener
      const qVisitors = query(collection(db, 'visitors'), orderBy('visitDate', 'desc'));
      const unsubVisitors = onSnapshot(qVisitors, (snapshot) => {
        const list: ShowroomVisitor[] = [];
        snapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() } as ShowroomVisitor);
        });
        setVisitors(list);
      }, (err) => {
        console.warn('Firestore visitors listener:', err.message);
      });

      // 4. Live Sales Ledger Listener
      const qSales = query(collection(db, 'sales'), orderBy('saleDate', 'desc'));
      const unsubSales = onSnapshot(qSales, (snapshot) => {
        const list: SalesRecord[] = [];
        snapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() } as SalesRecord);
        });
        setSales(list);
      }, (err) => {
        console.warn('Firestore sales listener:', err.message);
      });

      // 5. Live System Settings Listener
      const unsubSettings = onSnapshot(doc(db, 'system_settings', 'master_config'), (snap) => {
        if (snap.exists()) {
          setSettings(snap.data() as SystemSettings);
        } else {
          // Initialize default if unconfigured
          setDoc(doc(db, 'system_settings', 'master_config'), DEFAULT_SYSTEM_SETTINGS).catch(() => {});
        }
      }, (err) => {
        console.warn('Firestore settings listener:', err.message);
      });

      // 6. Live Users Listener (for assignment & team overview)
      const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
        const list: UserProfile[] = [];
        snapshot.forEach((doc) => {
          list.push({ uid: doc.id, ...doc.data() } as UserProfile);
        });
        setUsers(list);
      }, (err) => {
        console.warn('Firestore users listener:', err.message);
      });

      // 7. Live Scooters Listener
      const qScooters = query(collection(db, 'scooters'), orderBy('modelName', 'asc'));
      const unsubScooters = onSnapshot(qScooters, (snapshot) => {
        const list: Scooter[] = [];
        snapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() } as Scooter);
        });
        setScooters(list);
      }, (err) => {
        console.warn('Firestore scooters listener:', err.message);
      });

      // 8. Live Vouchers Listener
      const qVouchers = query(collection(db, 'vouchers'), orderBy('createdAt', 'desc'));
      const unsubVouchers = onSnapshot(qVouchers, (snapshot) => {
        const list: CustomerVoucher[] = [];
        snapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() } as CustomerVoucher);
        });
        setVouchers(list);
      }, (err) => {
        console.warn('Firestore vouchers listener:', err.message);
      });

      setLoading(false);

      return () => {
        unsubLeads();
        unsubAds();
        unsubVisitors();
        unsubSales();
        unsubSettings();
        unsubUsers();
        unsubScooters();
        unsubVouchers();
      };
    } catch (err) {
      console.warn("Real-time listener setup error:", err);
      setLoading(false);
    }
  }, [currentUser]);

  // Duplicate phone checker
  const checkDuplicatePhone = (phone: string): Lead | undefined => {
    const clean = cleanPhoneNumber(phone);
    if (!clean || clean.length < 10) return undefined;
    return leads.find(l => cleanPhoneNumber(l.phoneNumber) === clean);
  };

  // Add Lead
  const addLead = async (leadData: Omit<Lead, 'id' | 'createdAt' | 'updatedAt' | 'totalCallsCount' | 'isVisited' | 'isSold'>) => {
    const dup = checkDuplicatePhone(leadData.phoneNumber);
    if (dup) {
      return { 
        success: false, 
        leadId: dup.id, 
        error: `Phone number already exists in CRM (Assigned to ${dup.assignedToName}).` 
      };
    }

    const newId = `lead_${Date.now()}`;
    const newLead: Lead = {
      ...leadData,
      id: newId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      totalCallsCount: 0,
      isVisited: false,
      isSold: false,
    };

    const initialActivity: LeadActivity = {
      activityId: `act_${Date.now()}`,
      leadId: newId,
      type: 'STATUS_CHANGE',
      remark: `Lead created from ${newLead.leadSource}. Assigned to ${newLead.assignedToName}.`,
      newStatus: newLead.status,
      performedBy: newLead.createdBy,
      performedByName: currentUser?.name || 'Manager',
      createdAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, 'leads', newId), newLead);
      await addDoc(collection(db, 'leads', newId, 'activities'), initialActivity);
      return { success: true, leadId: newId };
    } catch (err: any) {
      console.error('Error adding lead:', err);
      return { success: false, error: err.message || 'Failed to add lead to Firestore.' };
    }
  };

  // Update Lead
  const updateLead = async (leadId: string, updates: Partial<Lead>) => {
    const updatedWithTime = {
      ...updates,
      updatedAt: new Date().toISOString()
    };
    try {
      await updateDoc(doc(db, 'leads', leadId), updatedWithTime);
    } catch (err) {
      console.error('Error updating lead:', err);
    }
  };

  // Delete Lead (master_admin only)
  const deleteLead = async (leadId: string) => {
    try {
      await deleteDoc(doc(db, 'leads', leadId));
    } catch (err) {
      console.error('Error deleting lead:', err);
    }
  };

  // Log Call Activity
  const logCallActivity = async (leadId: string, activityData: Omit<LeadActivity, 'activityId' | 'leadId' | 'createdAt'>) => {
    const actId = `act_${Date.now()}`;
    const newActivity: LeadActivity = {
      ...activityData,
      activityId: actId,
      leadId,
      createdAt: new Date().toISOString()
    };

    try {
      await addDoc(collection(db, 'leads', leadId, 'activities'), newActivity);
      await updateDoc(doc(db, 'leads', leadId), {
        status: activityData.newStatus,
        latestRemark: activityData.remark,
        nextFollowUpDate: activityData.scheduledFollowUp || null,
        followUpTimeSlot: activityData.timeSlot || null,
        lastContactedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error('Error logging call activity:', err);
    }
  };

  // Fetch activities for a lead
  const fetchActivitiesForLead = async (leadId: string): Promise<LeadActivity[]> => {
    try {
      const q = query(collection(db, 'leads', leadId, 'activities'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      const list: LeadActivity[] = [];
      snap.forEach(d => list.push({ activityId: d.id, ...d.data() } as LeadActivity));
      setActivities(prev => ({ ...prev, [leadId]: list }));
      return list;
    } catch (err) {
      console.error('Error fetching activities:', err);
      return activities[leadId] || [];
    }
  };

  // Add Ad Log
  const addAdLog = async (logData: Omit<AdLog, 'id' | 'createdAt'>) => {
    const id = `ad_${Date.now()}`;
    const newLog: AdLog = {
      ...logData,
      id,
      createdAt: new Date().toISOString()
    };
    try {
      await setDoc(doc(db, 'ad_metrics', id), newLog);
    } catch (err) {
      console.error('Error adding ad log:', err);
    }
  };

  // Add Showroom Visitor with smart phone matching
  const addShowroomVisitor = async (visitorData: Omit<ShowroomVisitor, 'id' | 'timestamp'>) => {
    const id = `vis_${Date.now()}`;
    const matchedLead = checkDuplicatePhone(visitorData.phoneNumber);
    const linkedLeadId = matchedLead ? matchedLead.id : null;

    const newVisitor: ShowroomVisitor = {
      ...visitorData,
      id,
      linkedLeadId,
      timestamp: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, 'visitors', id), newVisitor);
      if (matchedLead) {
        await updateDoc(doc(db, 'leads', matchedLead.id), { 
          isVisited: true,
          status: 'Visit Scheduled',
          updatedAt: new Date().toISOString(),
        });
        await addDoc(collection(db, 'leads', matchedLead.id, 'activities'), {
          activityId: `act_${Date.now()}`,
          leadId: matchedLead.id,
          type: 'VISIT_LOGGED',
          remark: `Showroom walk-in visit logged. Attended by ${visitorData.attendedBy}. Model: ${visitorData.modelExplored}.`,
          performedBy: visitorData.loggedBy,
          performedByName: currentUser?.name || 'Showroom Staff',
          createdAt: new Date().toISOString()
        });
      }
    } catch (err) {
      console.error('Error adding visitor:', err);
    }
  };

  // Record Sale with smart lead matching
  const recordSale = async (saleData: Omit<SalesRecord, 'id' | 'createdAt' | 'timestamp'>) => {
    const id = `sale_${Date.now()}`;
    const matchedLead = checkDuplicatePhone(saleData.phoneNumber);
    const linkedLeadId = matchedLead ? matchedLead.id : null;

    const newSale: SalesRecord = {
      ...saleData,
      id,
      linkedLeadId,
      timestamp: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, 'sales', id), newSale);
      if (matchedLead) {
        await updateDoc(doc(db, 'leads', matchedLead.id), { 
          isSold: true, 
          status: 'Converted',
          updatedAt: new Date().toISOString(),
        });
        await addDoc(collection(db, 'leads', matchedLead.id, 'activities'), {
          activityId: `act_${Date.now()}`,
          leadId: matchedLead.id,
          type: 'SALE_CLOSED',
          remark: `Sale closed! Model: ${saleData.scooterModel} (${saleData.colorVariant}). Amount: ₹${saleData.finalSaleAmount}. Invoice: ${saleData.invoiceNumber || 'N/A'}.`,
          newStatus: 'Converted',
          performedBy: saleData.loggedBy,
          performedByName: currentUser?.name || 'Showroom Staff',
          createdAt: new Date().toISOString()
        });
      }
    } catch (err) {
      console.error('Error recording sale:', err);
    }
  };

  // Update Settings
  const updateSettings = async (newSettings: SystemSettings) => {
    try {
      await setDoc(doc(db, 'system_settings', 'master_config'), newSettings);
      setSettings(newSettings);
    } catch (err) {
      console.error('Error saving settings:', err);
    }
  };

  // Update User Status
  const updateUserStatus = async (uid: string, isActive: boolean) => {
    const targetUser = users.find(u => u.uid === uid);
    if (targetUser?.email?.toLowerCase() === 'info.raojatin@gmail.com' && !isActive) {
      console.warn('Master Admin account (info.raojatin@gmail.com) cannot be deactivated.');
      return;
    }
    try {
      await updateDoc(doc(db, 'users', uid), { isActive });
    } catch (err) {
      console.error('Error updating user status:', err);
    }
  };

  // Update User Role
  const updateUserRole = async (uid: string, role: any) => {
    if (role === 'master_admin' || role === 'super_admin') {
      const targetUser = users.find(u => u.uid === uid);
      if (targetUser?.email?.toLowerCase() !== 'info.raojatin@gmail.com') {
        console.warn('Cannot assign master_admin role to non-master user.');
        return;
      }
    }
    try {
      await updateDoc(doc(db, 'users', uid), { role });
    } catch (err) {
      console.error('Error updating user role:', err);
    }
  };

  // Scooter Management
  const addScooter = async (scooterData: Omit<Scooter, 'id' | 'createdAt' | 'updatedAt'>) => {
    const id = `scooter_${Date.now()}`;
    const newScooter: Scooter = {
      ...scooterData,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    try {
      await setDoc(doc(db, 'scooters', id), newScooter);
      return { success: true, id };
    } catch (err: any) {
      console.error('Error adding scooter:', err);
      return { success: false, error: err.message || 'Failed to save scooter' };
    }
  };

  const updateScooter = async (id: string, updates: Partial<Scooter>) => {
    try {
      await updateDoc(doc(db, 'scooters', id), {
        ...updates,
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error('Error updating scooter:', err);
    }
  };

  const deleteScooter = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'scooters', id));
    } catch (err) {
      console.error('Error deleting scooter:', err);
    }
  };

  // Voucher / Invoice Management
  const addVoucher = async (voucherData: Omit<CustomerVoucher, 'id' | 'createdAt'>) => {
    const id = `voucher_${Date.now()}`;
    const newVoucher: CustomerVoucher = {
      ...voucherData,
      id,
      createdAt: new Date().toISOString(),
    };
    try {
      await setDoc(doc(db, 'vouchers', id), newVoucher);

      // Smart Action: Automatically sync with visitors collection if not added today
      const todayStr = new Date().toISOString().split('T')[0];
      const cleanPhone = cleanPhoneNumber(voucherData.phoneNumber);
      const visitedToday = visitors.some(v => v.visitDate === todayStr && cleanPhoneNumber(v.phoneNumber) === cleanPhone);

      if (!visitedToday && cleanPhone) {
        await addShowroomVisitor({
          visitDate: todayStr,
          visitorName: voucherData.customerName,
          phoneNumber: cleanPhone,
          purpose: 'Customer Quotation & Booking',
          modelExplored: voucherData.modelName,
          testRideTaken: true,
          attendedBy: voucherData.preparedByName || currentUser?.name || 'Sales Executive',
          visitOutcome: voucherData.voucherType.includes('Booking') ? 'Booked / Purchased' : 'Will Decide Soon',
          remarks: `Generated ${voucherData.voucherType} (${voucherData.voucherNumber})`,
          loggedBy: currentUser?.uid || 'staff',
        }).catch((e) => console.warn('Auto-visitor sync notice:', e));
      }

      return { success: true, id };
    } catch (err: any) {
      console.error('Error adding voucher:', err);
      return { success: false, error: err.message || 'Failed to save customer voucher' };
    }
  };

  const deleteVoucher = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'vouchers', id));
    } catch (err) {
      console.error('Error deleting voucher:', err);
    }
  };

  return (
    <CRMContext.Provider
      value={{
        leads,
        activities,
        adLogs,
        visitors,
        sales,
        users,
        scooters,
        vouchers,
        settings,
        loading,
        addLead,
        updateLead,
        deleteLead,
        logCallActivity,
        fetchActivitiesForLead,
        checkDuplicatePhone,
        addAdLog,
        addShowroomVisitor,
        recordSale,
        addScooter,
        updateScooter,
        deleteScooter,
        addVoucher,
        deleteVoucher,
        updateSettings,
        updateUserStatus,
        updateUserRole,
      }}
    >
      {children}
    </CRMContext.Provider>
  );
};

export const useCRM = () => {
  const ctx = useContext(CRMContext);
  if (!ctx) throw new Error('useCRM must be used within CRMProvider');
  return ctx;
};
