import React, { useState, useCallback, useRef } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { saveGameResult } from '../utils/storage';
import GameReview from '../components/GameReview';
import LoopContinueButton from '../components/LoopContinueButton';
import useGameReturn from '../hooks/useGameReturn';
import qbotImg from '../assets/qbot.svg';

/* ═══════════════════════════════════════════════════════════════
   QBOT'S SHOP — RPG Shopkeeper Financial Literacy Game
   QBot runs a fantasy shop. You're an adventurer buying supplies!
   Calculate totals, make change, earn gold reputation.
   ═══════════════════════════════════════════════════════════════ */

let _ac;
function ac() { if (!_ac) _ac = new (window.AudioContext || window.webkitAudioContext)(); if (_ac.state === 'suspended') _ac.resume(); return _ac; }
function tone(f, d, t = 'sine', v = 0.12) { try { const c = ac(), o = c.createOscillator(), g = c.createGain(); o.type = t; o.frequency.value = f; g.gain.setValueAtTime(v, c.currentTime); g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + d); o.connect(g); g.connect(c.destination); o.start(); o.stop(c.currentTime + d); } catch (_) {} }
const SFX = {
  coin:    () => { tone(1200, 0.08, 'sine', 0.06); setTimeout(() => tone(1600, 0.06, 'sine', 0.04), 50); },
  bill:    () => tone(400, 0.12, 'triangle', 0.06),
  correct: () => { tone(523, 0.12); setTimeout(() => tone(659, 0.12), 80); setTimeout(() => tone(784, 0.15), 160); },
  wrong:   () => tone(200, 0.3, 'sawtooth', 0.06),
  levelUp: () => { [392, 523, 659, 784, 1047].forEach((f, i) => setTimeout(() => tone(f, 0.2, 'sine', 0.1), i * 80)); },
  doorCreak:() => { tone(120, 0.4, 'sawtooth', 0.04); setTimeout(() => tone(90, 0.3, 'sawtooth', 0.03), 200); },
  doorBell:() => { tone(880, 0.15); setTimeout(() => tone(1100, 0.1), 120); },
  footsteps:() => { [0,120,240,360].forEach(d => setTimeout(() => tone(200 + Math.random()*80, 0.06, 'triangle', 0.04), d)); },
  win:     () => { [523,659,784,1047,1319].forEach((f,i) => setTimeout(() => tone(f, 0.2, 'sine', 0.1), i * 90)); },
};

const shuffle = a => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
const pick = a => a[Math.floor(Math.random() * a.length)];
const randInt = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const fmt = (cents) => `$${(cents / 100).toFixed(2)}`;

/* ── Player avatars ── */
const AVATARS = [
  { id: 'knight',  emoji: '🛡️', name: 'Knight',  title: 'Sir' },
  { id: 'wizard',  emoji: '🧙', name: 'Wizard',  title: 'Archmage' },
  { id: 'ranger',  emoji: '🏹', name: 'Ranger',  title: 'Scout' },
  { id: 'pirate',  emoji: '🏴‍☠️', name: 'Pirate',  title: 'Captain' },
  { id: 'dragon',  emoji: '🐉', name: 'Dragon Tamer', title: 'Warden' },
  { id: 'fairy',   emoji: '🧚', name: 'Fairy',   title: 'Enchanter' },
];

