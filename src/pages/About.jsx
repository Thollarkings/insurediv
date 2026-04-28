import React from 'react';
import { Link } from 'react-router-dom';
import { Target, Eye, Award, Users, TrendingUp, Globe, CheckCircle, ArrowRight } from 'lucide-react';

const stats = [
    { value: '15+', label: 'Years of Excellence' },
    { value: '50k+', label: 'Clients Protected' },
    { value: '98%', label: 'Claims Satisfaction' },
    { value: '120+', label: 'Expert Advisors' },
];

const values = [
    {
        icon: Target,
        title: 'Precision Protection',
        desc: 'We don\'t believe in one-size-fits-all. Every policy is a bespoke shield crafted around your unique life, assets, and aspirations.',
    },
    {
        icon: Eye,
        title: 'Visionary Support',
        desc: 'Anticipating life\'s challenges before they arise, our forward-thinking advisors ensure you stay always protected.',
    },
    {
        icon: Award,
        title: 'Integrity First',
        desc: 'Our word is our bond. We stand fully by our clients when it matters most — without compromise, without delay.',
    },
    {
        icon: Users,
        title: 'Client-Centred',
        desc: 'You are not a policy number. Every interaction is personal, every solution human, and every relationship lasting.',
    },
    {
        icon: TrendingUp,
        title: 'Growth-Oriented',
        desc: 'As you grow, your coverage grows with you. We adapt your protection strategy to match your evolving life.',
    },
    {
        icon: Globe,
        title: 'Global Reach',
        desc: 'Our network spans continents, giving you world-class protection no matter where life takes you.',
    },
];

const team = [
    { name: 'Mr Akinola', role: 'Chief Executive Officer', initials: 'AA' },
    { name: 'Mr Xxx Ooo', role: 'Chief Risk Officer', initials: 'XO' },
    { name: 'Mr Emmanuel', role: 'Head of Client Relations', initials: 'EA' },
    { name: 'Other Names', role: 'Director of Operations', initials: 'ON' },
];

const About = () => {
    return (
        <div className="min-h-screen">

            {/* Hero with background image */}
            <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img
                        src="/about-bg.png"
                        alt="Top Notch Insurance Brokers Executive Boardroom"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-linear-to-r from-navy-900/85 via-navy-900/60 to-transparent" />
                </div>
                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-white">
                    <div className="max-w-2xl">
                        <p className="text-gold font-semibold tracking-widest uppercase text-sm mb-4">Our Story</p>
                        <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6">
                            Built on <span className="text-gold">Trust.</span><br />Driven by Purpose.
                        </h1>
                        <p className="text-xl text-gray-200 leading-relaxed">
                            Top Notch Insurance Brokers was born from a simple conviction: that everyone deserves world-class protection, delivered with dignity and care.
                        </p>
                    </div>
                </div>
            </section>

            {/* Stats Bar */}
            <section className="bg-navy-900 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        {stats.map(({ value, label }) => (
                            <div key={label}>
                                <p className="text-4xl font-bold text-gold mb-1">{value}</p>
                                <p className="text-gray-300 text-sm uppercase tracking-widest">{label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Mission Section */}
            <section className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <p className="text-gold font-semibold tracking-widest uppercase text-sm mb-3">Our Mission</p>
                            <h2 className="text-4xl md:text-5xl font-bold text-navy-900 mb-6 leading-tight">
                                A Legacy of Excellence, Redefined
                            </h2>
                            <p className="text-gray-600 text-lg leading-relaxed mb-6">
                                Founded on the principles of trust and security, Top Notch Insurance Brokers has grown from a visionary concept into a beacon of excellence in the insurance sector. We are redefining how protection is delivered in the digital age — blending cutting-edge technology with deeply human service.
                            </p>
                            <p className="text-gray-600 text-lg leading-relaxed mb-8">
                                From humble beginnings to a national footprint, every step of our journey has been guided by one north star: the well-being of our clients. We don't just sell policies. We build lifelong partnerships rooted in genuine care.
                            </p>
                            <div className="space-y-3">
                                {['Regulated & fully licensed by industry standards', 'Award-winning claims resolution team', 'Dedicated relationship managers for every client', '24/7 global emergency support hotline'].map(item => (
                                    <div key={item} className="flex items-center gap-3">
                                        <CheckCircle className="w-5 h-5 text-gold shrink-0" />
                                        <span className="text-gray-700">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="relative">
                            <div className="bg-navy-900 rounded-3xl p-10 text-white">
                                <blockquote className="text-2xl font-light italic leading-relaxed text-gray-200 mb-8">
                                    "To provide top-notch protection through innovation, integrity, and absolute commitment to our clients' future — today and for generations to come."
                                </blockquote>
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-full bg-gold flex items-center justify-center font-bold text-navy-900 text-lg">MO</div>
                                    <div>
                                        <p className="font-bold text-white">Mr Ojo</p>
                                        <p className="text-gray-400 text-sm">Founder & CEO, Top Notch Insurance Brokers</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Core Values */}
            <section className="py-24 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <p className="text-gold font-semibold tracking-widest uppercase text-sm mb-3">What We Stand For</p>
                        <h2 className="text-4xl font-bold text-navy-900">Our Core Values</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {values.map(({ icon: Icon, title, desc }) => (
                            <div key={title} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all group">
                                <div className="bg-navy-900/5 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-navy-900 transition-colors">
                                    <Icon className="w-7 h-7 text-gold" />
                                </div>
                                <h3 className="text-xl font-bold text-navy-900 mb-3">{title}</h3>
                                <p className="text-gray-600 leading-relaxed">{desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Leadership Team */}
            <section className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <p className="text-gold font-semibold tracking-widest uppercase text-sm mb-3">The People Behind It</p>
                        <h2 className="text-4xl font-bold text-navy-900">Meet Our Leadership</h2>
                        <p className="text-gray-500 mt-4 max-w-xl mx-auto">World-class professionals united by a shared commitment to your security and peace of mind.</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {team.map(({ name, role, initials }) => (
                            <div key={name} className="text-center group">
                                <div className="w-24 h-24 rounded-full bg-navy-900 flex items-center justify-center font-bold text-2xl text-gold mx-auto mb-4 group-hover:bg-gold group-hover:text-navy-900 transition-colors">
                                    {initials}
                                </div>
                                <h4 className="font-bold text-navy-900 text-lg">{name}</h4>
                                <p className="text-gray-500 text-sm mt-1">{role}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 bg-navy-900 text-white text-center">
                <div className="max-w-3xl mx-auto px-4">
                    <h2 className="text-4xl font-bold mb-4">Ready to Experience Top Notch Protection?</h2>
                    <p className="text-gray-300 text-lg mb-8">Let one of our expert advisors design a bespoke plan tailored to your life and legacy.</p>
                    <Link
                        to="/contact"
                        className="inline-flex items-center gap-3 bg-gold text-navy-900 px-10 py-4 rounded-full font-bold text-lg hover:bg-white transition-all shadow-xl"
                    >
                        Get a Quote <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </section>

        </div>
    );
};

export default About;
