import React, { useState } from 'react';
import TitleScreen from './components/TitleScreen';
import NovelScreen from './components/NovelScreen';
import PuzzleScreen from './components/PuzzleScreen';
import ResultScreen from './components/ResultScreen';

export default function App() {
  const [screen, setScreen] = useState('title');
  const [scores, setScores] = useState({
    planningVsIntuition: 0,
    solidVsBold: 0
  });
  const [puzzleMetrics, setPuzzleMetrics] = useState(null);

  // Update diagnostic score based on choices/actions
  const updateScore = (delta) => {
    setScores((prev) => ({
      planningVsIntuition: prev.planningVsIntuition + (delta.planningVsIntuition || 0),
      solidVsBold: prev.solidVsBold + (delta.solidVsBold || 0)
    }));
  };

  // Puzzle finished callback, calculates behavior score updates
  const handlePuzzleComplete = (metrics) => {
    setPuzzleMetrics(metrics);
    
    let pDelta = 0; // planning vs intuition delta (positive = planning, negative = intuition)
    let sDelta = 0; // solid vs bold delta (positive = bold, negative = solid)

    // 1. Average first move time evaluation
    if (metrics.averageFirstMoveTime > 4.5) {
      pDelta += 20; // long hesitation -> planning
    } else if (metrics.averageFirstMoveTime < 2.0) {
      pDelta -= 20; // immediate action -> intuition
    }

    // 2. Undo usage count evaluation
    if (metrics.totalUndos === 0) {
      pDelta += 20; // zero undos -> carefully planned
    } else if (metrics.totalUndos >= 3) {
      pDelta -= 20; // high trial & error -> intuition
    }

    // 3. Level 1 branch choice
    if (metrics.level1Choice === 'short_route') {
      sDelta += 25; // chose crumbling shortcut -> bold
    } else if (metrics.level1Choice === 'long_route') {
      sDelta -= 25; // chose detour -> solid
    }

    // 4. Level 2 branch choice
    if (metrics.level2Choice === 'get_chest') {
      sDelta += 20; // went out of way to get chest -> bold
    } else if (metrics.level2Choice === 'inspect_chest_first') {
      pDelta += 20; // clicked chest before unlocking -> planning
      sDelta += 15; // eventually got chest -> bold
    } else if (metrics.level2Choice === 'goal_direct') {
      sDelta -= 25; // ignored chest, went straight -> solid
    }

    if (metrics.starCollected) {
      sDelta += 15; // got chest star -> bold
    }

    // 5. Level 3 laser behavior
    if (metrics.level3Choice === 'dash_laser') {
      pDelta -= 15; // rushed -> intuition
      sDelta += 20; // dashed laser -> bold
    } else if (metrics.level3Choice === 'patient_laser') {
      pDelta += 20; // timed pattern -> planning
      sDelta -= 20; // safety first -> solid
    } else if (metrics.level3Choice === 'hit_laser') {
      pDelta -= 15; // hit -> intuition
      sDelta += 15; // reckless -> bold
    }

    updateScore({ planningVsIntuition: pDelta, solidVsBold: sDelta });
    setScreen('outro');
  };

  const handleReset = () => {
    setScores({ planningVsIntuition: 0, solidVsBold: 0 });
    setPuzzleMetrics(null);
    setScreen('title');
  };

  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem 0'
    }}>
      {screen === 'title' && (
        <TitleScreen onStart={() => setScreen('intro')} />
      )}
      
      {screen === 'intro' && (
        <NovelScreen
          stage="intro"
          onChoiceSelected={updateScore}
          onComplete={() => setScreen('puzzle')}
        />
      )}
      
      {screen === 'puzzle' && (
        <PuzzleScreen onPuzzleComplete={handlePuzzleComplete} />
      )}
      
      {screen === 'outro' && (
        <NovelScreen
          stage="outro"
          onChoiceSelected={updateScore}
          onComplete={() => setScreen('results')}
        />
      )}
      
      {screen === 'results' && (
        <ResultScreen
          scores={scores}
          metrics={puzzleMetrics}
          onReset={handleReset}
        />
      )}
    </div>
  );
}