/* ── Customers with themed item pools that match their character ── */
const CUSTOMERS = [
  {
    name: 'Braveheart the Bold', emoji: '⚔️',
    greeting: "Hail, shopkeep! I need supplies for my quest!",
    items: [
      { name: 'Health Potion',   emoji: '🧪', minPrice: 75,  maxPrice: 200 },
      { name: 'Iron Sword',      emoji: '⚔️', minPrice: 200, maxPrice: 500 },
      { name: 'Steel Shield',    emoji: '🛡️', minPrice: 250, maxPrice: 600 },
      { name: 'Battle Rations',  emoji: '🥩', minPrice: 100, maxPrice: 250 },
      { name: 'Healing Salve',   emoji: '🩹', minPrice: 50,  maxPrice: 150 },
      { name: 'Torch Bundle',    emoji: '🔦', minPrice: 75,  maxPrice: 175 },
    ],
  },
  {
    name: 'Elara the Enchantress', emoji: '✨',
    greeting: "Greetings! I require magical provisions.",
    items: [
      { name: 'Spell Scroll',    emoji: '📜', minPrice: 150, maxPrice: 400 },
      { name: 'Mana Potion',     emoji: '🧪', minPrice: 100, maxPrice: 250 },
      { name: 'Crystal Orb',     emoji: '🔮', minPrice: 200, maxPrice: 500 },
      { name: 'Enchanted Ink',   emoji: '🖋️', minPrice: 75,  maxPrice: 200 },
      { name: 'Star Dust',       emoji: '✨', minPrice: 50,  maxPrice: 150 },
      { name: 'Mystic Candle',   emoji: '🕯️', minPrice: 30,  maxPrice: 100 },
    ],
  },
  {
    name: 'Thorin Ironshield', emoji: '🛡️',
    greeting: "I need armor and weapons, and I need them fast!",
    items: [
      { name: 'Iron Helmet',     emoji: '⛑️', minPrice: 200, maxPrice: 450 },
      { name: 'Chain Mail',      emoji: '🛡️', minPrice: 300, maxPrice: 700 },
      { name: 'War Hammer',      emoji: '🔨', minPrice: 250, maxPrice: 550 },
      { name: 'Shield Polish',   emoji: '✨', minPrice: 50,  maxPrice: 150 },
      { name: 'Gauntlets',       emoji: '🧤', minPrice: 150, maxPrice: 350 },
      { name: 'Leather Straps',  emoji: '🪢', minPrice: 25,  maxPrice: 100 },
    ],
  },
  {
    name: 'Luna Moonwhisper', emoji: '🌙',
    greeting: "The stars guided me here... I need stargazing supplies.",
    items: [
      { name: 'Moon Crystal',    emoji: '🌙', minPrice: 150, maxPrice: 400 },
      { name: 'Star Chart',      emoji: '🗺️', minPrice: 100, maxPrice: 300 },
      { name: 'Night Lantern',   emoji: '🏮', minPrice: 75,  maxPrice: 200 },
      { name: 'Dream Tea',       emoji: '🍵', minPrice: 50,  maxPrice: 125 },
      { name: 'Silver Mirror',   emoji: '🪞', minPrice: 125, maxPrice: 350 },
      { name: 'Moonlit Milk',    emoji: '🥛', minPrice: 30,  maxPrice: 100 },
    ],
  },
  {
    name: 'Captain Stormbeard', emoji: '⚓',
    greeting: "Ahoy! Stock me up for the voyage!",
    items: [
      { name: 'Rope Coil',       emoji: '🪢', minPrice: 75,  maxPrice: 200 },
      { name: 'Compass',         emoji: '🧭', minPrice: 150, maxPrice: 350 },
      { name: 'Sea Biscuits',    emoji: '🍪', minPrice: 50,  maxPrice: 125 },
      { name: 'Rum Barrel',      emoji: '🪣', minPrice: 200, maxPrice: 450 },
      { name: 'Spyglass',        emoji: '🔭', minPrice: 250, maxPrice: 500 },
      { name: 'Fishing Net',     emoji: '🥅', minPrice: 100, maxPrice: 250 },
    ],
  },
  {
    name: 'Pip the Swift', emoji: '🐾',
    greeting: "Quick! I'm on a secret mission! I need stealth gear!",
    items: [
      { name: 'Smoke Bomb',      emoji: '💨', minPrice: 75,  maxPrice: 200 },
      { name: 'Lockpick Set',    emoji: '🔑', minPrice: 100, maxPrice: 250 },
      { name: 'Dark Cloak',      emoji: '🧥', minPrice: 150, maxPrice: 350 },
      { name: 'Silent Boots',    emoji: '👢', minPrice: 125, maxPrice: 300 },
      { name: 'Trail Snack',     emoji: '🥜', minPrice: 25,  maxPrice: 75 },
      { name: 'Grappling Hook',  emoji: '🪝', minPrice: 200, maxPrice: 400 },
    ],
  },
  {
    name: 'Grimjaw the Giant', emoji: '🏔️',
    greeting: "HUNGRY. NEED FOOD. NOW.",
    items: [
      { name: 'Giant Drumstick', emoji: '🍗', minPrice: 200, maxPrice: 450 },
      { name: 'Mega Pie',        emoji: '🥧', minPrice: 150, maxPrice: 350 },
      { name: 'Dragon Steak',    emoji: '🥩', minPrice: 250, maxPrice: 500 },
      { name: 'Barrel of Soup',  emoji: '🍲', minPrice: 175, maxPrice: 400 },
      { name: 'Mountain Bread',  emoji: '🍞', minPrice: 50,  maxPrice: 150 },
      { name: 'Honey Cake',      emoji: '🍰', minPrice: 100, maxPrice: 250 },
    ],
  },
  {
    name: 'Sage Willowroot', emoji: '🌿',
    greeting: "Blessings! I need herbs and healing supplies.",
    items: [
      { name: 'Healing Herbs',   emoji: '🌿', minPrice: 50,  maxPrice: 150 },
      { name: 'Antidote Vial',   emoji: '🧪', minPrice: 100, maxPrice: 250 },
      { name: 'Bandage Roll',    emoji: '🩹', minPrice: 25,  maxPrice: 75 },
      { name: 'Herbal Tea',      emoji: '🍵', minPrice: 30,  maxPrice: 100 },
      { name: 'Nature Staff',    emoji: '🪵', minPrice: 200, maxPrice: 450 },
      { name: 'Flower Essence',  emoji: '🌸', minPrice: 75,  maxPrice: 200 },
    ],
  },
  {
    name: 'Blaze the Firewalker', emoji: '🔥',
    greeting: "I need fire-resistant gear for the volcano caves!",
    items: [
      { name: 'Fire Shield',     emoji: '🛡️', minPrice: 250, maxPrice: 550 },
      { name: 'Heat Potion',     emoji: '🧪', minPrice: 100, maxPrice: 250 },
      { name: 'Lava Boots',      emoji: '👢', minPrice: 200, maxPrice: 450 },
      { name: 'Flame Cloak',     emoji: '🧥', minPrice: 175, maxPrice: 400 },
      { name: 'Fire Salt',       emoji: '🧂', minPrice: 50,  maxPrice: 125 },
      { name: 'Dragon Scale',    emoji: '🐉', minPrice: 300, maxPrice: 600 },
    ],
  },
  {
    name: 'Frost the Wanderer', emoji: '❄️',
    greeting: "I've traveled through the frozen wastes. I need warm supplies.",
    items: [
      { name: 'Warm Cloak',      emoji: '🧣', minPrice: 150, maxPrice: 350 },
      { name: 'Hot Cocoa Mix',   emoji: '☕', minPrice: 50,  maxPrice: 125 },
      { name: 'Fur Boots',       emoji: '👢', minPrice: 175, maxPrice: 400 },
      { name: 'Ice Pick',        emoji: '⛏️', minPrice: 100, maxPrice: 250 },
      { name: 'Frost Salve',     emoji: '🩹', minPrice: 75,  maxPrice: 200 },
      { name: 'Fire Flint',      emoji: '🪨', minPrice: 25,  maxPrice: 75 },
    ],
  },
  {
    name: 'Shadow the Rogue', emoji: '🗡️',
    greeting: "Keep it quiet... I need blades and poisons.",
    items: [
      { name: 'Throwing Knives', emoji: '🗡️', minPrice: 150, maxPrice: 350 },
      { name: 'Poison Vial',     emoji: '🧪', minPrice: 100, maxPrice: 250 },
      { name: 'Shadow Cloak',    emoji: '🧥', minPrice: 200, maxPrice: 450 },
      { name: 'Disguise Kit',    emoji: '🎭', minPrice: 125, maxPrice: 300 },
      { name: 'Lockpicks',       emoji: '🔑', minPrice: 75,  maxPrice: 175 },
      { name: 'Smoke Pellets',   emoji: '💨', minPrice: 50,  maxPrice: 125 },
    ],
  },
  {
    name: 'Princess Goldleaf', emoji: '👑',
    greeting: "I expect only the finest luxury goods, shopkeep!",
    items: [
      { name: 'Golden Ring',     emoji: '💍', minPrice: 300, maxPrice: 700 },
      { name: 'Silk Scarf',      emoji: '🧣', minPrice: 150, maxPrice: 350 },
      { name: 'Royal Perfume',   emoji: '🌹', minPrice: 200, maxPrice: 450 },
      { name: 'Jeweled Mirror',  emoji: '🪞', minPrice: 250, maxPrice: 500 },
      { name: 'Fine Chocolate',  emoji: '🍫', minPrice: 100, maxPrice: 250 },
      { name: 'Pearl Necklace',  emoji: '📿', minPrice: 350, maxPrice: 800 },
    ],
  },
];

const MONEY = [
  { value: 10000, label: '$100', type: 'bill', color: '#059669' },
  { value: 2000,  label: '$20',  type: 'bill', color: '#0d9488' },
  { value: 1000,  label: '$10',  type: 'bill', color: '#0284c7' },
  { value: 500,   label: '$5',   type: 'bill', color: '#7c3aed' },
  { value: 100,   label: '$1',   type: 'bill', color: '#4f46e5' },
  { value: 25,    label: '25¢',  type: 'coin', color: '#d97706' },
  { value: 10,    label: '10¢',  type: 'coin', color: '#9ca3af' },
  { value: 5,     label: '5¢',   type: 'coin', color: '#78716c' },
  { value: 1,     label: '1¢',   type: 'coin', color: '#b45309' },
];

const DIFFICULTY = {
  easy:   { label: 'Apprentice',  emoji: '🌱', rounds: 8,  maxItems: 2, maxPrice: 200,  roundTo: 25, types: ['total'],            payExtra: [100, 200], xpPerRound: 10 },
  medium: { label: 'Journeyman',  emoji: '🔥', rounds: 10, maxItems: 3, maxPrice: 500,  roundTo: 5,  types: ['total', 'change'],  payExtra: [50, 300],  xpPerRound: 15 },
  hard:   { label: 'Master',      emoji: '💎', rounds: 12, maxItems: 4, maxPrice: 1000, roundTo: 1,  types: ['total', 'change'],  payExtra: [25, 500],  xpPerRound: 25 },
};

