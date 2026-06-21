import React, { useRef, useState } from 'react';
import { Download, Share2, RotateCcw, Copy, Check, Users, Sparkles, AlertCircle } from 'lucide-react';

const TYPES = {
  tactician: {
    key: 'tactician',
    name: '策士',
    english: 'TACTICIAN',
    color: 'var(--color-tactician)',
    colorRgb: 'var(--color-tactician-rgb)',
    accent: '#ff6b6b',
    catchphrase: '「読み切って、跳ぶ。」',
    description: '飛び込む前に必ず盤面を読む。けれど読み終えた瞬間に選ぶのは、誰よりも大胆な一手。あなたの慎重さは臆病さではなく、大勝負のための助走です。静かに勝ち筋を組み立て、ここぞで全部を賭けられる人。',
    strength: 'リスクを「計算された勝機」に変えられる。',
    weakness: '全部読み切るまで動けず、たまに考えすぎて好機を見送る。完璧な一手を狙いすぎる癖も。',
    partner: '冒険者',
    partnerDesc: '攻めたい方向が同じ。あなたが設計図を描く間に、迷わず先陣を切ってくれる。',
    opposite: '目利き',
    oppositeDesc: '何もかも正反対。十手読む場面を一瞬の勘で決めてしまう。理解はできない、だから目が離せない。'
  },
  adventurer: {
    key: 'adventurer',
    name: '冒険者',
    english: 'ADVENTURER',
    color: 'var(--color-adventurer)',
    colorRgb: 'var(--color-adventurer-rgb)',
    accent: '#ffb830',
    catchphrase: '「まず跳ぶ。理由はあとから。」',
    description: '考えるより先に手が動く。閉じた扉は、開けてみないと気が済まない。転んでもそれを次の燃料に変えて走り続ける、止まらないエンジンのような人。誰も動けない局面で、最初の一歩を踏み出せるのはあなただけ。',
    strength: '停滞を破る、最初の一歩の勇気。',
    weakness: '勢いが余って、ひと呼吸置けば防げたミスを踏むことも。退屈には一秒も耐えられない。',
    partner: '策士',
    partnerDesc: '同じく攻める仲間。あなたが突っ込む前に勝ち筋を読んでくれる。勢いに設計図が加われば無敵。',
    opposite: '職人肌',
    oppositeDesc: '正反対。三秒で済ます所を丁寧に積み上げていく。じれったい、けどその手堅さにこっそり憧れている。'
  },
  craftsman: {
    key: 'craftsman',
    name: '職人肌',
    english: 'CRAFTSMAN',
    color: 'var(--color-craftsman)',
    colorRgb: 'var(--color-craftsman-rgb)',
    accent: '#00d2c4',
    catchphrase: '「確かなものだけを、積み上げる。」',
    description: '派手さより確かさを選ぶ。手順を読み、無駄を削り、絶対に崩れない一手を置いていく。あなたが通った道は、後から誰が歩いても安全。長い勝負でこそ真価を発揮する、信頼そのものの人。',
    strength: '最後まで崩れない、揺るぎない安定感。',
    weakness: '石橋を叩きすぎて、たまに渡るタイミングを逃す。本当は少しだけ冒険に憧れている。',
    partner: '目利き',
    partnerDesc: '守りの価値観が同じ。あなたが熟考する場面を、勘で素早く埋めてくれる。',
    opposite: '冒険者',
    oppositeDesc: '正反対。無計画に飛び込んで、なぜか成功してしまう。呆れと羨望が半分ずつ。'
  },
  connoisseur: {
    key: 'connoisseur',
    name: '目利き',
    english: 'CONNOISSEUR',
    color: 'var(--color-connoisseur)',
    colorRgb: 'var(--color-connoisseur-rgb)',
    accent: '#a855f7',
    catchphrase: '「迷わない。でも、踏み外さない。」',
    description: '長考しない。それでいて選ぶのは、いつも堅実な一手。危ない橋には乗らず、最短で「間違いのない選択」に手が伸びる。その勘は、積み重ねた経験が結晶になったもの。速さと安全を両立できる、頼れる即断力の持ち主。',
    strength: '速いのに、外さない。',
    weakness: '直感が外れた時の立て直しは少し苦手。確実すぎて、大きな波に乗り損ねることも。',
    partner: '職人肌',
    partnerDesc: '安全志向が一致。あなたの勘での一手を、丁寧に裏打ちしてくれる。',
    opposite: '策士',
    oppositeDesc: '正反対。一瞬で決めるあなたと、十手先まで読む相手。時間の流れる速さが違うのに、なぜか惹かれ合う。'
  }
};

