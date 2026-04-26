export const handleColor = (category, day) => {
  switch (category) {
    case 'border':
      switch (day) {
        case 1:
          return '#ffd0de';
        case 2:
          return '#d0e0ff';
        case 3:
          return '#ffd6b8';
        case 4:
          return '#ddd3ff';
        case 5:
          return '#b3e9d2';
        default:
          return '#ffd0de';
      }

    case 'title':
      switch (day) {
        case 1:
          return '#ff6291';
        case 2:
          return '#6297ff';
        case 3:
          return '#ff7613';
        case 4:
          return '#8f6cff';
        case 5:
          return '#00b76a';
        default:
          return '#ff6291';
      }

    case 'sub':
      switch (day) {
        case 1:
          return '#ffeff4';
        case 2:
          return '#eff5ff';
        case 3:
          return '#fff1e7';
        case 4:
          return '#f4f0ff';
        case 5:
          return '#e6f8f0';
        default:
          return '#ffd0de';
      }

    default:
      return '#ffd0de';
  }
};
