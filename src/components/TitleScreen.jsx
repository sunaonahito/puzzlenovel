import React from 'react';
import { Play, Scroll, Sword } from 'lucide-react';

export default function TitleScreen({ onStart }) {
  return (
    <div className="glass-panel fade-in" style={{
      maxWidth: '650px',
      width: '100%',
      padding: '3rem 2.5rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '2.5rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative medieval top bar */}
      <div style={{
        position: 'absolute',
        top: '12px',
        left: '50%',
        transform: 'translateX(-50%)',
        fontSize: '0.65rem',
        fontWeight: '900',
        letterSpacing: '0.22em',
        color: '#c5a059',
        textTransform: 'uppercase',
        opacity: 0.8,
        whiteSpace: 'nowrap'
      }}>
        ❈ TACTICS & DESTINY OBSERVER ❈
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', marginTop: '1rem' }}>
        <div style={{
          fontSize: '0.8rem',
          fontWeight: '900',
          letterSpacing: '0.3em',
          color: 'var(--text-secondary)',
          textTransform: 'uppercase',
          fontFamily: 'Cinzel, serif'
        }}>
          Chronicle of the Mental Elements
        </div>
        <h1 className="glow-text" style={{
          fontSize: '2.8rem',
          margin: '0.25rem 0',
          fontWeight: '900',
          letterSpacing: '0.05em',
          lineHeight: '1.2',
          fontFamily: 'Cinzel, serif',
          whiteSpace: 'nowrap',
          textAlign: 'center'
        }}>
          PUZZLE & NOVEL
        </h1>
        <div style={{
          fontSize: '1.05rem',
          fontWeight: '600',
          color: 'var(--border-gold)',
          borderTop: '1px solid rgba(197, 160, 89, 0.25)',
          paddingTop: '0.5rem',
          marginTop: '0.25rem',
          fontFamily: 'Noto Serif JP, serif',
          letterSpacing: '0.15em'
        }}>
          運命の観測盤 — 精神的属性診断
        </div>
      </div>

      {/* Retro magical compass orbit illustration */}
      <div className="floating-element" style={{
        width: '140px',
        height: '140px',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0.5rem 0'
      }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          border: '2px solid rgba(197, 160, 89, 0.25)',
          borderRadius: '50%',
          animation: 'rotate 15s linear infinite'
        }}></div>
        <div style={{
          position: 'absolute',
          inset: '12px',
          border: '1.5px dashed rgba(197, 160, 89, 0.4)',
          borderRadius: '50%',
          animation: 'rotate-reverse 10s linear infinite'
        }}></div>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, #fcf4e8 0%, #c5a059 60%, #30220f 100%)',
          boxShadow: '0 0 25px rgba(197, 160, 89, 0.5), inset -2px -2px 5px rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Sword size={22} style={{ color: '#07080d', transform: 'rotate(45deg)' }} />
        </div>
      </div>

      {/* Styled as a vintage scroll */}
      <div className="parchment-scroll" style={{
        width: '100%',
        textAlign: 'left',
        lineHeight: '1.75'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          color: '#2b2318',
          fontWeight: '900',
          fontFamily: 'Noto Serif JP, serif',
          fontSize: '0.95rem',
          borderBottom: '1px solid rgba(143, 116, 75, 0.4)',
          paddingBottom: '0.4rem',
          marginBottom: '0.6rem'
        }}>
          <Scroll size={18} style={{ color: '#8f744b' }} />
          <span>運命の観測プロトコル起動準備</span>
        </div>
        この診断は、自己申告式のクイズではありません。実際に数々のパズルや物語の分岐点を通り抜けていただき、その『解き方』や『行動パターン（計画性・直感・堅実さ・大胆さ）』を精神的エレメント方位盤上に投影することで、あなたの真の精神的エレメントを診断します。
      </div>

      <button className="cyber-btn" onClick={onStart} style={{ padding: '1rem 3.5rem', fontSize: '1.05rem' }}>
        <Play size={18} fill="currentColor" />
        診断ゲートを開く
      </button>

      <div style={{
        fontSize: '0.75rem',
        color: 'var(--text-dim)',
        letterSpacing: '0.05em',
        fontFamily: 'Cinzel, serif'
      }}>
        © 1995-2026 PUZZLE & NOVEL SAGA // ALL RIGHTS RESERVED
      </div>
    </div>
  );
}
