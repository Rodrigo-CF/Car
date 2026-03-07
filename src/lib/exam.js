import { generateId } from "./store.js";
import { selectExamQuestions } from "../data/mock-questions.js";

export function createExamAttempt(store, user) {
  const selectedQuestions = selectExamQuestions(store.questionBank, store.examConfig.questionCount);
  const draftId = generateId("exam_draft");

  store.examDrafts.set(draftId, {
    attempt_id: draftId,
    user_id: user.user_id,
    question_ids: selectedQuestions.map((question) => question.id),
    started_at: new Date().toISOString(),
  });

  const questions = selectedQuestions.map((question) => ({
    id: question.id,
    topic: question.topic,
    stemEs: question.stemEs,
    stemEn: question.stemEn,
    optionsEs: question.optionsEs,
    optionsEn: question.optionsEn,
    debugCorrectOption: question.correctOption,
  }));

  return {
    attempt_id: draftId,
    config: store.examConfig,
    questions,
  };
}

export function submitExamAttempt(store, user, attemptId, payload) {
  const draft = store.examDrafts.get(attemptId);
  if (!draft || draft.user_id !== user.user_id) {
    return { status: 404, error: "exam attempt not found" };
  }

  const answers = payload.answers ?? {};
  const duration_sec = Number(payload.duration_sec) > 0 ? Number(payload.duration_sec) : 0;

  const questions = draft.question_ids
    .map((id) => store.questionBank.find((question) => question.id === id))
    .filter(Boolean);

  let correctCount = 0;
  for (const question of questions) {
    if (answers[question.id] === question.correctOption) {
      correctCount += 1;
    }
  }

  const total = questions.length;
  const scorePct = total > 0 ? Number(((correctCount / total) * 100).toFixed(2)) : 0;

  const attemptRecord = {
    attempt_id: generateId("exam_attempt"),
    draft_id: draft.attempt_id,
    user_id: user.user_id,
    score_pct: scorePct,
    correct_count: correctCount,
    duration_sec,
    passed: scorePct >= store.examConfig.passThresholdPct,
    created_at: new Date().toISOString(),
  };

  store.examAttempts.push(attemptRecord);
  store.examDrafts.delete(attemptId);

  return {
    status: 200,
    data: attemptRecord,
  };
}

export function updateExamConfig(store, payload) {
  const questionCount = Number(payload.questionCount);
  const timeLimitSec = Number(payload.timeLimitSec);
  const passThresholdPct = Number(payload.passThresholdPct);

  if (
    !Number.isInteger(questionCount) ||
    questionCount <= 0 ||
    !Number.isInteger(timeLimitSec) ||
    timeLimitSec <= 0 ||
    Number.isNaN(passThresholdPct) ||
    passThresholdPct <= 0 ||
    passThresholdPct > 100
  ) {
    return { status: 400, error: "invalid exam config" };
  }

  store.examConfig = {
    questionCount,
    timeLimitSec,
    passThresholdPct,
  };

  return { status: 200, data: store.examConfig };
}
