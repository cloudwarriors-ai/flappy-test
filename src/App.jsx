import { useState, useEffect, useCallback } from 'react'
import './App.css'

const GAME_HEIGHT = 600
const GAME_WIDTH = 400
const BIRD_SIZE = 20
const PIPE_WIDTH = 50
const PIPE_GAP = 150
const GRAVITY = 0.5
const JUMP_STRENGTH = -8
const PIPE_SPEED = 2

function App() {
  const [gameStarted, setGameStarted] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [score, setScore] = useState(0)
  const [birdY, setBirdY] = useState(GAME_HEIGHT / 2)
  const [birdVelocity, setBirdVelocity] = useState(0)
  const [pipes, setPipes] = useState([])

  const jump = useCallback(() => {
    if (!gameStarted) {
      setGameStarted(true)
      setBirdVelocity(JUMP_STRENGTH)
    } else if (!gameOver) {
      setBirdVelocity(JUMP_STRENGTH)
    } else {
      resetGame()
    }
  }, [gameStarted, gameOver])

  const resetGame = () => {
    setGameStarted(false)
    setGameOver(false)
    setScore(0)
    setBirdY(GAME_HEIGHT / 2)
    setBirdVelocity(0)
    setPipes([])
  }

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.code === 'Space') {
        e.preventDefault()
        jump()
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [jump])

  useEffect(() => {
    if (!gameStarted || gameOver) return

    const gameLoop = setInterval(() => {
      setBirdY(prev => {
        const newY = prev + birdVelocity
        if (newY < 0 || newY > GAME_HEIGHT - BIRD_SIZE) {
          setGameOver(true)
          return prev
        }
        return newY
      })

      setBirdVelocity(prev => prev + GRAVITY)

      setPipes(prev => {
        let newPipes = prev.map(pipe => ({
          ...pipe,
          x: pipe.x - PIPE_SPEED
        })).filter(pipe => pipe.x > -PIPE_WIDTH)

        if (newPipes.length === 0 || newPipes[newPipes.length - 1].x < GAME_WIDTH - 200) {
          const pipeY = Math.random() * (GAME_HEIGHT - PIPE_GAP - 100) + 50
          newPipes.push({
            x: GAME_WIDTH,
            y: pipeY,
            passed: false
          })
        }

        newPipes.forEach(pipe => {
          if (!pipe.passed && pipe.x < 100 - BIRD_SIZE) {
            pipe.passed = true
            setScore(s => s + 1)
          }
        })

        return newPipes
      })
    }, 16)

    return () => clearInterval(gameLoop)
  }, [gameStarted, gameOver, birdVelocity])

  useEffect(() => {
    if (!gameStarted || gameOver) return

    const checkCollision = () => {
      const birdLeft = 100
      const birdRight = birdLeft + BIRD_SIZE
      const birdTop = birdY
      const birdBottom = birdY + BIRD_SIZE

      for (let pipe of pipes) {
        const pipeLeft = pipe.x
        const pipeRight = pipe.x + PIPE_WIDTH
        
        if (birdRight > pipeLeft && birdLeft < pipeRight) {
          if (birdTop < pipe.y || birdBottom > pipe.y + PIPE_GAP) {
            setGameOver(true)
            break
          }
        }
      }
    }

    checkCollision()
  }, [birdY, pipes, gameStarted, gameOver])

  return (
    <div className="app">
      <div className="game-container" onClick={jump}>
        <div className="game-area">
          <div 
            className="bird"
            style={{
              left: '100px',
              top: `${birdY}px`
            }}
          />
          
          {pipes.map((pipe, index) => (
            <div key={index}>
              <div 
                className="pipe pipe-top"
                style={{
                  left: `${pipe.x}px`,
                  height: `${pipe.y}px`
                }}
              />
              <div 
                className="pipe pipe-bottom"
                style={{
                  left: `${pipe.x}px`,
                  top: `${pipe.y + PIPE_GAP}px`,
                  height: `${GAME_HEIGHT - pipe.y - PIPE_GAP}px`
                }}
              />
            </div>
          ))}
          
          <div className="score">Score: {score}</div>
          
          {!gameStarted && !gameOver && (
            <div className="message">
              <h2>Flappy Bird</h2>
              <p>Click or Press Space to Start</p>
            </div>
          )}
          
          {gameOver && (
            <div className="message">
              <h2>Game Over!</h2>
              <p>Score: {score}</p>
              <p>Click or Press Space to Restart</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default App