import React, { useState } from 'react';
import { Shield, Users, Target, Phone, Mail } from 'lucide-react';
import DewanImage from '../assets/Dewan.png';
import RajputImage from '../assets/Rajput.png';
import SharmaImage from '../assets/kunal.jpg';
import SrivastavaImage from '../assets/sarthak.png';

export default function AboutPage() {
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    preferredContact: 'email',
    consent: false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form submitted:', contactForm);
    // Reset form
    setContactForm({
      name: '',
      email: '',
      phone: '',
      message: '',
      preferredContact: 'email',
      consent: false
    });
  };

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Mission Section */}
      <section className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-6">About CourseWise</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          We're on a mission to make academic planning simpler and smarter for students worldwide.
          Our platform combines cutting-edge technology with educational expertise to help you make
          the best decisions for your academic journey.
        </p>
      </section>

      {/* Values Section - Updated with working hover animations */}
      <section className="grid md:grid-cols-3 gap-8 mb-16">
        {[
          {
            icon: Target,
            title: 'Our Mission',
            description: 'To empower students with intelligent tools for making informed academic decisions.'
          },
          {
            icon: Shield,
            title: 'Our Vision',
            description: 'To become the leading platform for academic guidance and course planning globally.'
          },
          {
            icon: Users,
            title: 'Our Community',
            description: 'Building a supportive network of students, educators, and academic advisors.'
          }
        ].map((item, index) => {
          const Icon = item.icon;
          return (
            <div 
              key={index} 
              className="group relative bg-white p-6 rounded-lg shadow-md cursor-pointer 
                         transform transition-all duration-300 ease-in-out
                         hover:-translate-y-2 hover:shadow-xl"
            >
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 
                            opacity-0 group-hover:opacity-100 transition-opacity duration-300 
                            rounded-lg"
              />
              
              {/* Content */}
              <div className="relative z-10">
                <div className="flex items-center justify-center w-12 h-12 mb-4 rounded-full 
                              bg-indigo-100 text-indigo-600 group-hover:bg-white/20 
                              group-hover:text-white transition-all duration-300 mx-auto">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-center 
                             group-hover:text-white transition-colors">
                  {item.title}
                </h3>
                <p className="text-gray-600 text-center group-hover:text-white/90 
                            transition-colors">
                  {item.description}
                </p>
              </div>
            </div>
          );
        })}
      </section>

      {/* Team Section - Adjusted for compact default state */}
      <section className="bg-gray-50 rounded-2xl p-8 mb-16">
        <h2 className="text-3xl font-bold text-center mb-8">Our Team</h2>
        <div className="grid md:grid-cols-4 gap-8">
          {[
            {
              name: 'Dhruv Rajput',
              role: 'Project Manager',
              image: RajputImage,
              bio: 'Experienced project manager with a passion for educational technology. Leading the team towards innovative solutions in academic planning.'
            },
            {
              name: 'Kunal Sharma',
              role: 'Lead Developer',
              image: SharmaImage,
              bio: 'Full-stack developer with expertise in React and Node.js. Dedicated to building scalable and user-friendly applications.'
            },
            {
              name: 'Sarthak Srivastav',
              role: 'UX Designer',
              image: SrivastavaImage,
              bio: 'Creative designer focused on crafting intuitive and engaging user experiences. Passionate about making education more accessible.'
            },
            {
              name: 'Dhruv Dewan',
              role: 'Data Scientist',
              image: DewanImage,
              bio: 'AI/ML specialist working on intelligent course recommendation systems. Committed to data-driven decision making in education.'
            }
          ].map((member, index) => (
            <div 
              key={index} 
              className="group relative bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 h-[280px] hover:h-[350px]"
            >
              {/* Normal View */}
              <div className="p-4 text-center">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-24 h-24 rounded-full mx-auto mb-3 object-cover group-hover:w-32 group-hover:h-32 transition-all duration-300"
                />
                <h3 className="font-semibold text-lg mb-1">{member.name}</h3>
                <p className="text-gray-600">{member.role}</p>
              </div>

              {/* Expanded Bio */}
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg p-6 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-center">
                <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-24 h-24 rounded-full mx-auto mb-3 object-cover border-2 border-white"
                  />
                  <h3 className="text-white font-bold text-lg mb-2">{member.name}</h3>
                  <p className="text-purple-100 text-base mb-3">{member.role}</p>
                  <p className="text-white/90 text-sm leading-relaxed">{member.bio}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Enhanced Contact Section */}
      <section className="bg-white rounded-2xl shadow-lg p-8 mb-16 max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-8">Get in Touch</h2>
        <p className="text-gray-600 text-center mb-8">
          We value your feedback and suggestions. Let us know how we can improve your experience.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
              <input
                type="text"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                value={contactForm.name}
                onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                value={contactForm.email}
                onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone (Optional)</label>
            <input
              type="tel"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              value={contactForm.phone}
              onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
            <textarea
              required
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              value={contactForm.message}
              onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Contact Method</label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="contactMethod"
                  value="email"
                  checked={contactForm.preferredContact === 'email'}
                  onChange={(e) => setContactForm({ ...contactForm, preferredContact: e.target.value })}
                  className="mr-2"
                />
                <Mail className="w-4 h-4 mr-1" />
                Email
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="contactMethod"
                  value="phone"
                  checked={contactForm.preferredContact === 'phone'}
                  onChange={(e) => setContactForm({ ...contactForm, preferredContact: e.target.value })}
                  className="mr-2"
                />
                <Phone className="w-4 h-4 mr-1" />
                Phone
              </label>
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              required
              checked={contactForm.consent}
              onChange={(e) => setContactForm({ ...contactForm, consent: e.target.checked })}
              className="mr-2"
            />
            <label className="text-sm text-gray-600">
              I consent to being contacted regarding my feedback/inquiry
            </label>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white py-3 px-6 rounded-lg
                     hover:from-indigo-600 hover:to-purple-600 transform hover:-translate-y-0.5 
                     transition-all duration-300 hover:shadow-lg font-medium"
          >
            Send Message
          </button>
        </form>
      </section>
    </div>
  );
}