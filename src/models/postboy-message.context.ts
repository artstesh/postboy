export interface PostboyMessageContext {
  correlationId: string;
  currentMessageId: string;
  parentMessageId?: string;
  depth: number;
  startedAt: Date;
  tags?: Set<string>;
}
