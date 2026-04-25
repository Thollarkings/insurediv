import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle } from 'lucide-react';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';

const Contact = () => {
    const [form, setForm] = useState({ name: '', email: '', plan: 'Life Assurance', message: '' });
    const [submitted, setSubmitted] = useState(false);
    const addInquiry = useMutation(api.inquiries.addInquiry);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        await addInquiry(form);
        setSubmitted(true);
    };

    return (
        <div className="pt-24 min-h-screen bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
                    <div>
                        <h1 className="text-4xl md:text-6xl font-bold text-[#002147] mb-8">
                            Get In <span className="text-[#D4AF37]">Touch</span>
                        </h1>
                        <p className="text-xl text-gray-600 mb-12">
                            Ready to secure your future? Our elite advisors are standing by to create your bespoke protection plan.
                        </p>

                        <div className="space-y-8">
                            {[
                                { icon: Mail, label: 'Email Us', value: 'concierge@divineinsure.com' },
                                { icon: Phone, label: 'Call Us', value: '+1 (800) DIVINE-01' },
                                { icon: MapPin, label: 'Visit Us', value: 'Dangote Building, Tipper Garage, New Garage Ibadan' },
                            ].map(({ icon: Icon, label, value }) => (
                                <div key={label} className="flex items-center gap-6">
                                    <div className="bg-[#002147] p-4 rounded-2xl">
                                        <Icon className="text-[#D4AF37] w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest">{label}</h4>
                                        <p className="text-xl font-bold text-[#002147]">{value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white/70 backdrop-blur p-10 rounded-3xl border border-gray-100 shadow-2xl">
                        {submitted ? (
                            <div className="flex flex-col items-center justify-center h-full text-center py-20 space-y-4">
                                <CheckCircle className="w-20 h-20 text-[#D4AF37]" />
                                <h3 className="text-2xl font-bold text-[#002147]">Message Received!</h3>
                                <p className="text-gray-500">A Divine Insure advisor will be in touch shortly.</p>
                                <button onClick={() => setSubmitted(false)} className="mt-4 text-sm text-[#002147] underline">Send another message</button>
                            </div>
                        ) : (
                            <form className="space-y-6" onSubmit={handleSubmit}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-[#002147] ml-1">Full Name</label>
                                        <input name="name" type="text" value={form.name} onChange={handleChange} required className="w-full bg-gray-50 border border-gray-100 p-4 rounded-xl focus:ring-2 focus:ring-[#D4AF37] outline-none" placeholder="John Doe" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-[#002147] ml-1">Email Address</label>
                                        <input name="email" type="email" value={form.email} onChange={handleChange} required className="w-full bg-gray-50 border border-gray-100 p-4 rounded-xl focus:ring-2 focus:ring-[#D4AF37] outline-none" placeholder="john@example.com" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-[#002147] ml-1">Plan of Interest</label>
                                    <select name="plan" value={form.plan} onChange={handleChange} className="w-full bg-gray-50 border border-gray-100 p-4 rounded-xl focus:ring-2 focus:ring-[#D4AF37] outline-none">
                                        <option>Life Assurance</option>
                                        <option>Health Elite</option>
                                        <option>Estate Shield</option>
                                        <option>Auto Premium</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-[#002147] ml-1">Your Message</label>
                                    <textarea name="message" rows="5" value={form.message} onChange={handleChange} required className="w-full bg-gray-50 border border-gray-100 p-4 rounded-xl focus:ring-2 focus:ring-[#D4AF37] outline-none" placeholder="Tell us about your needs..."></textarea>
                                </div>
                                <button type="submit" className="w-full bg-[#002147] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#D4AF37] hover:text-[#002147] transition-all flex items-center justify-center gap-3">
                                    Send Message <Send className="w-5 h-5" />
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;
