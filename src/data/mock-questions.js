const TOPICS = [
  "signals",
  "right_of_way",
  "sanctions",
  "road_safety",
  "vehicle_basics",
];

export function buildQuestionBank(total = 200) {
  return Array.from({ length: total }, (_, i) => {
    const idNumber = i + 1;
    const id = `Q${String(idNumber).padStart(3, "0")}`;
    const topic = TOPICS[i % TOPICS.length];
    const correctOption = ["A", "B", "C", "D"][i % 4];

    return {
      id,
      topic,
      language: "es",
      stemEs: `Pregunta ${idNumber}: contenido de ejemplo sobre ${topic}.`,
      stemEn: `Question ${idNumber}: sample content about ${topic}.`,
      optionsEs: {
        A: `Opcion A ${id}`,
        B: `Opcion B ${id}`,
        C: `Opcion C ${id}`,
        D: `Opcion D ${id}`,
      },
      optionsEn: {
        A: `Option A ${id}`,
        B: `Option B ${id}`,
        C: `Option C ${id}`,
        D: `Option D ${id}`,
      },
      correctOption,
    };
  });
}

export function selectExamQuestions(bank, count = 70) {
  const clone = [...bank];
  for (let i = clone.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [clone[i], clone[j]] = [clone[j], clone[i]];
  }
  return clone.slice(0, count);
}