/* ── QBot shopkeeper dialogue — RPG style ── */
const QBOT_DIALOGUE = {
  welcome: [
    "Ah, a new adventurer! Welcome to QBot's Emporium!",
    "Step right in, traveler! The finest goods in all the land await!",
    "Well met, friend! My shelves are stocked and ready!",
  ],
  customerArrives: [
    "A customer approaches the counter...",
    "The door creaks open... a new face!",
    "Another brave soul enters the shop!",
  ],
  correctTotal: [
    "Excellent math, adventurer! The gold is counted perfectly!",
    "That's the exact amount! You have a merchant's eye!",
    "Well done! The coins ring true!",
    "Perfect! You'd make a fine shopkeeper yourself!",
  ],
  correctChange: [
    "The change is exact! A true master of coin!",
    "Perfectly counted! Not a single copper astray!",
    "Spot on! The customer leaves satisfied!",
    "Flawless change-making! Your reputation grows!",
  ],
  wrong: [
    "Hmm, that's not quite right... count again, adventurer!",
    "The coins don't add up... try once more!",
    "Close, but a merchant must be precise! Check your math!",
    "Careful with those coins! The count seems off...",
  ],
  streak3: [
    "Three in a row! Your skill impresses me!",
    "A triple streak! The customers speak highly of you!",
  ],
  streak5: [
    "FIVE perfect transactions! You're legendary!",
    "Unstoppable! Tales of your skill spread across the land!",
  ],
  gameOverPerfect: [
    "A PERFECT day at the shop! You are truly the greatest merchant in the realm!",
    "Not a single mistake! The kingdom shall hear of this legendary cashier!",
  ],
  gameOverGood: [
    "A fine day of work! The shop prospers thanks to you, adventurer!",
    "Well done! Come back anytime — you've earned your keep!",
  ],
  gameOverOk: [
    "The day is done. With practice, you'll master the art of coin!",
    "Not bad for a newcomer! Return tomorrow and sharpen your skills!",
  ],
};

function roundToNearest(val, nearest) {
  return Math.round(val / nearest) * nearest;
}

function generateRound(diff, roundNum) {
  const type = pick(diff.types);
  const customer = pick(CUSTOMERS);
  const numItems = randInt(1, diff.maxItems);
  const chosenItems = shuffle(customer.items).slice(0, numItems).map(item => {
    const raw = randInt(item.minPrice, Math.min(item.maxPrice, diff.maxPrice));
    const price = Math.max(diff.roundTo, roundToNearest(raw, diff.roundTo));
    return { ...item, price };
  });
  const total = chosenItems.reduce((s, it) => s + it.price, 0);

  if (type === 'change') {
    const extra = randInt(diff.payExtra[0], diff.payExtra[1]);
    const paid = roundToNearest(total + extra, 100);
    const changeNeeded = paid - total;
    return { type, items: chosenItems, total, customer, paid, changeNeeded, roundNum };
  }
  return { type, items: chosenItems, total, customer, roundNum };
}

