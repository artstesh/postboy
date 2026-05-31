/**
 * Represents configurable settings for the Postboy system.
 */
export class PostboySettings {
  public metadata: boolean = true;

  /**
   * Constructs an instance of the class with optional settings.
   *
   * @param {Partial<PostboySettings>} [settings] - Optional settings to configure the instance. Can include partial metadata or other configurations.
   */
  constructor(settings?: Partial<PostboySettings>) {
    this.metadata = settings?.metadata ?? this.metadata;
  }
}
