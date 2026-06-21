import React, { useState, useEffect } from 'react';
import { ArrowRight, HelpCircle } from 'lucide-react';

export default function NovelScreen({ stage, onChoiceSelected, onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTypingComplete, setIsTypingComplete] = useState(false);

  // Classical medieval visual novel dialogue configuration
  const introDialogues = [
    {
      speaker: '運命の観測者 ルナ',
      text: '魂の共鳴を確認しました。ようこそ、旅人よ。私はこの世界の星盤を観測する者、「ルナ」です。これより、あなたの「認知・アライメント診断」を開始します。'
    },
    {
      speaker: '運命の観測者 ルナ',
      text: 'これから、あなたには3つの試練の迷宮ゲートを攻略していただきます。あなたの移動速度、迷い、時の巻き戻し（Undo）、そして選択肢の一つ一つがリアルタイムで属性値としてスコア化されます。'
    },
    {
      speaker: '運命の観測者 ルナ',
      text: '試練を始める前に、1つ教えてください。あなたは普段、未知の災いや障害に直面したとき、どのように立ち向かいますか？',
      choices: [
        {
          text: '考えるよりも先に、まず手元の剣を振るって試行錯誤する。',
          value: { planningVsIntuition: -15, solidVsBold: 0 },
          label: '直感属性'
        },
        {
          text: '全ての選択肢とリスクを天秤にかけ、計画を立ててから進む。',
          value: { planningVsIntuition: 15, solidVsBold: 0 },
          label: '計画属性'
        },
        {
          text: '過去の記録を調べ、最も安全で確実なルートを探す。',
          value: { planningVsIntuition: 0, solidVsBold: -15 },
          label: '堅実属性'
        }
      ]
    },
    {
      speaker: '運命の観測者 ルナ',
      text: 'なるほど、あなたの自己認識は受け取りました。それでは、実際の行動がどうであるか、天秤にかけましょう。最初のゲートを開放します。'
    }
  ];

  const outroDialogues = [
    {
      speaker: '運命の観測者 ルナ',
      text: 'すべての試練エリアの攻略、お見事でした。あなたのアバターの軌跡と、ジレンマ点での行動データを星盤に記録しました。'
    },
    {
      speaker: '運命の観測者 ルナ',
      text: '属性アライメントを判定する前に、最後の質問です。迷宮を攻略している最中、あなたはどのような瞬間に充実感を覚えましたか？',
      choices: [
        {
          text: '危険なショートカットを駆け抜け、リスクを制覇した瞬間。',
          value: { planningVsIntuition: 0, solidVsBold: 15 },
          label: '大胆'
        },
        {
          text: '罠や崩壊を完璧に回避し、無傷で安全に進みきった瞬間。',
          value: { planningVsIntuition: 0, solidVsBold: -15 },
          label: '堅実'
        },
        {
          text: '直感とひらめきで、淀みなくスピーディに操作できた瞬間。',
          value: { planningVsIntuition: -15, solidVsBold: 0 },
          label: '直感'
        },
        {
          text: 'すべての手を熟考し、最小の歩数で完璧な解法にたどり着いた瞬間。',
          value: { planningVsIntuition: 15, solidVsBold: 0 },
          label: '計画'
        }
      ]
    },
    {
      speaker: '運命の観測者 ルナ',
      text: 'ありがとうございます。自己申告データと行動ログの突き合わせが完了しました。それでは、あなたのアライメントを方位盤に描きます。運命をご覧ください。'
    }
  ];

  const dialogues = stage === 'intro' ? introDialogues : outroDialogues;
  const currentDialogue = dialogues[currentStep];

  // Slice-based typewriter logic (robust against strict mode race conditions)
  useEffect(() => {
    if (!currentDialogue) return;
    setIsTypingComplete(false);
    setDisplayedText('');

    let index = 0;
    const interval = setInterval(() => {
      index++;
      setDisplayedText(currentDialogue.text.slice(0, index));
      if (index >= currentDialogue.text.length) {
        clearInterval(interval);
        setIsTypingComplete(true);
      }
    }, 20); // typing speed

    return () => clearInterval(interval);
  }, [currentStep, stage]);

  const handleNext = () => {
    if (!isTypingComplete) {
      setDisplayedText(currentDialogue.text);
      setIsTypingComplete(true);
      return;
    }

    if (currentStep < dialogues.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handleChoice = (choice) => {
    onChoiceSelected(choice.value);
    if (currentStep < dialogues.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  if (!currentDialogue) return null;

  return (
    <div className="glass-panel fade-in" style={{
      maxWidth: '650px',
      width: '100%',
      padding: '2.5rem 2rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '2rem'
    }}>
      {/* Magic fortune crystal avatar */}
      <div className="companion-avatar">
        <div className="companion-ring-outer"></div>
        <div className="companion-ring"></div>
        <div className="companion-core" style={{
          background: stage === 'intro' ? 'radial-gradient(circle, #fcf4e8 0%, #c5a059 60%, #30220f 100%)' : 'radial-gradient(circle, #fcf4e8 0%, #8c42d9 60%, #1f0b38 100%)',
          boxShadow: stage === 'intro' ? '0 0 25px 6px rgba(197, 160, 89, 0.45)' : '0 0 25px 6px rgba(140, 66, 217, 0.45)'
        }}></div>
      </div>

      <div className="dialog-container">
        <div className="dialog-box">
          <div className="dialog-speaker">{currentDialogue.speaker}</div>
          <div className="dialog-text">
            {displayedText}
            {!isTypingComplete && <span className="typing-cursor"></span>}
          </div>
        </div>

        {/* Branching choice options */}
        {isTypingComplete && currentDialogue.choices ? (
          <div className="choices-grid">
            {currentDialogue.choices.map((choice, i) => (
              <button
                key={i}
                className="choice-option"
                onClick={() => handleChoice(choice)}
              >
                <span>{choice.text}</span>
              </button>
            ))}
          </div>
        ) : (
          /* Next / skip click trigger */
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <button className="cyber-btn" onClick={handleNext}>
              <span>{isTypingComplete ? '次へ' : 'スキップ'}</span>
              <ArrowRight size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Progress Gems */}
      <div style={{
        display: 'flex',
        gap: '8px',
        alignItems: 'center'
      }}>
        {dialogues.map((_, i) => (
          <div
            key={i}
            style={{
              width: '10px',
              height: '10px',
              transform: 'rotate(45deg)',
              background: i === currentStep ? 'var(--border-gold)' : 'rgba(197, 160, 89, 0.15)',
              border: '1px solid rgba(197, 160, 89, 0.3)',
              transition: 'background 0.3s'
            }}
          />
        ))}
      </div>
    </div>
  );
}
