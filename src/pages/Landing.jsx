import React from 'react';
import { ShieldCheck, HeartPulse, Home, Car, ArrowRight } from 'lucide-react';

const Landing = () => {
    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="relative h-screen flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img
                        src="/hero-bg.png"
                        alt="Background"
                        className="w-full h-full object-cover scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-navy-900/80 to-navy-900/40" />
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-white hero-animate">
                    <div className="max-w-2xl">
                        <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6">
                            Security for Your <br />
                            <span className="text-gold">Future Self</span>
                        </h1>
                        <p className="text-xl md:text-2xl text-gray-200 mb-8 leading-relaxed">
                            Top Notch Insurance Brokers provides premium protection for what matters most. Experience integrity, excellence, and peace of mind.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <button className="bg-gold text-navy-900 px-8 py-4 rounded-full font-bold text-lg hover:bg-white transition-all shadow-xl flex items-center gap-2">
                                Explorer Plans <ArrowRight className="w-5 h-5" />
                            </button>
                            <button className="border-2 border-white text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white hover:text-navy-900 transition-all">
                                Our Story
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Services Section */}
            <section className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-navy-900 mb-4">Elite Protection Packages</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">Tailored coverage designed with your legacy in mind.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            { icon: ShieldCheck, title: 'Life Assurance', desc: 'Secure your family\'s legacy with comprehensive coverage.' },
                            { icon: HeartPulse, title: 'Health Elite', desc: 'World-class healthcare for you and your loved ones.' },
                            { icon: Home, title: 'Estate Shield', desc: 'Protect your property against the unexpected.' },
                            { icon: Car, title: 'Auto Premium', desc: 'Advanced protection for your terrestrial assets.' }
                        ].map((item, i) => (
                            <div key={i} className="p-8 rounded-2xl bg-gray-50 border border-gray-100 hover:shadow-2xl transition-all group cursor-pointer">
                                <item.icon className="w-12 h-12 text-gold mb-6 group-hover:scale-110 transition-transform" />
                                <h3 className="text-xl font-bold text-navy-900 mb-3">{item.title}</h3>
                                <p className="text-gray-600 mb-4">{item.desc}</p>
                                <div className="text-gold font-semibold flex items-center gap-2 group-hover:gap-3 transition-all">
                                    Learn More <ArrowRight className="w-4 h-4" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Landing;
