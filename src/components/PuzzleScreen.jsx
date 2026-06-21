import React, { useState, useEffect, useRef } from 'react';
import { RotateCcw, Key, Lock, Unlock, Zap, HelpCircle, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Star } from 'lucide-react';

const LEVELS = [
  {
    id: 0,
    name: '領域01: 二択の路',
    description: '安全な遠回りか、危険な近道か。',
    grid: [
      ['#', '#', '#', '#', '#', '#', '#'],
      ['#', 'S', '.', '.', '.', '.', '#'],
      ['#', '#', '#', 'T', '#', '.', '#'],
      ['#', '.', '.', '.', '#', '.', '#'],
      ['#', '.', '#', '#', '#', '.', '#'],
      ['#', '.', '.', '.', '.', 'G', '#'],
      ['#', '#', '#', '#', '#', '#', '#']
    ],
    start: { r: 1, c: 1 },
    goal: { r: 5, c: 5 }
  },
  {
    id: 1,
    name: '領域02: 秘匿の宝箱',
    description: '目標に直行するか、リスクを取って財宝を探すか。',
    grid: [
      ['#', '#', '#', '#', '#', '#', '#', '#'],
      ['#', 'S', '.', '.', '#', '.', 'K', '#'],
      ['#', '#', '#', '.', '#', '.', '#', '#'],
      ['#', 'C', '.', '.', '.', '.', '.', '#'],
      ['#', '#', '#', '.', '#', '#', '.', '#'],
      ['#', 'G', '.', '.', '#', '.', '.', '#'],
      ['#', '#', '#', '#', '#', '#', '#', '#']
    ],
    start: { r: 1, c: 1 },
    goal: { r: 5, c: 1 }
  },
  {
    id: 2,
    name: '領域03: 脈動する防壁',
    description: 'タイミングを見極めるか、勢いで駆け抜けるか。',
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
  }
];

