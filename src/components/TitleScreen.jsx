import React from 'react';
import { Play, ShieldAlert, Cpu } from 'lucide-react';

export default function TitleScreen({ onStart }) {
  return (
    <div className="glass-panel fade-in" style={{
      maxWidth: '650px',
      width: '100%',
      padding: '3rem 2rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '2.5rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Visual cyber decorations */}
      <div style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        opacity: 0.15,
        color: '#00e5ff'
      }}>
        <Cpu size={48} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
        <div style={{
          fontSize: '0.85rem',
          fontWeight: '900',
          letterSpacing: '0.4em',
          color: 'var(--primary)',
          textTransform: 'uppercase',
          textIndent: '0.4em'
        }}>
          Puzzle × Visual Novel
        </div>
        <h1 className="glow-text" style={{
          fontSize: '3.5rem',
          margin: '0.5rem 0',
          fontWeight: '800',
          letterSpacing: '-0.03em',
          lineHeight: '1.1'
        }}>
          PUZUNOVE
        </h1>
        <div style={{
          fontSize: '1.1rem',
          fontWeight: '500',
          color: 'var(--text-secondary)',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          paddingTop: '0.5rem',
          marginTop: '0.25rem'
        }}>
          境界の観測者 — パズノベ性格診断
        </div>
      </div>

      {/* Intro Graphic / Orbit animation */}
      <div className="floating-element" style={{
        width: '140px',
        height: '140px',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifycontent: 'center',
        margin: '1rem 0'
      }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          border: '2px solid rgba(0, 229, 255, 0.15)',
          borderRadius: '35% 65% 70% 30% / 30% 40% 60% 70%',
          animation: 'rotate 12s linear infinite'
        }}></div>
        <div style={{
          position: 'absolute',
          inset: '10px',
          border: '1.5px dashed rgba(168, 85, 247, 0.3)',
          borderRadius: '65% 35% 30% 70% / 60% 30% 70% 40%',
          animation: 'rotate-reverse 8s linear infinite'
        }}></div>
        <div style={{
          width: '50px',
          height: '50px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--primary) 0%, #a855f7 100%)',
          boxShadow: '0 0 25px rgba(0, 229, 255, 0.5), 0 0 25px rgba(168, 85, 247, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Cpu size={24} style={{ color: '#0a0e1a' }} />
        </div>
      </div>

      <div className="glass-panel" style={{
        background: 'rgba(10, 14, 26, 0.4)',
        padding: '1.25rem 1.5rem',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.04)',
        fontSize: '0.95rem',
        textAlign: 'left',
        color: 'var(--text-secondary)',
        lineHeight: '1.7',
        width: '100%'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          color: 'var(--text-primary)',
          fontWeight: '700',
          marginBottom: '0.5rem'
        }}>
          <ShieldAlert size={18} style={{ color: 'var(--primary)' }} />
          <span>観測プロトコル起動準備</span>
        </div>
        この診断は、自己申告式のクイズではありません。実際に数々のパズルや物語の分岐点を通り抜けていただき、その『解き方』や『行動パターン（計画性・直感・堅実さ・大胆さ）』をリアルタイムに観測することで、あなたの真の認知スタイルを診断します。
      </div>

      <button className="cyber-btn" onClick={onStart} style={{ padding: '1rem 3rem', fontSize: '1.1rem' }}>
        <Play size={18} fill="currentColor" />
        診断マトリクスを開始
      </button>

      <div style={{
        fontSize: '0.75rem',
        color: 'var(--text-dim)',
        letterSpacing: '0.05em'
      }}>
        © 2026 PUZUNOVE.APP // ALL RIGHTS OBSERVED
      </div>
    </div>
  );
}
