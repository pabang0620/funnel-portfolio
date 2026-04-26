import { useState } from 'react';
import ConfirmBtn from './utils/ConfirmBtn';
import correctimg from './images/correct.png';
import incorrectimg from './images/incorrect.png';
import './style.css';

export default function FifthGrade02() {
  const [isInputDisabled, setIsInputDisabled] = useState(false);
  const [type, setType] = useState(true);
  const [showResults, setShowResults] = useState(false);

  // 문제 데이터: 각 숫자의 약수 찾기
  const questions = [
    {
      id: '1',
      number: 6,
      divisors: [
        { result: 6, answer: '1' },
        { result: 3, answer: '2' },
        { result: 2, answer: '3' },
        { result: 1, answer: '6' },
      ],
      color: 'pink',
    },
    {
      id: '2',
      number: 9,
      divisors: [
        { result: 9, answer: '1' },
        { result: 3, answer: '3' },
        { result: 1, answer: '9' },
      ],
      color: 'blue',
    },
    {
      id: '3',
      number: 21,
      divisors: [
        { result: 21, answer: '1' },
        { result: 7, answer: '3' },
        { result: 3, answer: '7' },
        { result: 1, answer: '21' },
      ],
      color: 'green',
    },
    {
      id: '4',
      number: 25,
      divisors: [
        { result: 25, answer: '1' },
        { result: 5, answer: '5' },
        { result: 1, answer: '25' },
      ],
      color: 'orange',
    },
  ];

  const [answers, setAnswers] = useState(() => {
    const initial = {};
    questions.forEach((q) => {
      initial[q.id] = q.divisors.map(() => '');
    });
    return initial;
  });

  const correctAnswers = {};
  questions.forEach((q) => {
    correctAnswers[q.id] = q.divisors.map((d) => d.answer);
  });

  const handleChange = (questionId, index, value) => {
    setAnswers({
      ...answers,
      [questionId]: answers[questionId].map((item, i) =>
        i === index ? value : item
      ),
    });
  };

  const isCorrect = (questionId) => {
    return correctAnswers[questionId].every(
      (answer, index) => answer === answers[questionId][index]
    );
  };

  const handleGrade = () => {
    setShowResults(!showResults);
    setType(!type);
    setIsInputDisabled(!isInputDisabled);
  };

  const ResultIcon = ({ questionId }) => {
    if (!showResults) return null;
    return (
      <img
        className="elice-result-overlay"
        src={isCorrect(questionId) ? correctimg : incorrectimg}
        alt={isCorrect(questionId) ? 'O' : 'X'}
      />
    );
  };

  const Input = ({ questionId, index }) => (
    <input
      disabled={isInputDisabled}
      className="elice-input"
      type="text"
      value={answers[questionId][index]}
      onChange={(e) => handleChange(questionId, index, e.target.value)}
    />
  );

  const questionLabels = ['①', '②', '③', '④'];

  return (
    <div className="elice-grade02">
      <div className="elice-title">
        <h2>나눗셈으로 약수 찾기</h2>
        <p>빈칸에 알맞은 약수를 써넣으세요.</p>
      </div>

      <div className="elice-quiz-grid">
        {questions.map((question, qIndex) => (
          <div
            key={question.id}
            className={`elice-card elice-card-${question.color}`}
          >
            <div className="elice-question-number">
              <span>{questionLabels[qIndex]}</span>
              <ResultIcon questionId={question.id} />
            </div>

            <div className="elice-division-content">
              <div className="elice-target-number">{question.number}의 약수</div>
              <div className="elice-division-list">
                {question.divisors.map((divisor, dIndex) => (
                  <div key={dIndex} className="elice-division-row">
                    <span className="elice-division-formula">
                      {question.number} ÷
                    </span>
                    <Input questionId={question.id} index={dIndex} />
                    <span className="elice-division-result">
                      = {divisor.result}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <ConfirmBtn type={type} day={2} handleGrade={handleGrade} />
    </div>
  );
}
