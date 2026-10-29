import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../../contexts/NotificationContext';
import { timeEntriesAPI, mongoAssignmentsAPI } from '../../services/api';
import {
  ArrowLeft,
  Clock,
  Play,
  Pause,
  Square,
  Calendar,
  Coffee,
  MapPin,
  RefreshCw,
  Download,
  Timer,
  CheckCircle,
  Edit,
  MoreVertical,
  PlusCircle,
  AlertCircle,
  ClipboardList
} from 'lucide-react';

// 'YYYY-MM-DD' for a date in the browser's local timezone (toISOString would use UTC)
const toDateInputValue = (date) => {
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
};

// Parse a 'YYYY-MM-DD' value as a local date
const parseDateInputValue = (value) => {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
};

const formatClockTime = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const getErrorMessage = (error, fallback) => error.response?.data?.detail || fallback;

const EmployeeTimeTracker = () => {
  const navigate = useNavigate();
  const notify = useNotification();
  // Running entry from the server (null when no timer is running)
  const [activeEntry, setActiveEntry] = useState(null);
  // Task of the last stopped session while "paused", so Resume can start a new entry for it
  const [pausedSession, setPausedSession] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [timeLogs, setTimeLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [assignments, setAssignments] = useState([]);
  const [selectedDate, setSelectedDate] = useState(toDateInputValue(new Date()));

  const isTracking = Boolean(activeEntry);
  const currentSession = activeEntry || pausedSession;

  const fetchTimeLogs = useCallback(async () => {
    if (!selectedDate) return;
    try {
      setLoading(true);
      setError(null);
      const day = parseDateInputValue(selectedDate);
      const start = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 0, 0, 0).toISOString();
      const end = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 23, 59, 59, 999).toISOString();
      const response = await timeEntriesAPI.getEntries({ start, end });
      setTimeLogs(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching time logs:', error);
      setError(getErrorMessage(error, 'Failed to load time logs. Please try again.'));
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchTimeLogs();
  }, [fetchTimeLogs]);

  // Restore a running timer (survives page reloads) and load open assignments as quick-start tasks
  useEffect(() => {
    const fetchActiveEntry = async () => {
      try {
        const response = await timeEntriesAPI.getActive();
        setActiveEntry(response.data || null);
      } catch (error) {
        console.error('Error fetching active timer:', error);
      }
    };
    const fetchAssignments = async () => {
      try {
        const response = await mongoAssignmentsAPI.getMyAssignments();
        const open = (Array.isArray(response.data) ? response.data : [])
          .filter(assignment => ['pending', 'in_progress'].includes(assignment.status));
        setAssignments(open);
      } catch (error) {
        console.error('Error fetching assignments:', error);
      }
    };
    fetchActiveEntry();
    fetchAssignments();
  }, []);

  // Elapsed time is always derived from the server's start_time
  useEffect(() => {
    if (!activeEntry) return undefined;
    const startMs = new Date(activeEntry.start_time).getTime();
    const tick = () => setElapsedTime(Math.max(0, Math.floor((Date.now() - startMs) / 1000)));
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [activeEntry]);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Seconds between a completed entry's start and end (used to freeze the display while paused)
  const entrySeconds = (entry) => {
    if (!entry?.start_time || !entry?.end_time) return 0;
    return Math.max(0, Math.floor((new Date(entry.end_time) - new Date(entry.start_time)) / 1000));
  };

  const startTracking = async (taskName = 'General Work', type = 'work', assignmentId = null, description = null) => {
    if (actionLoading) return;
    try {
      setActionLoading(true);
      const response = await timeEntriesAPI.start({
        task: taskName,
        type,
        description: description || undefined,
        assignment_id: assignmentId || undefined
      });
      setActiveEntry(response.data);
      setPausedSession(null);
      fetchTimeLogs();
    } catch (error) {
      console.error('Error starting timer:', error);
      if (error.response?.status === 409) {
        // A timer is already running (e.g. started in another tab) - show that one instead
        try {
          const active = await timeEntriesAPI.getActive();
          setActiveEntry(active.data || null);
          setPausedSession(null);
        } catch (activeError) {
          console.error('Error fetching active timer:', activeError);
        }
      }
      notify.error(getErrorMessage(error, 'Failed to start the timer. Please try again.'));
    } finally {
      setActionLoading(false);
    }
  };

  // Stops the running entry on the server; returns the completed entry or null on failure.
  // With keepAsPaused, its task is remembered so Resume can start a new entry for it.
  const stopActiveEntry = async (keepAsPaused = false) => {
    try {
      setActionLoading(true);
      const response = await timeEntriesAPI.stop(activeEntry.id);
      if (keepAsPaused) {
        const { task, type, description, assignment_id } = activeEntry;
        setPausedSession({ task, type, description, assignment_id });
        setElapsedTime(entrySeconds(response.data));
      }
      setActiveEntry(null);
      fetchTimeLogs();
      return response.data;
    } catch (error) {
      console.error('Error stopping timer:', error);
      notify.error(getErrorMessage(error, 'Failed to stop the timer. Please try again.'));
      return null;
    } finally {
      setActionLoading(false);
    }
  };

  // The backend has no pause: pausing logs the current session, Resume starts a new one for the same task
  const pauseTracking = async () => {
    if (!activeEntry || actionLoading) return;
    await stopActiveEntry(true);
  };

  const resumeTracking = () => {
    if (!pausedSession) return;
    startTracking(pausedSession.task, pausedSession.type, pausedSession.assignment_id, pausedSession.description);
  };

  const stopTracking = async () => {
    if (actionLoading) return;
    if (activeEntry) {
      const completed = await stopActiveEntry();
      if (!completed) return;
      notify.success(`Logged ${(completed.duration_hours ?? 0).toFixed(2)}h on ${completed.task}`);
    }
    // When paused, the last session is already saved - just leave the paused state
    setPausedSession(null);
    setElapsedTime(0);
  };

  const workLogs = timeLogs.filter(log => log.type === 'work');
  const completedWorkLogs = workLogs.filter(log => log.duration_hours != null);
  const totalHours = completedWorkLogs.reduce((total, log) => total + (Number(log.duration_hours) || 0), 0);

  const getTypeColor = (type) => {
    switch (type) {
      case 'work': return 'bg-blue-100 text-blue-800';
      case 'break': return 'bg-yellow-100 text-yellow-800';
      case 'meeting': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'work': return <Clock className="h-4 w-4" />;
      case 'break': return <Coffee className="h-4 w-4" />;
      case 'meeting': return <MapPin className="h-4 w-4" />;
      default: return <Timer className="h-4 w-4" />;
    }
  };

  const quickStartOptions = [
    { label: 'General Work', task: 'General Work', type: 'work' },
    { label: 'Inventory Tasks', task: 'Inventory Management', type: 'work' },
    { label: 'Quality Control', task: 'Quality Control', type: 'work' },
    { label: 'Break Time', task: 'Break', type: 'break' },
    { label: 'Team Meeting', task: 'Team Meeting', type: 'meeting' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 mt-18">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Time Tracker</h1>
                <p className="text-gray-600 mt-1">Track your work hours and breaks</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={fetchTimeLogs}
                disabled={loading}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Active Timer */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
          <div className="text-center">
            <div className={`text-6xl font-mono font-bold mb-4 ${pausedSession && !isTracking ? 'text-gray-400' : 'text-gray-900'}`}>
              {formatTime(currentSession ? elapsedTime : 0)}
            </div>

            {currentSession && (
              <div className="mb-6">
                <div className="text-lg font-semibold text-gray-900 mb-2">{currentSession.task}</div>
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(currentSession.type)}`}>
                  {getTypeIcon(currentSession.type)}
                  <span className="ml-2 capitalize">{currentSession.type}</span>
                </div>
                {isTracking ? (
                  <p className="text-sm text-gray-500 mt-3">
                    Started at {formatClockTime(activeEntry.start_time)}. Pausing saves this session to your log.
                  </p>
                ) : (
                  <p className="text-sm text-gray-500 mt-3">
                    Paused - the last session was saved. Resume starts a new session for the same task.
                  </p>
                )}
              </div>
            )}

            <div className="flex items-center justify-center space-x-4">
              {!currentSession ? (
                <div className="w-full max-w-4xl">
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {quickStartOptions.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => startTracking(option.task, option.type)}
                        disabled={actionLoading}
                        className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Play className="h-4 w-4 mr-2" />
                        {option.label}
                      </button>
                    ))}
                  </div>

                  {/* Open assignments as quick-start tasks */}
                  {assignments.length > 0 && (
                    <div className="mt-6 text-left">
                      <h4 className="flex items-center text-sm font-medium text-gray-700 mb-3">
                        <ClipboardList className="h-4 w-4 mr-2" />
                        Track time on an assignment
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {assignments.map((assignment) => (
                          <button
                            key={assignment.id}
                            onClick={() => startTracking(assignment.title, 'work', assignment.id)}
                            disabled={actionLoading}
                            className="flex items-center px-4 py-3 bg-white border border-blue-200 text-blue-700 rounded-lg hover:bg-blue-50 transition-colors duration-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Play className="h-4 w-4 mr-2 flex-shrink-0" />
                            <span className="truncate">{assignment.title}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  {isTracking ? (
                    <button
                      onClick={pauseTracking}
                      disabled={actionLoading}
                      className="flex items-center px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors duration-200 text-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Pause className="h-5 w-5 mr-2" />
                      Pause
                    </button>
                  ) : (
                    <button
                      onClick={resumeTracking}
                      disabled={actionLoading}
                      className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 text-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Play className="h-5 w-5 mr-2" />
                      Resume
                    </button>
                  )}
                  <button
                    onClick={stopTracking}
                    disabled={actionLoading}
                    className="flex items-center px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 text-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Square className="h-5 w-5 mr-2" />
                    {isTracking ? 'Stop & Save' : 'Finish'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Daily Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Hours</p>
                <p className="text-2xl font-bold text-gray-900">{totalHours.toFixed(2)}h</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Sessions</p>
                <p className="text-2xl font-bold text-gray-900">{workLogs.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <Coffee className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Breaks</p>
                <p className="text-2xl font-bold text-gray-900">{timeLogs.filter(log => log.type === 'break').length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <Timer className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Average Session</p>
                <p className="text-2xl font-bold text-gray-900">
                  {completedWorkLogs.length > 0
                    ? (totalHours / completedWorkLogs.length).toFixed(1)
                    : '0.0'
                  }h
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Time Logs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Time Logs for {selectedDate ? parseDateInputValue(selectedDate).toLocaleDateString() : '—'}
              </h3>
              <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200">
                <Download className="mr-2 h-4 w-4" />
                Export
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading time logs...</span>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <AlertCircle className="mx-auto h-12 w-12 text-red-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Could not load time logs</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={fetchTimeLogs}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </button>
            </div>
          ) : timeLogs.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No time logs</h3>
              <p className="text-gray-600">No time entries recorded for this date.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Task
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Start Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      End Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {timeLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{log.task}</div>
                          {log.description && (
                            <div className="text-sm text-gray-500">{log.description}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(log.type)}`}>
                          {getTypeIcon(log.type)}
                          <span className="ml-1 capitalize">{log.type}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatClockTime(log.start_time)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {log.end_time ? formatClockTime(log.end_time) : 'Running'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {log.duration_hours != null ? `${Number(log.duration_hours).toFixed(2)}h` : '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {log.status === 'active' ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            <Timer className="h-3 w-3 mr-1" />
                            active
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            {log.status}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button className="text-blue-600 hover:text-blue-900 p-1">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button className="text-gray-400 hover:text-gray-600 p-1">
                            <MoreVertical className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeTimeTracker;
