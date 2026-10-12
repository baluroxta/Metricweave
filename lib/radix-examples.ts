import dedent from "dedent";
import { dashboardExamples } from './dashboard-examples';

export const examples = {
  ...dashboardExamples,
  "landing page": {
    prompt: "Build a landing page for a healthcare company",
    response: `
    import React from 'react';
import { Button, Card, Text, Strong } from '@radix-ui/themes'
import { Heart, Shield, Clock, Users } from "lucide-react"

export default function HealthcareLandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-14 flex items-center">
        <a className="flex items-center justify-center" href="#">
          <Heart className="h-6 w-6 text-blue-600" />
          <span className="sr-only">HealthCare Co.</span>
        </a>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <a className="text-sm font-medium hover:underline underline-offset-4" href="#">
            Services
          </a>
          <a className="text-sm font-medium hover:underline underline-offset-4" href="#">
            About
          </a>
          <a className="text-sm font-medium hover:underline underline-offset-4" href="#">
            Contact
          </a>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <Text as="h1" size="9" weight="bold" className="tracking-tighter">
                  Your Health, Our Priority
                </Text>
                <Text as="p" size="5" color="gray" className="mx-auto max-w-[700px]">
                  Providing compassionate care and cutting-edge medical solutions to improve your quality of life.
                </Text>
              </div>
              <div className="space-x-4">
                <Button size="3">Book Appointment</Button>
                <Button variant="outline" size="3">Learn More</Button>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-100">
          <div className="container px-4 md:px-6">
            <Text as="h2" size="8" weight="bold" align="center" className="mb-8">Our Services</Text>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <Card>
                <div className="p-6 flex flex-col items-center text-center space-y-2">
                  <Shield className="h-12 w-12 text-blue-600" />
                  <Strong size="4">Preventive Care</Strong>
                  <Text color="gray">Regular check-ups and screenings to keep you healthy.</Text>
                </div>
              </Card>
              <Card>
                <div className="p-6 flex flex-col items-center text-center space-y-2">
                  <Users className="h-12 w-12 text-blue-600" />
                  <Strong size="4">Family Medicine</Strong>
                  <Text color="gray">Comprehensive care for patients of all ages.</Text>
                </div>
              </Card>
              <Card>
                <div className="p-6 flex flex-col items-center text-center space-y-2">
                  <Clock className="h-12 w-12 text-blue-600" />
                  <Strong size="4">24/7 Emergency</Strong>
                  <Text color="gray">Round-the-clock care for urgent medical needs.</Text>
                </div>
              </Card>
              <Card>
                <div className="p-6 flex flex-col items-center text-center space-y-2">
                  <Heart className="h-12 w-12 text-blue-600" />
                  <Strong size="4">Specialized Care</Strong>
                  <Text color="gray">Expert treatment for complex health conditions.</Text>
                </div>
              </Card>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <Text as="h2" size="8" weight="bold" align="center" className="mb-8">What Our Patients Say</Text>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <div className="p-6 space-y-2">
                    <Text color="gray">
                      "The care I received was exceptional. The staff was friendly and professional, and the doctors took the time to listen to my concerns."
                    </Text>
                    <div className="flex items-center space-x-2">
                      <div className="bg-gray-200 border-2 border-dashed rounded-full w-10 h-10"></div>
                      <div>
                        <Strong>Jane Doe</Strong>
                        <Text as="p" size="2" color="gray">Patient</Text>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-100">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <Text as="h2" size="8" weight="bold">Ready to Prioritize Your Health?</Text>
                <Text as="p" size="5" color="gray" className="mx-auto max-w-[600px]">
                  Book an appointment today and take the first step towards a healthier you.
                </Text>
              </div>
              <Button size="4">Book Appointment Now</Button>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <Text size="1" color="gray">© 2023 HealthCare Co. All rights reserved.</Text>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <a className="text-xs hover:underline underline-offset-4" href="#">
            Terms of Service
          </a>
          <a className="text-xs hover:underline underline-offset-4" href="#">
            Privacy
          </a>
        </nav>
      </footer>
    </div>
  )
}
    `,
  },
  "blog app": {
    prompt: "make me a personal blog",
    response: `
    import { useState } from 'react'
import { Button, Card, Text, Strong } from '@radix-ui/themes'
import { ArrowLeft } from 'lucide-react'

// Sample blog post data with full content
const blogPosts = [
  {
    id: 1,
    title: "Getting Started with Next.js",
    excerpt: "Learn how to build modern web applications with Next.js",
    date: "2023-06-01",
    readTime: "5 min read",
    content: "Next.js is a powerful React framework that makes it easy to build fast, SEO-friendly web applications.\n\nHere are some key features of Next.js:\n\n1. Server-Side Rendering (SSR): Next.js can render React components on the server, which improves initial load time and SEO.\n2. Static Site Generation (SSG): You can generate static HTML files at build time for even faster loading.\n3. API Routes: Next.js allows you to create API endpoints as part of your application.\n4. File-based Routing: Simply create files in the 'pages' directory to define routes.\n5. Built-in CSS Support: Next.js supports CSS Modules, Sass, and other styling options out of the box.\n\nTo get started with Next.js, you can use the following command: npx create-next-app@latest my-next-app"
  },
  {
    id: 2,
    title: "The Power of Tailwind CSS",
    excerpt: "Discover how Tailwind CSS can streamline your styling workflow",
    date: "2023-06-05",
    readTime: "4 min read",
    content: "Tailwind CSS is a utility-first CSS framework that can significantly speed up your development process.\n\nInstead of writing custom CSS, you apply pre-existing classes directly in your HTML.\n\nKey benefits of Tailwind CSS include:\n\n1. Rapid Development: With utility classes, you can quickly style elements without switching between HTML and CSS files.\n2. Consistency: Tailwind provides a set of pre-defined design tokens, ensuring consistency across your project.\n3. Customization: You can easily customize the default configuration to match your design system.\n4. Responsive Design: Tailwind includes responsive utility variants, making it simple to create responsive layouts.\n5. Smaller File Sizes: When properly configured, Tailwind can eliminate unused CSS, resulting in smaller file sizes.\n\nTo start using Tailwind CSS in your project, you can install it with npm: npm install tailwindcss"
  },
  {
    id: 3,
    title: "React Hooks Explained",
    excerpt: "Dive deep into React Hooks and how they can simplify your components",
    date: "2023-06-10",
    readTime: "6 min read",
    content: "React Hooks are functions that allow you to use state and other React features in functional components.\n\nThey were introduced in React 16.8 and have revolutionized how we write React components.\n\nSome of the most commonly used hooks are:\n\n1. useState: Allows you to add state to functional components.\n2. useEffect: Lets you perform side effects in functional components.\n3. useContext: Provides a way to pass data through the component tree without manually passing props.\n4. useReducer: An alternative to useState for managing complex state logic.\n5. useCallback and useMemo: Help optimize performance by memoizing functions and values.\n\nHooks simplify your components and make it easier to reuse stateful logic between components."
  },
  {
    id: 4,
    title: "Building Accessible Web Apps",
    excerpt: "Learn best practices for creating inclusive and accessible web applications",
    date: "2023-06-15",
    readTime: "7 min read",
    content: "Creating accessible web applications is crucial for ensuring that all users, including those with disabilities, can use your website effectively.\n\nHere are some key principles to follow:\n\n1. Semantic HTML: Use appropriate HTML elements for their intended purpose.\n2. ARIA attributes: When necessary, use ARIA attributes to provide additional context to screen readers.\n3. Keyboard Navigation: Ensure that all interactive elements can be accessed and operated using only a keyboard.\n4. Color Contrast: Make sure there's sufficient color contrast between text and background for readability.\n5. Alternative Text: Provide alt text for images to describe their content to users who can't see them.\n6. Focus Management: Properly manage focus, especially in single-page applications and dynamic content.\n7. Responsive Design: Create layouts that adapt to different screen sizes and orientations.\n\nRemember, accessibility is not just about complying with guidelines—it's about creating a better user experience for everyone."
  }
]

export default function Blog() {
  const [selectedPost, setSelectedPost] = useState(null);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-blue-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <Strong size="6">My Awesome Blog</Strong>
          <nav>
            <ul className="flex space-x-4">
              <li><a href="#" className="hover:underline">Home</a></li>
              <li><a href="#" className="hover:underline">About</a></li>
              <li><a href="#" className="hover:underline">Contact</a></li>
            </ul>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-8">
        {selectedPost ? (
          <div>
            <Button
              variant="outline"
              onClick={() => setSelectedPost(null)}
              className="mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to all posts
            </Button>
            <Text as="h2" size="8" weight="bold" className="mb-2">{selectedPost.title}</Text>
            <Text color="gray" className="mb-4">{selectedPost.date} · {selectedPost.readTime}</Text>
            <div className="prose max-w-none">
              {selectedPost.content.split('\n').map((paragraph, index) => (
                <Text as="p" key={index} className="mb-4">{paragraph}</Text>
              ))}
            </div>
          </div>
        ) : (
          <>
            <Text as="h2" size="8" weight="bold" className="mb-6">Latest Posts</Text>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogPosts.map((post) => (
                <Card key={post.id}>
                  <div className="p-6">
                    <Strong size="4" className="mb-2 block">{post.title}</Strong>
                    <Text color="gray" className="mb-4">{post.excerpt}</Text>
                    <div className="flex justify-between items-center">
                      <Text size="2" color="gray">
                        {post.date} · {post.readTime}
                      </Text>
                      <Button variant="outline" size="1" onClick={() => setSelectedPost(post)}>
                        Read More
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 mt-8">
        <div className="container mx-auto px-4 py-6 text-center">
          <Text>© 2023 My Awesome Blog. All rights reserved.</Text>
          <div className="mt-2">
            <a href="#" className="text-sm text-gray-600 hover:underline mr-4">Privacy Policy</a>
            <a href="#" className="text-sm text-gray-600 hover:underline">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
    `,
  },
  "calculator app": {
    prompt: "make me a calculator app",
    response: dedent(`
    I'll create a calculator app using React and Radix UI Themes. This calculator will support basic arithmetic operations: addition, subtraction, multiplication, and division.

    \`\`\`tsx{filename=calculator.tsx}
    import { useState } from 'react'
    import { Button, Card, Text } from '@radix-ui/themes'

    export default function Calculator() {
      const [display, setDisplay] = useState('0');
      const [firstOperand, setFirstOperand] = useState<number | null>(null);
      const [operator, setOperator] = useState<string | null>(null);
      const [waitingForSecondOperand, setWaitingForSecondOperand] = useState(false);

      const inputDigit = (digit: string) => {
        if (waitingForSecondOperand) {
          setDisplay(digit);
          setWaitingForSecondOperand(false);
        } else {
          setDisplay(display === '0' ? digit : display + digit);
        }
      };

      const inputDecimal = () => {
        if (waitingForSecondOperand) {
          setDisplay('0.');
          setWaitingForSecondOperand(false);
          return;
        }

        if (!display.includes('.')) {
          setDisplay(display + '.');
        }
      };

      const clear = () => {
        setDisplay('0');
        setFirstOperand(null);
        setOperator(null);
        setWaitingForSecondOperand(false);
      };

      const performOperation = (nextOperator: string) => {
        const inputValue = parseFloat(display);

        if (firstOperand === null) {
          setFirstOperand(inputValue);
        } else if (operator) {
          const result = calculate(firstOperand, inputValue, operator);
          setDisplay(String(result));
          setFirstOperand(result);
        }

        setWaitingForSecondOperand(true);
        setOperator(nextOperator);
      };

      const calculate = (firstOperand: number, secondOperand: number, operator: string) => {
        switch (operator) {
          case '+':
            return firstOperand + secondOperand;
          case '-':
            return firstOperand - secondOperand;
          case '*':
            return firstOperand * secondOperand;
          case '/':
            return firstOperand / secondOperand;
          default:
            return secondOperand;
        }
      };

      return (
        <Card className="w-full max-w-md mx-auto">
          <div className="p-6">
            <Text as="h1" size="6" weight="bold" className="text-center mb-4">Calculator</Text>
            <div className="grid grid-cols-4 gap-2">
              <div className="col-span-4 bg-gray-100 p-4 rounded mb-4">
                <Text size="6" weight="bold" align="right">{display}</Text>
              </div>
              <Button onClick={() => clear()} variant="soft" color="red">C</Button>
              <Button onClick={() => performOperation('/')} variant="soft">/</Button>
              <Button onClick={() => performOperation('*')} variant="soft">*</Button>
              <Button onClick={() => performOperation('-')} variant="soft">-</Button>
              
              <Button onClick={() => inputDigit('7')}>7</Button>
              <Button onClick={() => inputDigit('8')}>8</Button>
              <Button onClick={() => inputDigit('9')}>9</Button>
              <Button onClick={() => performOperation('+')} variant="soft" className="row-span-2">+</Button>
              
              <Button onClick={() => inputDigit('4')}>4</Button>
              <Button onClick={() => inputDigit('5')}>5</Button>
              <Button onClick={() => inputDigit('6')}>6</Button>
              
              <Button onClick={() => inputDigit('1')}>1</Button>
              <Button onClick={() => inputDigit('2')}>2</Button>
              <Button onClick={() => inputDigit('3')}>3</Button>
              <Button onClick={() => performOperation('=')} color="blue" className="row-span-2">=</Button>
              
              <Button onClick={() => inputDigit('0')} className="col-span-2">0</Button>
              <Button onClick={() => inputDecimal()}>.</Button>
            </div>
          </div>
        </Card>
      )
    }
    \`\`\`

    This calculator component provides a clean and functional interface using Radix UI Themes components. Here's what it includes:

    1. **Display**: Shows the current input or calculation result
    2. **Number buttons**: Input digits 0-9
    3. **Operation buttons**: Basic arithmetic operations (+, -, *, /)
    4. **Clear button**: Resets the calculator
    5. **Decimal point button**: Allows decimal number input
    6. **Equals button**: Performs the calculation

    The calculator uses React's useState hook to manage state and includes proper calculation logic that handles chained operations.
    `),
  },
  "quiz app": {
    prompt:
      "Make me a quiz app about American history. Make sure to give the user an explanation on each question whether they got it right or wrong and keep a score going",
    response: dedent(`
      I'll create an interactive American history quiz app with feedback and scoring using Radix UI Themes.

\`\`\`tsx{filename=history-quiz.tsx}
import { useState } from 'react'
import { Button, Card, Text, Strong } from '@radix-ui/themes'

type Question = {
  question: string
  options: string[]
  correctAnswer: string
  explanation: string
}

export default function HistoryQuiz() {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [score, setScore] = useState(0)
  const [showExplanation, setShowExplanation] = useState(false)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)

  const questions: Question[] = [
    {
      question: "In which year was the Declaration of Independence signed?",
      options: ["1774", "1775", "1776", "1777"],
      correctAnswer: "1776",
      explanation: "The Declaration of Independence was signed on July 4, 1776, marking the formal separation of the 13 American colonies from Great Britain."
    },
    {
      question: "Who was the first President of the United States?",
      options: ["John Adams", "Thomas Jefferson", "Benjamin Franklin", "George Washington"],
      correctAnswer: "George Washington",
      explanation: "George Washington served as the first President from 1789 to 1797 and is often called the 'Father of His Country'."
    },
    {
      question: "Which war was fought between the North and the South United States?",
      options: ["Revolutionary War", "Civil War", "War of 1812", "Spanish-American War"],
      correctAnswer: "Civil War",
      explanation: "The Civil War (1861-1865) was fought between the Union (North) and the Confederacy (South) primarily over slavery and states' rights."
    },
    {
      question: "What was the name of the first successful English settlement in America?",
      options: ["Plymouth", "Jamestown", "Roanoke", "Massachusetts Bay"],
      correctAnswer: "Jamestown",
      explanation: "Jamestown, founded in 1607 in Virginia, was the first permanent English settlement in North America."
    },
    {
      question: "Which amendment to the Constitution abolished slavery?",
      options: ["13th", "14th", "15th", "16th"],
      correctAnswer: "13th",
      explanation: "The 13th Amendment, ratified in 1865, abolished slavery and involuntary servitude throughout the United States."
    }
  ]

  const handleAnswer = (selectedOption: string) => {
    setSelectedAnswer(selectedOption)
    setShowExplanation(true)

    if (selectedOption === questions[currentQuestion].correctAnswer) {
      setScore(score + 1)
    }
  }

  const nextQuestion = () => {
    setSelectedAnswer(null)
    setShowExplanation(false)
    setCurrentQuestion(currentQuestion + 1)
  }

  const resetQuiz = () => {
    setCurrentQuestion(0)
    setScore(0)
    setShowExplanation(false)
    setSelectedAnswer(null)
  }

  if (currentQuestion >= questions.length) {
    return (
      <Card className="w-full max-w-2xl mx-auto mt-8">
        <div className="p-8 text-center space-y-4">
          <Strong size="8">Quiz Complete!</Strong>
          <Text size="5">
            Your final score: {score} out of {questions.length}
          </Text>
          <div className="mt-6">
            <Button size="3" onClick={resetQuiz}>Try Again</Button>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-2xl mx-auto mt-8">
      <div className="p-8 space-y-6">
        <div className="space-y-2">
          <Strong size="7">American History Quiz</Strong>
          <div className="flex justify-between">
            <Text color="gray">Question {currentQuestion + 1} of {questions.length}</Text>
            <Text color="gray">Score: {score}</Text>
          </div>
        </div>
        
        <Text size="5" weight="medium">{questions[currentQuestion].question}</Text>
        
        <div className="grid grid-cols-1 gap-3">
          {questions[currentQuestion].options.map((option) => (
            <Button
              key={option}
              onClick={() => handleAnswer(option)}
              variant={
                showExplanation
                  ? option === questions[currentQuestion].correctAnswer
                    ? 'solid'
                    : option === selectedAnswer
                    ? 'soft'
                    : 'outline'
                  : 'outline'
              }
              color={
                showExplanation
                  ? option === questions[currentQuestion].correctAnswer
                    ? 'green'
                    : option === selectedAnswer
                    ? 'red'
                    : 'gray'
                  : 'blue'
              }
              disabled={showExplanation}
              className="p-4 text-left justify-start"
              size="3"
            >
              {option}
            </Button>
          ))}
        </div>

        {showExplanation && (
          <Card variant="surface" className="p-4">
            <div className="space-y-3">
              <Strong size="3" color={selectedAnswer === questions[currentQuestion].correctAnswer ? 'green' : 'red'}>
                {selectedAnswer === questions[currentQuestion].correctAnswer
                  ? '✅ Correct!'
                  : '❌ Incorrect!'}
              </Strong>
              <Text>{questions[currentQuestion].explanation}</Text>
              <Button size="2" onClick={nextQuestion}>
                Next Question
              </Button>
            </div>
          </Card>
        )}
      </div>
    </Card>
  )
}
      \`\`\`

This quiz app includes all the requested features:

1. **Five questions** about American history with multiple choice answers
2. **Immediate feedback** showing whether the answer was correct or incorrect
3. **Detailed explanations** for each question after answering
4. **Score tracking** throughout the quiz
5. **Final score display** at the end with option to retry
6. **Visual feedback** with different button colors for correct/incorrect answers
7. **Progress tracking** showing current question number
8. **Clean UI** using Radix UI Themes components

The app uses React state management to handle the quiz flow and provides an educational experience with comprehensive feedback for each question.
      `),
  },
  "pomodoro timer": {
    prompt: "make a pomodoro timer",
    response: dedent(`
      I'll create a Pomodoro timer with adjustable focus and break times, including a notification sound when sessions complete.

      \`\`\`tsx{filename=pomodoro-timer.tsx}
      import { useState, useEffect } from 'react'
import { Button, Card, Text, Strong } from '@radix-ui/themes'
import { Play, Pause, X } from "lucide-react"

export default function PomodoroTimer() {
  const [mode, setMode] = useState<'focus' | 'break'>('focus')
  const [isActive, setIsActive] = useState(false)
  const [timeLeft, setTimeLeft] = useState(25 * 60) // 25 minutes in seconds
  const [focusTime, setFocusTime] = useState(25)
  const [breakTime, setBreakTime] = useState(5)

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((timeLeft) => timeLeft - 1)
      }, 1000)
    } else if (timeLeft === 0) {
      playSound()
      if (mode === 'focus') {
        setMode('break')
        setTimeLeft(breakTime * 60)
      } else {
        setMode('focus')
        setTimeLeft(focusTime * 60)
      }
      setIsActive(false)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isActive, timeLeft, mode, focusTime, breakTime])

  const toggleTimer = () => {
    setIsActive(!isActive)
  }

  const resetTimer = () => {
    setIsActive(false)
    setMode('focus')
    setTimeLeft(focusTime * 60)
  }

  const playSound = () => {
    // Create a simple beep sound using Web Audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    
    oscillator.frequency.value = 800
    oscillator.type = 'sine'
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)
    
    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.5)
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return \`\${mins.toString().padStart(2, "0")}:\${secs.toString().padStart(2, "0")}\`
  }

  const adjustTime = (type: 'focus' | 'break', amount: number) => {
    if (type === 'focus') {
      const newTime = Math.max(1, Math.min(60, focusTime + amount))
      setFocusTime(newTime)
      if (mode === 'focus' && !isActive) setTimeLeft(newTime * 60)
    } else {
      const newTime = Math.max(1, Math.min(15, breakTime + amount))
      setBreakTime(newTime)
      if (mode === 'break' && !isActive) setTimeLeft(newTime * 60)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <div className="p-8 space-y-6">
          <Strong size="7" className="text-center block">Pomodoro Timer</Strong>
          
          <div className="flex justify-center space-x-2">
            <Button
              variant={mode === 'focus' ? 'solid' : 'outline'}
              onClick={() => {
                setMode('focus')
                setTimeLeft(focusTime * 60)
                setIsActive(false)
              }}
              size="2"
            >
              Focus
            </Button>
            <Button
              variant={mode === 'break' ? 'solid' : 'outline'}
              onClick={() => {
                setMode('break')
                setTimeLeft(breakTime * 60)
                setIsActive(false)
              }}
              size="2"
            >
              Break
            </Button>
          </div>

          <div className="text-center space-y-6">
            <Text size="9" weight="bold" className="font-mono">
              {formatTime(timeLeft)}
            </Text>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Text size="2" weight="medium" className="block">Focus Time</Text>
                <div className="flex justify-center items-center space-x-2">
                  <Button
                    variant="outline"
                    size="1"
                    onClick={() => adjustTime('focus', -1)}
                    disabled={isActive}
                  >
                    -
                  </Button>
                  <Text size="3" className="w-12 text-center">{focusTime}m</Text>
                  <Button
                    variant="outline"
                    size="1"
                    onClick={() => adjustTime('focus', 1)}
                    disabled={isActive}
                  >
                    +
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Text size="2" weight="medium" className="block">Break Time</Text>
                <div className="flex justify-center items-center space-x-2">
                  <Button
                    variant="outline"
                    size="1"
                    onClick={() => adjustTime('break', -1)}
                    disabled={isActive}
                  >
                    -
                  </Button>
                  <Text size="3" className="w-12 text-center">{breakTime}m</Text>
                  <Button
                    variant="outline"
                    size="1"
                    onClick={() => adjustTime('break', 1)}
                    disabled={isActive}
                  >
                    +
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex justify-center space-x-3">
              <Button
                size="3"
                onClick={toggleTimer}
                className="w-24"
              >
                {isActive ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                {isActive ? 'Pause' : 'Start'}
              </Button>
              <Button
                size="3"
                variant="outline"
                onClick={resetTimer}
                className="w-24"
              >
                <X className="w-4 h-4 mr-2" />
                Reset
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
    \`\`\`

This Pomodoro timer includes all the requested features:

1. **Adjustable focus and break times** with +/- buttons
2. **Timer functionality** with play/pause controls
3. **Sound notification** when sessions complete (uses Web Audio API)
4. **Mode switching** between focus and break periods
5. **Clean, intuitive interface** using Radix UI Themes
6. **Automatic session transitions** from focus to break and vice versa
7. **Reset functionality** to restart the timer
8. **Responsive design** that works on different screen sizes

The timer uses React hooks for state management and includes proper cleanup for intervals. The sound notification uses the Web Audio API to create a simple beep sound when sessions complete.
    `),
  },
};