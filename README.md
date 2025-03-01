The `@artstesh/postboy` library is designed to simplify the development of TypeScript applications using an event-driven approach. It provides convenient tools for working with the `rxjs` library, managing events, and handling dependencies, allowing developers to focus on business logic rather than boilerplate.

## Purpose of the Library

In complex applications a developer always faces with a huge amount of services, subscriptions and, as a result, with a long list of dependencies in components of the system. Some services have to combine their own logic with providing of subscriptions, other exist only to define a list of observations to link components of the system. It is getting harder to support so many dependencies, testing becomes a nightmare add... to say the truth, it looks bad) Plus, it is neccessary to close all the subs properly to avoid memory leaks...

`@artstesh/postboy` is a tool aimed at reducing this complexity by removing repetitive tasks from development. It focuses on minimizing boilerplate code and eliminating issues such as subscription leaks and improper dependency handling.

## Key Features

1. **Event-Driven Architecture**  
   Enables creating event-based applications with minimal overhead and explicit subscription management. This is especially useful for large-scale applications where data delivery and reaction to events play a critical role.

2. **Integration with `rxjs`**  
   Reactive programming is supported out of the box. This enables easy use of `rxjs` to process events.

3. **Dependency Management**  
   The library simplifies dependency handling by providing an efficient mechanism for managing them.

4. **Seamless Integration**  
   `@artstesh/postboy` can be easily integrated into existing TypeScript projects and helps structure applications into independent components with clear responsibilities for events and reactions.

5. **Modularity and Scalability**  
   Thanks to its approach, the library is suitable for both small applications and large-scale projects with complex functionality.

## Usage Example

Let’s take a look at a simple example to demonstrate how `@artstesh/postboy` can be used to handle events.

### The case

Suppose we such a simple structure in an Angular application:

