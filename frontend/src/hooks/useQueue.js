import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { queueApi } from '../services/queueService';
import { SOCKET_URL } from '../services/api';

const emptySnapshot = {
  patients: [],
  activePatients: [],
  waitingPatients: [],
  servingPatient: null,
  nextTokens: [],
  stats: {
    totalPatients: 0,
    waiting: 0,
    serving: 0,
    completed: 0,
    estimatedQueueDuration: 0,
    avgConsultationTime: 10,
    currentToken: 0
  }
};

export function useQueue() {
  const { clinicId } = useAuth();
  const [snapshot, setSnapshot] = useState(emptySnapshot);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    const data = await queueApi.current();
    setSnapshot(data);
    setLoading(false);
    return data;
  }

  useEffect(() => {
    if (!clinicId) return undefined;
    let active = true;

    refresh().catch((error) => {
      if (active) {
        toast.error(error.message);
        setLoading(false);
      }
    });

    const socket = io(SOCKET_URL, { transports: ['websocket', 'polling'] });
    socket.emit('clinic:join', clinicId);
    socket.on('queue:update', (data) => {
      setSnapshot(data);
    });
    socket.on('connect_error', () => {
      toast.error('Live connection interrupted');
    });

    return () => {
      active = false;
      socket.emit('clinic:leave', clinicId);
      socket.disconnect();
    };
  }, [clinicId]);

  return { snapshot, loading, refresh };
}
