export const calendarTheme = {
  colors: {
    primary: '#EA4335',
    background: '#FFFFFF',
    border: '#DADCE0',
    todayBg: '#F1F3F4',
    text: {
      primary: '#3C4043',
      secondary: '#5F6368',
      sunday: '#D93025',
      saturday: '#1A73E8',
    },
  },
  layout: {
    sidebarWidth: '256px',
    headerHeight: '64px',
    cellMinHeight: '120px',
  },
};

export const roomColors = [
  '#039BE5',
  '#7986CB',
  '#33B679',
  '#8E24AA',
  '#E67C73',
  '#F6BF26',
  '#F4511E',
  '#0B8043',
  '#3F51B5',
  '#D50000',
];

export function getRoomColor(index: number): string {
  return roomColors[index % roomColors.length];
}

export const CEO_COLOR = '#DC2626';