<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MDAiIGhlaWdodD0iNDAwIiBzdHlsZT0iYmFja2dyb3VuZC1jb2xvcjogdHJhbnNwYXJlbnQ7IGZvbnQtZmFtaWx5OiBBcmlhbCwgc2Fucy1zZXJpZjsgZm9udC1zaXplOiAxNHB4OyI+DQogIDwhLS0gRmlyc3QgTGV2ZWwgQ29tcG9uZW50IC0tPg0KICA8cmVjdCB4PSIyMzAiIHk9IjIwIiB3aWR0aD0iMTQwIiBoZWlnaHQ9IjUwIiBmaWxsPSIjYzhlNmM5IiBzdHJva2U9IiMyZTdkMzIiIHN0cm9rZS13aWR0aD0iMiIgcng9IjYiPjwvcmVjdD4NCiAgPHRleHQgeD0iMzAwIiB5PSI1MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzJlN2QzMiI+QXBwQ29tcG9uZW50PC90ZXh0Pg0KDQogIDwhLS0gU2Vjb25kIExldmVsIENvbXBvbmVudHMgLS0+DQogIDxyZWN0IHg9IjEzMCIgeT0iMTIwIiB3aWR0aD0iMTQwIiBoZWlnaHQ9IjUwIiBmaWxsPSIjZmZlY2IzIiBzdHJva2U9IiNmNTdjMDAiIHN0cm9rZS13aWR0aD0iMiIgcng9IjYiPjwvcmVjdD4NCiAgPHRleHQgeD0iMjAwIiB5PSIxNTAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiNmNTdjMDAiPlBhcmVudCBBPC90ZXh0Pg0KDQogIDxyZWN0IHg9IjMzMCIgeT0iMTIwIiB3aWR0aD0iMTQwIiBoZWlnaHQ9IjUwIiBmaWxsPSIjZmZlY2IzIiBzdHJva2U9IiNmNTdjMDAiIHN0cm9rZS13aWR0aD0iMiIgcng9IjYiPjwvcmVjdD4NCiAgPHRleHQgeD0iNDAwIiB5PSIxNTAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiNmNTdjMDAiPlBhcmVudCBCPC90ZXh0Pg0KDQogIDwhLS0gVGhpcmQgTGV2ZWwgQ29tcG9uZW50cyAtLT4NCiAgPHJlY3QgeD0iNzAiIHk9IjI0MCIgd2lkdGg9IjE0MCIgaGVpZ2h0PSI1MCIgZmlsbD0iI2UzZjJmZCIgc3Ryb2tlPSIjMDA3YWNjIiBzdHJva2Utd2lkdGg9IjIiIHJ4PSI2Ij48L3JlY3Q+DQogIDx0ZXh0IHg9IjE0MCIgeT0iMjcwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjMDA3YWNjIj5DaGlsZCBBPC90ZXh0Pg0KDQogIDxyZWN0IHg9IjIzMCIgeT0iMjQwIiB3aWR0aD0iMTQwIiBoZWlnaHQ9IjUwIiBmaWxsPSIjZTNmMmZkIiBzdHJva2U9IiMwMDdhY2MiIHN0cm9rZS13aWR0aD0iMiIgcng9IjYiPjwvcmVjdD4NCiAgPHRleHQgeD0iMzAwIiB5PSIyNzAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiMwMDdhY2MiPi4uLjwvdGV4dD4NCg0KICA8cmVjdCB4PSIzOTAiIHk9IjI0MCIgd2lkdGg9IjE0MCIgaGVpZ2h0PSI1MCIgZmlsbD0iI2UzZjJmZCIgc3Ryb2tlPSIjMDA3YWNjIiBzdHJva2Utd2lkdGg9IjIiIHJ4PSI2Ij48L3JlY3Q+DQogIDx0ZXh0IHg9IjQ2MCIgeT0iMjcwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjMDA3YWNjIj5DaGlsZCBCPC90ZXh0Pg0KDQogIDwhLS0gTGluZXMgQ29ubmVjdGluZyBDb21wb25lbnRzIC0tPg0KICA8IS0tIEZyb20gQXBwQ29tcG9uZW50IHRvIFNlY29uZCBMZXZlbCAtLT4NCiAgPGxpbmUgeDE9IjMwMCIgeTE9IjcwIiB4Mj0iMjAwIiB5Mj0iMTIwIiBzdHJva2U9IiM2MDYwNjAiIHN0cm9rZS13aWR0aD0iMiIgbWFya2VyLWVuZD0idXJsKCNhcnJvd2hlYWQpIj48L2xpbmU+DQogIDxsaW5lIHgxPSIzMDAiIHkxPSI3MCIgeDI9IjQwMCIgeTI9IjEyMCIgc3Ryb2tlPSIjNjA2MDYwIiBzdHJva2Utd2lkdGg9IjIiIG1hcmtlci1lbmQ9InVybCgjYXJyb3doZWFkKSI+PC9saW5lPg0KDQogIDwhLS0gRnJvbSBTZWNvbmQgTGV2ZWwgdG8gVGhpcmQgTGV2ZWwgLS0+DQogIDxsaW5lIHgxPSIyMDAiIHkxPSIxNzAiIHgyPSIxNDAiIHkyPSIyNDAiIHN0cm9rZT0iIzYwNjA2MCIgc3Ryb2tlLXdpZHRoPSIyIiBtYXJrZXItZW5kPSJ1cmwoI2Fycm93aGVhZCkiPjwvbGluZT4NCiAgPGxpbmUgeDE9IjQwMCIgeTE9IjE3MCIgeDI9IjQ2MCIgeTI9IjI0MCIgc3Ryb2tlPSIjNjA2MDYwIiBzdHJva2Utd2lkdGg9IjIiIG1hcmtlci1lbmQ9InVybCgjYXJyb3doZWFkKSI+PC9saW5lPg0KDQogIDwhLS0gQXJyb3doZWFkIG1hcmtlciAtLT4NCiAgPGRlZnM+DQogICAgPG1hcmtlciBpZD0iYXJyb3doZWFkIiBtYXJrZXJXaWR0aD0iMTAiIG1hcmtlckhlaWdodD0iNyIgcmVmWD0iMTAiIHJlZlk9IjMuNSIgb3JpZW50PSJhdXRvIj4NCiAgICAgIDxwb2x5Z29uIHBvaW50cz0iMCAwLCAxMCAzLjUsIDAgNyIgZmlsbD0iIzYwNjA2MCI+PC9wb2x5Z29uPg0KICAgIDwvbWFya2VyPg0KICA8L2RlZnM+DQo8L3N2Zz4NCg==">

**Child B** contains a text input and **Child A** have show the value of the input.

In a common case, we would create a specific service with an observable; but it alse means that we have to get an instance of the service in **Child A** and **Child B** and the service itself looks pretty bad - it is just a wrapper over the observable.

*I don't event want to describe the idea of sending information through the parents - it is much more painful and dirty.

### The postboy approach

```typescript
import {PostboyService} from '@artstesh/postboy';

public class ChildA {
  constructor(private postboy: PostboyService) {
  }
  
  public ngOnInit(){
    this.postboy.sub(UserInputEvent).subscribe(ev => {
      console.log(ev.text);
    })
  }
}

public class ChildB {
  constructor(private postboy: PostboyService) {
  }

  public onInput(){
    this.postboy.fire(new UserInputEvent(this.text));
  }
}
```

### Key Benefits of This Approach

- Clear separation of event generation and event handling.
- TypeScript interfaces ensure strict typing for the data passed between different parts of the application.
- The members of the system know nothing about each other
- No need to create specific mediators

## Advantages of the Library

- **Simplicity:** Clear structure for managing events and their processing.
- **Safety:** TypeScript ensures type-safety, minimizing potential errors.
- **Flexibility:** `rxjs` integration allows advanced event processing, such as filtering, pre-processing, and combining event streams.
- **Scalability:** Code becomes clean and easy to extend without introducing unnecessary complexity.

