import { useState } from 'react';
import ConfirmBtn from './utils/ConfirmBtn';
import correctimg from './images/correct.png';
import incorrectimg from './images/incorrect.png';
import './style.css';

export default function FifthGrade01() {
  const [isInputDisabled, setIsInputDisabled] = useState(false);
  const [type, setType] = useState(true);
  const [showResults, setShowResults] = useState(false);

  // 문제 데이터
  const questions = [
    {
      id: '1',
      color: 'pink',
      expression: '25 + 43 - 19',
      steps: [
        { left: '25 + 43 - 19', right: '- 19', answer: '68' },
        { left: '', right: '', answer: '49' },
      ],
    },
    {
      id: '2',
      color: 'blue',
      expression: '31 - 16 + 23',
      steps: [
        { left: '31 - 16 + 23', right: '+ 23', answer: '15' },
        { left: '', right: '', answer: '38' },
      ],
    },
    {
      id: '3',
      color: 'orange',
      expression: '19 - 13 + 7',
      steps: [
        { left: '19 - 13 + 7', right: '+ 7', answer: '6' },
        { left: '', right: '', answer: '13' },
      ],
    },
    {
      id: '4',
      color: 'pink',
      expression: '16 + 23 - 9',
      steps: [
        { left: '16 + 23 - 9', right: '- 9', answer: '39' },
        { left: '', right: '', answer: '30' },
      ],
    },
    {
      id: '5',
      color: 'blue',
      expression: '35 - 27 + 9 - 14',
      steps: [
        { left: '35 - 27 + 9 - 14', right: '+ 9 - 14', answer: '8' },
        { left: '', right: '- 14', answer: '17' },
        { left: '', right: '', answer: '3' },
      ],
    },
    {
      id: '6',
      color: 'orange',
      expression: '28 + 15 - 17 - 20',
      steps: [
        { left: '28 + 15 - 17 - 20', right: '- 17 - 20', answer: '43' },
        { left: '', right: '- 20', answer: '26' },
        { left: '', right: '', answer: '6' },
      ],
    },
    {
      id: '7',
      color: 'pink',
      expression: '15 + 4 - 16 + 11',
      steps: [
        { left: '15 + 4 - 16 + 11', right: '- 16 + 11', answer: '19' },
        { left: '', right: '+ 11', answer: '3' },
        { left: '', right: '', answer: '14' },
      ],
    },
    {
      id: '8',
      color: 'blue',
      expression: '35 + 8 - 26 + 9',
      steps: [
        { left: '35 + 8 - 26 + 9', right: '- 26 + 9', answer: '43' },
        { left: '', right: '+ 9', answer: '17' },
        { left: '', right: '', answer: '26' },
      ],
    },
  ];

  const [answers, setAnswers] = useState(() => {
    const initial = {};
    questions.forEach((q) => {
      initial[q.id] = q.steps.map(() => '');
    });
    return initial;
  });

  const correctAnswers = {};
  questions.forEach((q) => {
    correctAnswers[q.id] = q.steps.map((s) => s.answer);
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

  const questionLabels = ['①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧'];

  return (
    <div className="elice-grade01">
      <div className="elice-title">
        <h2>덧셈과 뺄셈</h2>
        <p>차례대로 계산하여 빈칸에 알맞은 수를 써넣으세요.</p>
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

            <div className="elice-calc-table">
              {question.steps.map((step, sIndex) => (
                <div key={sIndex} className="elice-calc-row">
                  <div className="elice-calc-left">
                    {step.left}
                  </div>
                  <div className="elice-calc-equals">=</div>
                  <div className="elice-calc-input">
                    <input
                      disabled={isInputDisabled}
                      className="elice-input"
                      type="text"
                      value={answers[question.id][sIndex]}
                      onChange={(e) =>
                        handleChange(question.id, sIndex, e.target.value)
                      }
                    />
                  </div>
                  <div className="elice-calc-right">
                    {step.right}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <ConfirmBtn type={type} day={1} handleGrade={handleGrade} />
    </div>
  );
}
