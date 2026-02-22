import { useState, useEffect, useRef, useCallback } from 'react';
import { Box, Heading, Text, Button, VStack, HStack } from '@chakra-ui/react';

const GRID_SIZE = 21;
const CELL_SIZE = 18;
const CANVAS_SIZE = GRID_SIZE * CELL_SIZE;
const CENTER = Math.floor(GRID_SIZE / 2);
const RADIUS = GRID_SIZE / 2;
const TICK_MS = 120;

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
type Position = { x: number; y: number };

function isInCircle(x: number, y: number): boolean {
    const dx = x + 0.5 - GRID_SIZE / 2;
    const dy = y + 0.5 - GRID_SIZE / 2;
    return dx * dx + dy * dy <= RADIUS * RADIUS;
}

function wrap(val: number): number {
    return ((val % GRID_SIZE) + GRID_SIZE) % GRID_SIZE;
}

function getRandomFoodPosition(snake: Position[]): Position {
    const snakeSet = new Set(snake.map(p => `${p.x},${p.y}`));
    const validCells: Position[] = [];
    for (let x = 0; x < GRID_SIZE; x++) {
        for (let y = 0; y < GRID_SIZE; y++) {
            if (isInCircle(x, y) && !snakeSet.has(`${x},${y}`)) {
                validCells.push({ x, y });
            }
        }
    }
    if (validCells.length === 0) return { x: CENTER, y: CENTER };
    return validCells[Math.floor(Math.random() * validCells.length)];
}

const OPPOSITE: Record<Direction, Direction> = {
    UP: 'DOWN',
    DOWN: 'UP',
    LEFT: 'RIGHT',
    RIGHT: 'LEFT',
};

interface SnakeGameProps {
    onClose: () => void;
}