/* ── Main component ── */
export default function QBotShop() {
  const [searchParams] = useSearchParams();
  const assignmentId = searchParams.get('assignmentId');
  const classId = searchParams.get('classId');
  const { returnUrl, goBack } = useGameReturn();

  const [phase, setPhase] = useState('avatar');
  const [avatar, setAvatar] = useState(null);
  const [difficulty, setDifficulty] = useState(null);
  const [diff, setDiff] = useState(null);
  const [round, setRound] = useState(null);
  const [roundIdx, setRoundIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [xp, setXp] = useState(0);
  const [totalRounds, setTotalRounds] = useState(0);
  const [placed, setPlaced] = useState([]);
  const [qbotMsg, setQbotMsg] = useState(pick(QBOT_DIALOGUE.welcome));
  const [feedback, setFeedback] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [history, setHistory] = useState([]);
  const [showHowTo, setShowHowTo] = useState(false);
  const [streak, setStreak] = useState(0);
  const [customerEntering, setCustomerEntering] = useState(false);
  const [doorOpen, setDoorOpen] = useState(false);
  const [itemsVisible, setItemsVisible] = useState(false);
  const [scenePhase, setScenePhase] = useState('ready');
  const lockRef = useRef(false);

  const placedTotal = placed.reduce((s, m) => s + m.value, 0);
  const targetAmount = round ? (round.type === 'change' ? round.changeNeeded : round.total) : 0;
  const level = Math.floor(xp / 50) + 1;

  const playEntrance = useCallback(() => {
    setScenePhase('door');
    setDoorOpen(true);
    setCustomerEntering(false);
    setItemsVisible(false);
    setQbotMsg(pick(QBOT_DIALOGUE.customerArrives));

    setTimeout(() => { SFX.doorCreak(); }, 100);
    setTimeout(() => { SFX.doorBell(); }, 400);
    setTimeout(() => { setScenePhase('walk'); setCustomerEntering(true); SFX.footsteps(); }, 700);
    setTimeout(() => { setScenePhase('greet'); setDoorOpen(false); }, 1400);
    setTimeout(() => { setScenePhase('items'); setItemsVisible(true); setCustomerEntering(false); }, 1900);
    setTimeout(() => { setScenePhase('ready'); lockRef.current = false; }, 2400);
  }, []);

  const startGame = useCallback((lvl) => {
    const d = DIFFICULTY[lvl];
    const r = generateRound(d, 1);
    setDifficulty(lvl);
    setDiff(d);
    setRoundIdx(0);
    setRound(r);
    setScore(0);
    setXp(0);
    setTotalRounds(d.rounds);
    setPlaced([]);
    setFeedback(null);
    setGameOver(false);
    setHistory([]);
    setStreak(0);
    setPhase('game');
    lockRef.current = true;
    playEntrance();
  }, [playEntrance]);

  const addMoney = useCallback((moneyItem) => {
    if (lockRef.current || !round) return;
    moneyItem.type === 'coin' ? SFX.coin() : SFX.bill();
    setPlaced(prev => [...prev, { ...moneyItem, id: `${moneyItem.value}-${Date.now()}-${Math.random()}` }]);
  }, [round]);

  const removeLast = useCallback(() => { if (!lockRef.current) setPlaced(prev => prev.slice(0, -1)); }, []);
  const clearPlaced = useCallback(() => { if (!lockRef.current) setPlaced([]); }, []);

  const submitAnswer = useCallback(() => {
    if (lockRef.current || !round) return;
    lockRef.current = true;
    const correct = placedTotal === targetAmount;

    if (correct) {
      SFX.correct();
      setScore(s => s + 1);
      const newXp = xp + diff.xpPerRound;
      setXp(newXp);
      if (Math.floor(newXp / 50) > Math.floor(xp / 50)) SFX.levelUp();
      setStreak(s => {
        const ns = s + 1;
        if (ns === 5) setQbotMsg(pick(QBOT_DIALOGUE.streak5));
        else if (ns === 3) setQbotMsg(pick(QBOT_DIALOGUE.streak3));
        else setQbotMsg(pick(round.type === 'change' ? QBOT_DIALOGUE.correctChange : QBOT_DIALOGUE.correctTotal));
        return ns;
      });
      setFeedback({ correct: true, msg: round.type === 'change' ? `Correct change: ${fmt(round.changeNeeded)}` : `Correct! Total: ${fmt(round.total)}` });
    } else {
      SFX.wrong();
      setStreak(0);
      setFeedback({ correct: false, msg: `Needed ${fmt(targetAmount)}, you placed ${fmt(placedTotal)}` });
      setQbotMsg(pick(QBOT_DIALOGUE.wrong));
    }

    setHistory(prev => [...prev, {
      question: round.type === 'change'
        ? `${round.customer.name}: ${round.items.map(i => `${i.emoji} ${i.name} (${fmt(i.price)})`).join(', ')} — Total: ${fmt(round.total)}. Paid ${fmt(round.paid)}. Change?`
        : `${round.customer.name}: ${round.items.map(i => `${i.emoji} ${i.name} (${fmt(i.price)})`).join(', ')}. Total?`,
      correctAnswer: fmt(targetAmount),
      studentAnswer: fmt(placedTotal),
      correct,
    }]);

    setTimeout(() => {
      const nextIdx = roundIdx + 1;
      if (nextIdx >= totalRounds) {
        setGameOver(true);
        const finalScore = score + (correct ? 1 : 0);
        setQbotMsg(pick(
          finalScore === totalRounds ? QBOT_DIALOGUE.gameOverPerfect :
          finalScore >= totalRounds * 0.7 ? QBOT_DIALOGUE.gameOverGood :
          QBOT_DIALOGUE.gameOverOk
        ));
        SFX.win();
        saveGameResult({ gameName: "QBot's Shop", score: finalScore, total: totalRounds, assignmentId, classId });
      } else {
        const nextRound = generateRound(diff, nextIdx + 1);
        setRoundIdx(nextIdx);
        setRound(nextRound);
        setPlaced([]);
        setFeedback(null);
        lockRef.current = true;
        playEntrance();
      }
    }, 1800);
  }, [round, placedTotal, targetAmount, roundIdx, totalRounds, score, xp, diff, assignmentId, classId]);

  if (showReview) {
    return <GameReview gameName="QBot's Shop" results={history} onBack={() => setShowReview(false)} />;
  }

  /* ── PHASE 1: Avatar selection ── */
  if (phase === 'avatar') {
    return (
      <div style={{ minHeight: '100vh', background: BG_SHOP, fontFamily: FONT, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 16px 40px', overflowY: 'auto' }}>
        {returnUrl ? (
          <button type="button" onClick={goBack} style={{ position: 'absolute', top: 16, left: 16, background: 'none', border: 'none', color: '#34d399', fontWeight: 700, fontSize: 13, cursor: 'pointer', padding: 0 }}>← Continue</button>
        ) : (
          <Link to="/games" style={{ position: 'absolute', top: 16, left: 16, color: '#94a3b8', textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>← Games</Link>
        )}

        {/* Shop sign */}
        <div style={{
          background: 'linear-gradient(135deg, #92400e, #78350f)', borderRadius: 16,
          padding: '14px 28px', border: '3px solid #b45309', marginBottom: 16, marginTop: 8,
          boxShadow: '0 8px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
          position: 'relative',
        }}>
          <div style={{ fontSize: 24, fontWeight: 900, color: '#fde68a', textAlign: 'center', textShadow: '0 2px 4px rgba(0,0,0,0.4)', letterSpacing: 1 }}>
            ⚔️ QBot's Emporium ⚔️
          </div>
          <div style={{ fontSize: 10, color: '#fbbf24', textAlign: 'center', fontWeight: 600, opacity: 0.8, marginTop: 2 }}>
            "Finest goods in all the land!"
          </div>
        </div>

        {/* Shop scene with QBot */}
        <ShopScene qbotMsg={pick(QBOT_DIALOGUE.welcome)} showCustomer={false} />

        <div style={{ fontSize: 16, fontWeight: 800, color: '#fde68a', marginBottom: 8, marginTop: 16, textAlign: 'center' }}>
          Choose Your Adventurer
        </div>
        <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 14, textAlign: 'center' }}>
          Who walks through the shop door today?
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, maxWidth: 340, width: '100%', marginBottom: 20 }}>
          {AVATARS.map(a => (
            <button key={a.id} onClick={() => { setAvatar(a); setPhase('difficulty'); }}
              style={{
                padding: '12px 8px', borderRadius: 12,
                background: 'rgba(120,53,15,0.3)', border: '2px solid rgba(180,83,9,0.3)',
                color: '#fde68a', cursor: 'pointer', textAlign: 'center',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.target.style.background = 'rgba(180,83,9,0.4)'; e.target.style.borderColor = '#b45309'; }}
              onMouseLeave={e => { e.target.style.background = 'rgba(120,53,15,0.3)'; e.target.style.borderColor = 'rgba(180,83,9,0.3)'; }}
            >
              <div style={{ fontSize: 30, marginBottom: 4 }}>{a.emoji}</div>
              <div style={{ fontSize: 12, fontWeight: 800 }}>{a.name}</div>
            </button>
          ))}
        </div>
        {returnUrl && <LoopContinueButton onClick={goBack} />}
      </div>
    );
  }

  /* ── PHASE 2: Difficulty / Quest selection ── */
  if (phase === 'difficulty') {
    return (
      <div style={{ minHeight: '100vh', background: BG_SHOP, fontFamily: FONT, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 16px 40px', overflowY: 'auto' }}>
        {returnUrl ? (
          <button type="button" onClick={goBack} style={{ position: 'absolute', top: 16, left: 16, background: 'none', border: 'none', color: '#34d399', fontWeight: 700, fontSize: 13, cursor: 'pointer', padding: 0 }}>← Continue</button>
        ) : (
          <Link to="/games" style={{ position: 'absolute', top: 16, left: 16, color: '#94a3b8', textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>← Games</Link>
        )}

        {/* Player identity */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, marginTop: 8 }}>
          <div style={{ fontSize: 36 }}>{avatar.emoji}</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#fde68a' }}>{avatar.title} {avatar.name}</div>
            <div style={{ fontSize: 10, color: '#94a3b8' }}>Ready for a shift at QBot's Emporium</div>
          </div>
        </div>

        <ShopScene qbotMsg={`Ah, ${avatar.title} ${avatar.name}! Ready to learn the ways of the coin? Pick your quest!`} showCustomer={false} />

        {/* How it works */}
        <div style={{
          maxWidth: 420, width: '100%', background: 'rgba(120,53,15,0.15)',
          borderRadius: 14, padding: 16, marginTop: 16, marginBottom: 16,
          border: '1px solid rgba(180,83,9,0.2)',
        }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: '#fde68a', marginBottom: 10, textAlign: 'center' }}>📜 The Shopkeeper's Guide</div>
          <div style={{ fontSize: 11, color: '#d6d3d1', lineHeight: 1.6 }}>
            <div style={{ marginBottom: 8 }}>⚔️ <strong style={{ color: '#fde68a' }}>Adventurers</strong> visit the shop and buy items with real prices.</div>
            <div style={{ marginBottom: 8 }}>🧮 For <strong style={{ color: '#22c55e' }}>Total</strong> quests — add up the prices, then place the exact bills & coins.</div>
            <div style={{ marginBottom: 8 }}>💵 For <strong style={{ color: '#fbbf24' }}>Change</strong> quests — the customer overpays, and you figure out how much to give back!</div>
            <div>🪙 Tap <strong style={{ color: '#c4b5fd' }}>bills and coins</strong> to build your amount, then hit Submit!</div>
          </div>
        </div>

        <div style={{ fontSize: 14, fontWeight: 800, color: '#fde68a', marginBottom: 10, textAlign: 'center' }}>Choose Your Quest</div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 460, width: '100%' }}>
          {Object.entries(DIFFICULTY).map(([key, d]) => (
            <button key={key} onClick={() => startGame(key)} style={{
              padding: '16px 16px', borderRadius: 14, cursor: 'pointer', minWidth: 130,
              background: 'linear-gradient(135deg, rgba(120,53,15,0.4), rgba(92,45,13,0.5))',
              border: '2px solid rgba(180,83,9,0.4)', color: '#fde68a',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flex: '1 1 auto',
              transition: 'all 0.2s',
            }}>
              <div style={{ fontSize: 26 }}>{d.emoji}</div>
              <div style={{ fontSize: 14, fontWeight: 800 }}>{d.label}</div>
              <div style={{ fontSize: 10, opacity: 0.7, textAlign: 'center', lineHeight: 1.4, color: '#d6d3d1' }}>
                {key === 'easy' && 'Totals only\nRound prices'}
                {key === 'medium' && 'Totals + change\nSmaller coins'}
                {key === 'hard' && 'Exact cents\nTricky change'}
              </div>
              <div style={{ fontSize: 10, color: '#b45309', fontWeight: 700 }}>{d.rounds} customers · {d.xpPerRound} XP each</div>
            </button>
          ))}
        </div>
        {returnUrl && <LoopContinueButton onClick={goBack} />}
      </div>
    );
  }

  /* ── PHASE 3: Gameplay ── */
  const howToOverlay = showHowTo && (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, backdropFilter: 'blur(6px)', animation: 'fadeIn 0.3s ease' }}>
      <div style={{ background: 'linear-gradient(135deg,#44200a,#2c1504)', borderRadius: 20, padding: 24, maxWidth: 380, width: '100%', border: '2px solid #b45309', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
        <div style={{ fontSize: 18, fontWeight: 900, color: '#fde68a', marginBottom: 14, textAlign: 'center' }}>📜 Shopkeeper's Guide</div>
        <div style={{ fontSize: 12, color: '#d6d3d1', lineHeight: 1.6 }}>
          <Step n={1} c="#fbbf24">Adventurers visit with items. Check the <strong style={{ color: '#fde68a' }}>prices</strong>!</Step>
          <Step n={2} c="#22c55e">For <strong style={{ color: '#22c55e' }}>Total</strong> rounds — add up the prices, place exact bills & coins.</Step>
          <Step n={3} c="#f59e0b">For <strong style={{ color: '#fbbf24' }}>Change</strong> rounds — the customer overpays. Give back the right change!</Step>
          <Step n={4} c="#c4b5fd">Tap money to add it. Hit <strong style={{ color: '#fde68a' }}>Submit</strong> when ready!</Step>
        </div>
        <button onClick={() => setShowHowTo(false)} style={{ ...rpgBtn(), width: '100%', marginTop: 16 }}>Got it!</button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: BG_SHOP, fontFamily: FONT, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '10px 12px 24px' }}>
      {howToOverlay}

      {/* Header */}
      <div style={{ width: '100%', maxWidth: 500, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        {returnUrl ? (
          <button type="button" onClick={goBack} style={{ background: 'none', border: 'none', color: '#34d399', fontWeight: 700, fontSize: 13, cursor: 'pointer', padding: 0 }}>← Continue</button>
        ) : (
          <Link to="/games" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>← Leave</Link>
        )}
        <div style={{
          background: 'linear-gradient(135deg, #92400e, #78350f)', borderRadius: 8,
          padding: '4px 12px', border: '1px solid #b45309',
          fontSize: 12, fontWeight: 800, color: '#fde68a', textAlign: 'center',
        }}>
          ⚔️ QBot's Emporium
        </div>
        <button onClick={() => setShowHowTo(true)} style={{
          width: 24, height: 24, borderRadius: '50%', border: '1px solid rgba(180,83,9,0.4)',
          background: 'rgba(120,53,15,0.3)', color: '#fbbf24', fontSize: 13, fontWeight: 800,
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>?</button>
      </div>

      {/* XP bar */}
      <div style={{ width: '100%', maxWidth: 500, marginBottom: 6 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: '#78716c', fontWeight: 600, marginBottom: 2 }}>
          <span>Customer {roundIdx + 1} / {totalRounds}</span>
          <span>{xp} XP · {score} correct</span>
          {streak >= 2 && <span style={{ color: '#f59e0b' }}>🔥 {streak} streak</span>}
        </div>
        <div style={{ height: 5, background: 'rgba(120,53,15,0.3)', borderRadius: 4, border: '1px solid rgba(180,83,9,0.15)' }}>
          <div style={{ height: '100%', width: `${(xp % 50) / 50 * 100}%`, background: 'linear-gradient(90deg,#b45309,#d97706)', borderRadius: 4, transition: 'width 0.5s ease' }} />
        </div>
      </div>

      {/* Door animation overlay */}
      {doorOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 50, pointerEvents: 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {/* Door panels */}
          <div style={{
            position: 'absolute', top: 0, bottom: 0, left: 0, width: '50%',
            background: 'linear-gradient(90deg, #44200a, #5c2d0a)',
            borderRight: '3px solid #92400e',
            animation: 'doorOpenLeft 1s ease-in-out forwards',
            boxShadow: 'inset -10px 0 20px rgba(0,0,0,0.4)',
          }}>
            <div style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', width: 12, height: 12, borderRadius: '50%', background: '#b45309', boxShadow: '0 0 6px rgba(180,83,9,0.5)' }} />
          </div>
          <div style={{
            position: 'absolute', top: 0, bottom: 0, right: 0, width: '50%',
            background: 'linear-gradient(270deg, #44200a, #5c2d0a)',
            borderLeft: '3px solid #92400e',
            animation: 'doorOpenRight 1s ease-in-out forwards',
            boxShadow: 'inset 10px 0 20px rgba(0,0,0,0.4)',
          }}>
            <div style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', width: 12, height: 12, borderRadius: '50%', background: '#b45309', boxShadow: '0 0 6px rgba(180,83,9,0.5)' }} />
          </div>
          {/* Light beam */}
          <div style={{
            position: 'absolute', top: '30%', left: '50%', transform: 'translateX(-50%)',
            width: 0, height: 200,
            borderLeft: '40px solid transparent', borderRight: '40px solid transparent',
            borderTop: '200px solid rgba(253,230,138,0.06)',
            animation: 'lightBeam 0.8s ease-in 0.3s forwards', opacity: 0,
          }} />
        </div>
      )}

      {/* ═══ THE SHOP SCENE — RPG encounter layout ═══ */}
      {round && (
        <div style={{
          maxWidth: 500, width: '100%',
          background: 'linear-gradient(180deg, rgba(68,32,10,0.35) 0%, rgba(44,21,4,0.5) 50%, rgba(30,14,2,0.6) 100%)',
          borderRadius: 16, padding: 0, marginBottom: 8,
          border: '1px solid rgba(180,83,9,0.25)',
          position: 'relative', overflow: 'hidden',
        }}>
          {/* Ambient torches on walls */}
          <div style={{ position: 'absolute', top: 8, left: 10, fontSize: 16, animation: 'torchFlicker 2s ease-in-out infinite', zIndex: 2 }}>🔥</div>
          <div style={{ position: 'absolute', top: 8, right: 10, fontSize: 16, animation: 'torchFlicker 2s ease-in-out infinite 0.7s', zIndex: 2 }}>🔥</div>

          {/* Warm ambient glow behind QBot */}
          <div style={{ position: 'absolute', top: 0, left: 0, width: '40%', height: '100%', background: 'radial-gradient(ellipse at 20% 30%, rgba(180,83,9,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

          {/* ── Top: The Encounter — QBot behind counter, YOU in front ── */}
          <div style={{ padding: '16px 14px 0', position: 'relative' }}>

            {/* Shop interior — shelves behind QBot */}
            <div style={{
              display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 6,
              fontSize: 10, color: '#57534e', fontWeight: 600, letterSpacing: 1,
            }}>
              📦 📦 🧪 📦 🗡️ 📦 🧪 📦
            </div>

            {/* Character encounter area */}
            <div style={{
              display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
              padding: '0 8px', marginBottom: 0,
            }}>

              {/* LEFT: QBot the Shopkeeper — behind counter */}
              <div style={{ textAlign: 'center', flex: '0 0 auto' }}>
                <div style={{
                  width: 56, height: 56, borderRadius: '50%', margin: '0 auto 4px',
                  background: 'linear-gradient(135deg,#4c1d95,#2e1065)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '3px solid #b45309',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.4), 0 0 20px rgba(180,83,9,0.15)',
                  animation: scenePhase === 'greet' ? 'shopkeeperNod 0.5s ease' : 'idleBob 3s ease-in-out infinite',
                }}>
                  <img src={qbotImg} alt="QBot" style={{ width: 38 }} />
                </div>
                <div style={{ fontSize: 11, fontWeight: 800, color: '#fbbf24' }}>QBot</div>
                <div style={{ fontSize: 8, color: '#78716c' }}>Shopkeeper</div>
              </div>

              {/* CENTER: The wooden counter */}
              <div style={{ flex: 1, padding: '0 10px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end' }}>
                {/* Counter surface */}
                <div style={{
                  width: '100%', height: 10, borderRadius: 5,
                  background: 'linear-gradient(180deg, #b45309 0%, #92400e 40%, #78350f 100%)',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
                  marginBottom: 0,
                }} />
                {/* Counter front panel */}
                <div style={{
                  width: '90%', height: 20, borderRadius: '0 0 6px 6px',
                  background: 'linear-gradient(180deg, #78350f 0%, #5c2d0a 100%)',
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <div style={{ fontSize: 7, color: '#b45309', fontWeight: 700, letterSpacing: 1 }}>⚔️ EMPORIUM ⚔️</div>
                </div>
              </div>

              {/* RIGHT: YOUR AVATAR — the adventurer */}
              <div style={{ textAlign: 'center', flex: '0 0 auto' }}>
                <div style={{
                  width: 56, height: 56, borderRadius: '50%', margin: '0 auto 4px',
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '3px solid rgba(253,230,138,0.4)', fontSize: 30,
                  boxShadow: '0 4px 16px rgba(0,0,0,0.4), 0 0 20px rgba(253,230,138,0.08)',
                  animation: 'idleBob 3s ease-in-out infinite 0.5s',
                }}>
                  {avatar?.emoji}
                </div>
                <div style={{ fontSize: 11, fontWeight: 800, color: '#fde68a' }}>{avatar?.name}</div>
                <div style={{ fontSize: 8, color: '#78716c' }}>Lv.{level} {avatar?.title}</div>
              </div>
            </div>
          </div>

          {/* ── Speech Bubbles — dialogue between characters ── */}
          <div style={{ padding: '10px 14px' }}>
            {/* QBot's dialogue */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 6, alignItems: 'flex-start' }}>
              <div style={{ fontSize: 14, flexShrink: 0 }}>🤖</div>
              <div style={{
                background: 'rgba(76,29,149,0.2)', borderRadius: '2px 10px 10px 10px', padding: '6px 10px',
                border: '1px solid rgba(168,85,247,0.15)', flex: 1,
                fontSize: 11, fontWeight: 600, color: '#c4b5fd', lineHeight: 1.4,
                fontStyle: 'italic',
                animation: scenePhase === 'greet' || scenePhase === 'items' ? 'textFadeUp 0.4s ease' : 'none',
              }}>
                "{qbotMsg}"
              </div>
            </div>

            {/* Customer approaching (walks in behind the player) */}
            {scenePhase !== 'door' && scenePhase !== 'walk' && !feedback && (
              <div style={{
                display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 6,
                animation: 'textFadeUp 0.4s ease',
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                  background: 'rgba(255,255,255,0.06)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '2px solid rgba(255,255,255,0.12)', fontSize: 14,
                  animation: customerEntering ? 'customerWalkIn 0.8s cubic-bezier(0.22,1,0.36,1) forwards' : 'none',
                }}>
                  {round.customer.emoji}
                </div>
                <div style={{
                  background: 'rgba(255,255,255,0.04)', borderRadius: '2px 10px 10px 10px', padding: '6px 10px',
                  border: '1px solid rgba(255,255,255,0.06)', flex: 1,
                  fontSize: 11, color: '#d6d3d1', fontStyle: 'italic',
                }}>
                  <span style={{ fontWeight: 700, color: '#e2e8f0' }}>{round.customer.name}:</span> "{round.customer.greeting}"
                </div>
              </div>
            )}
          </div>

          {/* ── Items on the counter — slide in ── */}
          <div style={{ padding: '0 14px 10px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
              {round.items.map((item, i) => (
                <div key={`${roundIdx}-${i}`} style={{
                  background: 'rgba(0,0,0,0.25)', borderRadius: 10, padding: '8px 10px',
                  border: '1px solid rgba(180,83,9,0.2)', textAlign: 'center', minWidth: 75, flex: '1 1 auto',
                  opacity: itemsVisible ? 1 : 0,
                  transform: itemsVisible ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.8)',
                  transition: `all 0.4s cubic-bezier(0.22,1,0.36,1) ${i * 0.15}s`,
                }}>
                  <div style={{ fontSize: 26, marginBottom: 2 }}>{item.emoji}</div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#d6d3d1' }}>{item.name}</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#22c55e' }}>{fmt(item.price)}</div>
                </div>
              ))}
            </div>

            {/* Quest prompt */}
            <div style={{ opacity: itemsVisible ? 1 : 0, transition: 'opacity 0.4s ease 0.5s' }}>
              {round.type === 'change' ? (
                <div style={{ background: 'rgba(245,158,11,0.1)', borderRadius: 10, padding: '8px 12px', border: '1px solid rgba(245,158,11,0.2)' }}>
                  <div style={{ fontSize: 12, color: '#fbbf24', fontWeight: 700 }}>💵 Pays with {fmt(round.paid)} — Total is {fmt(round.total)}</div>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>How much <strong style={{ color: '#fbbf24' }}>change</strong> do they get?</div>
                </div>
              ) : (
                <div style={{ background: 'rgba(34,197,94,0.08)', borderRadius: 10, padding: '8px 12px', border: '1px solid rgba(34,197,94,0.15)' }}>
                  <div style={{ fontSize: 12, color: '#22c55e', fontWeight: 700 }}>💰 What's the total?</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Register / placed money */}
      <div style={{
        maxWidth: 500, width: '100%', background: 'rgba(120,53,15,0.15)',
        borderRadius: 14, padding: 12, marginBottom: 8,
        border: '1px solid rgba(180,83,9,0.15)', minHeight: 60,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <div style={{ fontSize: 10, color: '#78716c', fontWeight: 600 }}>
            {round?.type === 'change' ? '🪙 Change to give:' : '🪙 Your count:'}
          </div>
          <div style={{
            fontSize: 22, fontWeight: 900,
            color: feedback ? (feedback.correct ? '#22c55e' : '#ef4444') : (placedTotal === targetAmount && placedTotal > 0 ? '#22c55e' : '#fde68a'),
            transition: 'color 0.3s',
          }}>
            {fmt(placedTotal)}
          </div>
        </div>
        {placed.length > 0 ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, marginBottom: 4 }}>
            {placed.map(m => (
              <div key={m.id} style={{
                padding: '2px 7px', borderRadius: 6, fontSize: 10, fontWeight: 700,
                background: `${m.color}22`, color: m.color, border: `1px solid ${m.color}44`,
                animation: 'moneyPop 0.2s ease',
              }}>{m.label}</div>
            ))}
          </div>
        ) : (
          <div style={{ fontSize: 10, color: '#57534e', fontStyle: 'italic', textAlign: 'center', padding: 6 }}>
            Tap bills & coins below to count out the money
          </div>
        )}
        {placed.length > 0 && !feedback && (
          <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
            <button onClick={removeLast} style={{ ...smallBtn('#78716c'), flex: 1 }}>↩ Undo</button>
            <button onClick={clearPlaced} style={{ ...smallBtn('#dc2626'), flex: 1 }}>✕ Clear</button>
          </div>
        )}
      </div>

      {/* Feedback with animation */}
      {feedback && (
        <div style={{
          maxWidth: 500, width: '100%', padding: '12px 16px', borderRadius: 12, marginBottom: 8,
          background: feedback.correct ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
          border: `2px solid ${feedback.correct ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
          textAlign: 'center',
          animation: feedback.correct ? 'correctBounce 0.5s ease' : 'wrongShake 0.4s ease',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: feedback.correct ? '#22c55e' : '#ef4444' }}>
            {feedback.correct ? '✓ ' : '✗ '}{feedback.msg}
          </div>
          {feedback.correct && (
            <div style={{ fontSize: 11, color: '#fbbf24', fontWeight: 700, marginTop: 4 }}>
              +{diff?.xpPerRound} XP {streak >= 3 ? `· 🔥 ${streak} streak!` : ''}
            </div>
          )}
          {/* Coin shower on correct */}
          {feedback.correct && (
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
              {[0,1,2,3,4,5].map(i => (
                <div key={i} style={{
                  position: 'absolute', fontSize: 14,
                  left: `${15 + i * 14}%`, top: -20,
                  animation: `coinFall 1s ease-in ${i * 0.1}s forwards`,
                  opacity: 0,
                }}>🪙</div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Money drawer */}
      {!feedback && (
        <div style={{ maxWidth: 500, width: '100%' }}>
          <div style={{ fontSize: 9, color: '#78716c', fontWeight: 600, marginBottom: 3, textTransform: 'uppercase', letterSpacing: 1 }}>Bills</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 8 }}>
            {MONEY.filter(m => m.type === 'bill').map(m => (
              <button key={m.value} onClick={() => addMoney(m)} style={{
                padding: '9px 12px', borderRadius: 8,
                border: `2px solid ${m.color}55`,
                background: `linear-gradient(135deg, ${m.color}20, ${m.color}10)`,
                color: m.color, fontSize: 13, fontWeight: 800,
                cursor: 'pointer', minWidth: 52, textAlign: 'center', flex: '1 1 auto',
              }}>{m.label}</button>
            ))}
          </div>
          <div style={{ fontSize: 9, color: '#78716c', fontWeight: 600, marginBottom: 3, textTransform: 'uppercase', letterSpacing: 1 }}>Coins</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 10 }}>
            {MONEY.filter(m => m.type === 'coin').map(m => (
              <button key={m.value} onClick={() => addMoney(m)} style={{
                padding: '9px 12px', borderRadius: 8,
                border: `2px solid ${m.color}55`,
                background: `linear-gradient(135deg, ${m.color}20, ${m.color}10)`,
                color: m.color, fontSize: 13, fontWeight: 800,
                cursor: 'pointer', minWidth: 52, textAlign: 'center', flex: '1 1 auto',
              }}>{m.label}</button>
            ))}
          </div>
          <button onClick={submitAnswer} style={{
            ...rpgBtn(placedTotal > 0), width: '100%', padding: '13px 20px', fontSize: 14,
            opacity: placedTotal > 0 ? 1 : 0.4,
          }}>
            ⚔️ Submit {round?.type === 'change' ? 'Change' : 'Total'}: {fmt(placedTotal)}
          </button>
        </div>
      )}

      {/* Game over */}
      {gameOver && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 100, backdropFilter: 'blur(8px)', padding: 20,
          animation: 'fadeIn 0.5s ease',
        }}>
          <div style={{
            background: 'linear-gradient(135deg,#44200a,#1a0a02)', borderRadius: 20,
            padding: 28, maxWidth: 400, width: '100%', textAlign: 'center',
            border: '2px solid #b45309', boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
          }}>
            <div style={{ fontSize: 42, marginBottom: 6 }}>
              {score === totalRounds ? '👑' : score >= totalRounds * 0.7 ? '⚔️' : '🛡️'}
            </div>
            <div style={{ fontSize: 20, fontWeight: 900, color: '#fde68a', marginBottom: 4 }}>
              {score === totalRounds ? 'Legendary Merchant!' : score >= totalRounds * 0.7 ? 'Skilled Shopkeeper!' : 'Quest Complete!'}
            </div>
            <div style={{ fontSize: 12, color: '#d6d3d1', marginBottom: 12 }}>
              {avatar?.emoji} {avatar?.title} {avatar?.name} · Level {level}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginBottom: 12 }}>
              {[1,2,3].map(s => {
                const stars = score === totalRounds ? 3 : score >= totalRounds * 0.7 ? 2 : 1;
                return <span key={s} style={{ fontSize: 26, filter: s <= stars ? 'none' : 'grayscale(1) opacity(0.3)' }}>⭐</span>;
              })}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginBottom: 14 }}>
              <MiniStat label="Correct" value={score} color="#22c55e" />
              <MiniStat label="Missed" value={totalRounds - score} color="#ef4444" />
              <MiniStat label="XP Earned" value={xp} color="#d97706" />
              <MiniStat label="Level" value={level} color="#fbbf24" />
            </div>

            <div style={{
              background: 'rgba(0,0,0,0.25)', borderRadius: 10, padding: '8px 12px',
              border: '1px solid rgba(180,83,9,0.2)', marginBottom: 14,
              fontSize: 11, fontWeight: 600, color: '#c4b5fd', lineHeight: 1.4, fontStyle: 'italic',
            }}>
              🤖 "{qbotMsg}"
            </div>

            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button onClick={() => startGame(difficulty)} style={rpgBtn()}>⚔️ Play Again</button>
              <button onClick={() => { setPhase('difficulty'); setDifficulty(null); }} style={rpgBtn()}>🗺️ Change Quest</button>
              <button onClick={() => setShowReview(true)} style={rpgBtn()}>📜 Review</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn { 0%{opacity:0;transform:translateY(10px)} 100%{opacity:1;transform:translateY(0)} }
        @keyframes moneyPop { 0%{transform:scale(0.7);opacity:0} 50%{transform:scale(1.1)} 100%{transform:scale(1);opacity:1} }
        @keyframes torchFlicker { 0%{opacity:0.6} 30%{opacity:1} 60%{opacity:0.75} 100%{opacity:0.6} }
        @keyframes textFadeUp { 0%{opacity:0;transform:translateY(8px)} 100%{opacity:1;transform:translateY(0)} }

        @keyframes doorOpenLeft {
          0%{transform:translateX(0);opacity:1}
          30%{transform:translateX(0);opacity:1}
          100%{transform:translateX(-110%);opacity:0}
        }
        @keyframes doorOpenRight {
          0%{transform:translateX(0);opacity:1}
          30%{transform:translateX(0);opacity:1}
          100%{transform:translateX(110%);opacity:0}
        }
        @keyframes lightBeam {
          0%{opacity:0}
          50%{opacity:1}
          100%{opacity:0}
        }
        @keyframes customerWalkIn {
          0%{opacity:0;transform:translateX(60px) scale(0.7)}
          40%{opacity:0.6;transform:translateX(20px) scale(0.9)}
          70%{opacity:0.9;transform:translateX(5px) scale(1)}
          85%{transform:translateX(-2px) scale(1)}
          100%{opacity:1;transform:translateX(0) scale(1)}
        }
        @keyframes shopkeeperNod {
          0%{transform:rotate(0)}
          30%{transform:rotate(-4deg)}
          60%{transform:rotate(2deg)}
          100%{transform:rotate(0)}
        }
        @keyframes idleBob {
          0%{transform:translateY(0)}
          50%{transform:translateY(-3px)}
          100%{transform:translateY(0)}
        }
        @keyframes correctBounce {
          0%{transform:scale(0.95);opacity:0}
          40%{transform:scale(1.04)}
          70%{transform:scale(0.98)}
          100%{transform:scale(1);opacity:1}
        }
        @keyframes wrongShake {
          0%{transform:translateX(0)}
          20%{transform:translateX(-8px)}
          40%{transform:translateX(8px)}
          60%{transform:translateX(-5px)}
          80%{transform:translateX(5px)}
          100%{transform:translateX(0)}
        }
        @keyframes coinFall {
          0%{opacity:1;transform:translateY(0) rotate(0)}
          100%{opacity:0;transform:translateY(60px) rotate(360deg)}
        }
      `}</style>
      {returnUrl && <LoopContinueButton onClick={goBack} />}
    </div>
  );
}

/* ── Shop scene with QBot behind counter ── */
function ShopScene({ qbotMsg, showCustomer = false, customerEmoji = '⚔️' }) {
  return (
    <div style={{
      maxWidth: 420, width: '100%', position: 'relative',
      background: 'linear-gradient(180deg, rgba(68,32,10,0.4) 0%, rgba(44,21,4,0.5) 100%)',
      borderRadius: 16, padding: 16, overflow: 'hidden',
      border: '1px solid rgba(180,83,9,0.25)',
      boxShadow: 'inset 0 0 40px rgba(0,0,0,0.3)',
    }}>
      {/* Torches */}
      <div style={{ position: 'absolute', top: 8, left: 12, fontSize: 18, animation: 'torchFlicker 2s ease-in-out infinite' }}>🔥</div>
      <div style={{ position: 'absolute', top: 8, right: 12, fontSize: 18, animation: 'torchFlicker 2s ease-in-out infinite 0.5s' }}>🔥</div>

      {/* Counter */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16,
        padding: '20px 10px 10px',
      }}>
        {/* QBot behind counter */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%', margin: '0 auto 4px',
            background: 'linear-gradient(135deg,#4c1d95,#2e1065)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '3px solid #b45309', boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
          }}>
            <img src={qbotImg} alt="QBot" style={{ width: 38 }} />
          </div>
          <div style={{ fontSize: 10, fontWeight: 800, color: '#fbbf24' }}>QBot</div>
          <div style={{ fontSize: 8, color: '#78716c' }}>Shopkeeper</div>
        </div>

        {/* Wooden counter */}
        <div style={{
          flex: 1, height: 6, borderRadius: 3,
          background: 'linear-gradient(90deg, #92400e, #b45309, #92400e)',
          boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
        }} />
      </div>

      {/* Speech bubble */}
      <div style={{
        background: 'rgba(0,0,0,0.3)', borderRadius: 10, padding: '8px 12px',
        border: '1px solid rgba(180,83,9,0.15)',
        fontSize: 11, fontWeight: 600, color: '#fde68a', lineHeight: 1.5,
        fontStyle: 'italic', textAlign: 'center',
      }}>
        🤖 "{qbotMsg}"
      </div>
    </div>
  );
}

/* ── Helpers ── */
const Step = ({ n, c = '#fbbf24', children }) => (
  <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
    <span style={{ color: c, fontWeight: 800, fontSize: 16 }}>{n}.</span>
    <span>{children}</span>
  </div>
);

const MiniStat = ({ label, value, color }) => (
  <div style={{ textAlign: 'center' }}>
    <div style={{ fontSize: 20, fontWeight: 800, color }}>{value}</div>
    <div style={{ fontSize: 8, color: '#78716c', fontWeight: 600, textTransform: 'uppercase' }}>{label}</div>
  </div>
);

const BG_SHOP = 'linear-gradient(180deg, #1a0a02 0%, #2c1504 30%, #1a0a02 60%, #0f0a05 100%)';
const FONT = '"Inter","Segoe UI",system-ui,sans-serif';
function rpgBtn(active = true) {
  return {
    padding: '11px 18px', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: 700,
    background: active ? 'linear-gradient(135deg, #92400e, #78350f)' : 'linear-gradient(135deg, #44200a, #2c1504)',
    border: '2px solid #b45309', color: '#fde68a',
    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
  };
}
function smallBtn(c) { return { padding: '4px 10px', background: `${c}22`, color: c, border: `1px solid ${c}44`, borderRadius: 6, cursor: 'pointer', fontSize: 10, fontWeight: 700 }; }
