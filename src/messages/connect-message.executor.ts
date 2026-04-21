import {PostboyExecutor} from "../models/postboy-executor";
import {PostboyGenericMessage} from "../models/postboy-generic-message";
import {MessageType} from "../postboy-abstract.registrator";
import {Observable, Subject} from "rxjs";

/**
 * Represents a message that facilitates connection functionality
 * within the application's messaging system.
 *
 * @template T - A type that extends {@link PostboyGenericMessage}, representing
 * the structure of the message being handled.
 *
 * @extends PostboyExecutor<void>
 */
export class ConnectMessage<T extends PostboyGenericMessage> extends PostboyExecutor<void> {
  static readonly ID = 'aa03a192-bdc7-402d-9f2f-bf3748229ea2';

  /**
   * Constructs a new instance of the class.
   *
   * @param {MessageType<T>} type - The type of the message.
   * @param {Subject<T>} sub - The subject to be used for message handling.
   * @param {(s: Subject<T>) => Observable<T>} [pipe] - An optional function to transform the subject.
   */
  constructor(
    public type: MessageType<T>,
    public sub: Subject<T>,
    public pipe?: (s: Subject<T>) => Observable<T>
  ) {
    super();
  }
}
