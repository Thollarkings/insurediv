import React, { useState } from 'react';
import { ShieldCheck, User, Mail, AlertCircle, CheckCircle, Trash2, Lock } from 'lucide-react';

const API_URL = 'http://localhost:3001/api';
const ENROLLMENT_CODE = 'diven45-2026';

const Enroll = () => {
    const [step, setStep] = useState('code');
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [staffData, setStaffData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'staff'
    });
    const [staffUsers, setStaffUsers] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchStaffUsers = async () => {
        try {
            const res = await fetch(`${API_URL}/staff/list?code=${encodeURIComponent(code)}`);
            if (res.ok) {
                const data = await res.json();
                setStaffUsers(data);
            }
        } catch (err) {
            console.error('Failed to fetch staff', err);
        }
    };

    const verifyCode = code === ENROLLMENT_CODE;

    const handleCodeSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!code.trim()) {
            setError('Please enter the enrollment code');
            return;
        }

        if (verifyCode) {
            setStep('create');
            setSuccess('Code verified! You can now create staff accounts.');
            fetchStaffUsers();
        } else {
            setError('Invalid enrollment code. Please try again.');
        }
    };

    const handleStaffSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!staffData.name.trim() || !staffData.email.trim() || !staffData.password.trim()) {
            setError('Please fill in all required fields');
            return;
        }

        if (staffData.password.length < 6) {
            setError('Password must be at least 6 characters long');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/staff/enroll`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...staffData,
                    enrollmentCode: code
                })
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Failed to create staff account');
            } else {
                setSuccess(`Staff account for ${staffData.name} created successfully!`);
                setStaffData({ name: '', email: '', password: '', role: 'staff' });
                fetchStaffUsers();
            }
        } catch (err) {
            setError('Failed to create staff account');
        } finally {
            setLoading(false);
        }
    };

    const handleCodeChange = (e) => {
        setCode(e.target.value);
        setError('');
        setSuccess('');
    };

    const handleDeleteStaff = async (email) => {
        if (!window.confirm(`Are you sure you want to delete staff member ${email}?`)) return;

        const deleteCode = window.prompt('Please enter the enrollment code to confirm deletion:');

        if (!deleteCode) {
            setError('Deletion cancelled: No enrollment code provided');
            return;
        }

        if (deleteCode !== 'diven45-2026') {
            setError('Invalid enrollment code. Deletion cancelled.');
            return;
        }

        try {
            setError('');
            setSuccess('');

            const res = await fetch(`${API_URL}/staff/delete`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: email, enrollmentCode: deleteCode })
            });

            if (res.ok) {
                setSuccess(`Staff ${email} deleted successfully`);
                fetchStaffUsers();
            } else {
                const data = await res.json();
                setError(data.error || 'Failed to delete staff');
            }
        } catch (err) {
            setError('Failed to delete staff member');
        }
    };

    const handleStaffChange = (e) => {
        setStaffData({
            ...staffData,
            [e.target.name]: e.target.value
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-24 pb-12">
            <div className="max-w-4xl mx-auto px-4">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-[#002147] rounded-3xl mb-6">
                        <ShieldCheck className="w-10 h-10 text-[#D4AF37]" />
                    </div>
                    <h1 className="text-4xl font-bold text-[#002147] mb-4">Staff Enrollment Portal</h1>
                    <p className="text-xl text-gray-600">
                        Create secure staff accounts for access to the Top Notch Insurance Brokers admin portal
                    </p>
                </div>

                {step === 'code' && (
                    <div className="max-w-md mx-auto">
                        <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-2xl">
                            <div className="text-center mb-8">
                                <h2 className="text-2xl font-bold text-[#002147] mb-2">Enter Enrollment Code</h2>
                                <p className="text-gray-500">
                                    Only authorized administrators can create staff accounts
                                </p>
                            </div>

                            {error && (
                                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                                    <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                                    <p className="text-red-700">{error}</p>
                                </div>
                            )}

                            <form onSubmit={handleCodeSubmit} className="space-y-6">
                                <div>
                                    <label className="text-sm font-bold text-[#002147] mb-2 block">
                                        Enrollment Code
                                    </label>
                                    <input
                                        type="password"
                                        value={code}
                                        onChange={handleCodeChange}
                                        placeholder="Enter code"
                                        className="w-full bg-gray-50 border border-gray-200 p-4 rounded-xl focus:ring-2 focus:ring-[#002147] outline-none text-lg"
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full bg-[#002147] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#D4AF37] hover:text-[#002147] transition-all shadow-lg flex items-center justify-center gap-3"
                                >
                                    <ShieldCheck className="w-5 h-5" />
                                    Verify Code
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {step === 'create' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-2xl">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-12 h-12 bg-[#002147] rounded-2xl flex items-center justify-center">
                                    <User className="w-6 h-6 text-[#D4AF37]" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-[#002147]">Create Staff Account</h2>
                                    <p className="text-gray-500">Add new staff members to the system</p>
                                </div>
                            </div>

                            {error && (
                                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                                    <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                                    <p className="text-red-700">{error}</p>
                                </div>
                            )}

                            {success && (
                                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3">
                                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                    <p className="text-green-700">{success}</p>
                                </div>
                            )}

                            <form onSubmit={handleStaffSubmit} className="space-y-6">
                                <div>
                                    <label className="text-sm font-bold text-[#002147] mb-2 block">
                                        Full Name *
                                    </label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                        <input
                                            type="text"
                                            name="name"
                                            value={staffData.name}
                                            onChange={handleStaffChange}
                                            placeholder="John Doe"
                                            className="w-full bg-gray-50 border border-gray-200 p-4 pl-12 rounded-xl focus:ring-2 focus:ring-[#002147] outline-none"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-bold text-[#002147] mb-2 block">
                                        Email Address *
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                        <input
                                            type="email"
                                            name="email"
                                            value={staffData.email}
                                            onChange={handleStaffChange}
                                            placeholder="john@topnotchib.com"
                                            className="w-full bg-gray-50 border border-gray-200 p-4 pl-12 rounded-xl focus:ring-2 focus:ring-[#002147] outline-none"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-bold text-[#002147] mb-2 block">
                                        Password *
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                        <input
                                            type="password"
                                            name="password"
                                            value={staffData.password}
                                            onChange={handleStaffChange}
                                            placeholder="Minimum 6 characters"
                                            className="w-full bg-gray-50 border border-gray-200 p-4 pl-12 rounded-xl focus:ring-2 focus:ring-[#002147] outline-none"
                                            required
                                            minLength={6}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-bold text-[#002147] mb-2 block">
                                        Role
                                    </label>
                                    <select
                                        name="role"
                                        value={staffData.role}
                                        onChange={handleStaffChange}
                                        className="w-full bg-gray-50 border border-gray-200 p-4 rounded-xl focus:ring-2 focus:ring-[#002147] outline-none"
                                    >
                                        <option value="staff">Staff</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-[#002147] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#D4AF37] hover:text-[#002147] transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Creating...' : 'Create Staff Account'}
                                </button>
                            </form>
                        </div>

                        <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-2xl">
                            <h2 className="text-2xl font-bold text-[#002147] mb-6">Current Staff Members</h2>
                            <div className="space-y-4">
                                {staffUsers.map((staff) => (
                                    <div
                                        key={staff.email}
                                        className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-[#002147] rounded-xl flex items-center justify-center">
                                                <User className="w-5 h-5 text-[#D4AF37]" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-[#002147]">{staff.name}</p>
                                                <p className="text-sm text-gray-500">{staff.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="text-sm font-bold text-[#D4AF37] uppercase">
                                                {staff.role}
                                            </span>
                                            <button
                                                onClick={() => handleDeleteStaff(staff.email)}
                                                className="text-red-500 hover:text-red-700 transition-colors"
                                                title="Delete staff member"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {staffUsers.length === 0 && (
                                    <p className="text-gray-500 text-center py-8">No staff members yet.</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Enroll;
