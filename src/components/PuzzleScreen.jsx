import React, { useState, useEffect, useRef } from 'react';
import { RotateCcw, Key, Lock, Unlock, Zap, HelpCircle, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Star } from 'lucide-react';

const LEVEL_VARIATIONS = [
  // 試練 01 variations
  [
    {
      id: 0,
      name: '試練01: 二択の架け橋 (Type-A)',
      description: '安全な迂回路か、崩落の危険がある最短ルートか。',
      grid: [
        ['#', '#', '#', '#', '#', '#', '#'],
        ['#', 'S', '.', 'T', '.', 'G', '#'],
        ['#', '.', '#', '#', '#', '.', '#'],
        ['#', '.', '#', '#', '#', '.', '#'],
        ['#', '.', '.', '.', '.', '.', '#'],
        ['#', '#', '#', '#', '#', '#', '#']
      ],
      start: { r: 1, c: 1 },
      goal: { r: 1, c: 5 },
      classifyPath: (nr, nc) => {
        if (nr === 2 && nc === 1) return 'long_route';
        if (nr === 1 && nc === 2) return 'short_route';
        return null;
      }
    },
    {
      id: 0,
      name: '試練01: 二択の架け橋 (Type-B)',
      description: '安全な迂回路か、崩落の危険がある最短ルートか。',
      grid: [
        ['#', '#', '#', '#', '#', '#', '#'],
        ['#', '.', '.', '.', '.', '.', '#'],
        ['#', '.', '#', '#', '#', '.', '#'],
        ['#', '.', '#', '#', '#', '.', '#'],
        ['#', 'S', '.', 'T', '.', 'G', '#'],
        ['#', '#', '#', '#', '#', '#', '#']
      ],
      start: { r: 4, c: 1 },
      goal: { r: 4, c: 5 },
      classifyPath: (nr, nc) => {
        if (nr === 3 && nc === 1) return 'long_route';
        if (nr === 4 && nc === 2) return 'short_route';
        return null;
      }
    }
  ],
  // 試練 02 variations
  [
    {
      id: 1,
      name: '試練02: 秘匿の宝物庫 (Type-A)',
      description: 'ゲート開放へ急ぐか、危険を冒して財宝を回収するか。',
      grid: [
        ['#', '#', '#', '#', '#', '#', '#', '#'],
        ['#', 'S', '.', '.', '#', '.', 'K', '#'],
        ['#', '#', '#', '.', '#', '.', '#', '#'],
        ['#', 'C', '.', '.', 'L', '.', '.', '#'],
        ['#', '#', '#', '.', '#', '#', '.', '#'],
        ['#', 'G', '.', '.', '#', '.', '.', '#'],
        ['#', '#', '#', '#', '#', '#', '#', '#']
      ],
      start: { r: 1, c: 1 },
      goal: { r: 5, c: 1 },
      classifyPath: (nr, nc) => {
        if (nc >= 4) return 'get_chest';
        return null;
      }
    },
    {
      id: 1,
      name: '試練02: 秘匿の宝物庫 (Type-B)',
      description: 'ゲート開放へ急ぐか、危険を冒して財宝を回収するか。',
      grid: [
        ['#', '#', '#', '#', '#', '#', '#', '#'],
        ['#', 'K', '.', '#', '.', '.', 'S', '#'],
        ['#', '#', '.', '#', '.', '#', '#', '#'],
        ['#', '.', '.', 'L', '.', '.', 'C', '#'],
        ['#', '.', '#', '#', '.', '#', '#', '#'],
        ['#', '.', '.', '#', '.', '.', 'G', '#'],
        ['#', '#', '#', '#', '#', '#', '#', '#']
      ],
      start: { r: 1, c: 6 },
      goal: { r: 5, c: 6 },
      classifyPath: (nr, nc) => {
        if (nc <= 3) return 'get_chest';
        return null;
      }
    }
  ],
  // 試練 03 variations
  [
    {
      id: 2,
      name: '試練03: 脈動する魔力壁 (Type-A)',
      description: '障壁の周期を見極めるか、一瞬の隙に突撃するか。',
      grid: [
        ['#', '#', '#', '#', '#', '#', '#'],
        ['#', 'S', '.', 'L', '.', '.', '#'],
        ['#', '#', '.', '#', '.', '#', '#'],
        ['#', '.', '.', 'L', '.', 'G', '#'],
        ['#', '.', '#', '#', '.', '#', '#'],
        ['#', '.', '.', '.', '.', '.', '#'],
        ['#', '#', '#', '#', '#', '#', '#']
      ],
      start: { r: 1, c: 1 },
      goal: { r: 3, c: 5 }
    },
    {
      id: 2,
      name: '試練03: 脈動する魔力壁 (Type-B)',
      description: '障壁の周期を見極めるか、一瞬の隙に突撃するか。',
      grid: [
        ['#', '#', '#', '#', '#', '#', '#'],
        ['#', '.', '.', 'L', '.', 'S', '#'],
        ['#', '#', '.', '#', '.', '#', '#'],
        ['#', 'G', '.', 'L', '.', '.', '#'],
        ['#', '.', '#', '#', '.', '#', '#'],
        ['#', '.', '.', '.', '.', '.', '#'],
        ['#', '#', '#', '#', '#', '#', '#']
      ],
      start: { r: 1, c: 5 },
      goal: { r: 3, c: 1 }
    }
  ]
];

