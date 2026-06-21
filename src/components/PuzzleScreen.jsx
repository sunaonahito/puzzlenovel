import React, { useState, useEffect, useRef } from 'react';
import { RotateCcw, Key, Lock, Unlock, Zap, HelpCircle, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Star } from 'lucide-react';

const LEVELS = [
  {
    id: 0,
    name: '試練01: 二択の架け橋',
    description: '安全な迂回路か、崩落の危険がある最短ルートか。',
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
    name: '試練02: 秘匿の宝物庫',
    description: 'ゲート開放へ急ぐか、危険を冒して財宝を回収するか。',
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
    name: '試練03: 脈動する魔力壁',
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
  const [lunaHint, setLunaHint] = useState('アバター（盾）を操作して、緑のゴールゲートへ誘導してください。');
  
  // Dynamic map cells (for crumbling tiles)
  const [crumblingTiles, setCrumblingTiles] = useState({});
  // Lasers active state
  const [lasersActive, setLasersActive] = useState(false);

  // Telemetry references for personality diagnostics
  const undoCountRef = useRef(0);
  const startTimeRef = useRef(null);
  const levelFirstMoveTimeRef = useRef([]); 
  const firstMoveMadeRef = useRef(false);
  
  // Specific actions tracked
  const [level1Choice, setLevel1Choice] = useState(''); 
  const [level2Choice, setLevel2Choice] = useState(''); 
  const [level3Choice, setLevel3Choice] = useState(''); 
  
  // Laser timer (lightning runes)
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
      setLunaHint('目の前の橋は腐食し崩れやすそうです（T）。安全な遠回り（下方向）か、崩落の危険がある直線か、あなたの選択を観測します。');
    } else if (levelIndex === 1) {
      setLunaHint('ゴール（G）は目の前ですが、宝箱（C）と鍵（K）が配置されています。宝箱の回収にはリスクと手数が伴います。どう進めますか？');
    } else if (levelIndex === 2) {
      setLunaHint('雷鳴の魔力壁（L）が一定周期で明滅しています。雷撃に触れれば初期地点にリセットされます。立ち止まり観察するのも手です。');
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
        setLunaHint('警告：魔力壁の放電に被弾しました。初期位置に戻します。障壁の消える周期をよく見てください。');
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
        setLevel1Choice('short_route'); 
      } else if (nr >= 3 && !level1Choice) {
        setLevel1Choice('long_route'); 
      }
    }

    // Level 2 logic: Path classification
    if (levelIndex === 1) {
      if (nc >= 4 && !level2Choice) {
        setLevel2Choice('get_chest'); 
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
        setLunaHint('警告：木橋が踏み抜かれ崩壊しました。初期位置へ差し戻します。');
        return;
      } else {
        setCrumblingTiles(prev => ({ ...prev, [tileKey]: stepCount + 1 }));
        setLunaHint('木橋がギシギシと音を立てています！長居すると崩壊します！');
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
      if (lasersActive) {
        setPlayerPos(currentLevel.start);
        setHistory([]);
        undoCountRef.current += 1;
        setLunaHint('警告：放電中の魔力壁に衝突しました。初期位置に戻ります。');
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
    if (levelIndex < LEVELS.length - 1) {
      setLevelIndex(levelIndex + 1);
    } else {
      const averageFirstMoveTime = levelFirstMoveTimeRef.current.reduce((a, b) => a + b, 0) / LEVELS.length;
      
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
  }, [playerPos, hasKey, chestOpened, levelIndex, crumblingTiles, lasersActive]);

  const handleCellClick = (r, c) => {
    const dr = r - playerPos.r;
    const dc = c - playerPos.c;
    
    if (Math.abs(dr) + Math.abs(dc) === 1) {
      movePlayer(dr, dc);
    } else {
      const clickedCell = currentLevel.grid[r][c];
      if (clickedCell === 'T') {
        setLunaHint('観測：崩落する木橋（T）。一度乗ると足場が傷つき、留まり続けると崩れて下に落下します。');
      } else if (clickedCell === 'C') {
        setLunaHint(chestOpened ? '開放済みの古い木製宝箱。' : 'ロックされた宝箱（C）。開けるには鍵（K）が必要です。');
      } else if (clickedCell === 'K') {
        setLunaHint('真鍮製の鍵（K）。宝箱を開けるために必要な鍵。');
      } else if (clickedCell === 'L') {
        setLunaHint('雷鳴の魔力壁（L）。1.5秒ごとに放電（黄色）し、侵入者を消滅させてリセットします。');
      } else if (clickedCell === 'G') {
        setLunaHint('ゴールゲート（G）。アバターを誘導すると次の試練への扉が開きます。');
      } else if (clickedCell === '#') {
        setLunaHint('切り立った石壁です。通行不能。');
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
                const crumbleCount = crumblingTiles[tileKey] || 0;
                
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
                    {/* Render Player (Knight's Shield) */}
                    {isPlayer && (
                      <div className="grid-item player-core" style={{ borderRadius: '4px' }} />
                    )}

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
                        color: crumbleCount > 0 ? '#ef4444' : '#8a6c50',
                        position: 'absolute',
                        bottom: '2px',
                        width: '100%',
                        textAlign: 'center',
                        fontFamily: 'monospace'
                      }}>
                        {crumbleCount > 0 ? 'CRACKED' : 'WOOD'}
                      </div>
                    )}

                    {/* Render electric lightning warning */}
                    {!isPlayer && isLaser && (
                      <div style={{
                        position: 'absolute',
                        inset: '2px',
                        border: lasersActive ? '2px solid #d99126' : '1px dashed rgba(217, 145, 38, 0.2)',
                        borderRadius: '2px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: lasersActive ? 'rgba(217, 145, 38, 0.25)' : 'none',
                        transition: 'all 0.1s'
                      }}>
                        <Zap size={10} style={{ color: lasersActive ? '#d99126' : 'rgba(217, 145, 38, 0.15)' }} />
                      </div>
                    )}
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
              <span className="hud-label">消費歩数 (STEPS)</span>
              <span className="hud-value">{steps}</span>
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
