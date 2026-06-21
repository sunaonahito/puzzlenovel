import React, { useState, useEffect } from 'react';
import { ArrowRight, HelpCircle } from 'lucide-react';

export default function NovelScreen({ stage, onChoiceSelected, onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTypingComplete, setIsTypingComplete] = useState(false);

  // Dialog dialogues based on stage (intro / outro)
  const introDialogues = [
    {
      speaker: 'ルナ',
      text: '起動を確認しました。ようこそ、被検体。私はシステムオブザーバーの「ルナ」です。これより、あなたの「認知・行動スタイル診断」を開始します。'
    },
    {
      speaker: 'ルナ',
      text: 'これから、あなたには3つのパズルゲートを攻略していただきます。あなたの移動速度、戸惑い、やり直し（Undo）、そして選択の一つ一つがリアルタイムでスコア化されます。'
    },
    {
      speaker: 'ルナ',
      text: 'テストを始める前に、1つ教えてください。あなたは普段、未知の問題や障害に直面したとき、どのように行動しますか？',
      choices: [
        {
          text: '考えるよりも先に、まず行動して試行錯誤する。',
          value: { planningVsIntuition: -15, solidVsBold: 0 },
          label: '直感型'
        },
        {
          text: '全ての選択肢とリスクを整理し、計画を立ててから動く。',
          value: { planningVsIntuition: 15, solidVsBold: 0 },
          label: '計画型'
        },
        {
          text: '過去の事例や、最も安全で確実なルートを探す。',
          value: { planningVsIntuition: 0, solidVsBold: -15 },
          label: '堅実型'
        }
      ]
    },
    {
      speaker: 'ルナ',
      text: 'なるほど、あなたの自己認識は分かりました。それでは、実際の行動がどうであるか、確かめてみましょう。最初のゲートを開放します。'
    }
  ];

  const outroDialogues = [
    {
      speaker: 'ルナ',
      text: 'すべてのテストエリアの攻略、お見事でした。あなたのアバターの軌跡と、ジレンマ点での行動データを完全に収集しました。'
    },
    {
      speaker: 'ルナ',
      text: '診断結果を解析する前に、最後の質問です。パズルを解いている最中、あなたはどのような気持ちでしたか？',
      choices: [
        {
          text: 'リスクを取って近道（ショートカット）を狙うのが快感だった。',
          value: { planningVsIntuition: 0, solidVsBold: 15 },
          label: '大胆'
        },
        {
          text: '罠や危険を確実に回避して、ミスなく進むことに安心した。',
          value: { planningVsIntuition: 0, solidVsBold: -15 },
          label: '堅実'
        },
        {
          text: '直感でスピーディに操作する瞬間が一番楽しかった。',
          value: { planningVsIntuition: -15, solidVsBold: 0 },
          label: '直感'
        },
        {
          text: 'じっくりと考えて、手数を最小限に抑える解法にこだわった。',
          value: { planningVsIntuition: 15, solidVsBold: 0 },
          label: '計画'
        }
      ]
    },
    {
      speaker: 'ルナ',
      text: 'ありがとうございます。自己申告データと行動ログの突き合わせが完了しました。それでは、あなたの本質的なスタイルをマップに描きます。結果をご覧ください。'
    }
  ];

  const dialogues = stage === 'intro' ? introDialogues : outroDialogues;
  const currentDialogue = dialogues[currentStep];

  // Typewriter effect logic
  useEffect(() => {
    if (!currentDialogue) return;
    setIsTypingComplete(false);
    setDisplayedText('');

    let index = 0;
    const interval = setInterval(() => {
      setDisplayedText((prev) => prev + currentDialogue.text.charAt(index));
      index++;
      if (index >= currentDialogue.text.length) {
        clearInterval(interval);
        setIsTypingComplete(true);
      }
    }, 20); // typing speed

    return () => clearInterval(interval);
  }, [currentStep, stage]);

  const handleNext = () => {
    if (!isTypingComplete) {
      // Skip typing
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
      {/* Companion Luna animated avatar */}
      <div className="companion-avatar">
        <div className="companion-ring-outer"></div>
        <div className="companion-ring"></div>
        <div className="companion-core" style={{
          background: stage === 'intro' ? 'var(--primary)' : 'rgba(168, 85, 247, 1)',
          boxShadow: stage === 'intro' ? '0 0 30px 8px rgba(0, 229, 255, 0.4)' : '0 0 30px 8px rgba(168, 85, 247, 0.4)'
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

        {/* Branching choices if available */}
        {isTypingComplete && currentDialogue.choices ? (
          <div className="choices-grid">
            {currentDialogue.choices.map((choice, i) => (
              <button
                key={i}
                className="choice-option"
                onClick={() => handleChoice(choice)}
              >
                <span>{choice.text}</span>
                <span className="choice-badge">{choice.label}</span>
              </button>
            ))}
          </div>
        ) : (
          /* Plain next button if no choices */
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <button className="cyber-btn" onClick={handleNext}>
              <span>{isTypingComplete ? '次へ' : 'スキップ'}</span>
              <ArrowRight size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Progress Indicator */}
      <div style={{
        display: 'flex',
        gap: '6px',
        alignItems: 'center'
      }}>
        {dialogues.map((_, i) => (
          <div
            key={i}
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: i === currentStep ? 'var(--primary)' : 'rgba(255, 255, 255, 0.1)',
              transition: 'background 0.3s'
            }}
          />
        ))}
      </div>
    </div>
  );
}