export default function PuzzleScreen({ onPuzzleComplete, avatarShape = 'circle' }) {
  const [levelIndex, setLevelIndex] = useState(0);
  const [currentLevel, setCurrentLevel] = useState(null);
  
  // Random variation selector
  useEffect(() => {
    const variations = LEVEL_VARIATIONS[levelIndex];
    const randomVar = variations[Math.floor(Math.random() * variations.length)];
    setCurrentLevel(randomVar);
  }, [levelIndex]);
  
  // Game states
  const [playerPos, setPlayerPos] = useState({ r: 1, c: 1 });
  const [history, setHistory] = useState([]);
  const [hasKey, setHasKey] = useState(false);
  const [chestOpened, setChestOpened] = useState(false);
  const [starCollected, setStarCollected] = useState(false);
  const [steps, setSteps] = useState(0);
  const [lunaHint, setLunaHint] = useState('アバター（盾）を操作して、緑のゴールゲートへ誘導してください。');
  
  // Dynamic map cells (for crumbling tiles)
  const [crumblingTiles, setCrumblingTiles] = useState({});
  // Lasers active states (key: 'r,c', value: boolean)
  const [activeLasers, setActiveLasers] = useState({});

  // Telemetry references for personality diagnostics
  const undoCountRef = useRef(0);
  const startTimeRef = useRef(null);
  const levelFirstMoveTimeRef = useRef([]); 
  const firstMoveMadeRef = useRef(false);
  
  // Elapsed time display (CHRONICLE)
  const [elapsed, setElapsed] = useState(0);

  // Format seconds to MM′SS″
  const formatTime = (sec) => {
    const m = String(Math.floor(sec / 60)).padStart(2, '0');
    const s = String(sec % 60).padStart(2, '0');
    return `${m}′${s}″`;
  };
  
  // Specific actions tracked
  const [level1Choice, setLevel1Choice] = useState(''); 
  const [level2Choice, setLevel2Choice] = useState(''); 
  const [level3Choice, setLevel3Choice] = useState(''); 
  
  // Laser timer (lightning runes) with separate random timings for each coordinate
  useEffect(() => {
    if (!currentLevel || levelIndex === 0) {
      setActiveLasers({});
      return;
    }

    const laserCoords = [];
    currentLevel.grid.forEach((row, r) => {
      row.forEach((cell, c) => {
        if (cell === 'L') {
          laserCoords.push(`${r},${c}`);
        }
      });
    });

    // Initialize all lasers as inactive (false)
    const initialStates = {};
    laserCoords.forEach(coord => {
      initialStates[coord] = false;
    });
    setActiveLasers(initialStates);

    const timers = {};

    laserCoords.forEach((coord) => {
      const runTimer = (currentState) => {
        // active: 600ms - 1200ms
        // inactive: 400ms - 1000ms (shorter duration for higher density/difficulty)
        const delay = currentState
          ? 600 + Math.random() * 600
          : 400 + Math.random() * 600;

        timers[coord] = setTimeout(() => {
          const nextState = !currentState;
          setActiveLasers(prev => ({
            ...prev,
            [coord]: nextState
          }));
          runTimer(nextState);
        }, delay);
      };

      // Stagger initial activation randomly (up to 800ms) to ensure they are out of sync
      const initialDelay = Math.random() * 800;
      timers[coord] = setTimeout(() => {
        setActiveLasers(prev => ({
          ...prev,
          [coord]: true
        }));
        runTimer(true);
      }, initialDelay);
    });

    return () => {
      Object.values(timers).forEach(clearTimeout);
    };
  }, [currentLevel, levelIndex]);

  // Handle Level Reset / Setup
  useEffect(() => {
    if (!currentLevel) return;
    setPlayerPos(currentLevel.start);
    setHistory([]);
    setHasKey(false);
    setChestOpened(false);
    setStarCollected(false);
    setSteps(0);
    setCrumblingTiles({});
    setElapsed(0); // Reset CHRONICLE timer on new trial
    
    firstMoveMadeRef.current = false;
    startTimeRef.current = Date.now();

    // Default hint for levels
    if (levelIndex === 0) {
      setLunaHint('目の前の橋は腐食し崩れやすそうです（T）。足場に注意しつつ、ゴール（G）へアバターを導いてください。');
    } else if (levelIndex === 1) {
      setLunaHint('このエリアには宝箱（C）と鍵（K）があります。ゲートを開く鍵を見つけ、ゴール（G）を目指しましょう。');
    } else if (levelIndex === 2) {
      setLunaHint('雷鳴の魔力壁（L）が行く手を阻んでいます。雷撃（黄色）に触れぬようタイミングを見極め、ゴール（G）へ進みましょう。');
    }
  }, [currentLevel]);

  // CHRONICLE timer — counts up every second, resets when trial changes
  useEffect(() => {
    if (!currentLevel) return;
    const id = setInterval(() => setElapsed(prev => prev + 1), 1000);
    return () => clearInterval(id);
  }, [currentLevel]);

  // Handle laser hazard collision
  useEffect(() => {
    if (!currentLevel) return;
    if (levelIndex > 0) {
      const isPlayerOnLaser = currentLevel.grid[playerPos.r][playerPos.c] === 'L';
      if (isPlayerOnLaser) {
        const playerCoord = `${playerPos.r},${playerPos.c}`;
        if (activeLasers[playerCoord]) {
          // Hit! Reset to start
          setPlayerPos(currentLevel.start);
          setHistory([]);
          undoCountRef.current += 1;
          setLunaHint('警告：魔力壁の放電に被弾しました。初期位置に戻します。障壁の消える周期をよく見てください。');
          if (levelIndex === 2) setLevel3Choice('hit_laser');
        }
      }
    }
  }, [activeLasers, playerPos, levelIndex, currentLevel]);

  // Movement handler
  const movePlayer = (dr, dc) => {
    if (!currentLevel) return;
    const nr = playerPos.r + dr;
    const nc = playerPos.c + dc;
    
    // Check boundaries
    if (nr < 0 || nr >= currentLevel.grid.length || nc < 0 || nc >= currentLevel.grid[0].length) return;
    
    const targetCell = currentLevel.grid[nr][nc];
    
    // Check wall
    if (targetCell === '#') return;

    // Track first move latency
    if (!firstMoveMadeRef.current) {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      levelFirstMoveTimeRef.current.push(elapsed);
      firstMoveMadeRef.current = true;
    }

    // Save history for undo
    setHistory(prev => [...prev, playerPos]);
    setSteps(prev => prev + 1);

    // Level 1 and 2 path classification using variation helpers
    if (currentLevel.classifyPath) {
      const choice = currentLevel.classifyPath(nr, nc);
      if (choice) {
        if (levelIndex === 0 && !level1Choice) setLevel1Choice(choice);
        else if (levelIndex === 1 && !level2Choice) setLevel2Choice(choice);
      }
    }

    // Handle Crumbling Tile (Level 1) with 50% chance of collapse
    if (targetCell === 'T') {
      const tileKey = `${nr},${nc}`;
      const crumbleState = crumblingTiles[tileKey];
      
      // If it has already collapsed or was stepped on before, it definitely collapses
      if (crumbleState) {
        setPlayerPos(currentLevel.start);
        setHistory([]);
        undoCountRef.current += 1;
        setLunaHint('警告：傷ついた木橋が完全に崩壊しました。初期位置へ差し戻します。');
        return;
      }

      // 50% probability roll
      if (Math.random() < 0.5) {
        setCrumblingTiles(prev => ({ ...prev, [tileKey]: 'collapsed' }));
        setPlayerPos(currentLevel.start);
        setHistory([]);
        undoCountRef.current += 1;
        setLunaHint('警告：踏み出した瞬間、木橋が音を立てて崩落しました！初期位置へ差し戻します。');
        return;
      } else {
        setCrumblingTiles(prev => ({ ...prev, [tileKey]: 'held' }));
        setLunaHint('木橋を渡っていますが、奇跡的に持ち堪えています！急いで渡りきりましょう！');
      }
    }

    // Handle Key Pickups
    if (targetCell === 'K') {
      setHasKey(true);
      setLunaHint('古代の鍵を回収しました。これで宝箱を開けられます。');
    }

    // Handle Chest Interaction
    if (targetCell === 'C') {
      if (hasKey) {
        if (!chestOpened) {
          setChestOpened(true);
          setStarCollected(true);
          setLunaHint('宝箱を開錠！魔力のスターを獲得しました。');
        }
      } else {
        setLunaHint('宝箱には鉄の錠前（C）がかかっています。鍵（K）が必要です。');
        if (!level2Choice) {
          setLevel2Choice('inspect_chest_first');
        }
        return; 
      }
    }

    // Handle Lasers (Level 3)
    if (targetCell === 'L') {
      const laserCoord = `${nr},${nc}`;
      if (activeLasers[laserCoord]) {
        setPlayerPos(currentLevel.start);
        setHistory([]);
        undoCountRef.current += 1;
        setLunaHint('警告：放電中の魔力壁に衝突しました。初期位置に戻します。');
        setLevel3Choice('hit_laser');
        return;
      } else {
        setLunaHint('魔力障壁が消滅した隙に通過しました！');
        if (!level3Choice) {
          const totalElapsed = (Date.now() - startTimeRef.current) / 1000;
          if (totalElapsed < 4) {
            setLevel3Choice('dash_laser');
          } else {
            setLevel3Choice('patient_laser');
          }
        }
      }
    }

    // Update position
    setPlayerPos({ r: nr, c: nc });

    // Check Goal Achievement
    if (targetCell === 'G') {
      handleLevelComplete();
    }
  };

  const handleLevelComplete = () => {
    if (levelIndex < LEVEL_VARIATIONS.length - 1) {
      setLevelIndex(levelIndex + 1);
    } else {
      const averageFirstMoveTime = levelFirstMoveTimeRef.current.reduce((a, b) => a + b, 0) / LEVEL_VARIATIONS.length;
      
      const metrics = {
        averageFirstMoveTime,
        totalUndos: undoCountRef.current,
        level1Choice,
        level2Choice: level2Choice || 'goal_direct', 
        level3Choice: level3Choice || 'patient_laser',
        starCollected
      };
      
      onPuzzleComplete(metrics);
    }
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const lastPos = history[history.length - 1];
    setPlayerPos(lastPos);
    setHistory(prev => prev.slice(0, -1));
    setSteps(prev => Math.max(0, prev - 1));
    undoCountRef.current += 1;
    setLunaHint('時間を一手巻き戻しました。');
  };

  const handleReset = () => {
    setPlayerPos(currentLevel.start);
    setHistory([]);
    setSteps(0);
    setCrumblingTiles({});
    undoCountRef.current += 1;
    setLunaHint('現在の試練を初期化しました。');
  };

  // Keyboard navigation listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          movePlayer(-1, 0);
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          movePlayer(1, 0);
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          movePlayer(0, -1);
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          movePlayer(0, 1);
          break;
        default:
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [playerPos, hasKey, chestOpened, levelIndex, crumblingTiles, activeLasers]);

  const handleCellClick = (r, c) => {
    const dr = r - playerPos.r;
    const dc = c - playerPos.c;
    
    if (Math.abs(dr) + Math.abs(dc) === 1) {
      movePlayer(dr, dc);
    } else {
      const clickedCell = currentLevel.grid[r][c];
      if (clickedCell === 'T') {
        setLunaHint('崩落する木橋（T）。一度踏むと足場が傷つき、さらに負荷がかかると崩落して初期位置に戻されます。');
      } else if (clickedCell === 'C') {
        setLunaHint(chestOpened ? '開放済みの古い木製宝箱。' : 'ロックされた宝箱（C）。開けるには鍵（K）が必要です。');
      } else if (clickedCell === 'K') {
        setLunaHint('真鍮製の鍵（K）。宝箱を開けるために必要な鍵。');
      } else if (clickedCell === 'L') {
        setLunaHint('雷鳴の魔力壁（L）。一定周期で放電（黄色）し、接触すると初期位置にリセットされます。');
      } else if (clickedCell === 'G') {
        setLunaHint('ゴールゲート（G）。アバターを誘導すると次の試練への扉が開きます。');
      } else if (clickedCell === '#') {
        setLunaHint('切り立った石壁です。通行不能。');
      }
    }
  };

  if (!currentLevel) {
    return <div style={{ color: 'var(--text-secondary)', padding: '2rem' }}>Loading Labyrinth...</div>;
  }

  return (
    <div className="glass-panel fade-in" style={{
      maxWidth: '850px',
      width: '100%',
      padding: '2rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem'
    }}>
      
      {/* Header Level Info */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid rgba(197, 160, 89, 0.25)',
        paddingBottom: '1rem'
      }}>
        <div style={{ textAlign: 'left' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--border-gold)', fontWeight: '900', fontFamily: 'Cinzel, serif' }}>
            TRIAL 0{levelIndex + 1} / 03
          </div>
          <h2 style={{ fontSize: '1.45rem', marginTop: '0.2rem', fontFamily: 'Noto Serif JP, serif' }}>{currentLevel.name}</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{currentLevel.description}</p>
        </div>

        {/* Level Gem Indicators */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {[0, 1, 2].map(idx => (
            <div
              key={idx}
              style={{
                width: '14px',
                height: '14px',
                transform: 'rotate(45deg)',
                background: idx === levelIndex ? 'var(--border-gold)' : idx < levelIndex ? '#1b8577' : 'rgba(197,160,89,0.06)',
                border: '1px solid rgba(197, 160, 89, 0.3)',
                boxShadow: idx === levelIndex ? '0 0 10px var(--border-gold)' : 'none'
              }}
            />
          ))}
        </div>
      </div>

      {/* Main Layout */}
      <div className="puzzle-layout">
        {/* Left Side: Map Grid */}
        <div className="puzzle-grid-wrapper">
          <div style={{
            display: 'grid',
            gridTemplateRows: `repeat(${currentLevel.grid.length}, 1fr)`,
            gridTemplateColumns: `repeat(${currentLevel.grid[0].length}, 1fr)`,
            gap: '6px',
            width: '100%',
            maxWidth: '380px',
          }}>
            {currentLevel.grid.map((row, r) =>
              row.map((cell, c) => {
                const isPlayer = playerPos.r === r && playerPos.c === c;
                const isGoal = cell === 'G';
                const isKey = cell === 'K' && !hasKey;
                const isChest = cell === 'C';
                const isCrumbling = cell === 'T';
                const isLaser = cell === 'L';
                const isWall = cell === '#';
                
                const tileKey = `${r},${c}`;
                const crumbleState = crumblingTiles[tileKey];
                
                const isLaserActive = isLaser && activeLasers[`${r},${c}`];
                let cellClass = 'grid-cell cell-floor';
                if (isWall) cellClass = 'grid-cell cell-wall';
                else if (isCrumbling) cellClass = `grid-cell cell-floor cell-crumbling ${crumbleState ? (crumbleState === 'collapsed' ? 'collapsed' : 'stepped') : ''}`;
                else if (isLaserActive) cellClass = 'grid-cell cell-floor cell-laser-active';

                return (
                  <div
                    key={`${r}-${c}`}
                    className={cellClass}
                    onClick={() => handleCellClick(r, c)}
                    style={{ cursor: isWall ? 'default' : 'pointer' }}
                  >
                    {/* Render Player Avatar (shape depends on first novel choice) */}
                    {isPlayer && (() => {
                      const goldGradient = 'radial-gradient(circle at 40% 35%, #e8d08a, #c5a059)';
                      const goldShadow = '0 0 8px rgba(197,160,89,0.8), 0 0 18px rgba(197,160,89,0.4)';

                      // diamond: rotate a square 45deg
                      if (avatarShape === 'triangle') {
                        return (
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '100%',
                            height: '100%',
                            position: 'absolute',
                          }}>
                            <div style={{
                              width: '52%',
                              height: '52%',
                              background: goldGradient,
                              boxShadow: goldShadow,
                              transform: 'rotate(45deg)',
                              borderRadius: '2px',
                            }} />
                          </div>
                        );
                      }

                      const shapeStyles = {
                        circle: {
                          borderRadius: '50%',
                          background: goldGradient,
                          boxShadow: goldShadow,
                          width: '70%',
                          height: '70%',
                        },
                        square: {
                          borderRadius: '4px',
                          background: goldGradient,
                          boxShadow: goldShadow,
                          width: '70%',
                          height: '70%',
                        },
                      };

                      const style = shapeStyles[avatarShape] || shapeStyles.circle;
                      return (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '100%',
                          height: '100%',
                          position: 'absolute',
                        }}>
                          <div style={style} />
                        </div>
                      );
                    })()}

                    {/* Render Goal Portal */}
                    {!isPlayer && isGoal && (
                      <div className="grid-item goal-core" />
                    )}

                    {/* Render Keys */}
                    {!isPlayer && isKey && (
                      <div className="grid-item item-key">
                        <Key size={18} />
                      </div>
                    )}

                    {/* Render Chest */}
                    {!isPlayer && isChest && (
                      <div className="grid-item item-chest">
                        {chestOpened ? <Unlock size={18} /> : <Lock size={18} />}
                      </div>
                    )}

                    {/* Render crumbling cracks */}
                    {!isPlayer && isCrumbling && (
                      <div style={{
                        fontSize: '0.45rem',
                        fontWeight: '900',
                        color: crumbleState === 'collapsed' ? '#ef4444' : crumbleState === 'held' ? '#3b82f6' : '#8a6c50',
                        position: 'absolute',
                        bottom: '2px',
                        width: '100%',
                        textAlign: 'center',
                        fontFamily: 'monospace'
                      }}>
                        {crumbleState === 'collapsed' ? 'COLLAPSED' : crumbleState === 'held' ? 'STABLE' : 'WOOD'}
                      </div>
                    )}

                    {/* Render electric lightning warning */}
                    {!isPlayer && isLaser && (() => {
                      const isLaserActive = !!activeLasers[`${r},${c}`];
                      return (
                        <div style={{
                          position: 'absolute',
                          inset: '2px',
                          border: isLaserActive ? '2px solid #d99126' : '1px dashed rgba(217, 145, 38, 0.2)',
                          borderRadius: '2px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: isLaserActive ? 'rgba(217, 145, 38, 0.25)' : 'none',
                          transition: 'all 0.1s'
                        }}>
                          <Zap size={10} style={{ color: isLaserActive ? '#d99126' : 'rgba(217, 145, 38, 0.15)' }} />
                        </div>
                      );
                    })()}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: HUD */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {/* Ornate Dialog Hint bubble */}
          <div style={{
            background: 'rgba(197, 160, 89, 0.04)',
            border: '2px solid rgba(197, 160, 89, 0.2)',
            borderRadius: '2px',
            padding: '1rem',
            textAlign: 'left'
          }}>
            <div style={{ fontSize: '0.75rem', fontWeight: '900', color: 'var(--border-gold)', marginBottom: '0.3rem', fontFamily: 'Cinzel, serif' }}>
              ❈ LUNA'S OBSERVATION
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: '1.6' }}>
              {lunaHint}
            </div>
          </div>

          {/* HUD Status sheet */}
          <div className="hud-card">
            <div className="hud-row">
              <span className="hud-label">刻の記録 (CHRONICLE)</span>
              <span className="hud-value" style={{ fontFamily: 'Cinzel, serif', letterSpacing: '0.05em' }}>
                {formatTime(elapsed)}
              </span>
            </div>
            <div className="hud-row">
              <span className="hud-label">消費歩数 (STEPS)</span>
              <span className="hud-value">{steps}</span>
            </div>
            <div className="hud-row">
              <span className="hud-label">目標評価歩数 (TARGET)</span>
              <span className="hud-value">
                {levelIndex === 0 ? '8手以内' : levelIndex === 1 ? '8手以内' : '6手以内'}
              </span>
            </div>
            <div className="hud-row">
              <span className="hud-label">所持キー (KEY)</span>
              <span className="hud-value" style={{ color: hasKey ? '#c5a059' : 'var(--text-dim)' }}>
                {hasKey ? '1 / 1' : '0 / 1'}
              </span>
            </div>
            <div className="hud-row">
              <span className="hud-label">秘宝スター (STAR)</span>
              <span className="hud-value" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: starCollected ? '#d99126' : 'var(--text-dim)' }}>
                <Star size={14} fill={starCollected ? '#d99126' : 'none'} />
                <span>{starCollected ? 'Collected' : 'None'}</span>
              </span>
            </div>
          </div>

          {/* Action triggers */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <button className="cyber-btn-sec" onClick={handleUndo} disabled={history.length === 0} style={{ justifyContent: 'center' }}>
              <RotateCcw size={14} />
              <span>Undo</span>
            </button>
            <button className="cyber-btn-sec" onClick={handleReset} style={{ justifyContent: 'center' }}>
              <RotateCcw size={14} />
              <span>Reset</span>
            </button>
          </div>

        </div>
      </div>

      {/* D-Pad styled as heavy iron vintage directional buttons */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '4px',
        marginTop: '0.5rem',
        borderTop: '1px dashed rgba(197, 160, 89, 0.2)',
        paddingTop: '1.25rem'
      }}>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '0.5rem', fontFamily: 'Cinzel, serif' }}>
          TACTICAL INTERACTIVE D-PAD
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
          <button className="cyber-btn-sec" onClick={() => movePlayer(-1, 0)} style={{ padding: '0.5rem 1.5rem', background: '#252936' }}>
            <ArrowUp size={18} />
          </button>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="cyber-btn-sec" onClick={() => movePlayer(0, -1)} style={{ padding: '0.5rem 1.5rem', background: '#252936' }}>
              <ArrowLeft size={18} />
            </button>
            <div style={{ width: '46px' }} />
            <button className="cyber-btn-sec" onClick={() => movePlayer(0, 1)} style={{ padding: '0.5rem 1.5rem', background: '#252936' }}>
              <ArrowRight size={18} />
            </button>
          </div>
          <button className="cyber-btn-sec" onClick={() => movePlayer(1, 0)} style={{ padding: '0.5rem 1.5rem', background: '#252936' }}>
            <ArrowDown size={18} />
          </button>
        </div>
      </div>

    </div>
  );
}
