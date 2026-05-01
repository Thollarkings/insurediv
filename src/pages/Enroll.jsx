import React, { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useAction } from 'convex/react';
import { api } from '../../convex/_generated/api';
import {
    ShieldCheck,
    User,
    Mail,
    Lock,
    AlertCircle,
    CheckCircle,
    Trash2,
    ArrowUpCircle,
    ArrowDownCircle,
    X,
    RefreshCw,
    Users,
    UserPlus,
    Key,
} from 'lucide-react';

const ENROLLMENT_CODE = 'tnib-4926';
const SESSION_KEY = 'enroll_gate_verified';

// =============================================================================
// Toast helper
// =============================================================================

function Toast({ message, type, onClose }) {
    const isError = type === 'error';
    const isSuccess = type === 'success';

    return (
        <div
            className={`fixed top-6 right-6 z-50 max-w-sm w-full p-4 rounded-xl shadow-2xl border flex items-start gap-3 animate-slide-in ${isError
                    ? 'bg-red-50 border-red-200 text-red-700'
                    : 'bg-green-50 border-green-200 text-green-700'
                }`}
        >
            {isError ? (
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
            ) : (
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
            )}
            <p className="flex-1 text-sm font-medium">{message}</p>
            <button onClick={onClose} className="flex-shrink-0 hover:opacity-70">
                <X className="w-4 h-4" />
            </button>
        </div>
    );
}

// =============================================================================
// ProtectionGate – code-entry screen guarded by sessionStorage
// =============================================================================

