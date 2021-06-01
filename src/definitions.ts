export interface BackgroundFetchPlugin {
  echo(options: { value: string }): Promise<{ value: string }>;
}
