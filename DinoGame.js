import React, { useState, useEffect } from 'react';
import './DinoGame.css';

function DinoGame() {
  const [dinoPosition, setDinoPosition] = useState(0);
  const [isJumping, setIsJumping] = useState(false);
  const [obstacles, setObstacles] = useState([]);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);

  useEffect(() => {
    const handleKeyPress = (event) => {
      if ((event.code === 'Space' || event.key === 'ArrowUp') && !isJumping && !isGameOver) {
        jump();
      } else if (event.code === 'Enter' && isGameOver) {
        resetGame();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isJumping, isGameOver]);

  const jump = () => {
    setIsJumping(true);
    setDinoPosition(150);

    setTimeout(() => {
      setDinoPosition(0);
      setIsJumping(false);
    }, 500);
  };

  const resetGame = () => {
    setObstacles([]);
    setIsGameOver(false);
    setScore(0);
    setDinoPosition(0);
    setIsJumping(false);
  };

  // Collision detection
  useEffect(() => {
    if (isGameOver) return;

    const checkCollision = () => {
      const dino = document.querySelector('.dino');
      const dinoRect = dino.getBoundingClientRect();

      obstacles.forEach((obstacle) => {
        const obstacleEl = document.querySelector(`#obstacle-${obstacle.id}`);
        if (obstacleEl) {
          const obstacleRect = obstacleEl.getBoundingClientRect();
          if (
            dinoRect.right > obstacleRect.left &&
            dinoRect.left < obstacleRect.right &&
            dinoRect.bottom > obstacleRect.top
          ) {
            handleGameOver();
          }
        }
      });
    };

    const gameLoop = setInterval(() => {
      checkCollision();
      setScore(prev => prev + 1);
    }, 100);

    return () => clearInterval(gameLoop);
  }, [obstacles, isGameOver]);

  // Obstacle generation
  useEffect(() => {
    if (isGameOver) return;

    const createObstacle = () => {
      const newObstacle = {
        id: Date.now(),
        position: 600,
      };
      setObstacles(prev => [...prev, newObstacle]);
    };

    const obstacleInterval = setInterval(createObstacle, 2000);
    return () => clearInterval(obstacleInterval);
  }, [isGameOver]);

  // Move obstacles
  useEffect(() => {
    if (isGameOver) return;

    const moveObstacles = setInterval(() => {
      setObstacles(prev => 
        prev
          .map(obstacle => ({
            ...obstacle,
            position: obstacle.position - 5,
          }))
          .filter(obstacle => obstacle.position > -50)
      );
    }, 20);

    return () => clearInterval(moveObstacles);
  }, [isGameOver]);

  const handleGameOver = () => {
    setIsGameOver(true);
    if (score > highScore) {
      setHighScore(score);
    }
  };

  return (
    <div className="game-container">
      <div className="score-container">
        <div className="score">Score: {score}</div>
        <div className="high-score">High Score: {highScore}</div>
      </div>
      
      {isGameOver && (
        <div className="game-over">
          <div>Game Over!</div>
          <div className="restart-text">Press Enter to restart</div>
        </div>
      )}
      
      <div 
        className="dino"
        style={{ bottom: `${dinoPosition}px` }}
      >
        🦖
      </div>
      
      {obstacles.map(obstacle => (
        <div
          key={obstacle.id}
          id={`obstacle-${obstacle.id}`}
          className="obstacle"
          style={{ left: `${obstacle.position}px` }}
        >
          🌵
        </div>
      ))}
      
      <div className="ground"></div>
    </div>
  );
}

export default DinoGame;