export class CompatibilityRepository {
  saveScore(input: { score: number; explanation: string }) {
    return {
      id: crypto.randomUUID(),
      ...input,
      model: "rule-based-mvp",
      createdAt: new Date().toISOString()
    };
  }
}
