import { handleColor } from './handleColor';

export default function ConfirmBtn({ type, day, handleGrade }) {
  const color = handleColor('title', day);

  return (
    <div className="eliceButtonWrapper">
      {type ? (
        <button
          className="eliceConfirmBox"
          style={{ backgroundColor: color }}
          onClick={handleGrade}
        >
          제출하기
        </button>
      ) : (
        <button
          className="eliceRetryButton"
          style={{ border: `4px solid ${color}`, color: color }}
          onClick={handleGrade}
        >
          다시풀기
        </button>
      )}
    </div>
  );
}
