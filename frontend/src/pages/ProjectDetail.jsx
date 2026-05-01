import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { AuthContext } from '../context/AuthContext';
import { Plus, UserPlus, MessageSquare, Clock, Trash2, X, Activity, Settings } from 'lucide-react';
import { DndContext, useDraggable, useDroppable, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';

// --- DnD Components ---
const DraggableTask = ({ task, onClick, isAdmin, onDelete, getRiskColor }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `task-${task.id}`,
    data: task
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: 10,
    opacity: isDragging ? 0.5 : 1,
  } : undefined;

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...listeners} 
      className="glass-panel"
      style={{ ...style, padding: '1rem', cursor: 'grab', marginBottom: '1rem', backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-color)' }}
    >
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-bold">{task.title}</h4>
        {isAdmin && (
          <button 
            onPointerDown={(e) => { e.stopPropagation(); onDelete(task.id); }}
            style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '0.25rem' }}
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
      <p className="text-sm text-muted mb-4" style={{ pointerEvents: 'none' }}>{task.description}</p>
      
      <div className="flex justify-between items-center mt-4">
        <div className="flex items-center gap-3 text-xs text-muted">
           <span className="flex items-center gap-1"><MessageSquare size={14} /> {task.comments?.length || 0}</span>
           {task.risk !== undefined && (
             <span style={{ color: getRiskColor(task.risk), display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 'bold' }}>
               <Activity size={14} /> {Math.round(task.risk * 100)}% Risk
             </span>
           )}
        </div>
        <button 
          onPointerDown={(e) => { e.stopPropagation(); onClick(task); }} 
          className="btn btn-secondary" 
          style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
        >
          View
        </button>
      </div>
    </div>
  );
};

const DroppableColumn = ({ status, tasks, onTaskClick, isAdmin, onDelete, getRiskColor }) => {
  const { isOver, setNodeRef } = useDroppable({
    id: `col-${status}`,
    data: { status }
  });

  const style = {
    padding: '1rem', 
    minHeight: '600px', 
    backgroundColor: isOver ? 'rgba(99, 102, 241, 0.1)' : 'rgba(15, 23, 42, 0.3)',
    border: isOver ? '1px dashed var(--primary-color)' : '1px solid transparent',
    transition: 'all 0.2s ease',
    borderRadius: 'var(--radius-md)'
  };

  return (
    <div ref={setNodeRef} className="glass-panel" style={style}>
      <h3 className="font-bold mb-4 flex items-center justify-between">
        {status}
        <span className="badge" style={{ backgroundColor: 'var(--bg-panel)' }}>
          {tasks.length}
        </span>
      </h3>
      <div className="flex flex-col">
        {tasks.map(task => (
          <DraggableTask key={task.id} task={task} onClick={onTaskClick} isAdmin={isAdmin} onDelete={onDelete} getRiskColor={getRiskColor} />
        ))}
        {tasks.length === 0 && (
           <div className="text-center text-muted text-sm" style={{ padding: '2rem 0' }}>Drop tasks here</div>
        )}
      </div>
    </div>
  );
};

