import React, { useState, useEffect, useCallback } from 'react';
import './DinoGame.css';

const JUMP_DURATION = 500; // milliseconds
const JUMP_HEIGHT = 150; // pixels

function DinoGame() {
  const [dinoPosition, setDinoPosition] = useState(0);
  const [isJumping, setIsJumping] = useState(false);
  const [obstacles, setObstacles] = useState([]);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [lastClearedObstacleId, setLastClearedObstacleId] = useState(null);

  const handleGameOver = useCallback(() => {
    setIsGameOver(true);
    if (score > highScore) {
      setHighScore(score);
    }
  }, [score, highScore]);

  const jump = () => {
    if (!isJumping && !isGameOver) {
      setIsJumping(true);
      
      // Start the jump
      setDinoPosition(JUMP_HEIGHT);

      // Schedule the landing
      setTimeout(() => {
        setDinoPosition(0);
        setIsJumping(false);
      }, JUMP_DURATION);
    }
  };

  const resetGame = () => {
    setObstacles([]);
    setIsGameOver(false);
    setScore(0);
    setDinoPosition(0);
    setIsJumping(false);
  };

  // Handle keyboard input
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

  // Collision detection
  useEffect(() => {
    if (isGameOver) return;

    const checkCollision = () => {
      const dino = document.querySelector('.dino');
      const obstacleElements = document.querySelectorAll('.obstacle');

      if (!dino) return;

      const dinoRect = dino.getBoundingClientRect();

      obstacleElements.forEach((obstacle) => {
        const obstacleRect = obstacle.getBoundingClientRect();

        // More precise collision detection
        const collision = !(
          dinoRect.right < obstacleRect.left + 10 ||
          dinoRect.left > obstacleRect.right - 10 ||
          dinoRect.bottom < obstacleRect.top + 10 ||
          dinoRect.top > obstacleRect.bottom - 10
        );

        if (collision) {
          handleGameOver();
        }
      });
    };

    const collisionInterval = setInterval(checkCollision, 100);
    return () => clearInterval(collisionInterval);
  }, [isGameOver, handleGameOver]);

  // Generate obstacles
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

  // Add new effect for score tracking
  useEffect(() => {
    if (isGameOver) return;

    const checkObstacleClear = () => {
      const dino = document.querySelector('.dino');
      const obstacleElements = document.querySelectorAll('.obstacle');

      if (!dino) return;

      const dinoRect = dino.getBoundingClientRect();

      obstacleElements.forEach((obstacle) => {
        const obstacleRect = obstacle.getBoundingClientRect();
        const obstacleId = obstacle.getAttribute('data-id');

        // Check if dino has successfully cleared this obstacle
        if (
          dinoRect.left > obstacleRect.right && // Dino is past the obstacle
          !lastClearedObstacleId?.includes(obstacleId) && // Haven't scored for this obstacle yet
          isJumping // Dino is jumping
        ) {
          setScore(prevScore => prevScore + 10);
          setLastClearedObstacleId(obstacleId);
        }
      });
    };

    const scoreInterval = setInterval(checkObstacleClear, 100);
    return () => clearInterval(scoreInterval);
  }, [isJumping, isGameOver, lastClearedObstacleId]);

  return (
    <div className="game-container">
      <div className="score-container">
        <div className="score">Score: {score}</div>
        <div className="high-score">High Score: {highScore}</div>
      </div>

      {isGameOver && (
        <div className="game-over">
          <div className="game-over-title">Game Over!</div>
          <div className="final-score">Final Score: {score}</div>
          <div className="restart-text">Press Enter to restart</div>
        </div>
      )}

      <div
        className={`dino ${isJumping ? 'jumping' : ''}`}
        style={{ 
          bottom: `${dinoPosition}px`,
          transition: `bottom ${JUMP_DURATION}ms ease-out`
        }}
      >
        🦖
      </div>

      {obstacles.map(obstacle => (
        <div
          key={obstacle.id}
          data-id={obstacle.id}
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
