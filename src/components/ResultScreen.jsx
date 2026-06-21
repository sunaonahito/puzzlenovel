import React, { useRef, useState } from 'react';
import { Download, Share2, RotateCcw, Copy, Check, Shield, Sword, Compass, AlertCircle } from 'lucide-react';

const TYPES = {
  tactician: {
    key: 'tactician',
    name: '軍師',
    english: 'GRAND STRATEGIST',
    color: 'var(--color-tactician)',
    accent: '#d94242',
    catchphrase: '「盤面を見据え、一撃で決する。」',
    description: '飛び込む前に必ず全体の戦況を読む。けれど読み終えた瞬間に選ぶのは、誰よりも大胆な一手。あなたの慎重さは臆病さではなく、大勝負のための助走です。静かに勝ち筋を組み立て、ここぞで全部を賭けられる賢者。',
    strength: 'リスクを「計算された勝機」に変え、盤面を支配する。',
    weakness: 'すべての手順が見えるまで動けず、考えすぎて好機を逃すことも。完璧主義が仇になる癖があります。',
    partner: '勇者',
    partnerDesc: '攻めの意志が同じ。あなたが設計図を描く間に、迷わず先陣を切って敵陣へ斬り込んでくれる頼もしい前衛。',
    opposite: '鑑定士',
    oppositeDesc: '正反対の性質。十手読む場面を一瞬の勘で決めてしまう。その無駄のなさに、畏敬の念が消えません。'
  },
  adventurer: {
    key: 'adventurer',
    name: '勇者',
    english: 'HEROIC DRAGOON',
    color: 'var(--color-adventurer)',
    accent: '#d99126',
    catchphrase: '「まず跳べ。活路は剣の指す方にあり。」',
    description: '考えるより先に手が動く。閉じた扉は、開けてみないと気が済まない。転んでもそれを次の燃料に変えて走り続ける、止まらないエンジンのような人。誰も動けない局面で、最初の一歩を踏み出せる勇気の持ち主。',
    strength: '停滞を打破する、最初の一歩を踏み出す圧倒的な決断力。',
    weakness: '勢いが余って、ひと呼吸置けば回避できた罠を踏んでしまうことも。退屈と静止には一秒も耐えられません。',
    partner: '軍師',
    partnerDesc: '同じく攻める仲間。あなたが突っ込む前に勝ち筋を読んでくれる。勢いに設計図が加われば天下無双。',
    opposite: '工匠',
    oppositeDesc: '正反対の性質。三秒で済ます所を丁寧に積み上げていく。その手堅さに、密かな憧れを抱いています。'
  },
  craftsman: {
    key: 'craftsman',
    name: '工匠',
    english: 'RUNE SMITH',
    color: 'var(--color-craftsman)',
    accent: '#1b8577',
    catchphrase: '「確かな一歩のみが、難攻不落の砦を築く。」',
    description: '派手さより確かさを選ぶ。手順を読み、無駄を削り、絶対に崩れない安全なルートを置いていく。あなたが通った道は、後から誰が歩いても安全。長い持久戦でこそ真価を発揮する、堅実な信頼そのものの人。',
    strength: '最後まで崩れない、揺るぎない安定感と再現性の高さ。',
    weakness: '石橋を叩きすぎて、渡るタイミングを逃す。本当は少しだけ、無計画な冒険に焦がれている節があります。',
    partner: '鑑定士',
    partnerDesc: '安全志向が一致。あなたが熟考する場面を、野生の勘で素早く埋めて、テンポを作ってくれる名コンビ。',
    opposite: '勇者',
    oppositeDesc: '正反対の性質。無計画に飛び込んで、なぜか成功してしまう。呆れと羨望が半分ずつの不思議な存在。'
  },
  connoisseur: {
    key: 'connoisseur',
    name: '鑑定士',
    english: 'ARCANE ORACLE',
    color: 'var(--color-connoisseur)',
    accent: '#8c42d9',
    catchphrase: '「真実は一瞬のひらめきに宿る。」',
    description: '長考しない。それでいて選ぶのは、いつも堅実な一手。危ない橋には乗らず、最短で「間違いのない選択」に手が伸びる。その直感は、積み重ねた経験が結晶になったもの。速さと安全を両立できる、頼れる即断力の持ち主。',
    strength: '思考時間が皆無に近いのに、罠やリスクを外さない驚異的なセンス。',
    weakness: '直感が外れた時の立て直しは少し苦手。確実すぎて、予測不能な大波に乗り損ねることも。',
    partner: '工匠',
    partnerDesc: '安全志向が一致。あなたの直感的な選択を、熟練の技術で丁寧に裏打ちし補強してくれる存在。',
    opposite: '軍師',
    oppositeDesc: '正反対の性質。一瞬で決めるあなたと、十手先まで読む相手。時間の流れる速さが違うのに、なぜか惹かれ合う。'
  }
};

