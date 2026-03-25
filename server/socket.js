/**
 * Real-time WebSocket Module (Socket.IO)
 *
 * Handles:
 *  - Class chat (real-time messaging with rooms)
 *  - Live game sessions (Kahoot-style multiplayer)
 *  - Presence/typing indicators
 *  - Announcement broadcasts
 */

import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { addChatMessage } from './store.js';

const JWT_SECRET = process.env.JWT_SECRET || 'quantegy-ai-jwt-secret-change-in-production-';

// In-memory live game state (survives longer than localStorage, scoped to server lifetime)
const liveGames = new Map();

export function initSocketIO(httpServer) {
  const io = new Server(httpServer, {
    cors: { origin: '*', methods: ['GET', 'POST'] },
    pingInterval: 25000,
    pingTimeout: 60000,
  });

  // Auth middleware — verify JWT on connection
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
      // Allow anonymous connections for students joining live games
      socket.user = { username: socket.handshake.auth?.displayName || 'Guest', role: 'guest' };
      return next();
    }
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      socket.user = decoded;
      next();
    } catch {
      // Still allow connection but mark as guest
      socket.user = { username: 'Guest', role: 'guest' };
      next();
    }
  });

  io.on('connection', (socket) => {
    const user = socket.user;

    // ─── Chat Rooms ────────────────────────────────────────────
    socket.on('chat:join', (classId) => {
      socket.join(`chat:${classId}`);
      socket.classId = classId;
      io.to(`chat:${classId}`).emit('chat:presence', {
        userId: user.username,
        displayName: user.displayName || user.username,
        status: 'online',
      });
    });

    socket.on('chat:leave', (classId) => {
      socket.leave(`chat:${classId}`);
      io.to(`chat:${classId}`).emit('chat:presence', {
        userId: user.username,
        status: 'offline',
      });
    });

    socket.on('chat:message', (data) => {
      const { classId, text, media, dmTo } = data;
      if (!classId) return;

      const msg = {
        id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        classId,
        text: text || '',
        media: media || null,
        authorId: user.username,
        authorName: user.displayName || user.username,
        dmTo: dmTo || null,
        createdAt: new Date().toISOString(),
      };

      // Persist to server store
      addChatMessage(msg);

      if (dmTo) {
        // DM: send only to sender and recipient in the room
        socket.emit('chat:message', msg);
        const recipientSockets = [...io.sockets.sockets.values()]
          .filter(s => s.user?.username === dmTo && s.rooms.has(`chat:${classId}`));
        recipientSockets.forEach(s => s.emit('chat:message', msg));
      } else {
        io.to(`chat:${classId}`).emit('chat:message', msg);
      }
    });

    socket.on('chat:typing', ({ classId, isTyping }) => {
      if (!classId) return;
      socket.to(`chat:${classId}`).emit('chat:typing', {
        userId: user.username,
        displayName: user.displayName || user.username,
        isTyping,
      });
    });

    socket.on('chat:delete', ({ classId, msgId }) => {
      if (!classId || !msgId) return;
      io.to(`chat:${classId}`).emit('chat:delete', { msgId });
    });

    // ─── Live Game ─────────────────────────────────────────────

    socket.on('game:create', (data) => {
      const { pin, questions, grade } = data;
      if (!pin) return;

      const game = {
        pin,
        host: user.username,
        hostSocketId: socket.id,
        phase: 'lobby',
        questions: questions || [],
        currentQ: 0,
        players: [],
        answers: {},
        scores: {},
        grade: grade || 'grade3',
        createdAt: Date.now(),
      };
      liveGames.set(pin, game);
      socket.join(`game:${pin}`);
      socket.gamePin = pin;
      socket.emit('game:created', { pin });
    });

    socket.on('game:join', ({ pin, playerName, playerId }) => {
      const game = liveGames.get(pin);
      if (!game) return socket.emit('game:error', { error: 'Game not found.' });
      if (game.phase !== 'lobby') return socket.emit('game:error', { error: 'Game already started.' });

      const id = playerId || `p-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const player = { id, name: playerName || user.displayName || user.username, socketId: socket.id };

      if (!game.players.some(p => p.id === id)) {
        game.players.push(player);
        game.scores[id] = 0;
      }

      socket.join(`game:${pin}`);
      socket.gamePin = pin;
      socket.playerId = id;

      io.to(`game:${pin}`).emit('game:player-joined', {
        players: game.players.map(p => ({ id: p.id, name: p.name })),
        newPlayer: { id, name: player.name },
      });
      socket.emit('game:joined', { pin, playerId: id, players: game.players.map(p => ({ id: p.id, name: p.name })) });
    });

    socket.on('game:start-question', ({ pin }) => {
      const game = liveGames.get(pin);
      if (!game || game.host !== user.username) return;

      game.phase = 'question';
      game.answers = {};
      const q = game.questions[game.currentQ];
      if (!q) return;

      io.to(`game:${pin}`).emit('game:question', {
        index: game.currentQ,
        total: game.questions.length,
        question: q.question || q.text,
        options: q.options,
        timeLimit: q.timeLimit || 20,
      });
    });

    socket.on('game:answer', ({ pin, playerId, answer, timeLeft }) => {
      const game = liveGames.get(pin);
      if (!game || game.phase !== 'question') return;

      if (!game.answers[game.currentQ]) game.answers[game.currentQ] = {};
      game.answers[game.currentQ][playerId] = { answer, timeLeft: timeLeft || 0, timestamp: Date.now() };

      // Notify host of answer count
      const answerCount = Object.keys(game.answers[game.currentQ]).length;
      io.to(game.hostSocketId).emit('game:answer-received', {
        playerId,
        answerCount,
        totalPlayers: game.players.length,
      });
    });

    socket.on('game:reveal', ({ pin }) => {
      const game = liveGames.get(pin);
      if (!game || game.host !== user.username) return;

      game.phase = 'reveal';
      const q = game.questions[game.currentQ];
      const correct = q?.correct;
      const questionAnswers = game.answers[game.currentQ] || {};

      // Calculate scores
      for (const [pid, ans] of Object.entries(questionAnswers)) {
        if (ans.answer === correct) {
          const timeBonus = Math.round((ans.timeLeft || 0) * 50);
          const base = 1000;
          game.scores[pid] = (game.scores[pid] || 0) + base + timeBonus;
        }
      }

      io.to(`game:${pin}`).emit('game:reveal', {
        correct,
        scores: game.scores,
        answers: Object.fromEntries(
          Object.entries(questionAnswers).map(([pid, a]) => [pid, a.answer])
        ),
      });
    });

    socket.on('game:next', ({ pin }) => {
      const game = liveGames.get(pin);
      if (!game || game.host !== user.username) return;

      game.currentQ++;
      if (game.currentQ >= game.questions.length) {
        game.phase = 'finished';
        io.to(`game:${pin}`).emit('game:finished', { scores: game.scores });
        return;
      }

      game.phase = 'question';
      game.answers[game.currentQ] = {};
      const q = game.questions[game.currentQ];

      io.to(`game:${pin}`).emit('game:question', {
        index: game.currentQ,
        total: game.questions.length,
        question: q.question || q.text,
        options: q.options,
        timeLimit: q.timeLimit || 20,
      });
    });

    socket.on('game:end', ({ pin }) => {
      const game = liveGames.get(pin);
      if (!game) return;
      io.to(`game:${pin}`).emit('game:ended', { scores: game.scores });
      liveGames.delete(pin);
    });

    // ─── Announcements (broadcast to class) ────────────────────

    socket.on('announcement:new', ({ classId, announcement }) => {
      if (!classId || !announcement) return;
      io.to(`chat:${classId}`).emit('announcement:new', announcement);
    });

    // ─── Disconnect ────────────────────────────────────────────

    socket.on('disconnect', () => {
      // Clean up chat presence
      if (socket.classId) {
        io.to(`chat:${socket.classId}`).emit('chat:presence', {
          userId: user.username,
          status: 'offline',
        });
      }

      // Clean up game
      if (socket.gamePin) {
        const game = liveGames.get(socket.gamePin);
        if (game) {
          if (game.host === user.username) {
            io.to(`game:${socket.gamePin}`).emit('game:ended', { scores: game.scores, reason: 'Host disconnected.' });
            liveGames.delete(socket.gamePin);
          } else {
            io.to(`game:${socket.gamePin}`).emit('game:player-left', {
              playerId: socket.playerId,
              players: game.players.filter(p => p.socketId !== socket.id).map(p => ({ id: p.id, name: p.name })),
            });
          }
        }
      }
    });
  });

  // Clean up stale games every 5 minutes
  setInterval(() => {
    const now = Date.now();
    for (const [pin, game] of liveGames) {
      if (now - game.createdAt > 3600000) { // 1 hour
        liveGames.delete(pin);
      }
    }
  }, 300000);

  return io;
}