export default function ResultScreen({ scores, metrics, onReset }) {
  const canvasRef = useRef(null);
  const [copied, setCopied] = useState(false);

  // Normalize scores to fall between -100 and +100
  const clamp = (val) => Math.max(-100, Math.min(100, val));
  const finalX = clamp(scores.planningVsIntuition);
  const finalY = clamp(scores.solidVsBold);

  // Determine Type based on quadrant signs
  let diagnosedTypeKey = 'craftsman';
  if (finalX >= 0 && finalY >= 0) diagnosedTypeKey = 'tactician';     // 計画 × 大胆
  else if (finalX < 0 && finalY >= 0) diagnosedTypeKey = 'adventurer'; // 直感 × 大胆
  else if (finalX >= 0 && finalY < 0) diagnosedTypeKey = 'craftsman';  // 計画 × 堅実
  else if (finalX < 0 && finalY < 0) diagnosedTypeKey = 'connoisseur'; // 直感 × 堅実

  const currentType = TYPES[diagnosedTypeKey];

  // Helper for generating text for copy/paste sharing
  const shareText = `【Puzunove診断結果】\n私の認知スタイルは『${currentType.name} (${currentType.english})』でした！\n${currentType.catchphrase}\n\n■ 思考軸: ${finalX >= 0 ? `計画派 (+${finalX})` : `直感派 (${finalX})`}\n■ 行動軸: ${finalY >= 0 ? `大胆派 (+${finalY})` : `堅実派 (${finalY})`}\n\nパズルの解き方から行動パターンを診断する新感覚ゲーム。あなたも測ってみませんか？\n#Puzunove #性格診断 #パズノベ診断\nhttps://puzunove.app`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  // Render Result Card in HTML Canvas and download as PNG
  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Dimensions: 600x900
    const w = 600;
    const h = 900;
    canvas.width = w;
    canvas.height = h;

    // Draw Background
    ctx.fillStyle = '#0a0e1a';
    ctx.fillRect(0, 0, w, h);

    // Subtle Radial Background Glow based on type color
    const grad = ctx.createRadialGradient(w/2, h/2, 50, w/2, h/2, 450);
    grad.addColorStop(0, `${currentType.accent}22`);
    grad.addColorStop(1, '#0a0e1a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Draw grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Outer border
    ctx.strokeStyle = `${currentType.accent}44`;
    ctx.lineWidth = 4;
    ctx.strokeRect(15, 15, w - 30, h - 30);

    // Inner subtle border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    ctx.strokeRect(25, 25, w - 50, h - 50);

    // Header title
    ctx.fillStyle = 'rgba(0, 229, 255, 0.6)';
    ctx.font = 'bold 12px "Outfit", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('PUZUNOVE // COGNITIVE OBSERVATION CARD', w / 2, 60);

    // Draw Type Accent Color Banner
    ctx.fillStyle = currentType.accent;
    ctx.fillRect(50, 85, w - 100, 6);

    // English type name
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '900 20px "Outfit", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(currentType.english, w / 2, 115);

    // Japanese type name
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 48px "Noto Sans JP", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(currentType.name, w / 2, 165);

    // Catchphrase
    ctx.fillStyle = currentType.accent;
    ctx.font = 'bold 20px "Noto Sans JP", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(currentType.catchphrase, w / 2, 215);

    // Description text (wrapped)
    ctx.fillStyle = '#94a3b8';
    ctx.font = '14px "Noto Sans JP", sans-serif';
    ctx.textAlign = 'left';
    
    // Text wrap helper
    const wrapText = (text, x, y, maxWidth, lineHeight) => {
      const words = text.split('');
      let line = '';
      let currentY = y;
      
      for (let n = 0; n < words.length; n++) {
        let testLine = line + words[n];
        let metrics = ctx.measureText(testLine);
        let testWidth = metrics.width;
        if (testWidth > maxWidth && n > 0) {
          ctx.fillText(line, x, currentY);
          line = words[n];
          currentY += lineHeight;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, x, currentY);
      return currentY + lineHeight;
    };
    
    let descEndY = wrapText(currentType.description, 60, 260, w - 120, 24);

    // Draw Strengths Box
    ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(50, descEndY + 10, w - 100, 110, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = currentType.accent;
    ctx.font = 'bold 12px "Noto Sans JP", sans-serif';
    ctx.fillText('▼ あなたの強み (STRENGTH)', 70, descEndY + 35);
    ctx.fillStyle = '#f8fafc';
    ctx.font = '14px "Noto Sans JP", sans-serif';
    wrapText(currentType.strength, 70, descEndY + 58, w - 140, 20);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.font = 'bold 12px "Noto Sans JP", sans-serif';
    ctx.fillText('▼ 愛嬌・ウィークポイント (WEAKNESS)', 70, descEndY + 85);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '13px "Noto Sans JP", sans-serif';
    wrapText(currentType.weakness, 70, descEndY + 105, w - 140, 18);

    // 2D Coordinates Grid plot
    const graphSize = 160;
    const graphX = w / 2 - graphSize / 2;
    const graphY = descEndY + 145;

    // Draw graph background
    ctx.fillStyle = '#060a14';
    ctx.beginPath();
    ctx.roundRect(graphX, graphY, graphSize, graphSize, 6);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(graphX, graphY, graphSize, graphSize);

    // Draw axis lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.beginPath();
    ctx.moveTo(graphX + graphSize / 2, graphY);
    ctx.lineTo(graphX + graphSize / 2, graphY + graphSize);
    ctx.moveTo(graphX, graphY + graphSize / 2);
    ctx.lineTo(graphX + graphSize, graphY + graphSize / 2);
    ctx.stroke();

    // Labels
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.font = 'bold 9px "Noto Sans JP", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('計画', graphX + graphSize / 2, graphY - 6);
    ctx.fillText('直感', graphX + graphSize / 2, graphY + graphSize + 13);
    ctx.textAlign = 'left';
    ctx.fillText('大胆', graphX + graphSize + 6, graphY + graphSize / 2 + 3);
    ctx.textAlign = 'right';
    ctx.fillText('堅実', graphX - 6, graphY + graphSize / 2 + 3);

    // Plot user coordinates
    const px = graphX + graphSize / 2 + (finalX / 100) * (graphSize / 2);
    const py = graphY + graphSize / 2 - (finalY / 100) * (graphSize / 2); // invert Y for canvas orientation

    ctx.fillStyle = currentType.accent;
    ctx.shadowColor = currentType.accent;
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(px, py, 6, 0, Math.PI * 2);
    ctx.fill();

    // Reset shadow
    ctx.shadowBlur = 0;

    // Draw Matches
    ctx.textAlign = 'left';
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 13px "Noto Sans JP", sans-serif';
    ctx.fillText(`★ ベスト相棒 (名コンビ): ${currentType.partner}`, 50, graphY + graphSize + 45);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px "Noto Sans JP", sans-serif';
    ctx.fillText(currentType.partnerDesc, 65, graphY + graphSize + 65);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 13px "Noto Sans JP", sans-serif';
    ctx.fillText(`⚡ 気になる相手 (正反対): ${currentType.opposite}`, 50, graphY + graphSize + 95);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px "Noto Sans JP", sans-serif';
    ctx.fillText(currentType.oppositeDesc, 65, graphY + graphSize + 115);

    // Draw Footer Brand
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(0, 229, 255, 0.4)';
    ctx.font = 'bold 12px "Outfit", sans-serif';
    ctx.fillText('PUZUNOVE.APP // 観測データ', w / 2, h - 50);

    // Download file link trigger
    const link = document.createElement('a');
    link.download = `puzunove_${currentType.english.toLowerCase()}_result.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="glass-panel fade-in" style={{
      maxWidth: '650px',
      width: '100%',
      padding: '2.5rem 1.75rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '2.25rem'
    }}>
      
      {/* Diagnosed Header */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
        <div style={{
          fontSize: '0.75rem',
          fontWeight: '900',
          letterSpacing: '0.3em',
          color: 'var(--primary)',
          textTransform: 'uppercase'
        }}>
          Observation Complete
        </div>
        <h2 style={{
          fontSize: '2rem',
          fontWeight: '900',
          color: currentType.accent,
          textShadow: `0 0 10px ${currentType.accent}33`
        }}>
          【{currentType.name}】
        </h2>
        <div style={{
          fontSize: '0.9rem',
          color: 'var(--text-secondary)',
          fontFamily: 'Outfit',
          letterSpacing: '0.1em'
        }}>
          {currentType.english}
        </div>
      </div>

      {/* 2D Coordinates Grid and Coordinates detail */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: '2rem',
        alignItems: 'center'
      }}>
        {/* Graph */}
        <div className="results-graph-container" style={{ margin: 0 }}>
          <div className="coordinate-grid">
            <div className="coordinate-axis-x" />
            <div className="coordinate-axis-y" />
            
            {/* Plot User Dot */}
            <div
              className="coordinate-dot"
              style={{
                left: `${50 + (finalX / 2)}%`,
                top: `${50 - (finalY / 2)}%`, // Y axis points UP in 2D coordinates, but CSS points DOWN, so we subtract
                backgroundColor: currentType.accent,
                boxShadow: `0 0 15px ${currentType.accent}`
              }}
            />

            {/* Labels */}
            <span className="coordinate-label label-top">計画 (Plan)</span>
            <span className="coordinate-label label-bottom">直感 (Intuition)</span>
            <span className="coordinate-label label-left">堅実 (Solid)</span>
            <span className="coordinate-label label-right">大胆 (Bold)</span>

            {/* Quadrant helpers */}
            <div className="coordinate-quadrant quadrant-top-right">計画×大胆</div>
            <div className="coordinate-quadrant quadrant-top-left">直感×大胆</div>
            <div className="coordinate-quadrant quadrant-bottom-left">直感×堅実</div>
            <div className="coordinate-quadrant quadrant-bottom-right">計画×堅実</div>
          </div>
        </div>

        {/* Diagnostic coordinates numbers */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            あなたの測定座標
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '1.5rem',
            fontFamily: 'Outfit, monospace',
            fontSize: '1.25rem',
            fontWeight: '700'
          }}>
            <div>
              <span style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>計画⇄直感:</span>{' '}
              <span style={{ color: finalX >= 0 ? 'var(--primary)' : 'var(--color-adventurer)' }}>
                {finalX >= 0 ? `+${finalX}` : finalX}
              </span>
            </div>
            <div>
              <span style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>堅実⇄大胆:</span>{' '}
              <span style={{ color: finalY >= 0 ? 'var(--color-tactician)' : 'var(--color-craftsman)' }}>
                {finalY >= 0 ? `+${finalY}` : finalY}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Description Panel */}
      <div className="glass-panel" style={{
        background: 'rgba(10, 14, 26, 0.4)',
        padding: '1.75rem',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        textAlign: 'left'
      }}>
        <div style={{
          color: currentType.accent,
          fontSize: '1.15rem',
          fontWeight: '800',
          textAlign: 'center',
          marginBottom: '1rem'
        }}>
          {currentType.catchphrase}
        </div>
        <p style={{
          fontSize: '0.95rem',
          color: 'var(--text-primary)',
          lineHeight: '1.7',
          marginBottom: '1.5rem'
        }}>
          {currentType.description}
        </p>

        {/* Strengths & Weaknesses */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1.25rem' }}>
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: currentType.accent,
              fontWeight: '800',
              fontSize: '0.85rem',
              marginBottom: '0.25rem'
            }}>
              <Sparkles size={14} />
              <span>本質的な強み (Strength)</span>
            </div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: '1.5' }}>
              {currentType.strength}
            </div>
          </div>

          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: 'var(--text-secondary)',
              fontWeight: '800',
              fontSize: '0.85rem',
              marginBottom: '0.25rem'
            }}>
              <AlertCircle size={14} />
              <span>愛嬌・弱点 (Weakness)</span>
            </div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              {currentType.weakness}
            </div>
          </div>
        </div>
      </div>

      {/* Symmetrical Compatibility section */}
      <div className="glass-panel" style={{
        background: 'rgba(255,255,255,0.02)',
        padding: '1.25rem 1.5rem',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.04)',
        textAlign: 'left'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontWeight: '700',
          fontSize: '0.95rem',
          color: 'var(--text-primary)',
          marginBottom: '1rem',
          borderBottom: '1px solid rgba(255,255,255,0.04)',
          paddingBottom: '0.5rem'
        }}>
          <Users size={16} style={{ color: 'var(--primary)' }} />
          <span>相性分析 (Matches)</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--primary)' }}>
              🤝 ベストパートナー（名コンビ）: {currentType.partner}
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
              {currentType.partnerDesc}
            </p>
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#fb7185' }}>
              ⚡ 気になる相手（正反対）: {currentType.opposite}
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
              {currentType.oppositeDesc}
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons: Download, Share, Retry */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <button className="cyber-btn" onClick={handleDownload} style={{ justifyContent: 'center' }}>
            <Download size={16} />
            <span>カード保存</span>
          </button>
          
          <button className="cyber-btn" onClick={handleShareTwitter} style={{
            justifyContent: 'center',
            borderColor: 'rgba(255, 255, 255, 0.4)',
            background: 'rgba(255, 255, 255, 0.05)'
          }}>
            <Share2 size={16} />
            <span>Xでシェア</span>
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <button className="cyber-btn-sec" onClick={handleCopy} style={{ justifyContent: 'center' }}>
            {copied ? <Check size={16} style={{ color: '#10b981' }} /> : <Copy size={16} />}
            <span>{copied ? 'コピー完了' : '結果をテキストコピー'}</span>
          </button>

          <button className="cyber-btn-sec" onClick={onReset} style={{ justifyContent: 'center' }}>
            <RotateCcw size={16} />
            <span>もう一度診断する</span>
          </button>
        </div>
      </div>

      {/* Hidden Canvas used for PNG Generation */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

    </div>
  );
}
