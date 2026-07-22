export class StrategyError extends Error {
  constructor(public code: string, message: string, public status: number) { super(message); }
}
