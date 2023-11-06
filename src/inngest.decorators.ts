import { ClientOptions, GetEvents } from "inngest";
import { AnyInngest } from "inngest/components/Inngest";
import { Context } from "inngest/types";

import { INNGEST_FUNCTION, INNGEST_TRIGGER } from "@/inngest.module";
import { ExtractClientOptions } from "@/inngest.types";

export type ExtractInngest<T> = T extends NestInngest<infer I> ? I : never;

export class NestInngest<TInngest extends AnyInngest> {
  constructor(protected readonly inngest: TInngest) {}

  static from<TOpts extends AnyInngest>(inngest: TOpts) {
    return new NestInngest<TOpts>(inngest);
  }

  /**
   * Inngest function decorator
   */
  public Function(args: Parameters<TInngest["createFunction"]>[0]) {
    return (
      target: Object,
      key: string | symbol,
      descriptor: PropertyDescriptor,
    ) => {
      Reflect.defineMetadata(INNGEST_FUNCTION, args, descriptor.value);
      return descriptor;
    };
  }

  /**
   * Inngest function trigger decorator
   */
  public Trigger(options: Parameters<TInngest["createFunction"]>[1]) {
    type TEvent = (typeof options)["event"];

    return (
      target: Object,
      key: string | symbol,
      descriptor: PropertyDescriptor,
    ): TypedPropertyDescriptor<
      (
        ctx: Context<
          ExtractClientOptions<TInngest>,
          GetEvents<TInngest>,
          TEvent extends keyof GetEvents<TInngest> & string ? TEvent : any
        >,
      ) => any
    > => {
      Reflect.defineMetadata(INNGEST_TRIGGER, options, descriptor.value);
      return descriptor;
    };
  }
}

export namespace NestInngest {
  export type context<
    TInngest,
    TEvent extends keyof GetEvents<ExtractInngest<TInngest>> & string,
    TOpts extends ClientOptions = ExtractClientOptions<
      ExtractInngest<TInngest>
    >,
  > = Context<TOpts, GetEvents<ExtractInngest<TInngest>>, TEvent>;
}
