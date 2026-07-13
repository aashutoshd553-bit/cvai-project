import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2, User } from 'lucide-react';

const Contact = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name && email && message) {
      setSubmitted(true);
      setName('');
      setEmail('');
      setMessage('');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-16 bg-slate-50 min-h-[90vh]">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-black text-black uppercase tracking-tight">
          Contact Us
        </h1>
        <p className="text-slate-500 mt-3 max-w-xl mx-auto text-xs font-semibold uppercase tracking-wider">
          Have feedback or technical questions? Get in touch with our team.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 glass-panel p-8 rounded-none border border-slate-200">
        {/* Info panel */}
        <div className="md:col-span-5 space-y-6">
          <h2 className="text-xl font-bold text-black uppercase tracking-tight mb-4">Get In Touch</h2>
          
          <div className="flex gap-4 items-start">
            <User className="w-5 h-5 text-black shrink-0 mt-1" />
            <div>
              <h4 className="font-semibold text-slate-800 text-sm">Owner & Developer</h4>
              <p className="text-xs text-slate-600 mt-0.5 font-bold uppercase">AASHUTOSH DUBEY</p>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <Mail className="w-5 h-5 text-black shrink-0 mt-1" />
            <div>
              <h4 className="font-semibold text-slate-800 text-sm">Email Address</h4>
              <p className="text-xs text-slate-600 mt-0.5 font-bold">aashutoshdubey5533d@gmail.com</p>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <Phone className="w-5 h-5 text-black shrink-0 mt-1" />
            <div>
              <h4 className="font-semibold text-slate-800 text-sm">Phone Contact</h4>
              <p className="text-xs text-slate-600 mt-0.5">+91 98765 43210</p>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <MapPin className="w-5 h-5 text-black shrink-0 mt-1" />
            <div>
              <h4 className="font-semibold text-slate-800 text-sm">Campus Address</h4>
              <p className="text-xs text-slate-600 mt-0.5">Faculty of Engineering & Tech, Block 4, India</p>
            </div>
          </div>
        </div>

        {/* Message form */}
        <div className="md:col-span-7 border-t md:border-t-0 md:border-l border-slate-200 pt-8 md:pt-0 md:pl-8">
          {submitted ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-slate-50 border border-slate-200 rounded-none">
              <CheckCircle2 className="w-12 h-12 text-black mb-4 animate-bounce" />
              <h3 className="text-lg font-bold text-black mb-2 uppercase tracking-wider">Message Sent!</h3>
              <p className="text-xs text-slate-500">
                Thank you for your feedback. We will get back to you shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-slate-700 text-xs font-bold uppercase tracking-wider mb-1" htmlFor="contact-name">
                  Full Name
                </label>
                <input
                  id="contact-name"
                  type="text"
                  placeholder="Your Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full glass-input"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 text-xs font-bold uppercase tracking-wider mb-1" htmlFor="contact-email">
                  Email Address
                </label>
                <input
                  id="contact-email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full glass-input"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 text-xs font-bold uppercase tracking-wider mb-1" htmlFor="contact-message">
                  Message
                </label>
                <textarea
                  id="contact-message"
                  rows="4"
                  placeholder="Your suggestions or feedback..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full glass-input"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 bg-black hover:bg-slate-900 text-white font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-2 transition-all duration-150"
              >
                <Send className="w-4 h-4" />
                <span>Send Message</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Contact;