export default function PuzzleScreen({ onPuzzleComplete }) {
  const [levelIndex, setLevelIndex] = useState(0);
  const currentLevel = LEVELS[levelIndex];
  
  // Game states
  const [playerPos, setPlayerPos] = useState(currentLevel.start);
  const [history, setHistory] = useState([]);
  const [hasKey, setHasKey] = useState(false);
  const [chestOpened, setChestOpened] = useState(false);
  const [starCollected, setStarCollected] = useState(false);
  const [steps, setSteps] = useState(0);
  const [lunaHint, setLunaHint] = useState('キーボード（矢印キー / WASD）または画面下の方向キーでアバターを動かしてください。');
  
  // Dynamic map cells (for crumbling tiles)
  const [crumblingTiles, setCrumblingTiles] = useState({});
  // Lasers active state
  const [lasersActive, setLasersActive] = useState(false);

  // Telemetry references for personality diagnostics
  const undoCountRef = useRef(0);
  const startTimeRef = useRef(null);
  const levelFirstMoveTimeRef = useRef([]); // seconds before first move in each level
  const firstMoveMadeRef = useRef(false);
  
  // Specific actions tracked
  const [level1Choice, setLevel1Choice] = useState(''); // 'short_route' or 'long_route'
  const [level2Choice, setLevel2Choice] = useState(''); // 'goal_direct', 'get_chest', 'inspect_chest_first'
  const [level3Choice, setLevel3Choice] = useState(''); // 'dash_laser', 'patient_laser'
  
  // Laser timer
  useEffect(() => {
    if (levelIndex !== 2) return;
    const interval = setInterval(() => {
      setLasersActive(prev => !prev);
    }, 1500);
    return () => clearInterval(interval);
  }, [levelIndex]);

  // Handle Level Reset / Setup
  useEffect(() => {
    setPlayerPos(currentLevel.start);
    setHistory([]);
    setHasKey(false);
    setChestOpened(false);
    setStarCollected(false);
    setSteps(0);
    setCrumblingTiles({});
    
    firstMoveMadeRef.current = false;
    startTimeRef.current = Date.now();

    // Default hint for levels
    if (levelIndex === 0) {
      setLunaHint('目の前の橋は崩れやすそうです（T）。迂回するか、リスクを背負って直進するか、あなたの判断を観測します。');
    } else if (levelIndex === 1) {
      setLunaHint('目標（G）はすぐそこですが、宝箱（C）と鍵（K）が配置されています。どう進めるか観察しています。');
    } else if (levelIndex === 2) {
      setLunaHint('セキュリティレーザー（L）が一定間隔で点滅しています。接触すればスタート位置にリセットされます。');
    }
  }, [levelIndex]);

  // Handle laser hazard collision
  useEffect(() => {
    if (levelIndex === 2 && lasersActive) {
      const isPlayerOnLaser = currentLevel.grid[playerPos.r][playerPos.c] === 'L';
      if (isPlayerOnLaser) {
        // Hit! Reset to start
        setPlayerPos(currentLevel.start);
        setHistory([]);
        undoCountRef.current += 1;
        setLunaHint('警告：レーザーに接触しました。初期位置に差し戻します。タイミングをよく見てください。');
        setLevel3Choice('hit_laser');
      }
    }
  }, [lasersActive, playerPos, levelIndex]);

  // Movement handler
  const movePlayer = (dr, dc) => {
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

    // Level 1 logic: Path classification
    if (levelIndex === 0) {
      if (nc >= 4 && !level1Choice) {
        setLevel1Choice('short_route'); // went right towards crumbling tile
      } else if (nr >= 3 && !level1Choice) {
        setLevel1Choice('long_route'); // went down to detour
      }
    }

    // Level 2 logic: Path classification
    if (levelIndex === 1) {
      if (nc >= 4 && !level2Choice) {
        setLevel2Choice('get_chest'); // went right towards key
      }
    }

    // Handle Crumbling Tile (Level 1)
    if (targetCell === 'T') {
      const tileKey = `${nr},${nc}`;
      const stepCount = crumblingTiles[tileKey] || 0;
      if (stepCount >= 1) {
        // Second time stepping on it or stood still: reset player
        setPlayerPos(currentLevel.start);
        setHistory([]);
        undoCountRef.current += 1;
        setLunaHint('警告：足場が崩れました。初期位置へ差し戻します。');
        return;
      } else {
        setCrumblingTiles(prev => ({ ...prev, [tileKey]: stepCount + 1 }));
        setLunaHint('足元が崩れかけています！急いで通り抜けてください。');
      }
    }

    // Handle Key Pickups
    if (targetCell === 'K') {
      setHasKey(true);
      setLunaHint('鍵を回収しました。これでセキュリティチェストを開けられます。');
    }

    // Handle Chest Interaction
    if (targetCell === 'C') {
      if (hasKey) {
        if (!chestOpened) {
          setChestOpened(true);
          setStarCollected(true);
          setLunaHint('チェストを開放。隠されたスターを獲得しました！');
        }
      } else {
        setLunaHint('このチェストはロックされています。鍵（K）が必要です。');
        // If they click/step on chest without key, note it
        if (!level2Choice) {
          setLevel2Choice('inspect_chest_first');
        }
        return; // Can't walk over locked chest
      }
    }

    // Handle Lasers (Level 3)
    if (targetCell === 'L') {
      if (lasersActive) {
        // Hit! Reset
        setPlayerPos(currentLevel.start);
        setHistory([]);
        undoCountRef.current += 1;
        setLunaHint('警告：アクティブなレーザーに衝突しました。初期位置に戻ります。');
        setLevel3Choice('hit_laser');
        return;
      } else {
        // Safe passing
        setLunaHint('レーザーが消えている隙に通過しました！');
        if (!level3Choice) {
          // If they passed laser in under 3 seconds from level start
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
    if (levelIndex < LEVELS.length - 1) {
      setLevelIndex(levelIndex + 1);
    } else {
      // Calculate final telemetry metrics
      const averageFirstMoveTime = levelFirstMoveTimeRef.current.reduce((a, b) => a + b, 0) / LEVELS.length;
      
      const metrics = {
        averageFirstMoveTime,
        totalUndos: undoCountRef.current,
        level1Choice,
        level2Choice: level2Choice || 'goal_direct', // if not set, they went straight to goal
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
    setLunaHint('手数を1手戻しました。慎重に進めるのも良い選択です。');
  };

  const handleReset = () => {
    setPlayerPos(currentLevel.start);
    setHistory([]);
    setSteps(0);
    setCrumblingTiles({});
    undoCountRef.current += 1;
    setLunaHint('現在のステージをリセットしました。');
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
  }, [playerPos, hasKey, chestOpened, levelIndex, crumblingTiles, lasersActive]);

  // Inspect Element on grid click
  const handleCellClick = (r, c) => {
    const dr = r - playerPos.r;
    const dc = c - playerPos.c;
    
    // If adjacent, move there
    if (Math.abs(dr) + Math.abs(dc) === 1) {
      movePlayer(dr, dc);
    } else {
      // Just inspect
      const clickedCell = currentLevel.grid[r][c];
      if (clickedCell === 'T') {
        setLunaHint('観測：崩れる足場（T）。乗るとひびが入り、さらにもう一歩留まると崩壊して初期化されます。');
      } else if (clickedCell === 'C') {
        setLunaHint(chestOpened ? '開放済みのセキュリティチェスト。' : 'ロックされたセキュリティチェスト（C）。開けるには鍵（K）が必要です。');
      } else if (clickedCell === 'K') {
        setLunaHint('認証用キー（K）。チェストを開錠するのに必須のアイテム。');
      } else if (clickedCell === 'L') {
        setLunaHint('セキュリティレーザー（L）。1.5秒ごとに活性化（赤色）し、侵入者を検知してリセットします。');
      } else if (clickedCell === 'G') {
        setLunaHint('ゴール（G）。ここまでアバターを誘導するとゲートが開きます。');
      } else if (clickedCell === '#') {
        setLunaHint('遮断された壁面です。通過できません。');
      }
    }
  };

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
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        paddingBottom: '1rem'
      }}>
        <div style={{ textAlign: 'left' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: '700' }}>
            GATE 0{levelIndex + 1} / 03
          </div>
          <h2 style={{ fontSize: '1.35rem', marginTop: '0.2rem' }}>{currentLevel.name}</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{currentLevel.description}</p>
        </div>

        {/* Level indicators */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {[0, 1, 2].map(idx => (
            <div
              key={idx}
              style={{
                width: '32px',
                height: '6px',
                borderRadius: '3px',
                background: idx === levelIndex ? 'var(--primary)' : idx < levelIndex ? 'rgba(16, 185, 129, 0.4)' : 'rgba(255,255,255,0.06)',
                boxShadow: idx === levelIndex ? '0 0 10px var(--primary-glow)' : 'none'
              }}
            />
          ))}
        </div>
      </div>

      {/* Main Layout: Grid on Left, Info HUD on Right */}
      <div className="puzzle-layout">
        {/* Left Side: Interactive Grid Map */}
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
                const crumbleCount = crumblingTiles[tileKey] || 0;
                
                // Determine styling
                let cellClass = 'grid-cell cell-floor';
                if (isWall) cellClass = 'grid-cell cell-wall';
                else if (isCrumbling) cellClass = `grid-cell cell-floor cell-crumbling ${crumbleCount > 0 ? 'stepped' : ''}`;
                else if (isLaser && lasersActive) cellClass = 'grid-cell cell-floor cell-laser-active';

                return (
                  <div
                    key={`${r}-${c}`}
                    className={cellClass}
                    onClick={() => handleCellClick(r, c)}
                    style={{ cursor: isWall ? 'default' : 'pointer' }}
                  >
                    {/* Render Player Avatar */}
                    {isPlayer && (
                      <div className="grid-item player-core" />
                    )}

                    {/* Render Goal Exit */}
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
                      <div className={`grid-item item-chest ${chestOpened ? 'opened' : ''}`}>
                        {chestOpened ? <Unlock size={18} /> : <Lock size={18} />}
                      </div>
                    )}

                    {/* Render Crumbling Crack graphic */}
                    {!isPlayer && isCrumbling && crumbleCount > 0 && (
                      <div style={{
                        fontSize: '0.6rem',
                        fontWeight: '900',
                        color: 'rgba(239, 68, 68, 0.7)',
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        CRACK
                      </div>
                    )}

                    {/* Render Laser warnings */}
                    {!isPlayer && isLaser && (
                      <div style={{
                        width: '4px',
                        height: '100%',
                        background: lasersActive ? '#ef4444' : 'rgba(239, 68, 68, 0.2)',
                        boxShadow: lasersActive ? '0 0 10px #ef4444' : 'none',
                        position: 'absolute',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        transition: 'background 0.1s'
                      }} />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Information and HUD Controller */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {/* Mini Companion Textbox */}
          <div style={{
            background: 'rgba(0, 229, 255, 0.03)',
            border: '1px solid rgba(0, 229, 255, 0.12)',
            borderRadius: '12px',
            padding: '1rem',
            textAlign: 'left'
          }}>
            <div style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--primary)', marginBottom: '0.25rem' }}>
              ルナの分析
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: '1.5' }}>
              {lunaHint}
            </div>
          </div>

          {/* Hud Telemetry Card */}
          <div className="hud-card">
            <div className="hud-row">
              <span className="hud-label">歩数 (Steps)</span>
              <span className="hud-value" style={{ fontFamily: 'monospace' }}>{steps}</span>
            </div>
            <div className="hud-row">
              <span className="hud-label">所持キー (Key)</span>
              <span className="hud-value" style={{ color: hasKey ? '#fbbf24' : 'var(--text-dim)' }}>
                {hasKey ? '1 / 1' : '0 / 1'}
              </span>
            </div>
            <div className="hud-row">
              <span className="hud-label">星の獲得 (Star)</span>
              <span className="hud-value" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: starCollected ? '#fbbf24' : 'var(--text-dim)' }}>
                <Star size={16} fill={starCollected ? '#fbbf24' : 'none'} />
                <span>{starCollected ? 'Collected' : 'None'}</span>
              </span>
            </div>
          </div>

          {/* Controls: Undo and Reset */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <button className="cyber-btn-sec" onClick={handleUndo} disabled={history.length === 0} style={{
              justifyContent: 'center',
              opacity: history.length === 0 ? 0.4 : 1,
              cursor: history.length === 0 ? 'default' : 'pointer'
            }}>
              <RotateCcw size={16} />
              <span>Undo</span>
            </button>
            <button className="cyber-btn-sec" onClick={handleReset} style={{ justifyContent: 'center' }}>
              <RotateCcw size={16} />
              <span>Reset</span>
            </button>
          </div>

        </div>
      </div>

      {/* Mobile D-Pad Control Panel */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '4px',
        marginTop: '0.5rem',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
        paddingTop: '1.25rem'
      }}>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '0.5rem' }}>
          MOBILE CONTROL D-PAD
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
          <button className="cyber-btn-sec" onClick={() => movePlayer(-1, 0)} style={{ padding: '0.5rem 1.25rem' }}>
            <ArrowUp size={18} />
          </button>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="cyber-btn-sec" onClick={() => movePlayer(0, -1)} style={{ padding: '0.5rem 1.25rem' }}>
              <ArrowLeft size={18} />
            </button>
            <div style={{ width: '42px' }} />
            <button className="cyber-btn-sec" onClick={() => movePlayer(0, 1)} style={{ padding: '0.5rem 1.25rem' }}>
              <ArrowRight size={18} />
            </button>
          </div>
          <button className="cyber-btn-sec" onClick={() => movePlayer(1, 0)} style={{ padding: '0.5rem 1.25rem' }}>
            <ArrowDown size={18} />
          </button>
        </div>
      </div>

    </div>
  );
}
