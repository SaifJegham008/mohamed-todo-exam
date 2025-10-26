import React, { useState } from 'react';
import { Check, Edit2, Trash2, Save, X, Calendar, AlertCircle } from 'lucide-react';

const TodoCard = ({ 
  task, 
  onUpdate, 
  onDelete, 
  isLoading = false 
}) => {
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
    if (!editData.title.trim()) {
      return;
    }
    
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
      <div className="card p-6">
        <div className="space-y-4">
          <div>
            <input
              type="text"
              value={editData.title}
              onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))}
              className="input-field font-medium text-lg"
              placeholder="Task title"
            />
          </div>
          
          <div>
            <textarea
              value={editData.description}
              onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
              className="input-field min-h-[100px] resize-none"
              placeholder="Task description (optional)"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Due Date
              </label>
              <input
                type="date"
                value={editData.due_date}
                onChange={(e) => setEditData(prev => ({ ...prev, due_date: e.target.value }))}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Priority
              </label>
              <select
                value={editData.priority}
                onChange={(e) => setEditData(prev => ({ ...prev, priority: e.target.value }))}
                className="input-field"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2">
            <button
              onClick={handleCancel}
              className="btn-secondary flex items-center"
              disabled={isLoading}
            >
              <X className="w-4 h-4 mr-1" />
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="btn-success flex items-center"
              disabled={isLoading || !editData.title.trim()}
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
    <div className={`card p-6 transition-all duration-200 hover:shadow-xl ${
      task.completed ? 'opacity-75' : ''
    }`}>
      <div className="flex items-start space-x-4">
        {/* Checkbox */}
        <button
          onClick={handleToggleComplete}
          disabled={isLoading}
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
            <p className={`mt-2 text-sm ${
              task.completed 
                ? 'line-through text-slate-400 dark:text-slate-500' 
                : 'text-slate-600 dark:text-slate-300'
            }`}>
              {task.description}
            </p>
          )}

          {/* Task metadata */}
          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
            {/* Priority */}
            {task.priority && (
              <span className={`px-2 py-1 rounded-full font-medium ${getPriorityColor(task.priority)}`}>
                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
              </span>
            )}
            
            {/* Due Date */}
            {task.due_date && (
              <div className={`flex items-center space-x-1 ${
                isOverdue(task.due_date) 
                  ? 'text-red-600 dark:text-red-400' 
                  : 'text-slate-500 dark:text-slate-400'
              }`}>
                <Calendar className="w-3 h-3" />
                <span>Due: {formatDueDate(task.due_date)}</span>
                {isOverdue(task.due_date) && (
                  <AlertCircle className="w-3 h-3 text-red-500" />
                )}
              </div>
            )}
          </div>
          
          <div className="mt-3 flex items-center text-xs text-slate-500 dark:text-slate-400">
            <span>Created: {formatDate(task.created_at)}</span>
            {task.updated_at !== task.created_at && (
              <span className="ml-4">Updated: {formatDate(task.updated_at)}</span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleEdit}
            disabled={isLoading}
            className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            title="Edit task"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          
          <button
            onClick={handleDelete}
            disabled={isLoading}
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

export default TodoCard;
