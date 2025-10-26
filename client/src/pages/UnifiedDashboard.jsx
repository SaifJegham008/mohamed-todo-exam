import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Calendar as CalendarIcon, List, ChevronLeft, ChevronRight, Check, Edit2, Trash2, Save, X, AlertCircle, Moon, Sun, LogOut } from 'lucide-react';
import { useToast } from '../components/Toast';
import { SkeletonList } from '../components/Skeleton';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';

const UnifiedDashboard = () => {
  const { showToast } = useToast();
  const { isDark, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', due_date: '', priority: 'medium' });
  
  // Calendar state
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [viewMode, setViewMode] = useState('calendar'); // 'calendar' or 'tasks'

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  useEffect(() => {
    loadTasks();
  }, []);

  const handleLogout = () => {
    logout();
    showToast('Logged out successfully', 'success');
  };

  const loadTasks = async () => {
    try {
      setLoading(true);
      const response = await api.get('/tasks');
      setTasks(response.data.tasks || []);
    } catch (error) {
      showToast('Failed to load tasks', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTask.title.trim()) {
      showToast('Task title is required', 'error');
      return;
    }

    try {
      setIsCreating(true);
      const response = await api.post('/tasks', newTask);
      setTasks(prev => [response.data.task, ...prev]);
      setNewTask({ title: '', description: '', due_date: '', priority: 'medium' });
      setShowCreateForm(false);
      setShowTaskForm(false);
      showToast('Task created successfully', 'success');
    } catch (error) {
      showToast(error.response?.data?.error || 'Failed to create task', 'error');
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdateTask = async (taskId, updateData) => {
    try {
      const response = await api.put(`/tasks/${taskId}`, updateData);
      setTasks(prev => prev.map(task => 
        task.id === taskId ? response.data.task : task
      ));
      showToast('Task updated successfully', 'success');
    } catch (error) {
      showToast(error.response?.data?.error || 'Failed to update task', 'error');
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks(prev => prev.filter(task => task.id !== taskId));
      showToast('Task deleted successfully', 'success');
    } catch (error) {
      showToast(error.response?.data?.error || 'Failed to delete task', 'error');
    }
  };

  // Calendar functions
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getTasksForDate = (date) => {
    if (!date || !Array.isArray(tasks)) return [];
    const dateStr = date.toISOString().split('T')[0];
    return tasks.filter(task => {
      if (task.due_date) {
        const taskDate = new Date(task.due_date).toISOString().split('T')[0];
        return taskDate === dateStr;
      }
      return false;
    });
  };

  const handleDateClick = (date) => {
    if (date) {
      setSelectedDate(date);
      setNewTask(prev => ({
        ...prev,
        due_date: date.toISOString().split('T')[0]
      }));
      setShowTaskForm(true);
    }
  };

  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const isToday = (date) => {
    if (!date) return false;
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (filter === 'completed') return matchesSearch && task.completed;
    if (filter === 'pending') return matchesSearch && !task.completed;
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow-sm border-b border-slate-200 dark:border-slate-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                TodoApp
              </h1>
            </div>

            {/* Right side controls */}
            <div className="flex items-center space-x-4">
              {/* View Toggle */}
              <div className="flex items-center bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('calendar')}
                  className={`flex items-center space-x-1 px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'calendar'
                      ? 'bg-white dark:bg-slate-600 text-indigo-600 dark:text-indigo-400 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <CalendarIcon className="w-4 h-4" />
                  <span className="hidden sm:inline">Calendar</span>
                </button>
                <button
                  onClick={() => setViewMode('tasks')}
                  className={`flex items-center space-x-1 px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'tasks'
                      ? 'bg-white dark:bg-slate-600 text-indigo-600 dark:text-indigo-400 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <List className="w-4 h-4" />
                  <span className="hidden sm:inline">Tasks</span>
                </button>
              </div>

              {/* User info and controls */}
              <div className="flex items-center space-x-3">
                {/* User email */}
                <span className="text-sm text-slate-600 dark:text-slate-400 hidden sm:block">
                  {user?.email}
                </span>
                
                {/* Dark mode toggle */}
                <button
                  onClick={toggleTheme}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                  title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                  {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
                
                {/* Logout button */}
                <button
                  onClick={handleLogout}
                  className="btn-secondary flex items-center space-x-1"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {viewMode === 'calendar' ? (
          /* Calendar View */
          <div className="space-y-6">
            {/* Calendar Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {months[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h2>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => navigateMonth(-1)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <ChevronLeft className="h-5 w-5 text-slate-600 dark:text-slate-300" />
                </button>
                <button
                  onClick={() => setCurrentDate(new Date())}
                  className="px-3 py-1 text-sm bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-colors"
                >
                  Today
                </button>
                <button
                  onClick={() => navigateMonth(1)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <ChevronRight className="h-5 w-5 text-slate-600 dark:text-slate-300" />
                </button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-4">
              {/* Days of Week Header */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {days.map(day => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-slate-500 dark:text-slate-400">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1">
                {getDaysInMonth(currentDate).map((date, index) => {
                  const dayTasks = getTasksForDate(date);
                  const isCurrentDay = isToday(date);

                  return (
                    <div
                      key={index}
                      onClick={() => handleDateClick(date)}
                      className={`
                        min-h-[80px] sm:min-h-[100px] p-2 border border-slate-200 dark:border-slate-600 rounded-lg cursor-pointer
                        hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors
                        ${date ? 'bg-white dark:bg-slate-800' : 'bg-slate-50 dark:bg-slate-900'}
                        ${isCurrentDay ? 'ring-2 ring-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : ''}
                      `}
                    >
                      {date && (
                        <>
                          <div className="flex items-center justify-between mb-1">
                            <span className={`
                              text-sm font-medium
                              ${isCurrentDay ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-700 dark:text-slate-300'}
                            `}>
                              {date.getDate()}
                            </span>
                          </div>
                          
                          {/* Tasks for this date */}
                          <div className="space-y-1">
                            {dayTasks.slice(0, 2).map(task => (
                              <div
                                key={task.id}
                                className={`
                                  text-xs p-1 rounded truncate
                                  ${task.completed ? 'line-through opacity-60' : ''}
                                  ${getPriorityColor(task.priority)}
                                  text-white
                                `}
                                title={task.title}
                              >
                                {task.title}
                              </div>
                            ))}
                            {dayTasks.length > 2 && (
                              <div className="text-xs text-slate-500 dark:text-slate-400">
                                +{dayTasks.length - 2} more
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          /* Tasks View */
          <div className="space-y-6">
            {/* Tasks Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  My Tasks
                </h2>
                <p className="mt-1 text-slate-600 dark:text-slate-400">
                  {filteredTasks.length} of {tasks.length} tasks
                </p>
              </div>
              
              <button
                onClick={() => setShowCreateForm(true)}
                className="btn-primary flex items-center justify-center space-x-2 w-full sm:w-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Add Task</span>
              </button>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field pl-10 w-full"
                />
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === 'all'
                      ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilter('pending')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === 'pending'
                      ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                >
                  Pending
                </button>
                <button
                  onClick={() => setFilter('completed')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === 'completed'
                      ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                >
                  Done
                </button>
              </div>
            </div>

            {/* Tasks List */}
            <div className="space-y-3">
              {loading ? (
                <SkeletonList count={3} />
              ) : filteredTasks.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-slate-400 dark:text-slate-500 mb-4">
                    <List className="w-12 h-12 mx-auto" />
                  </div>
                  <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                    No tasks found
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-4">
                    {searchTerm ? 'Try adjusting your search terms' : 'Get started by creating your first task'}
                  </p>
                  {!searchTerm && (
                    <button
                      onClick={() => setShowCreateForm(true)}
                      className="btn-primary"
                    >
                      Create Task
                    </button>
                  )}
                </div>
              ) : (
                filteredTasks.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onUpdate={handleUpdateTask}
                    onDelete={handleDeleteTask}
                  />
                ))
              )}
            </div>
          </div>
        )}

        {/* Create Task Modal */}
        {(showCreateForm || showTaskForm) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                {showTaskForm ? `Add Task for ${selectedDate?.toLocaleDateString()}` : 'Create New Task'}
              </h3>
              <form onSubmit={handleCreateTask} className="space-y-4">
                <div>
                  <input
                    type="text"
                    placeholder="Task title"
                    value={newTask.title}
                    onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                    className="input-field w-full"
                    required
                  />
                </div>
                <div>
                  <textarea
                    placeholder="Task description (optional)"
                    value={newTask.description}
                    onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                    className="input-field w-full min-h-[80px] resize-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Due Date
                    </label>
                    <input
                      type="date"
                      value={newTask.due_date}
                      onChange={(e) => setNewTask(prev => ({ ...prev, due_date: e.target.value }))}
                      className="input-field w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Priority
                    </label>
                    <select
                      value={newTask.priority}
                      onChange={(e) => setNewTask(prev => ({ ...prev, priority: e.target.value }))}
                      className="input-field w-full"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateForm(false);
                      setShowTaskForm(false);
                      setNewTask({ title: '', description: '', due_date: '', priority: 'medium' });
                    }}
                    className="flex-1 btn-secondary"
                    disabled={isCreating}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 btn-primary"
                    disabled={isCreating || !newTask.title.trim()}
                  >
                    {isCreating ? 'Creating...' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

// Task Card Component
const TaskCard = ({ task, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: task.title,
    description: task.description || '',
    due_date: task.due_date || '',
    priority: task.priority || 'medium'
  });

  const handleEdit = () => {
    setIsEditing(true);
    setEditData({
      title: task.title,
      description: task.description || '',
      due_date: task.due_date || '',
      priority: task.priority || 'medium'
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({
      title: task.title,
      description: task.description || '',
      due_date: task.due_date || '',
      priority: task.priority || 'medium'
    });
  };

  const handleSave = async () => {
    if (!editData.title.trim()) return;
    await onUpdate(task.id, editData);
    setIsEditing(false);
  };

  const handleToggleComplete = async () => {
    await onUpdate(task.id, { completed: !task.completed });
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      await onDelete(task.id);
    }
  };

  const formatDueDate = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/20';
      case 'medium': return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/20';
      case 'low': return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20';
      default: return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date() && !task.completed;
  };

  if (isEditing) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4">
        <div className="space-y-4">
          <div>
            <input
              type="text"
              value={editData.title}
              onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))}
              className="input-field w-full font-medium text-lg"
              placeholder="Task title"
            />
          </div>
          
          <div>
            <textarea
              value={editData.description}
              onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
              className="input-field w-full min-h-[80px] resize-none"
              placeholder="Task description (optional)"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Due Date
              </label>
              <input
                type="date"
                value={editData.due_date}
                onChange={(e) => setEditData(prev => ({ ...prev, due_date: e.target.value }))}
                className="input-field w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Priority
              </label>
              <select
                value={editData.priority}
                onChange={(e) => setEditData(prev => ({ ...prev, priority: e.target.value }))}
                className="input-field w-full"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={handleCancel}
              className="flex-1 btn-secondary flex items-center justify-center"
            >
              <X className="w-4 h-4 mr-1" />
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 btn-success flex items-center justify-center"
              disabled={!editData.title.trim()}
            >
              <Save className="w-4 h-4 mr-1" />
              Save
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4 transition-all duration-200 ${
      task.completed ? 'opacity-75' : ''
    }`}>
      <div className="flex items-start space-x-3">
        {/* Checkbox */}
        <button
          onClick={handleToggleComplete}
          className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
            task.completed 
              ? 'bg-emerald-500 border-emerald-500 text-white' 
              : 'border-slate-300 dark:border-slate-600 hover:border-emerald-500'
          }`}
        >
          {task.completed && <Check className="w-4 h-4" />}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className={`text-lg font-medium ${
            task.completed 
              ? 'line-through text-slate-500 dark:text-slate-400' 
              : 'text-slate-900 dark:text-slate-100'
          }`}>
            {task.title}
          </h3>
          
          {task.description && (
            <p className={`mt-1 text-sm ${
              task.completed 
                ? 'line-through text-slate-400 dark:text-slate-500' 
                : 'text-slate-600 dark:text-slate-300'
            }`}>
              {task.description}
            </p>
          )}

          {/* Task metadata */}
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
            {/* Priority */}
            {task.priority && (
              <span className={`px-2 py-1 rounded-full font-medium ${getPriorityColor(task.priority)}`}>
                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
              </span>
            )}
            
            {/* Due Date */}
            {task.due_date && (
              <div className={`flex items-center space-x-1 ${
                isOverdue(task.due_date) 
                  ? 'text-red-600 dark:text-red-400' 
                  : 'text-slate-500 dark:text-slate-400'
              }`}>
                <CalendarIcon className="w-3 h-3" />
                <span>{formatDueDate(task.due_date)}</span>
                {isOverdue(task.due_date) && (
                  <AlertCircle className="w-3 h-3 text-red-500" />
                )}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-1">
          <button
            onClick={handleEdit}
            className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            title="Edit task"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          
          <button
            onClick={handleDelete}
            className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
            title="Delete task"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnifiedDashboard;
