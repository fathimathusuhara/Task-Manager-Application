import React from 'react';
import { Link } from 'react-router-dom';
import { CheckSquare, Users, ShieldCheck, Zap } from 'lucide-react';

const Landing = () => {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-color)', overflow: 'hidden' }}>
      {/* Navbar - Transparent & Sleek */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 4rem', backgroundColor: 'rgba(255, 255, 255, 0.02)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', position: 'fixed', top: 0, width: '100%', zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))', borderRadius: 'var(--radius-md)', padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)' }}>
            <CheckSquare color="white" size={24} />
          </div>
          <span className="text-2xl font-bold text-white">TeamTask</span>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link to="/login" className="btn btn-secondary" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)', color: 'white' }}>Sign In</Link>
          <Link to="/register" className="btn btn-primary">Get Started</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main style={{ paddingTop: '100px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '8rem 2rem 4rem' }}>
        <div className="badge badge-progress mb-6 animate-fade-in" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
          ✨ Introducing TeamTask v2.0
        </div>
        <h1 className="animate-fade-in" style={{ fontSize: '5rem', fontWeight: 900, maxWidth: '900px', lineHeight: 1, marginBottom: '2rem', color: 'white', letterSpacing: '-0.04em' }}>
          Manage your team's work, <span style={{ background: 'linear-gradient(135deg, #60a5fa, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>beautifully.</span>
        </h1>
        <p className="text-xl animate-fade-in" style={{ maxWidth: '650px', marginBottom: '3.5rem', animationDelay: '0.1s', color: 'rgba(255, 255, 255, 0.9)', lineHeight: 1.6 }}>
          The premium, secure, and blazing-fast way to track projects, assign tasks, and collaborate in real-time.
        </p>
        <div className="animate-fade-in" style={{ display: 'flex', gap: '1.5rem', animationDelay: '0.2s' }}>
          <Link to="/register" className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.125rem' }}>Start for Free</Link>
          <Link to="/login" className="btn btn-secondary" style={{ padding: '1rem 2rem', fontSize: '1.125rem' }}>Login to Workspace</Link>
        </div>

        {/* Feature Grid */}
        <div className="grid-cards animate-fade-in" style={{ marginTop: '6rem', maxWidth: '1000px', width: '100%', textAlign: 'left', animationDelay: '0.3s' }}>
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '1rem', borderRadius: 'var(--radius-lg)', display: 'inline-block', marginBottom: '1rem' }}>
              <Zap color="var(--primary-color)" size={32} />
            </div>
            <h3 className="text-xl font-bold mb-2">Lightning Fast</h3>
            <p className="text-muted">Built on React and FastAPI for an incredibly smooth and responsive experience without reloads.</p>
          </div>
          
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <div style={{ background: 'rgba(236, 72, 153, 0.1)', padding: '1rem', borderRadius: 'var(--radius-lg)', display: 'inline-block', marginBottom: '1rem' }}>
              <Users color="var(--secondary-color)" size={32} />
            </div>
            <h3 className="text-xl font-bold mb-2">Team Collaboration</h3>
            <p className="text-muted">Interactive drag-and-drop task boards and rich task comments to keep everyone aligned.</p>
          </div>

          <div className="glass-panel" style={{ padding: '2rem' }}>
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '1rem', borderRadius: 'var(--radius-lg)', display: 'inline-block', marginBottom: '1rem' }}>
              <ShieldCheck color="var(--success)" size={32} />
            </div>
            <h3 className="text-xl font-bold mb-2">Secure by Design</h3>
            <p className="text-muted">Enterprise-grade Role-Based Access Control (RBAC) ensuring your data is safe and restricted.</p>
          </div>
        </div>
      </main>
      
      <div style={{ position: 'absolute', top: '-20%', left: '-10%', width: '50%', height: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, rgba(15,23,42,0) 70%)', zIndex: -1 }}></div>
      <div style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '50%', height: '50%', background: 'radial-gradient(circle, rgba(236,72,153,0.1) 0%, rgba(15,23,42,0) 70%)', zIndex: -1 }}></div>
    </div>
  );
};

export default Landing;