function ProtectionGate({ onVerified }) {
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!code.trim()) {
            setError('Please enter the enrollment code.');
            return;
        }

        setLoading(true);

        // Brief artificial delay so the user perceives validation
        await new Promise((r) => setTimeout(r, 400));

        if (code.trim() === ENROLLMENT_CODE) {
            sessionStorage.setItem(SESSION_KEY, 'true');
            onVerified();
        } else {
            setError('Invalid enrollment code. Please try again.');
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-24 pb-12 flex items-center justify-center">
            <div className="max-w-md w-full mx-auto px-4">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-[#002147] rounded-3xl mb-6">
                        <ShieldCheck className="w-10 h-10 text-[#D4AF37]" />
                    </div>
                    <h1 className="text-4xl font-bold text-[#002147] mb-4">Staff Enrollment Portal</h1>
                    <p className="text-xl text-gray-600">
                        Secure access for Top Notch Insurance Brokers administrators
                    </p>
                </div>

                <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-2xl">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-14 h-14 bg-[#002147]/10 rounded-2xl mb-4">
                            <Key className="w-7 h-7 text-[#002147]" />
                        </div>
                        <h2 className="text-2xl font-bold text-[#002147] mb-2">Enter Enrollment Code</h2>
                        <p className="text-gray-500">
                            Only authorized administrators can manage staff accounts
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                            <p className="text-red-700 text-sm">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="text-sm font-bold text-[#002147] mb-2 block">
                                Enrollment Code
                            </label>
                            <input
                                type="password"
                                value={code}
                                onChange={(e) => {
                                    setCode(e.target.value);
                                    setError('');
                                }}
                                placeholder="Enter code"
                                className="w-full bg-gray-50 border border-gray-200 p-4 rounded-xl focus:ring-2 focus:ring-[#002147] outline-none text-lg"
                                autoFocus
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#002147] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#D4AF37] hover:text-[#002147] transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                        >
                            {loading ? (
                                <>
                                    <RefreshCw className="w-5 h-5 animate-spin" />
                                    Verifying…
                                </>
                            ) : (
                                <>
                                    <ShieldCheck className="w-5 h-5" />
                                    Verify Code
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

// =============================================================================
// DeleteConfirmationModal
// =============================================================================

function DeleteConfirmationModal({ staff, onClose, onConfirm }) {
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleConfirm = async () => {
        setError('');

        if (code.trim() !== ENROLLMENT_CODE) {
            setError('Invalid confirmation code.');
            return;
        }

        setLoading(true);
        try {
            await onConfirm(staff._id, code.trim());
            onClose();
        } catch (err) {
            setError(err?.message || 'Failed to delete staff member.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-2xl max-w-md w-full">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-[#002147]">Confirm Deletion</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-red-700 text-sm">
                        You are about to permanently delete{' '}
                        <span className="font-bold">{staff.name}</span> ({staff.email}).
                        This action cannot be undone.
                    </p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                        <p className="text-red-700 text-sm">{error}</p>
                    </div>
                )}

                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-bold text-[#002147] mb-2 block">
                            Enter confirmation code to proceed
                        </label>
                        <input
                            type="password"
                            value={code}
                            onChange={(e) => {
                                setCode(e.target.value);
                                setError('');
                            }}
                            placeholder="Enter code"
                            className="w-full bg-gray-50 border border-gray-200 p-4 rounded-xl focus:ring-2 focus:ring-[#002147] outline-none"
                            autoFocus
                        />
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-200 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleConfirm}
                            disabled={loading}
                            className="flex-1 bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                    Deleting…
                                </>
                            ) : (
                                <>
                                    <Trash2 className="w-4 h-4" />
                                    Delete Staff
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// =============================================================================
// StaffDashboard – create form + staff table
// =============================================================================

function StaffDashboard() {
    // ---- Queries & Mutations ----
    const staffUsers = useQuery(api.staff.listStaffUsers) || [];
    const createStaff = useAction(api.staff.createStaffUser);
    const deleteStaff = useMutation(api.staff.deleteStaffUser);
    const updateDesignation = useMutation(api.staff.updateDesignation);

    // ---- Local state ----
    const [form, setForm] = useState({ name: '', email: '', password: '', role: 'staff' });
    const [formErrors, setFormErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [toast, setToast] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null); // staff object to delete

    // ---- Toast auto-dismiss ----
    useEffect(() => {
        if (toast) {
            const t = setTimeout(() => setToast(null), 4000);
            return () => clearTimeout(t);
        }
    }, [toast]);

    const showToast = useCallback((message, type) => {
        setToast({ message, type, key: Date.now() });
    }, []);

    // ---- Form validation ----
    const validateForm = () => {
        const errors = {};
        if (!form.name.trim()) errors.name = 'Full name is required.';
        if (!form.email.trim()) {
            errors.email = 'Email is required.';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
            errors.email = 'Please enter a valid email address.';
        }
        if (!form.password) {
            errors.password = 'Password is required.';
        } else if (form.password.length < 6) {
            errors.password = 'Password must be at least 6 characters.';
        }
        if (!form.role || (form.role !== 'staff' && form.role !== 'admin')) {
            errors.role = 'Please select a valid designation.';
        }
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // ---- Handlers ----
    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        // Clear field error on change
        if (formErrors[name]) {
            setFormErrors((prev) => {
                const next = { ...prev };
                delete next[name];
                return next;
            });
        }
    };

    const handleCreateStaff = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setSubmitting(true);
        try {
            const result = await createStaff({
                name: form.name.trim(),
                email: form.email.trim(),
                password: form.password,
                role: form.role,
                enrollmentCode: ENROLLMENT_CODE,
            });
            showToast(`Staff account for ${result.name} created successfully!`, 'success');
            setForm({ name: '', email: '', password: '', role: 'staff' });
            setFormErrors({});
        } catch (err) {
            showToast(err?.message || 'Failed to create staff account.', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteStaff = async (staffId, code) => {
        await deleteStaff({ id: staffId, enrollmentCode: code });
        showToast('Staff member deleted successfully.', 'success');
    };

    const handlePromote = async (staff) => {
        try {
            await updateDesignation({ id: staff._id, role: 'admin' });
            showToast(`${staff.name} promoted to Admin.`, 'success');
        } catch (err) {
            showToast(err?.message || 'Failed to update designation.', 'error');
        }
    };

    const handleDemote = async (staff) => {
        try {
            await updateDesignation({ id: staff._id, role: 'staff' });
            showToast(`${staff.name} demoted to Staff.`, 'success');
        } catch (err) {
            showToast(err?.message || 'Failed to update designation.', 'error');
        }
    };

    // ---- Loading state ----
    if (staffUsers === undefined) {
        return (
            <div className="min-h-screen bg-gray-50 pt-24 pb-12 flex items-center justify-center">
                <div className="text-center">
                    <RefreshCw className="w-10 h-10 text-[#002147] animate-spin mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">Loading staff data…</p>
                </div>
            </div>
        );
    }

    // ---- Render ----
    return (
        <div className="min-h-screen bg-gray-50 pt-24 pb-12">
            {/* Toast */}
            {toast && (
                <Toast
                    key={toast.key}
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

            {/* Delete modal */}
            {deleteTarget && (
                <DeleteConfirmationModal
                    staff={deleteTarget}
                    onClose={() => setDeleteTarget(null)}
                    onConfirm={handleDeleteStaff}
                />
            )}

            <div className="max-w-6xl mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-[#002147] rounded-3xl mb-6">
                        <Users className="w-10 h-10 text-[#D4AF37]" />
                    </div>
                    <h1 className="text-4xl font-bold text-[#002147] mb-4">Staff Management Dashboard</h1>
                    <p className="text-xl text-gray-600">
                        Create, manage, and control staff access to the Top Notch Insurance Brokers admin portal
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    {/* ================================================================ */}
                    {/* LEFT – Create Staff Form                                          */}
                    {/* ================================================================ */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-2xl sticky top-28">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-12 h-12 bg-[#002147] rounded-2xl flex items-center justify-center">
                                    <UserPlus className="w-6 h-6 text-[#D4AF37]" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-[#002147]">Create Staff Account</h2>
                                    <p className="text-gray-500 text-sm">Add new staff members to the system</p>
                                </div>
                            </div>

                            <form onSubmit={handleCreateStaff} className="space-y-5">
                                {/* Name */}
                                <div>
                                    <label className="text-sm font-bold text-[#002147] mb-2 block">
                                        Full Name <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                        <input
                                            type="text"
                                            name="name"
                                            value={form.name}
                                            onChange={handleFormChange}
                                            placeholder="John Doe"
                                            className={`w-full bg-gray-50 border p-4 pl-12 rounded-xl focus:ring-2 focus:ring-[#002147] outline-none ${formErrors.name ? 'border-red-300' : 'border-gray-200'
                                                }`}
                                        />
                                    </div>
                                    {formErrors.name && (
                                        <p className="text-red-500 text-xs mt-1.5">{formErrors.name}</p>
                                    )}
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="text-sm font-bold text-[#002147] mb-2 block">
                                        Email Address <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                        <input
                                            type="email"
                                            name="email"
                                            value={form.email}
                                            onChange={handleFormChange}
                                            placeholder="john@topnotchib.com"
                                            className={`w-full bg-gray-50 border p-4 pl-12 rounded-xl focus:ring-2 focus:ring-[#002147] outline-none ${formErrors.email ? 'border-red-300' : 'border-gray-200'
                                                }`}
                                        />
                                    </div>
                                    {formErrors.email && (
                                        <p className="text-red-500 text-xs mt-1.5">{formErrors.email}</p>
                                    )}
                                </div>

                                {/* Password */}
                                <div>
                                    <label className="text-sm font-bold text-[#002147] mb-2 block">
                                        Password <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                        <input
                                            type="password"
                                            name="password"
                                            value={form.password}
                                            onChange={handleFormChange}
                                            placeholder="Minimum 6 characters"
                                            className={`w-full bg-gray-50 border p-4 pl-12 rounded-xl focus:ring-2 focus:ring-[#002147] outline-none ${formErrors.password ? 'border-red-300' : 'border-gray-200'
                                                }`}
                                        />
                                    </div>
                                    {formErrors.password && (
                                        <p className="text-red-500 text-xs mt-1.5">{formErrors.password}</p>
                                    )}
                                </div>

                                {/* Designation */}
                                <div>
                                    <label className="text-sm font-bold text-[#002147] mb-2 block">
                                        Designation <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="role"
                                        value={form.role}
                                        onChange={handleFormChange}
                                        className={`w-full bg-gray-50 border p-4 rounded-xl focus:ring-2 focus:ring-[#002147] outline-none ${formErrors.role ? 'border-red-300' : 'border-gray-200'
                                            }`}
                                    >
                                        <option value="staff">Staff</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                    {formErrors.role && (
                                        <p className="text-red-500 text-xs mt-1.5">{formErrors.role}</p>
                                    )}
                                </div>

                                {/* Submit */}
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full bg-[#002147] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#D4AF37] hover:text-[#002147] transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                                >
                                    {submitting ? (
                                        <>
                                            <RefreshCw className="w-5 h-5 animate-spin" />
                                            Creating Account…
                                        </>
                                    ) : (
                                        <>
                                            <UserPlus className="w-5 h-5" />
                                            Create Staff Account
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* ================================================================ */}
                    {/* RIGHT – Staff Table                                               */}
                    {/* ================================================================ */}
                    <div className="lg:col-span-3">
                        <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-2xl">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-[#002147] rounded-xl flex items-center justify-center">
                                        <Users className="w-5 h-5 text-[#D4AF37]" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-[#002147]">
                                        Current Staff Members
                                    </h2>
                                </div>
                                <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full font-medium">
                                    {staffUsers.length} total
                                </span>
                            </div>

                            {staffUsers.length === 0 ? (
                                <div className="text-center py-16">
                                    <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-500 text-lg">No staff members yet.</p>
                                    <p className="text-gray-400 text-sm">
                                        Use the form to create the first staff account.
                                    </p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-gray-200">
                                                <th className="text-left py-3 px-4 text-sm font-bold text-[#002147]">Name</th>
                                                <th className="text-left py-3 px-4 text-sm font-bold text-[#002147] hidden md:table-cell">
                                                    Email
                                                </th>
                                                <th className="text-left py-3 px-4 text-sm font-bold text-[#002147]">Designation</th>
                                                <th className="text-right py-3 px-4 text-sm font-bold text-[#002147]">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {staffUsers.map((staff) => (
                                                <tr
                                                    key={staff._id}
                                                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                                                >
                                                    {/* Name */}
                                                    <td className="py-4 px-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-9 h-9 bg-[#002147] rounded-lg flex items-center justify-center flex-shrink-0">
                                                                <User className="w-4 h-4 text-[#D4AF37]" />
                                                            </div>
                                                            <span className="font-bold text-[#002147] text-sm">{staff.name}</span>
                                                        </div>
                                                    </td>

                                                    {/* Email */}
                                                    <td className="py-4 px-4 hidden md:table-cell">
                                                        <span className="text-sm text-gray-600">{staff.email}</span>
                                                    </td>

                                                    {/* Designation badge */}
                                                    <td className="py-4 px-4">
                                                        <span
                                                            className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase ${staff.role === 'admin'
                                                                    ? 'bg-[#D4AF37]/20 text-[#002147]'
                                                                    : 'bg-gray-200 text-gray-600'
                                                                }`}
                                                        >
                                                            {staff.role}
                                                        </span>
                                                    </td>

                                                    {/* Actions */}
                                                    <td className="py-4 px-4">
                                                        <div className="flex items-center justify-end gap-1">
                                                            {/* Promote */}
                                                            {staff.role !== 'admin' && (
                                                                <button
                                                                    onClick={() => handlePromote(staff)}
                                                                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                                    title="Promote to Admin"
                                                                >
                                                                    <ArrowUpCircle className="w-4 h-4" />
                                                                </button>
                                                            )}

                                                            {/* Demote */}
                                                            {staff.role !== 'staff' && (
                                                                <button
                                                                    onClick={() => handleDemote(staff)}
                                                                    className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                                                                    title="Demote to Staff"
                                                                >
                                                                    <ArrowDownCircle className="w-4 h-4" />
                                                                </button>
                                                            )}

                                                            {/* Delete */}
                                                            <button
                                                                onClick={() => setDeleteTarget(staff)}
                                                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                                title="Delete staff member"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// =============================================================================
// Enroll – top-level page component
// =============================================================================

const Enroll = () => {
    const [verified, setVerified] = useState(() => {
        return sessionStorage.getItem(SESSION_KEY) === 'true';
    });

    const handleVerified = () => setVerified(true);

    if (!verified) {
        return <ProtectionGate onVerified={handleVerified} />;
    }

    return <StaffDashboard />;
};

export default Enroll;
