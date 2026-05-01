import React, { useEffect, useState, useContext } from 'react';
import api from '../api';
import { AuthContext } from '../context/AuthContext';
import { CheckCircle2, Clock, ListTodo } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tasksRes, invRes] = await Promise.all([
          api.get('/tasks/'),
          api.get('/projects/invitations/me')
        ]);
        setTasks(tasksRes.data);
        setInvitations(invRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleInvitation = async (invId, action) => {
    try {
      await api.post(`/projects/invitations/${invId}/${action}`);
      setInvitations(invitations.filter(i => i.id !== invId));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div>Loading dashboard...</div>;

  const filteredTasks = tasks.filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()) || (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase())));

  const todoTasks = filteredTasks.filter(t => t.status === 'To Do');
  const inProgressTasks = filteredTasks.filter(t => t.status === 'In Progress');
  const doneTasks = filteredTasks.filter(t => t.status === 'Done');

  const now = new Date();
  const overdueTasks = filteredTasks.filter(t => t.status !== 'Done' && t.deadline && new Date(t.deadline) < now);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Welcome Banner - Cyberpunk Dark Blue */}
      <div style={{ 
        background: 'linear-gradient(135deg, #1e3a8a 0%, #312e81 50%, #4338ca 100%)',
        borderRadius: 'var(--radius-lg)',
        padding: '3rem',
        marginBottom: '3rem',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid rgba(255, 255, 255, 0.05)'
      }}>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1 className="text-4xl font-bold mb-3 text-white" style={{ letterSpacing: '-0.03em' }}>Welcome back, {user?.username}! 👋</h1>
          <p className="text-white" style={{ opacity: 0.95, fontSize: '1.25rem', fontWeight: '500' }}>You have {todoTasks.length + inProgressTasks.length} active tasks across your projects.</p>
        </div>
        <div style={{ position: 'absolute', right: '-2%', top: '-20%', opacity: 0.15, transform: 'rotate(15deg)' }}>
          <CheckCircle2 size={320} color="white" />
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <h2 className="text-3xl font-bold text-white">Overview</h2>
        <div className="input-group" style={{ marginBottom: 0 }}>
          <input 
            type="text" 
            className="input-field" 
            placeholder="Search all tasks..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ width: '350px', background: 'rgba(30, 41, 59, 0.7)', border: '1px solid rgba(255, 255, 255, 0.1)', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}
          />
        </div>
      </div>

      {/* Invitations Banner */}
      {invitations.length > 0 && (
        <div className="mb-8" style={{ border: '1px solid var(--primary-color)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', backgroundColor: 'rgba(99, 102, 241, 0.1)' }}>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><CheckCircle2 size={20} color="var(--primary-color)"/> Pending Project Invitations</h2>
          <div className="flex flex-col gap-3">
            {invitations.map(inv => (
              <div key={inv.id} className="glass-panel flex justify-between items-center" style={{ padding: '1rem', backgroundColor: 'var(--bg-panel)' }}>
                <div>
                  <span className="font-bold">{inv.project?.name || `Project #${inv.project_id}`}</span> invited you to collaborate.
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleInvitation(inv.id, 'accept')} className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>Accept</button>
                  <button onClick={() => handleInvitation(inv.id, 'decline')} className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>Decline</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid-cards mb-8" style={{ gap: '2rem' }}>
        <div className="glass-panel" style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem', borderTop: '4px solid var(--text-muted)' }}>
          <div style={{ padding: '1.25rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: 'var(--radius-lg)' }}>
            <ListTodo size={36} color="var(--text-muted)" />
          </div>
          <div>
            <div className="text-4xl font-bold mb-1">{todoTasks.length}</div>
            <div className="text-muted font-bold text-sm tracking-wider uppercase">To Do</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem', borderTop: '4px solid var(--primary-color)' }}>
          <div style={{ padding: '1.25rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: 'var(--radius-lg)' }}>
            <Clock size={36} color="var(--primary-color)" />
          </div>
          <div>
            <div className="text-4xl font-bold mb-1">{inProgressTasks.length}</div>
            <div className="text-muted font-bold text-sm tracking-wider uppercase">In Progress</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem', borderTop: '4px solid var(--success)' }}>
          <div style={{ padding: '1.25rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: 'var(--radius-lg)' }}>
            <CheckCircle2 size={36} color="var(--success)" />
          </div>
          <div>
            <div className="text-4xl font-bold mb-1">{doneTasks.length}</div>
            <div className="text-muted font-bold text-sm tracking-wider uppercase">Completed</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
        
        {/* Overdue Tasks */}
        {overdueTasks.length > 0 && (
          <div>
            <h2 className="text-xl mb-4 font-bold flex items-center gap-2" style={{ color: 'var(--danger)' }}>
              <Clock size={20} /> Overdue Tasks
            </h2>
            <div className="flex flex-col gap-4">
              {overdueTasks.map(task => (
                <Link to={`/projects/${task.project_id}`} key={task.id} className="glass-panel hover-glow" style={{ padding: '1.5rem', borderLeft: '4px solid var(--danger)', display: 'block', transition: 'all 0.2s' }}>
                  <h3 className="font-bold mb-2">{task.title}</h3>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="badge badge-todo">{task.status}</span>
                    <span className="text-sm font-bold" style={{ color: 'var(--danger)' }}>Due: {new Date(task.deadline).toLocaleDateString()}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Recent Tasks */}
        <div>
          <h2 className="text-2xl mb-6 font-bold flex items-center gap-3 text-white">
            <ListTodo size={24} /> Your Recent Tasks
          </h2>
          {filteredTasks.length === 0 ? (
            <div className="glass-panel text-center" style={{ padding: '3rem' }}>
              <p className="text-muted">No tasks found matching your criteria.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {filteredTasks.slice(0, 6).map(task => (
                <Link to={`/projects/${task.project_id}`} key={task.id} className="glass-panel hover-glow" style={{ padding: '1.5rem', display: 'block', borderLeft: `4px solid ${task.status === 'Done' ? 'var(--success)' : task.status === 'In Progress' ? 'var(--primary-color)' : 'var(--text-muted)'}`, transition: 'all 0.2s' }}>
                  <h3 className="font-bold mb-2">{task.title}</h3>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className={`badge badge-${task.status === 'To Do' ? 'todo' : task.status === 'In Progress' ? 'progress' : 'done'}`}>
                      {task.status}
                    </span>
                    {task.deadline && (
                      <span className="text-sm text-muted">Due: {new Date(task.deadline).toLocaleDateString()}</span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
