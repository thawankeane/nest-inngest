# nest-inngest

[![npm](https://img.shields.io/npm/v/nest-inngest)](https://www.npmjs.com/package/nest-inngest)

An unofficial strongly typed [Inngest](https://inngest.com) module for Nest.js projects.

## Overview

`nest-inngest` is a library designed for the Nest.js framework, allowing you to leverage all the benefits of the framework, such as Dependency Injection (DI).

## Getting Started

> Disclaimer: This guide serves as an example of how to use the `nest-inngest` library. The structure used in the examples is purely illustrative, and you are free to adapt it to your project's current structure.

1. Install the library using your preferred package manager.

   ```shell
    pnpm add nest-inngest
   ```

2. In your app.module.ts or a similar file, add a new item to the `imports` array.

   ```ts
   // app.module.ts
   import { Module } from "@nestjs/core";

   import { InngestModule } from "nest-inngest";

   import { inngest } from "../lib/inngest";

   @Module({
     imports: [
       InngestModule.forRoot({
         inngest,
         path: "/api/inngest",
       }),
     ],
     controllers: [],
     providers: [],
   })
   export class AppModule {}
   ```

3. (Optional) In your `inngest.ts` file, include the `schemas` using your preferred method.

   ```ts
   // src/lib/inngest.ts
   import { Inngest, EventSchemas } from "inngest";
   import { NestInngest } from "nest-inngest";
   import { z } from "zod";

   export const inngest = new Inngest({
     id: "orders",
     // https://www.inngest.com/docs/reference/client/create#defining-event-payload-types
     schemas: new EventSchemas().fromZod({
       "orders/order.created": {
         data: z.object({
           id: z.string().uuid(),
           product: z.string(),
           quantity: z.number(),
         }),
       },
     }),
   });

   // instantiate and export Inngest helper decorator
   export const OrdersInngest = NestInngest.from(inngest);
   ```

4. Assign a new Inngest function to your controller

   ```ts
   import { Controller } "@nestjs/common";
   import { NestInngest } from "nest-inngest";

   import { OrdersInngest } from "../lib/inngest"

   @Controller("orders")
   export class OrdersController {
      constructor(private readonly ordersService: OrdersService) {}

      @OrdersInngest.Function({
        id: "orders-handler"
      })
      @OrdersInngest.Trigger({
        event: "orders/order.created" // 👈 Type-safety
      })
      public async handleOrderCreated(
        { event, step }: NestInngest.context<typeof OrdersInngest, "orders/order.created"> // 👈 Type helper to function context
      ) {
        // process recently created order

        console.log(event.data);

        await this.ordersService.sendOrderNotification(event.data.id);

        return { success: true }
      }
   }

   ```

## Roadmap

- [x] Add a global Nest module using the `.forRoot` pattern.
- [x] Export a class that accepts an instance of Inngest in the constructor and exposes typed decorators.
  - [x] `Function` decorator
  - [x] `Trigger` decorator
- [x] Add typing helpers.
  - [x] Helper for typing the `Context`
- [ ] Add automated tests.
- [ ] Add automatic documentation in the AsyncAPI spec. (TBD)
- [ ] Add Github actions with changelogs and auto releases
