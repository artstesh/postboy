import {PostboyCallbackMessage} from "./postboy-callback.message";
import {Queue} from "@artstesh/collections";


export class MessageQueue<D> {
   /**
    * Gets the current data stored in the instance.
    *
    * @return {D | null} The current data or null if no data is set.
    */
   get data(): D | null {
      return this._data;
   }

   private queries: Queue<PostboyCallbackMessage<D>> = new Queue<PostboyCallbackMessage<D>>();
   private _requestInProgress: boolean = true;
   private _data: D | null = null;

   constructor(private cache: boolean = true) {}

   /**
    * Resets the state of the instance by clearing stored data.
    * This method sets the internal data to null, effectively resetting the object.
    *
    * @return {void} Does not return a value.
    */
   public reset(): MessageQueue<D> {
      this._data = null;
      return this;
   }

   /**
    * Attempts to finalize the provided query. It either queues the query for later processing
    * if a request is in progress or data is missing, or completes the query immediately.
    *
    * @param {PostboyCallbackMessage<D>} query - The callback message to be finalized.
    * @return {boolean} - Returns true if the query was successfully finalized, otherwise false.
    */
   public tryFinish(query: PostboyCallbackMessage<D>): boolean {
      if (this._requestInProgress || this._data === null) return this.queries.put(query) && false;
      query.finish(this._data);
      return true;
   }

   /**
    * Adds a new query to the query queue.
    *
    * @param {PostboyCallbackMessage<D>} query - The query to be added to the queue.
    * @return {MessageQueue<D>} The updated QueryQueue instance.
    */
   public add(query: PostboyCallbackMessage<D>): MessageQueue<D> {
      return this.queries.put(query) && this;
   }

   /**
    * Marks the operation as finished by updating the internal state and handling each query.
    *
    * @param {D} data - The data to be set for the current operation.
    * @return {void} This method does not return a value.
    */
   public finish(data: D): void {
      if(this.cache) this._data = data;
      this._requestInProgress = false;
      this.queries.each(q => q.finish(data));
   }
}
