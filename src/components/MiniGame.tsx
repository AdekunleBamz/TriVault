'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';

interface MiniGameProps {
  onReward: (reward: number) => void;
  className?: string;
}

export function SpinTheWheel({ onReward, className = '' }: MiniGameProps) {
  const [isSpinning, setIsSpinning] = React.useState(false);
  const [rotation, setRotation] = React.useState(0);
  const [result, setResult] = React.useState<number | null>(null);

  const rewards = [10, 5, 25, 2, 50, 1, 15, 3];
  const segmentAngle = 360 / rewards.length;

  const handleSpin = () => {
    if (isSpinning) return;

    setIsSpinning(true);
    setResult(null);

    // Random rotation between 5-10 full rotations plus final position
    const spins = 5 + Math.random() * 5;
    const finalPosition = Math.floor(Math.random() * rewards.length);
    const totalRotation = rotation + (spins * 360) + (finalPosition * segmentAngle);

    setRotation(totalRotation);

    // Calculate result after spin completes
    setTimeout(() => {
      const normalizedRotation = totalRotation % 360;
      const winningIndex = Math.floor((360 - normalizedRotation + segmentAngle / 2) / segmentAngle) % rewards.length;
      setResult(rewards[winningIndex]);
      setIsSpinning(false);
      onReward(rewards[winningIndex]);
    }, 4000);
  };

  return (
    <Card className={className}>
      <CardContent className="pt-6">
        <div className="text-center mb-4">
          <h3 className="text-xl font-bold text-white">🎰 Spin The Wheel</h3>
          <p className="text-gray-400 text-sm">Win bonus XP!</p>
        </div>

        <div className="relative w-64 h-64 mx-auto mb-6">
          {/* Wheel */}
          <div
            className="w-full h-full rounded-full border-4 border-gray-600 overflow-hidden transition-transform"
            style={{
              transform: `rotate(${rotation}deg)`,
              transitionDuration: isSpinning ? '4s' : '0s',
              transitionTimingFunction: 'cubic-bezier(0.17, 0.67, 0.12, 0.99)',
            }}
          >
            {rewards.map((reward, index) => {
              const angle = index * segmentAngle;
              const colors = [
                'bg-purple-500', 'bg-blue-500', 'bg-cyan-500', 'bg-green-500',
                'bg-yellow-500', 'bg-orange-500', 'bg-red-500', 'bg-pink-500'
              ];
              return (
                <div
                  key={index}
                  className={`absolute w-1/2 h-1/2 origin-bottom-right ${colors[index]}`}
                  style={{
                    transform: `rotate(${angle}deg) skewY(-${90 - segmentAngle}deg)`,
                    transformOrigin: '0% 100%',
                  }}
                >
                  <span
                    className="absolute text-white font-bold text-sm"
                    style={{
                      transform: `skewY(${90 - segmentAngle}deg) rotate(${segmentAngle / 2}deg)`,
                      left: '50%',
                      top: '30%',
                    }}
                  >
                    {reward}XP
                  </span>
                </div>
              );
            })}
          </div>

          {/* Pointer */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2">
            <div className="w-0 h-0 border-l-8 border-r-8 border-t-12 border-l-transparent border-r-transparent border-t-white" />
          </div>

          {/* Center */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-gray-800 border-4 border-gray-600 flex items-center justify-center">
            <span className="text-lg">🦭</span>
          </div>
        </div>

        {result !== null && (
          <div className="text-center mb-4 animate-bounce">
            <span className="text-2xl">🎉</span>
            <span className="text-xl font-bold text-white ml-2">+{result} XP!</span>
          </div>
        )}

        <Button
          variant="primary"
          onClick={handleSpin}
          disabled={isSpinning}
          className="w-full"
        >
          {isSpinning ? 'Spinning...' : 'Spin!'}
        </Button>
      </CardContent>
    </Card>
  );
}
