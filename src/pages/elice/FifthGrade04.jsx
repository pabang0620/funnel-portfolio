import { useState } from 'react';
import ConfirmBtn from './utils/ConfirmBtn';
import correctimg from './images/correct.png';
import incorrectimg from './images/incorrect.png';
import './style.css';

export default function FifthGrade04() {
  const [isInputDisabled, setIsInputDisabled] = useState(false);
  const [type, setType] = useState(true);
  const [showResults, setShowResults] = useState(false);

  // 문제 데이터: 약수의 개수 찾기
  const questions = [
    {
      id: '1',
      targetNumber: 16,
      candidates: [1, 2, 3, 4, 8, 16],
      answer: '5',
      hint: '16의 약수는 1, 2, 4, 8, 16',
    },
    {
      id: '2',
      targetNumber: 17,
      candidates: [1, 2, 3, 8, 17, 34],
      answer: '2',
      hint: '17은 소수입니다',
    },
    {
      id: '3',
      targetNumber: 21,
      candidates: [1, 2, 3, 7, 21, 42],
      answer: '4',
      hint: '21의 약수는 1, 3, 7, 21',
    },
    {
      id: '4',
      targetNumber: 29,
      candidates: [1, 5, 7, 9, 13, 29],
      answer: '2',
      hint: '29는 소수입니다',
    },
    {
      id: '5',
      targetNumber: 33,
      candidates: [1, 3, 11, 18, 33, 66],
      answer: '4',
      hint: '33의 약수는 1, 3, 11, 33',
    },
    {
      id: '6',
      targetNumber: 49,
      candidates: [1, 4, 7, 11, 26, 49],
      answer: '3',
      hint: '49의 약수는 1, 7, 49',
    },
  ];

  const [answers, setAnswers] = useState(() => {
    const initial = {};
    questions.forEach((q) => {
      initial[q.id] = [''];
    });
    return initial;
  });

  const correctAnswers = {};
  questions.forEach((q) => {
    correctAnswers[q.id] = [q.answer];
  });

  const handleChange = (questionId, value) => {
    setAnswers({
      ...answers,
      [questionId]: [value],
    });
  };

  const isCorrect = (questionId) => {
    return correctAnswers[questionId][0] === answers[questionId][0];
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
        className="elice-result-overlay-large"
        src={isCorrect(questionId) ? correctimg : incorrectimg}
        alt={isCorrect(questionId) ? 'O' : 'X'}
      />
    );
  };

  const questionLabels = ['①', '②', '③', '④', '⑤', '⑥'];

  return (
    <div className="elice-grade04">
      <div className="elice-title">
        <h2>약수의 개수 찾기</h2>
        <p>주어진 숫자들 중에서 위 숫자의 약수가 몇 개인지 구하세요.</p>
      </div>

      <div className="elice-quiz-grid-3">
        {questions.map((question, qIndex) => (
          <div key={question.id} className="elice-divisor-card">
            <div className="elice-question-header">
              <span className="elice-question-label">{questionLabels[qIndex]}</span>
              <ResultIcon questionId={question.id} />
            </div>

            <div className="elice-divisor-content">
              <div className="elice-target-box">
                <span className="elice-target-value">{question.targetNumber}</span>
              </div>

              <div className="elice-candidates">
                {question.candidates.map((num, idx) => (
                  <div key={idx} className="elice-candidate-box">
                    {num}
                  </div>
                ))}
              </div>

              <div className="elice-answer-section">
                <span className="elice-answer-label">약수의 개수:</span>
                <input
                  disabled={isInputDisabled}
                  className="elice-input-small"
                  type="text"
                  value={answers[question.id][0]}
                  onChange={(e) => handleChange(question.id, e.target.value)}
                />
                <span className="elice-answer-unit">개</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <ConfirmBtn type={type} day={4} handleGrade={handleGrade} />
    </div>
  );
}
