import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { getAuthToken } from '../utils/storage';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const listenersRef = useRef(new Map());

  useEffect(() => {
    const token = getAuthToken();
    const displayName = localStorage.getItem('quantegy-teacher-user')
      || JSON.parse(localStorage.getItem('quantegy-student-user') || '{}')?.displayName
      || 'Guest';

    const socket = io(window.location.origin, {
      auth: { token, displayName },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
    });

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setConnected(false);
    };
  }, []);

  const emit = useCallback((event, data) => {
    socketRef.current?.emit(event, data);
  }, []);

  const on = useCallback((event, handler) => {
    socketRef.current?.on(event, handler);
    if (!listenersRef.current.has(event)) listenersRef.current.set(event, new Set());
    listenersRef.current.get(event).add(handler);
  }, []);

  const off = useCallback((event, handler) => {
    socketRef.current?.off(event, handler);
    listenersRef.current.get(event)?.delete(handler);
  }, []);

  const value = { socket: socketRef.current, connected, emit, on, off };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}

export function useSocket() {
  return useContext(SocketContext) || { socket: null, connected: false, emit: () => {}, on: () => {}, off: () => {} };
}

/**
 * Hook for class chat real-time messaging.
 * Falls back to polling if socket is unavailable.
 */
export function useChatSocket(classId) {
  const { emit, on, off, connected } = useSocket();
  const [typingUsers, setTypingUsers] = useState({});
  const [onlineUsers, setOnlineUsers] = useState({});
  const messageHandlerRef = useRef(null);

  useEffect(() => {
    if (!classId || !connected) return;
    emit('chat:join', classId);
    return () => { emit('chat:leave', classId); };
  }, [classId, connected, emit]);

  useEffect(() => {
    if (!connected) return;

    const handlePresence = ({ userId, displayName, status }) => {
      setOnlineUsers(prev => {
        const next = { ...prev };
        if (status === 'online') next[userId] = displayName || userId;
        else delete next[userId];
        return next;
      });
    };

    const handleTyping = ({ userId, displayName, isTyping }) => {
      setTypingUsers(prev => {
        const next = { ...prev };
        if (isTyping) next[userId] = displayName || userId;
        else delete next[userId];
        return next;
      });
    };

    on('chat:presence', handlePresence);
    on('chat:typing', handleTyping);

    return () => {
      off('chat:presence', handlePresence);
      off('chat:typing', handleTyping);
    };
  }, [connected, on, off]);

  const sendMessage = useCallback((text, media, dmTo) => {
    emit('chat:message', { classId, text, media, dmTo });
  }, [classId, emit]);

  const sendTyping = useCallback((isTyping) => {
    emit('chat:typing', { classId, isTyping });
  }, [classId, emit]);

  const onMessage = useCallback((handler) => {
    if (messageHandlerRef.current) off('chat:message', messageHandlerRef.current);
    messageHandlerRef.current = handler;
    on('chat:message', handler);
    return () => {
      off('chat:message', handler);
      messageHandlerRef.current = null;
    };
  }, [on, off]);

  const deleteMessage = useCallback((msgId) => {
    emit('chat:delete', { classId, msgId });
  }, [classId, emit]);

  return { connected, sendMessage, sendTyping, onMessage, deleteMessage, typingUsers, onlineUsers };
}

/**
 * Hook for live game real-time.
 */
export function useGameSocket() {
  const { emit, on, off, connected } = useSocket();

  const createGame = useCallback((pin, questions, grade) => {
    emit('game:create', { pin, questions, grade });
  }, [emit]);

  const joinGame = useCallback((pin, playerName, playerId) => {
    emit('game:join', { pin, playerName, playerId });
  }, [emit]);

  const startQuestion = useCallback((pin) => {
    emit('game:start-question', { pin });
  }, [emit]);

  const submitAnswer = useCallback((pin, playerId, answer, timeLeft) => {
    emit('game:answer', { pin, playerId, answer, timeLeft });
  }, [emit]);

  const revealAnswer = useCallback((pin) => {
    emit('game:reveal', { pin });
  }, [emit]);

  const nextQuestion = useCallback((pin) => {
    emit('game:next', { pin });
  }, [emit]);

  const endGame = useCallback((pin) => {
    emit('game:end', { pin });
  }, [emit]);

  return {
    connected, on, off,
    createGame, joinGame, startQuestion, submitAnswer,
    revealAnswer, nextQuestion, endGame,
  };
}

export default SocketContext;
