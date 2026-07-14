export const mascots = [
  {
    id: 'pudding',
    name: '푸딩이',
    role: '응원 마스터',
    emoji: '🐹',
    tone: 'warm',
    lines: [
      '오늘도 한 걸음!',
      '천천히 해도 괜찮아.',
      '잘했어! 정말이야.',
      '작은 미션도 멋진 성장이야.'
    ]
  },
  {
    id: 'jjingjjing',
    name: '찡찡이',
    role: '라이벌',
    emoji: '😈',
    tone: 'rival',
    lines: [
      '흥. 오늘은 인정.',
      '겨우 이 정도? ...그래도 잘했네.',
      '안 물었어. 아마도.',
      '다음 미션도 깨보든가.'
    ]
  }
];

export function pickMascotMessage(seed = Date.now()) {
  const mascot = mascots[Math.abs(seed) % mascots.length];
  const line = mascot.lines[Math.abs(seed * 7) % mascot.lines.length];
  return { ...mascot, line };
}
