import { Inngest } from "inngest";

export type ExtractClientOptions<T> = T extends Inngest<infer I> ? I : never;
