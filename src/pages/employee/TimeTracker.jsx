import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  PlusCircle
} from 'lucide-react';

const EmployeeTimeTracker = () => {
  const navigate = useNavigate();
  const [isTracking, setIsTracking] = useState(false);
  const [currentSession, setCurrentSession] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [timeLogs, setTimeLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchTimeLogs();
  }, [selectedDate]);

  useEffect(() => {
    let interval = null;
    if (isTracking && currentSession) {
      interval = setInterval(() => {
        const now = new Date();
        const startTime = new Date(currentSession.startTime);
        setElapsedTime(Math.floor((now - startTime) / 1000));
      }, 1000);
    } else if (!isTracking) {
      setElapsedTime(0);
    }
    return () => clearInterval(interval);
  }, [isTracking, currentSession]);

  const fetchTimeLogs = async () => {
    try {
      setLoading(true);
      // Mock data - in real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockTimeLogs = [
        {
          id: 1,
          date: '2024-08-21',
          startTime: '08:00',
          endTime: '12:00',
          duration: 4,
          task: 'Inventory Count - Section A',
          type: 'work',
          status: 'completed',
          description: 'Completed full inventory count for electronics section'
        },
        {
          id: 2,
          date: '2024-08-21',
          startTime: '12:00',
          endTime: '13:00',
          duration: 1,
          task: 'Lunch Break',
          type: 'break',
          status: 'completed',
          description: 'Lunch break'
        },
        {
          id: 3,
          date: '2024-08-21',
          startTime: '13:00',
          endTime: '17:00',
          duration: 4,
          task: 'Quality Inspection',
          type: 'work',
          status: 'completed',
          description: 'Quality inspection of incoming shipments'
        },
        {
          id: 4,
          date: '2024-08-20',
          startTime: '08:30',
          endTime: '12:30',
          duration: 4,
          task: 'Equipment Maintenance',
          type: 'work',
          status: 'completed',
          description: 'Routine maintenance on warehouse equipment'
        },
        {
          id: 5,
          date: '2024-08-20',
          startTime: '13:30',
          endTime: '17:30',
          duration: 4,
          task: 'Shipment Processing',
          type: 'work',
          status: 'completed',
          description: 'Processing outbound shipments'
        }
      ];
      
      // Filter logs by selected date
      const filteredLogs = mockTimeLogs.filter(log => log.date === selectedDate);
      setTimeLogs(filteredLogs);
    } catch (error) {
      console.error('Error fetching time logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startTracking = (taskName = 'General Work', type = 'work') => {
    const now = new Date();
    const session = {
      id: Date.now(),
      startTime: now,
      task: taskName,
      type: type,
      description: ''
    };
    setCurrentSession(session);
    setIsTracking(true);
    setElapsedTime(0);
  };

  const pauseTracking = () => {
    setIsTracking(false);
  };

  const stopTracking = () => {
    if (currentSession) {
      const now = new Date();
      const duration = Math.floor((now - new Date(currentSession.startTime)) / 1000 / 3600 * 100) / 100; // hours with 2 decimals
      
      const newLog = {
        id: Date.now(),
        date: selectedDate,
        startTime: new Date(currentSession.startTime).toLocaleTimeString('en-US', { 
          hour12: false, 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        endTime: now.toLocaleTimeString('en-US', { 
          hour12: false, 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        duration: duration,
        task: currentSession.task,
        type: currentSession.type,
        status: 'completed',
        description: currentSession.description || `Worked on ${currentSession.task}`
      };
      
      setTimeLogs(prev => [newLog, ...prev]);
    }
    
    setCurrentSession(null);
    setIsTracking(false);
    setElapsedTime(0);
  };

  const getTotalHours = () => {
    return timeLogs
      .filter(log => log.type === 'work')
      .reduce((total, log) => total + log.duration, 0)
      .toFixed(2);
  };

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
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
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
            <div className="text-6xl font-mono font-bold text-gray-900 mb-4">
              {formatTime(elapsedTime)}
            </div>
            
            {currentSession && (
              <div className="mb-6">
                <div className="text-lg font-semibold text-gray-900 mb-2">{currentSession.task}</div>
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(currentSession.type)}`}>
                  {getTypeIcon(currentSession.type)}
                  <span className="ml-2 capitalize">{currentSession.type}</span>
                </div>
              </div>
            )}

            <div className="flex items-center justify-center space-x-4">
              {!isTracking && !currentSession ? (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 w-full max-w-4xl">
                  {quickStartOptions.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => startTracking(option.task, option.type)}
                      className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      {option.label}
                    </button>
                  ))}
                </div>
              ) : (
                <>
                  {isTracking ? (
                    <button
                      onClick={pauseTracking}
                      className="flex items-center px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors duration-200 text-lg font-medium"
                    >
                      <Pause className="h-5 w-5 mr-2" />
                      Pause
                    </button>
                  ) : (
                    <button
                      onClick={() => setIsTracking(true)}
                      className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 text-lg font-medium"
                    >
                      <Play className="h-5 w-5 mr-2" />
                      Resume
                    </button>
                  )}
                  <button
                    onClick={stopTracking}
                    className="flex items-center px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 text-lg font-medium"
                  >
                    <Square className="h-5 w-5 mr-2" />
                    Stop & Save
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
                <p className="text-2xl font-bold text-gray-900">{getTotalHours()}h</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Sessions</p>
                <p className="text-2xl font-bold text-gray-900">{timeLogs.filter(log => log.type === 'work').length}</p>
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
                  {timeLogs.filter(log => log.type === 'work').length > 0 
                    ? (getTotalHours() / timeLogs.filter(log => log.type === 'work').length).toFixed(1)
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
                Time Logs for {new Date(selectedDate).toLocaleDateString()}
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
                          <div className="text-sm text-gray-500">{log.description}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(log.type)}`}>
                          {getTypeIcon(log.type)}
                          <span className="ml-1 capitalize">{log.type}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {log.startTime}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {log.endTime}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {log.duration}h
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          {log.status}
                        </span>
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