// --- Main Component ---
const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showEditProjectModal, setShowEditProjectModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  
  const [newTask, setNewTask] = useState({ title: '', description: '', status: 'To Do', deadline: '', assignee_id: '' });
  const [editProjectData, setEditProjectData] = useState({ name: '', description: '' });
  const [memberIdToAdd, setMemberIdToAdd] = useState('');
  const [commentText, setCommentText] = useState('');

  // DnD Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 }, // Allows clicking without starting drag
    })
  );

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [projRes, tasksRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/tasks/?project_id=${id}`)
      ]);
      setProject(projRes.data);
      setEditProjectData({ name: projRes.data.name, description: projRes.data.description });
      
      // Fetch ML Risk Predictions for each task
      const tasksWithRisk = await Promise.all(
        tasksRes.data.map(async (t) => {
          if (t.status !== 'Done') {
            try {
              const riskRes = await api.get(`/tasks/${t.id}/predict-delay`);
              return { ...t, risk: riskRes.data.probability_of_delay };
            } catch {
              return t;
            }
          }
          return t;
        })
      );
      setTasks(tasksWithRisk);
      
      if (user?.role === 'admin') {
        const usersRes = await api.get('/users/');
        setUsers(usersRes.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (prob) => {
    if (prob > 0.7) return 'var(--danger)';
    if (prob > 0.4) return 'var(--warning, #f59e0b)';
    return 'var(--success)';
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over) return;

    const taskId = active.data.current.id;
    const newStatus = over.data.current.status;
    const currentStatus = active.data.current.status;

    if (currentStatus !== newStatus) {
      // Optimistic update
      setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
      try {
        await api.put(`/tasks/${taskId}`, { status: newStatus });
      } catch (err) {
        console.error(err);
        fetchData(); // Revert on error
      }
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await api.post('/tasks/', { ...newTask, project_id: parseInt(id), assignee_id: newTask.assignee_id ? parseInt(newTask.assignee_id) : null });
      setShowTaskModal(false);
      setNewTask({ title: '', description: '', status: 'To Do', deadline: '', assignee_id: '' });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!memberIdToAdd) return;
    try {
      await api.post(`/projects/${id}/members/${memberIdToAdd}`);
      setShowMemberModal(false);
      setMemberIdToAdd('');
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await api.delete(`/tasks/${taskId}`);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || !selectedTask) return;
    try {
      await api.post(`/tasks/${selectedTask.id}/comments`, { text: commentText });
      setCommentText('');
      // Refresh just the task to get new comments
      const res = await api.get(`/tasks/${selectedTask.id}`);
      setSelectedTask(res.data);
      fetchData(); // refresh list to update comment count
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateProject = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/projects/${id}`, editProjectData);
      setShowEditProjectModal(false);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteProject = async () => {
    if (window.confirm("Are you sure you want to completely delete this project and all its tasks? This action cannot be undone.")) {
      try {
        await api.delete(`/projects/${id}`);
        navigate('/projects');
      } catch (err) {
        console.error(err);
      }
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!project) return <div>Project not found</div>;

  const statuses = ['To Do', 'In Progress', 'Done'];
  const isAdmin = user?.role === 'admin';

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 className="text-3xl mb-2 flex items-center gap-3">
            {project.name}
            {isAdmin && (
               <button onClick={() => setShowEditProjectModal(true)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }} className="hover:text-white">
                 <Settings size={20} />
               </button>
            )}
          </h1>
          <p className="text-muted">{project.description}</p>
        </div>
        {isAdmin && (
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="btn btn-secondary" onClick={() => setShowMemberModal(true)}>
              <UserPlus size={18} /> Add Member
            </button>
            <button className="btn btn-primary hover-glow" onClick={() => setShowTaskModal(true)}>
              <Plus size={18} /> Add Task
            </button>
          </div>
        )}
      </div>

      {/* Members Section */}
      <div className="mb-8 flex items-center gap-4">
        <span className="text-sm font-bold text-muted">TEAM MEMBERS:</span>
        <div className="flex gap-2">
          {project.members.map(m => (
            <div key={m.id} className="badge" style={{ backgroundColor: 'var(--bg-elevated)', color: 'var(--text-main)', border: '1px solid var(--border-color)' }}>
              {m.username}
            </div>
          ))}
        </div>
      </div>

      {/* Kanban Board with DnD */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', overflowX: 'auto', paddingBottom: '1rem' }}>
          {statuses.map(status => (
            <DroppableColumn 
              key={status} 
              status={status} 
              tasks={tasks.filter(t => t.status === status)} 
              onTaskClick={(task) => setSelectedTask(task)}
              isAdmin={isAdmin}
              onDelete={handleDeleteTask}
              getRiskColor={getRiskColor}
            />
          ))}
        </div>
      </DndContext>

      {/* Create Task Modal */}
      {showTaskModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '500px', padding: '2rem' }}>
            <h2 className="text-2xl mb-4">Create New Task</h2>
            <form onSubmit={handleCreateTask}>
              <div className="input-group">
                <label className="input-label">Title</label>
                <input type="text" className="input-field" value={newTask.title} onChange={(e) => setNewTask({...newTask, title: e.target.value})} required />
              </div>
              <div className="input-group">
                <label className="input-label">Description</label>
                <textarea className="input-field" rows="3" value={newTask.description} onChange={(e) => setNewTask({...newTask, description: e.target.value})}></textarea>
              </div>
              <div className="input-group">
                <label className="input-label">Assignee (Optional)</label>
                <select className="input-field" value={newTask.assignee_id} onChange={(e) => setNewTask({...newTask, assignee_id: e.target.value})}>
                  <option value="">Unassigned</option>
                  {project.members.map(m => (
                    <option key={m.id} value={m.id}>{m.username}</option>
                  ))}
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">Deadline</label>
                <input type="date" className="input-field" value={newTask.deadline} onChange={(e) => setNewTask({...newTask, deadline: e.target.value})} />
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowTaskModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Task / Comments Modal */}
      {selectedTask && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '600px', padding: '2rem', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="flex justify-between items-start mb-4">
               <h2 className="text-2xl font-bold">{selectedTask.title}</h2>
               <button onClick={() => setSelectedTask(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={24} /></button>
            </div>
            <div className="flex gap-2 mb-4">
               <span className="badge badge-progress">{selectedTask.status}</span>
               {selectedTask.deadline && (
                 <span className="badge" style={{ backgroundColor: 'var(--bg-elevated)' }}>
                   <Clock size={12} style={{ display: 'inline', marginRight: '4px' }}/> 
                   {new Date(selectedTask.deadline).toLocaleDateString()}
                 </span>
               )}
            </div>
            <p className="text-muted mb-6">{selectedTask.description || 'No description provided.'}</p>

            <hr style={{ borderColor: 'var(--border-color)', margin: '2rem 0' }} />

            <h3 className="font-bold mb-4">Comments</h3>
            <div className="mb-4 flex flex-col gap-3">
              {selectedTask.comments?.length === 0 ? (
                <p className="text-sm text-muted">No comments yet.</p>
              ) : (
                selectedTask.comments?.map(comment => (
                  <div key={comment.id} style={{ padding: '1rem', backgroundColor: 'rgba(15, 23, 42, 0.4)', borderRadius: 'var(--radius-md)' }}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-sm text-primary">{comment.author?.username || 'Unknown'}</span>
                      <span className="text-xs text-muted">{new Date(comment.created_at).toLocaleString()}</span>
                    </div>
                    <p className="text-sm">{comment.text}</p>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handlePostComment} className="flex gap-2">
              <input 
                type="text" 
                className="input-field" 
                placeholder="Write a comment..." 
                value={commentText} 
                onChange={(e) => setCommentText(e.target.value)}
                style={{ flex: 1 }}
              />
              <button type="submit" className="btn btn-primary" disabled={!commentText.trim()}>Post</button>
            </form>
          </div>
        </div>
      )}

      {/* Member Modal */}
      {showMemberModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '400px', padding: '2rem' }}>
            <h2 className="text-2xl mb-4">Add Team Member</h2>
            <form onSubmit={handleAddMember}>
              <div className="input-group">
                <label className="input-label">Select User</label>
                <select className="input-field" value={memberIdToAdd} onChange={(e) => setMemberIdToAdd(e.target.value)} required>
                  <option value="">Select a user...</option>
                  {users.filter(u => !project.members.some(m => m.id === u.id)).map(u => (
                    <option key={u.id} value={u.id}>{u.username} ({u.email})</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowMemberModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Add Member</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Project Modal */}
      {showEditProjectModal && isAdmin && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '500px', padding: '2rem' }}>
            <h2 className="text-2xl mb-4">Project Settings</h2>
            <form onSubmit={handleUpdateProject}>
              <div className="input-group">
                <label className="input-label">Project Name</label>
                <input type="text" className="input-field" value={editProjectData.name} onChange={(e) => setEditProjectData({...editProjectData, name: e.target.value})} required />
              </div>
              <div className="input-group">
                <label className="input-label">Description</label>
                <textarea className="input-field" rows="3" value={editProjectData.description} onChange={(e) => setEditProjectData({...editProjectData, description: e.target.value})}></textarea>
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'space-between', marginTop: '2rem' }}>
                <button type="button" className="btn btn-secondary" style={{ color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.3)' }} onClick={handleDeleteProject}>
                  <Trash2 size={16} /> Delete Project
                </button>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowEditProjectModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Save Changes</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default ProjectDetail;
