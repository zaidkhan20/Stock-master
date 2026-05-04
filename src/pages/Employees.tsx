import React, { useEffect, useState } from 'react';
import { collection, query, onSnapshot, addDoc, serverTimestamp, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { 
  Users, 
  Plus, 
  Search, 
  Briefcase, 
  Calendar, 
  DollarSign,
  Phone,
  Mail,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';

interface Employee {
  id: string;
  name: string;
  designation: string;
  phone: string;
  email: string;
  salary: number;
  joiningDate: string;
}

export const Employees: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [newEmployee, setNewEmployee] = useState({
    name: '',
    designation: '',
    phone: '',
    email: '',
    salary: 0,
    joiningDate: format(new Date(), 'yyyy-MM-dd')
  });

  useEffect(() => {
    return onSnapshot(query(collection(db, 'employees')), (snapshot) => {
      setEmployees(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Employee)));
    });
  }, []);

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'employees'), {
        ...newEmployee,
        createdAt: serverTimestamp()
      });
      setShowAddModal(false);
      setNewEmployee({ name: '', designation: '', phone: '', email: '', salary: 0, joiningDate: format(new Date(), 'yyyy-MM-dd') });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Employee Directory</h1>
          <p className="text-slate-500">Manage staff records, roles and salaries</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-6 py-2 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Add Employee
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search staff by name or designation..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {employees.filter(emp => emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || emp.designation.toLowerCase().includes(searchTerm.toLowerCase())).map((employee) => (
          <div key={employee.id} className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-lg transition-all group">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600">
                <Users className="w-6 h-6" />
              </div>
              <div className="text-[10px] font-black uppercase text-slate-400 bg-slate-100 px-2 py-1 rounded">
                Active
              </div>
            </div>
            
            <h3 className="text-lg font-bold text-slate-900 mb-0.5">{employee.name}</h3>
            <div className="flex items-center gap-2 text-slate-500 text-sm font-medium mb-6">
              <Briefcase className="w-3.5 h-3.5" />
              {employee.designation}
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-50">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-600 text-xs font-bold">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" /> Joined {employee.joiningDate}
                  </div>
                  <div className="text-xs font-black text-emerald-600">
                    ₨ {employee.salary.toLocaleString()} / mo
                  </div>
               </div>
               <div className="flex flex-wrap gap-2 pt-2">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 rounded-lg text-xs font-medium text-slate-600">
                    <Phone className="w-3 h-3 text-slate-400" /> {employee.phone || 'N/A'}
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 rounded-lg text-xs font-medium text-slate-600">
                    <Mail className="w-3 h-3 text-slate-400" /> {employee.email || 'N/A'}
                  </div>
               </div>
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white w-full max-w-lg rounded-3xl p-8 shadow-2xl">
               <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-black text-slate-900 uppercase">New Staff Record</h2>
                  <button onClick={() => setShowAddModal(false)}><X /></button>
               </div>
               <form onSubmit={handleAddEmployee} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <input required placeholder="Full Name" className="w-full px-4 py-3 bg-slate-50 rounded-xl outline-none" value={newEmployee.name} onChange={e => setNewEmployee({...newEmployee, name: e.target.value})} />
                    <input required placeholder="Designation" className="w-full px-4 py-3 bg-slate-50 rounded-xl outline-none" value={newEmployee.designation} onChange={e => setNewEmployee({...newEmployee, designation: e.target.value})} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <input placeholder="Phone" className="w-full px-4 py-3 bg-slate-50 rounded-xl outline-none" value={newEmployee.phone} onChange={e => setNewEmployee({...newEmployee, phone: e.target.value})} />
                    <input placeholder="Email" type="email" className="w-full px-4 py-3 bg-slate-50 rounded-xl outline-none" value={newEmployee.email} onChange={e => setNewEmployee({...newEmployee, email: e.target.value})} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                       <label className="text-[10px] uppercase font-black text-slate-400">Monthly Salary (PKR)</label>
                       <input type="number" placeholder="0" className="w-full px-4 py-3 bg-slate-50 rounded-xl outline-none" value={newEmployee.salary} onChange={e => setNewEmployee({...newEmployee, salary: Number(e.target.value)})} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-black text-slate-400">Joining Date</label>
                      <input type="date" className="w-full px-4 py-3 bg-slate-50 rounded-xl outline-none" value={newEmployee.joiningDate} onChange={e => setNewEmployee({...newEmployee, joiningDate: e.target.value})} />
                    </div>
                  </div>
                  <button type="submit" className="w-full py-4 bg-slate-900 text-white font-bold rounded-xl active:scale-95 transition-all">Save Record</button>
               </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