export default function ResultScreen({ scores, metrics, onReset }) {
  const canvasRef = useRef(null);
  const [copied, setCopied] = useState(false);

  // Normalize scores to fall between -100 and +100
  const clamp = (val) => Math.max(-100, Math.min(100, val));
  const finalX = clamp(scores.planningVsIntuition);
  const finalY = clamp(scores.solidVsBold);

  // Determine class based on quadrant
  let diagnosedTypeKey = 'craftsman';
  if (finalX >= 0 && finalY >= 0) diagnosedTypeKey = 'tactician';     
  else if (finalX < 0 && finalY >= 0) diagnosedTypeKey = 'adventurer'; 
  else if (finalX >= 0 && finalY < 0) diagnosedTypeKey = 'craftsman';  
  else if (finalX < 0 && finalY < 0) diagnosedTypeKey = 'connoisseur'; 

  const currentType = TYPES[diagnosedTypeKey];

  // Symmetrical matches text formatting
  const shareText = `【Puzunove診断結果】\n私の精神アライメントは『${currentType.name} (${currentType.english})』でした！\n${currentType.catchphrase}\n\n■ 思考特性: ${finalX >= 0 ? `計画志向 (+${finalX})` : `直感志向 (${finalX})`}\n■ 行動特性: ${finalY >= 0 ? `大胆属性 (+${finalY})` : `堅実属性 (${finalY})`}\n\n戦術RPGの解き方から本質を診断する新感覚ゲーム。あなたも属性を測ってみませんか？\n#Puzunove #性格診断 #パズノベ診断\nhttps://punaonahito.github.io/puzzlenovel/`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  // HTML5 Canvas generation for an antique vintage scroll parchment certificate
  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = 600;
    const h = 900;
    canvas.width = w;
    canvas.height = h;

    // Draw antique parchment background
    ctx.fillStyle = '#eadecd';
    ctx.fillRect(0, 0, w, h);

    // Subtle vignette texture overlay
    const radialGrad = ctx.createRadialGradient(w/2, h/2, 100, w/2, h/2, 450);
    radialGrad.addColorStop(0, 'rgba(255, 255, 255, 0.15)');
    radialGrad.addColorStop(0.7, 'rgba(184, 153, 110, 0.25)');
    radialGrad.addColorStop(1, 'rgba(84, 61, 31, 0.45)');
    ctx.fillStyle = radialGrad;
    ctx.fillRect(0, 0, w, h);

    // Ornate gold border
    ctx.strokeStyle = '#8f744b';
    ctx.lineWidth = 4;
    ctx.strokeRect(20, 20, w - 40, h - 40);

    ctx.strokeStyle = '#c5a059';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(28, 28, w - 56, h - 56);

    // Rivet studs in the corner
    const drawRivet = (rx, ry) => {
      ctx.fillStyle = '#4e3e29';
      ctx.beginPath();
      ctx.arc(rx, ry, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.globalAlpha = 0.2;
      ctx.beginPath();
      ctx.arc(rx - 1.5, ry - 1.5, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    };
    drawRivet(38, 38);
    drawRivet(w - 38, 38);
    drawRivet(38, h - 38);
    drawRivet(w - 38, h - 38);

    // Header Title
    ctx.fillStyle = '#4e3e29';
    ctx.font = 'bold 11px "Cinzel", serif';
    ctx.textAlign = 'center';
    ctx.fillText('PUZUNOVE DIAGNOSIS // THE OBSERVER SCROLL', w / 2, 65);

    // Draw Crest/Emblem
    ctx.strokeStyle = 'rgba(143, 116, 75, 0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(w/2, 125, 30, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#8f744b';
    ctx.font = '24px "Cinzel", serif';
    ctx.fillText('⚡', w/2, 133);

    // Class Rank Box
    ctx.fillStyle = '#2b2318';
    ctx.font = 'bold 16px "Cinzel", serif';
    ctx.fillText('ALIGNMENT STATUS', w / 2, 185);

    // Class Name
    ctx.fillStyle = currentType.accent;
    ctx.font = '900 50px "Noto Serif JP", serif';
    ctx.fillText(currentType.name, w / 2, 240);

    ctx.fillStyle = '#6d5a3f';
    ctx.font = 'bold 16px "Cinzel", serif';
    ctx.fillText(currentType.english, w / 2, 270);

    // Catchphrase
    ctx.fillStyle = '#2b2318';
    ctx.font = 'italic bold 18px "Noto Serif JP", serif';
    ctx.fillText(currentType.catchphrase, w / 2, 315);

    // Description text wraps
    ctx.fillStyle = '#453c2f';
    ctx.font = '14px "Noto Serif JP", serif';
    ctx.textAlign = 'left';
    
    const wrapText = (text, x, y, maxWidth, lineHeight) => {
      const words = text.split('');
      let line = '';
      let currentY = y;
      
      for (let n = 0; n < words.length; n++) {
        let testLine = line + words[n];
        let testWidth = ctx.measureText(testLine).width;
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
    
    let descEndY = wrapText(currentType.description, 70, 360, w - 140, 24);

    // Strengths box in parchment style
    ctx.fillStyle = 'rgba(143, 116, 75, 0.08)';
    ctx.strokeStyle = 'rgba(143, 116, 75, 0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(60, descEndY + 10, w - 120, 115, 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#8f744b';
    ctx.font = 'bold 12px "Noto Serif JP", serif';
    ctx.fillText('▼ 属性の強み (ALIGNMENT STRENGTHS)', 80, descEndY + 35);
    ctx.fillStyle = '#2b2318';
    ctx.font = '14px "Noto Serif JP", serif';
    wrapText(currentType.strength, 80, descEndY + 58, w - 160, 20);

    ctx.fillStyle = '#8e7a68';
    ctx.font = 'bold 11px "Noto Serif JP", serif';
    ctx.fillText('▼ 精神の愛嬌 (WEAKNESS OVERVIEW)', 80, descEndY + 88);
    ctx.fillStyle = '#5c5244';
    ctx.font = '13px "Noto Serif JP", serif';
    wrapText(currentType.weakness, 80, descEndY + 107, w - 160, 18);

    // 2D Compass plot
    const compassSize = 140;
    const compassX = w / 2 - compassSize / 2;
    const compassY = descEndY + 155;

    // Draw circular compass background
    ctx.fillStyle = '#1e1912';
    ctx.beginPath();
    ctx.arc(w/2, compassY + compassSize/2, compassSize/2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#c5a059';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Axes
    ctx.strokeStyle = 'rgba(197, 160, 89, 0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(w/2 - compassSize/2 + 5, compassY + compassSize/2);
    ctx.lineTo(w/2 + compassSize/2 - 5, compassY + compassSize/2);
    ctx.moveTo(w/2, compassY + 5);
    ctx.lineTo(w/2, compassY + compassSize - 5);
    ctx.stroke();

    // Compass text labels
    ctx.fillStyle = '#c5a059';
    ctx.font = 'bold 9px "Cinzel", serif';
    ctx.textAlign = 'center';
    ctx.fillText('PLAN', w/2, compassY - 5);
    ctx.fillText('INTUITION', w/2, compassY + compassSize + 13);
    ctx.textAlign = 'left';
    ctx.fillText('BOLD', w/2 + compassSize/2 + 6, compassY + compassSize/2 + 3);
    ctx.textAlign = 'right';
    ctx.fillText('SOLID', w/2 - compassSize/2 - 6, compassY + compassSize/2 + 3);

    // User coordinate dot
    const px = w/2 + (finalX / 100) * (compassSize / 2);
    const py = (compassY + compassSize / 2) - (finalY / 100) * (compassSize / 2);

    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(px, py, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Compatible match text
    ctx.textAlign = 'left';
    ctx.fillStyle = '#2b2318';
    ctx.font = 'bold 13px "Noto Serif JP", serif';
    ctx.fillText(`⚔️ 同盟パートナー (名コンビ): ${currentType.partner}`, 60, compassY + compassSize + 45);
    ctx.fillStyle = '#5c5244';
    ctx.font = '12px "Noto Serif JP", serif';
    ctx.fillText(currentType.partnerDesc, 78, compassY + compassSize + 65);

    ctx.fillStyle = '#2b2318';
    ctx.font = 'bold 13px "Noto Serif JP", serif';
    ctx.fillText(`🛡️ 気になる敵手 (正反対): ${currentType.opposite}`, 60, compassY + compassSize + 95);
    ctx.fillStyle = '#5c5244';
    ctx.font = '12px "Noto Serif JP", serif';
    ctx.fillText(currentType.oppositeDesc, 78, compassY + compassSize + 115);

    // Footer
    ctx.textAlign = 'center';
    ctx.fillStyle = '#8f744b';
    ctx.font = 'bold 12px "Cinzel", serif';
    ctx.fillText('PUZUNOVE.APP // STATUS ARCHIVE', w / 2, h - 50);

    // Trigger file download link
    const link = document.createElement('a');
    link.download = `puzunove_alignment_${currentType.english.toLowerCase().replace(' ', '_')}.png`;
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
      
      {/* Title Header */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
        <div style={{
          fontSize: '0.75rem',
          fontWeight: '900',
          letterSpacing: '0.3em',
          color: 'var(--border-gold)',
          fontFamily: 'Cinzel, serif'
        }}>
          Alignment Crystal Plotted
        </div>
        <h2 style={{
          fontSize: '2rem',
          fontWeight: '900',
          color: currentType.accent,
          fontFamily: 'Noto Serif JP, serif',
          textShadow: `0 0 10px ${currentType.accent}33`
        }}>
          【{currentType.name}】
        </h2>
        <div style={{
          fontSize: '0.85rem',
          color: 'var(--text-secondary)',
          fontFamily: 'Cinzel, serif',
          letterSpacing: '0.15em'
        }}>
          {currentType.english}
        </div>
      </div>

      {/* Grid Alignment Compass & Coords */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: '2rem',
        alignItems: 'center'
      }}>
        {/* Alignment Compass Grid */}
        <div className="results-graph-container" style={{ margin: 0 }}>
          <div className="coordinate-grid">
            <div className="coordinate-axis-x" />
            <div className="coordinate-axis-y" />
            
            <div
              className="coordinate-dot"
              style={{
                left: `${50 + (finalX / 2)}%`,
                top: `${50 - (finalY / 2)}%`,
                backgroundColor: '#ffffff',
                border: '2px solid #000',
                boxShadow: `0 0 12px ${currentType.accent}`
              }}
            />

            <span className="coordinate-label label-top">計画 (Plan)</span>
            <span className="coordinate-label label-bottom">直感 (Intuition)</span>
            <span className="coordinate-label label-left">堅実 (Solid)</span>
            <span className="coordinate-label label-right">大胆 (Bold)</span>

            <div className="coordinate-quadrant quadrant-top-right">軍師</div>
            <div className="coordinate-quadrant quadrant-top-left">勇者</div>
            <div className="coordinate-quadrant quadrant-bottom-left">鑑定士</div>
            <div className="coordinate-quadrant quadrant-bottom-right">工匠</div>
          </div>
        </div>

        {/* Numerical alignment stats */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontFamily: 'Cinzel, serif' }}>
            ALIGNMENT COORDINATES
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '1.5rem',
            fontFamily: 'Cinzel, monospace',
            fontSize: '1.25rem',
            fontWeight: '700'
          }}>
            <div>
              <span style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>PLAN / INTU:</span>{' '}
              <span style={{ color: finalX >= 0 ? '#c5a059' : '#d99126' }}>
                {finalX >= 0 ? `+${finalX}` : finalX}
              </span>
            </div>
            <div>
              <span style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>BOLD / SOLID:</span>{' '}
              <span style={{ color: finalY >= 0 ? '#d94242' : '#1b8577' }}>
                {finalY >= 0 ? `+${finalY}` : finalY}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Parchment Status scroll sheet */}
      <div className="parchment-scroll" style={{
        padding: '1.75rem',
        textAlign: 'left'
      }}>
        <div style={{
          color: '#2b2318',
          fontSize: '1.15rem',
          fontWeight: '900',
          textAlign: 'center',
          marginBottom: '1rem',
          fontFamily: 'Noto Serif JP, serif'
        }}>
          {currentType.catchphrase}
        </div>
        <p style={{
          fontSize: '0.95rem',
          lineHeight: '1.75',
          marginBottom: '1.5rem'
        }}>
          {currentType.description}
        </p>

        {/* Strengths & Weaknesses (Tactics style) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', borderTop: '1px solid rgba(143, 116, 75, 0.3)', paddingTop: '1.25rem' }}>
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: '#8f744b',
              fontWeight: '900',
              fontSize: '0.85rem',
              marginBottom: '0.25rem',
              fontFamily: 'Noto Serif JP, serif'
            }}>
              <Sword size={14} />
              <span>本質的な強み (Alignment Strengths)</span>
            </div>
            <div style={{ fontSize: '0.9rem', color: '#2b2318', lineHeight: '1.6' }}>
              {currentType.strength}
            </div>
          </div>

          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: '#8e7a68',
              fontWeight: '900',
              fontSize: '0.85rem',
              marginBottom: '0.25rem',
              fontFamily: 'Noto Serif JP, serif'
            }}>
              <AlertCircle size={14} />
              <span>精神の愛嬌 (Weakness Overview)</span>
            </div>
            <div style={{ fontSize: '0.9rem', color: '#5c5244', lineHeight: '1.6' }}>
              {currentType.weakness}
            </div>
          </div>
        </div>
      </div>

      {/* Symmetrical SRPG Matches list */}
      <div className="glass-panel" style={{
        background: 'rgba(0,0,0,0.3)',
        padding: '1.25rem 1.5rem',
        borderRadius: '2px',
        border: '2px solid rgba(197, 160, 89, 0.2)',
        textAlign: 'left'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontWeight: '800',
          fontSize: '0.95rem',
          color: 'var(--text-primary)',
          marginBottom: '1rem',
          borderBottom: '1px dashed rgba(197,160,89,0.2)',
          paddingBottom: '0.5rem',
          fontFamily: 'Cinzel, serif'
        }}>
          <Shield size={16} style={{ color: 'var(--border-gold)' }} />
          <span>RELATION ALIGNMENT</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--border-gold)', fontFamily: 'Noto Serif JP, serif' }}>
              🤝 同盟パートナー (名コンビ): {currentType.partner}
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
              {currentType.partnerDesc}
            </p>
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#d94242', fontFamily: 'Noto Serif JP, serif' }}>
              ⚡ 気になる敵手 (正反対): {currentType.opposite}
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
              {currentType.oppositeDesc}
            </p>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <button className="cyber-btn" onClick={handleDownload} style={{ justifyContent: 'center' }}>
            <Download size={16} />
            <span>スクロール保存</span>
          </button>
          
          <button className="cyber-btn" onClick={handleShareTwitter} style={{
            justifyContent: 'center',
            borderColor: 'rgba(255, 255, 255, 0.25)',
            background: 'linear-gradient(to bottom, #1d212b 0%, #0d0f14 100%)'
          }}>
            <Share2 size={16} />
            <span>Xでシェア</span>
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <button className="cyber-btn-sec" onClick={handleCopy} style={{ justifyContent: 'center' }}>
            {copied ? <Check size={14} style={{ color: '#1b8577' }} /> : <Copy size={14} />}
            <span>{copied ? 'コピー完了' : '結果をテキストコピー'}</span>
          </button>

          <button className="cyber-btn-sec" onClick={onReset} style={{ justifyContent: 'center' }}>
            <RotateCcw size={14} />
            <span>もう一度試練を受ける</span>
          </button>
        </div>
      </div>

      {/* Canvas for Scroll Export */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

    </div>
  );
}