const SnakeGame = ({ onClose }: SnakeGameProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [gameState, setGameState] = useState<'ready' | 'playing' | 'gameover'>('ready');
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(() => {
        const saved = localStorage.getItem('snake-high-score');
        return saved ? parseInt(saved, 10) : 0;
    });

    const snakeRef = useRef<Position[]>([{ x: CENTER, y: CENTER }]);
    const directionRef = useRef<Direction>('RIGHT');
    const nextDirectionRef = useRef<Direction>('RIGHT');
    const foodRef = useRef<Position>(getRandomFoodPosition([{ x: CENTER, y: CENTER }]));
    const scoreRef = useRef(0);
    const gameLoopRef = useRef<number | null>(null);

    const draw = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

        // Draw circular background
        ctx.save();
        ctx.beginPath();
        ctx.arc(CANVAS_SIZE / 2, CANVAS_SIZE / 2, RADIUS * CELL_SIZE, 0, Math.PI * 2);
        ctx.fillStyle = '#1a1a2e';
        ctx.fill();
        ctx.clip();

        // Draw grid lines (subtle)
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
        ctx.lineWidth = 0.5;
        for (let i = 0; i <= GRID_SIZE; i++) {
            ctx.beginPath();
            ctx.moveTo(i * CELL_SIZE, 0);
            ctx.lineTo(i * CELL_SIZE, CANVAS_SIZE);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(0, i * CELL_SIZE);
            ctx.lineTo(CANVAS_SIZE, i * CELL_SIZE);
            ctx.stroke();
        }

        // Draw food
        const food = foodRef.current;
        if (isInCircle(food.x, food.y)) {
            ctx.fillStyle = '#e74c3c';
            ctx.beginPath();
            ctx.arc(
                food.x * CELL_SIZE + CELL_SIZE / 2,
                food.y * CELL_SIZE + CELL_SIZE / 2,
                CELL_SIZE / 2 - 2,
                0,
                Math.PI * 2,
            );
            ctx.fill();
        }

        // Draw snake
        const snake = snakeRef.current;
        snake.forEach((segment, index) => {
            if (!isInCircle(segment.x, segment.y)) return;
            const isHead = index === 0;
            ctx.fillStyle = isHead ? '#2ecc71' : '#27ae60';
            const padding = 1;
            ctx.fillRect(
                segment.x * CELL_SIZE + padding,
                segment.y * CELL_SIZE + padding,
                CELL_SIZE - padding * 2,
                CELL_SIZE - padding * 2,
            );
            if (isHead) {
                // Draw eyes
                ctx.fillStyle = '#000';
                const eyeSize = 2;
                const dir = directionRef.current;
                let eye1x: number, eye1y: number, eye2x: number, eye2y: number;
                const cx = segment.x * CELL_SIZE + CELL_SIZE / 2;
                const cy = segment.y * CELL_SIZE + CELL_SIZE / 2;
                if (dir === 'RIGHT') {
                    eye1x = cx + 3; eye1y = cy - 3;
                    eye2x = cx + 3; eye2y = cy + 3;
                } else if (dir === 'LEFT') {
                    eye1x = cx - 3; eye1y = cy - 3;
                    eye2x = cx - 3; eye2y = cy + 3;
                } else if (dir === 'UP') {
                    eye1x = cx - 3; eye1y = cy - 3;
                    eye2x = cx + 3; eye2y = cy - 3;
                } else {
                    eye1x = cx - 3; eye1y = cy + 3;
                    eye2x = cx + 3; eye2y = cy + 3;
                }
                ctx.beginPath();
                ctx.arc(eye1x, eye1y, eyeSize, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(eye2x, eye2y, eyeSize, 0, Math.PI * 2);
                ctx.fill();
            }
        });

        ctx.restore();

        // Draw circle border
        ctx.strokeStyle = '#4a4a6a';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(CANVAS_SIZE / 2, CANVAS_SIZE / 2, RADIUS * CELL_SIZE, 0, Math.PI * 2);
        ctx.stroke();
    }, []);

    const tick = useCallback(() => {
        const snake = snakeRef.current;
        directionRef.current = nextDirectionRef.current;
        const dir = directionRef.current;
        const head = snake[0];

        let newX = head.x;
        let newY = head.y;
        if (dir === 'UP') newY = wrap(head.y - 1);
        else if (dir === 'DOWN') newY = wrap(head.y + 1);
        else if (dir === 'LEFT') newX = wrap(head.x - 1);
        else if (dir === 'RIGHT') newX = wrap(head.x + 1);

        const newHead = { x: newX, y: newY };

        // Check self-collision (only for visible segments)
        const hitSelf = snake.some(
            (seg, i) => i > 0 && seg.x === newHead.x && seg.y === newHead.y,
        );
        if (hitSelf) {
            setGameState('gameover');
            const finalScore = scoreRef.current;
            setHighScore(prev => {
                const newHigh = Math.max(prev, finalScore);
                localStorage.setItem('snake-high-score', String(newHigh));
                return newHigh;
            });
            return;
        }

        const newSnake = [newHead, ...snake];

        // Check food collision
        const food = foodRef.current;
        if (newHead.x === food.x && newHead.y === food.y) {
            scoreRef.current += 10;
            setScore(scoreRef.current);
            foodRef.current = getRandomFoodPosition(newSnake);
        } else {
            newSnake.pop();
        }

        snakeRef.current = newSnake;
        draw();
    }, [draw]);

    const startGame = useCallback(() => {
        snakeRef.current = [{ x: CENTER, y: CENTER }];
        directionRef.current = 'RIGHT';
        nextDirectionRef.current = 'RIGHT';
        foodRef.current = getRandomFoodPosition([{ x: CENTER, y: CENTER }]);
        scoreRef.current = 0;
        setScore(0);
        setGameState('playing');
        draw();
    }, [draw]);

    // Game loop
    useEffect(() => {
        if (gameState !== 'playing') {
            if (gameLoopRef.current) {
                clearInterval(gameLoopRef.current);
                gameLoopRef.current = null;
            }
            return;
        }
        gameLoopRef.current = window.setInterval(tick, TICK_MS);
        return () => {
            if (gameLoopRef.current) {
                clearInterval(gameLoopRef.current);
                gameLoopRef.current = null;
            }
        };
    }, [gameState, tick]);

    // Key handling
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (gameState === 'ready') {
                startGame();
                return;
            }
            if (gameState === 'gameover') {
                if (e.key === ' ' || e.key === 'Enter') startGame();
                return;
            }

            let newDir: Direction | null = null;
            switch (e.key) {
                case 'ArrowUp':
                case 'w':
                case 'W':
                    newDir = 'UP';
                    break;
                case 'ArrowDown':
                case 's':
                case 'S':
                    newDir = 'DOWN';
                    break;
                case 'ArrowLeft':
                case 'a':
                case 'A':
                    newDir = 'LEFT';
                    break;
                case 'ArrowRight':
                case 'd':
                case 'D':
                    newDir = 'RIGHT';
                    break;
            }

            if (newDir && newDir !== OPPOSITE[directionRef.current]) {
                nextDirectionRef.current = newDir;
                e.preventDefault();
            }

            if (e.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [gameState, startGame, onClose]);

    // Initial draw
    useEffect(() => {
        draw();
    }, [draw]);

    return (
        <Box
            position="fixed"
            top={0}
            left={0}
            right={0}
            bottom={0}
            bg="rgba(0, 0, 0, 0.85)"
            zIndex={9999}
            display="flex"
            alignItems="center"
            justifyContent="center"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <VStack gap={4}>
                <HStack justify="space-between" w="100%" px={2}>
                    <Heading size="lg" color="green.400">
                        Snake
                    </Heading>
                    <Button
                        size="xs"
                        variant="ghost"
                        color="gray.400"
                        _hover={{ color: 'white' }}
                        onClick={onClose}
                    >
                        ESC to close
                    </Button>
                </HStack>

                <HStack justify="space-between" w="100%" px={2}>
                    <Text color="gray.300" fontSize="sm">
                        Score: {score}
                    </Text>
                    <Text color="gray.500" fontSize="sm">
                        Best: {highScore}
                    </Text>
                </HStack>

                <Box
                    position="relative"
                    width={`${CANVAS_SIZE}px`}
                    height={`${CANVAS_SIZE}px`}
                    borderRadius="50%"
                    overflow="hidden"
                >
                    <canvas
                        ref={canvasRef}
                        width={CANVAS_SIZE}
                        height={CANVAS_SIZE}
                        style={{ display: 'block' }}
                    />

                    {gameState === 'ready' && (
                        <Box
                            position="absolute"
                            top={0}
                            left={0}
                            right={0}
                            bottom={0}
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            borderRadius="50%"
                            bg="rgba(0, 0, 0, 0.6)"
                        >
                            <VStack gap={2}>
                                <Text color="white" fontSize="lg" fontWeight="bold">
                                    Press any key to start
                                </Text>
                                <Text color="gray.400" fontSize="xs">
                                    Arrow keys or WASD to move
                                </Text>
                            </VStack>
                        </Box>
                    )}

                    {gameState === 'gameover' && (
                        <Box
                            position="absolute"
                            top={0}
                            left={0}
                            right={0}
                            bottom={0}
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            borderRadius="50%"
                            bg="rgba(0, 0, 0, 0.7)"
                        >
                            <VStack gap={2}>
                                <Text color="red.400" fontSize="xl" fontWeight="bold">
                                    Game Over
                                </Text>
                                <Text color="white" fontSize="md">
                                    Score: {score}
                                </Text>
                                <Text color="gray.400" fontSize="xs">
                                    Press Enter or Space to restart
                                </Text>
                            </VStack>
                        </Box>
                    )}
                </Box>

                <Text color="gray.600" fontSize="xs">
                    The field wraps around &mdash; try it!
                </Text>
            </VStack>
        </Box>
    );
};

export default SnakeGame;
